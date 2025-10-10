USE BrokerTEC;
GO

--- Trigger para auditar cambios en el precio de las empresas
CREATE OR ALTER TRIGGER TR_Empresa_UpdatePrecio
ON [dbo].[empresa]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo si cambió el precio_actual
    IF UPDATE(precio_actual)
    BEGIN
        -- Insertar en historico_precio
        INSERT INTO [dbo].[historico_precio] (id_empresa, precio, fecha)
        SELECT 
            i.id_empresa,
            i.precio_actual,  -- El nuevo valor
            GETDATE()         -- Fecha actual
        FROM inserted i
        INNER JOIN deleted d ON i.id_empresa = d.id_empresa
        WHERE i.precio_actual != d.precio_actual  -- Evita inserts innecesarios si es igual
        AND i.activo = 1;  -- Solo para empresas activas

        -- Opcional: Log en audit_log (si la tabla existe)
        INSERT INTO [dbo].[audit_log] (tabla_afectada, id_registro, accion, usuario_modificador, descripcion)
        SELECT 
            'empresa',
            i.id_empresa,
            'UPDATE',
            SUSER_NAME(),
            'Precio actualizado de ' + CAST(d.precio_actual AS VARCHAR(20)) + ' a ' + CAST(i.precio_actual AS VARCHAR(20))
        FROM inserted i
        INNER JOIN deleted d ON i.id_empresa = d.id_empresa
        WHERE i.precio_actual != d.precio_actual;
        
    END;
END;
GO


--- Trigger para auditar cambios en el estado del usuario
CREATE OR ALTER TRIGGER TR_Usuario_UpdateEstado
ON [dbo].[usuario]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(estado)
    BEGIN
        -- Log en evento_admin para deshabilitaciones
        INSERT INTO [dbo].[evento_admin] (id_usuario, id_admin, tipo, justificacion, fecha)
        SELECT 
            i.id_usuario,
            NULL,  -- No podemos obtener el id_admin de forma confiable desde el trigger
            CASE 
                WHEN i.estado = 0 THEN 'deshabilitar'
                WHEN i.estado = 1 THEN 'habilitar'
                ELSE 'cambio_estado'
            END,
            'Cambio automático de estado: ' + 
                CASE 
                    WHEN d.estado = 1 AND i.estado = 0 THEN 'Usuario deshabilitado'
                    WHEN d.estado = 0 AND i.estado = 1 THEN 'Usuario habilitado'
                    ELSE 'Estado modificado'
                END + ' | Por: ' + ISNULL(SUSER_NAME(), 'Sistema'),
            GETDATE()
        FROM inserted i
        INNER JOIN deleted d ON i.id_usuario = d.id_usuario
        WHERE i.estado != d.estado;  -- Todos los cambios de estado


        INSERT INTO [dbo].[audit_log] (tabla_afectada, id_registro, accion, usuario_modificador, descripcion)
        SELECT 
            'usuario',
            i.id_usuario,
            'UPDATE',
            SUSER_NAME(),
            'Estado cambiado de ' + 
                CASE d.estado WHEN 1 THEN 'Activo' WHEN 0 THEN 'Inactivo' ELSE CAST(d.estado AS VARCHAR(10)) END + 
                ' a ' + 
                CASE i.estado WHEN 1 THEN 'Activo' WHEN 0 THEN 'Inactivo' ELSE CAST(i.estado AS VARCHAR(10)) END
        FROM inserted i 
        INNER JOIN deleted d ON i.id_usuario = d.id_usuario
        WHERE i.estado != d.estado;
    END;
END;
GO


--- Trigger para auditar cambios en el estado y cantidad de acciones de la empresa
CREATE OR ALTER TRIGGER TR_Empresa_UpdateActivoCantidad
ON [dbo].[empresa]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Para delistar (cambio en activo)
    IF UPDATE(activo)
    BEGIN
        INSERT INTO [dbo].[evento_admin] (id_usuario, id_admin, tipo, justificacion, fecha)
        SELECT 
            NULL,  -- No usuario específico
            NULL,  -- No podemos obtener id_admin de forma confiable en el trigger
            CASE 
                WHEN i.activo = 0 THEN 'delistar'
                WHEN i.activo = 1 THEN 'relistar'  -- Para casos de reactivación
                ELSE 'cambio_estado'
            END,
            'Cambio automático de estado activo: ' + 
                CASE 
                    WHEN d.activo = 1 AND i.activo = 0 THEN 'Empresa delistada'
                    WHEN d.activo = 0 AND i.activo = 1 THEN 'Empresa relistada'
                    ELSE 'Estado modificado'
                END + ' | Empresa: ' + i.nombre + ' (ID: ' + CAST(i.id_empresa AS VARCHAR(10)) + ')',
            GETDATE()
        FROM inserted i
        INNER JOIN deleted d ON i.id_empresa = d.id_empresa
        WHERE i.activo != d.activo;  -- Todos los cambios de estado activo
    END;

    -- Sincronizar tesorería si cambia cantidad_acciones total o activo
    IF UPDATE(cantidad_acciones) OR UPDATE(activo)
    BEGIN
        UPDATE t
        SET acciones_disponibles = 
            CASE 
                WHEN i.activo = 0 THEN 0  -- Si delistada, vaciar tesorería
                ELSE 
                    CASE 
                        WHEN i.cantidad_acciones < ISNULL((SELECT SUM(cantidad) FROM portafolio WHERE id_empresa = i.id_empresa), 0) 
                        THEN 0  -- No puede haber negativo, establecer a 0
                        ELSE i.cantidad_acciones - ISNULL((SELECT SUM(cantidad) FROM portafolio WHERE id_empresa = i.id_empresa), 0)
                    END
            END
        FROM tesoreria t
        INNER JOIN inserted i ON t.id_empresa = i.id_empresa
        INNER JOIN deleted d ON i.id_empresa = d.id_empresa
        WHERE (i.cantidad_acciones != d.cantidad_acciones) OR (i.activo != d.activo);
    END;

    -- Opcional: Audit log para cambios
    IF OBJECT_ID('dbo.audit_log', 'U') IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[audit_log] (tabla_afectada, id_registro, accion, usuario_modificador, descripcion)
        SELECT 
            'empresa',
            i.id_empresa,
            'UPDATE',
            SUSER_NAME(),
            CASE 
                WHEN i.activo != d.activo THEN 
                    'Estado activo cambiado de ' + 
                    CASE d.activo WHEN 1 THEN 'Activo' ELSE 'Inactivo' END + 
                    ' a ' + 
                    CASE i.activo WHEN 1 THEN 'Activo' ELSE 'Inactivo' END
                WHEN i.cantidad_acciones != d.cantidad_acciones THEN 
                    'Cantidad acciones actualizada de ' + CAST(d.cantidad_acciones AS VARCHAR(20)) + 
                    ' a ' + CAST(i.cantidad_acciones AS VARCHAR(20))
                ELSE 'Otros cambios'
            END
        FROM inserted i 
        INNER JOIN deleted d ON i.id_empresa = d.id_empresa
        WHERE i.activo != d.activo OR i.cantidad_acciones != d.cantidad_acciones;
    END
END;
GO

--- Trigger para auditar recargas y verificar límites
CREATE OR ALTER TRIGGER TR_Recarga_InsertAudit
ON [dbo].[recarga]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Manejar múltiples inserciones usando un conjunto de datos
    INSERT INTO [dbo].[audit_log] (
        tabla_afectada, 
        id_registro, 
        accion, 
        usuario_modificador, 
        descripcion, 
        fecha_modificacion  -- Cambiado de 'fecha' a 'fecha_modificacion'
    )
    SELECT 
        'recarga',
        i.id_recarga,
        'INSERT',
        SUSER_NAME(),
        CASE 
            WHEN (consumido.consumido_diario + i.monto) > c.limite_diario THEN
                'ALERTA: Recarga excede límite diario. Monto: ' + CAST(i.monto AS VARCHAR(20)) + 
                ' USD; Consumido diario: ' + CAST(consumido.consumido_diario AS VARCHAR(20)) + 
                '; Límite: ' + CAST(c.limite_diario AS VARCHAR(20))
            WHEN (consumido.consumido_diario + i.monto) > (c.limite_diario * 0.9) THEN
                'ADVERTENCIA: Recarga cerca del límite diario. Monto: ' + CAST(i.monto AS VARCHAR(20)) + 
                ' USD; Consumido diario: ' + CAST(consumido.consumido_diario AS VARCHAR(20)) + 
                '; Límite: ' + CAST(c.limite_diario AS VARCHAR(20)) + 
                '; Porcentaje: ' + CAST(CAST((consumido.consumido_diario + i.monto) * 100.0 / c.limite_diario AS DECIMAL(5,1)) AS VARCHAR(10)) + '%'
            ELSE
                'Recarga normal. Monto: ' + CAST(i.monto AS VARCHAR(20)) + 
                ' USD; Consumido diario: ' + CAST(consumido.consumido_diario AS VARCHAR(20)) + 
                '; Límite: ' + CAST(c.limite_diario AS VARCHAR(20))
        END,
        GETDATE()  -- Esto se insertará en fecha_modificacion
    FROM inserted i
    INNER JOIN wallet w ON i.id_wallet = w.id_wallet
    INNER JOIN usuario u ON w.id_usuario = u.id_usuario
    INNER JOIN categoria c ON u.id_categoria = c.id_categoria
    CROSS APPLY (
        SELECT dbo.FN_GetDailyRechargeUsed(u.id_usuario) AS consumido_diario
    ) AS consumido
    WHERE (consumido.consumido_diario + i.monto) > (c.limite_diario * 0.9);  -- Solo registrar cuando sea > 90% del límite

END;
GO