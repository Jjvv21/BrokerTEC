USE BrokerTEC;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[rol]') AND type in (N'U'))
CREATE TABLE [dbo].[rol] (
id_rol INT IDENTITY(1,1) PRIMARY KEY,
nombre_rol VARCHAR(50) NOT NULL,
descripcion VARCHAR(255),
CONSTRAINT chk_rol CHECK (nombre_rol IN ('Admin', 'Trader', 'Analyst'))
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categoria]') AND type in (N'U'))
CREATE TABLE [dbo].[categoria] (
id_categoria INT IDENTITY(1,1) PRIMARY KEY, 
nombre_categoria VARCHAR(50) NOT NULL,
limite_diario DECIMAL(18,2) NOT NULL,
CONSTRAINT chk_categoria CHECK (nombre_categoria IN ('Junior', 'Mid', 'Senior') AND limite_diario >= 0)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[mercado]') AND type in (N'U'))
CREATE TABLE [dbo].[mercado] (
id_mercado INT IDENTITY(1,1) PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
estado VARCHAR(20) NOT NULL DEFAULT 'habilitado',
CONSTRAINT uq_mercado_nombre UNIQUE (nombre),
CONSTRAINT chk_estado_mercado CHECK (estado IN ('habilitado', 'deshabilitado'))
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuario]') AND type in (N'U'))
CREATE TABLE [dbo].[usuario] (
id_usuario INT IDENTITY(1,1) PRIMARY KEY,
id_rol INT NOT NULL,
id_categoria INT,
alias VARCHAR(50) NOT NULL,
estado BIT NOT NULL DEFAULT 1,
nombre VARCHAR(100) NOT NULL,
correo VARCHAR(100) NOT NULL,
telefono VARCHAR(15),
direccion VARCHAR(255),
pais_de_origen VARCHAR(50),
password_hash VARCHAR(255) NOT NULL,
last_access DATETIME DEFAULT GETDATE(),
CONSTRAINT uq_usuario_alias UNIQUE (alias),
CONSTRAINT uq_usuario_correo UNIQUE (correo),
CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES [dbo].rol ON DELETE NO ACTION,
CONSTRAINT fk_usuario_categoria FOREIGN KEY (id_categoria) REFERENCES [dbo].categoria ON DELETE SET NULL,
CONSTRAINT chk_correo CHECK (correo LIKE '%@%.%')
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[empresa]') AND type in (N'U'))
CREATE TABLE [dbo].[empresa] (
id_empresa INT IDENTITY(1,1) PRIMARY KEY,
id_mercado INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
precio_actual DECIMAL(18,4) NOT NULL,
cantidad_acciones BIGINT NOT NULL,
market_cap AS (precio_actual * cantidad_acciones) PERSISTED,
activo BIT NOT NULL DEFAULT 1,
CONSTRAINT fk_empresa_mercado FOREIGN KEY (id_mercado) REFERENCES [dbo].mercado ON DELETE CASCADE,
CONSTRAINT chk_precio CHECK (precio_actual > 0),
CONSTRAINT chk_acciones CHECK (cantidad_acciones >= 0)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tesoreria]') AND type in (N'U'))
CREATE TABLE [dbo].[tesoreria] (
id_tesoreria INT IDENTITY(1,1) PRIMARY KEY,
id_empresa INT NOT NULL,
acciones_disponibles BIGINT NOT NULL,
CONSTRAINT fk_tesoreria_empresa FOREIGN KEY (id_empresa) REFERENCES [dbo].empresa ON DELETE CASCADE,
CONSTRAINT chk_acciones_tesoreria CHECK (acciones_disponibles >= 0),
CONSTRAINT uq_tesoreria_empresa UNIQUE (id_empresa)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[historico_precio]') AND type in (N'U'))
CREATE TABLE [dbo].[historico_precio] (
id_hist INT IDENTITY(1,1) PRIMARY KEY,
id_empresa INT NOT NULL,
precio DECIMAL(18,4) NOT NULL,
fecha DATETIME NOT NULL DEFAULT GETDATE(),
CONSTRAINT fk_hist_empresa FOREIGN KEY (id_empresa) REFERENCES [dbo].empresa ON DELETE CASCADE,
CONSTRAINT chk_precio_hist CHECK (precio > 0)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[transaccion]') AND type in (N'U'))
CREATE TABLE [dbo].[transaccion] (
id_tx INT IDENTITY(1,1) PRIMARY KEY,
id_usuario INT NOT NULL,
id_empresa INT NOT NULL,
tipo VARCHAR(20) NOT NULL,
cantidad INT NOT NULL,
precio DECIMAL(18,4) NOT NULL,
fecha DATETIME NOT NULL DEFAULT GETDATE(),
CONSTRAINT fk_tx_usuario FOREIGN KEY (id_usuario) REFERENCES [dbo].usuario ON DELETE CASCADE,
CONSTRAINT fk_tx_empresa FOREIGN KEY (id_empresa) REFERENCES [dbo].empresa ON DELETE CASCADE,
CONSTRAINT chk_cantidad_tx CHECK (cantidad > 0),
CONSTRAINT chk_precio_tx CHECK (precio > 0),
CONSTRAINT chk_tipo_tx CHECK (tipo IN ('compra', 'venta', 'liquidacion'))
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usuario_mercado]') AND type in (N'U'))
CREATE TABLE [dbo].[usuario_mercado] (
id_usuario INT NOT NULL,
id_mercado INT NOT NULL,
PRIMARY KEY (id_usuario, id_mercado),
CONSTRAINT fk_usermkt_usuario FOREIGN KEY (id_usuario) REFERENCES [dbo].usuario ON DELETE CASCADE,
CONSTRAINT fk_usermkt_mercado FOREIGN KEY (id_mercado) REFERENCES [dbo].mercado ON DELETE CASCADE
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[wallet]') AND type in (N'U'))
CREATE TABLE [dbo].[wallet] (
id_wallet INT IDENTITY(1,1) PRIMARY KEY,
id_usuario INT NOT NULL,
saldo DECIMAL(18,2) NOT NULL DEFAULT 0,
CONSTRAINT fk_wallet_usuario FOREIGN KEY (id_usuario) REFERENCES [dbo].usuario ON DELETE CASCADE,
CONSTRAINT chk_saldo CHECK (saldo >= 0),
CONSTRAINT uq_wallet_usuario UNIQUE (id_usuario)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[recarga]') AND type in (N'U'))
CREATE TABLE [dbo].[recarga] (
id_recarga INT IDENTITY(1,1) PRIMARY KEY,
id_wallet INT NOT NULL,
monto DECIMAL(18,2) NOT NULL,
fecha DATETIME NOT NULL DEFAULT GETDATE(),
CONSTRAINT fk_recarga_wallet FOREIGN KEY (id_wallet) REFERENCES [dbo].wallet ON DELETE CASCADE,
CONSTRAINT chk_monto CHECK (monto > 0)
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[evento_admin]') AND type in (N'U'))
CREATE TABLE [dbo].[evento_admin] (
id_evento INT IDENTITY(1,1) PRIMARY KEY,
id_usuario INT NOT NULL,
id_admin INT NOT NULL,
tipo VARCHAR(20) NOT NULL,
justificacion TEXT,
fecha DATETIME NOT NULL DEFAULT GETDATE(),
CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario) REFERENCES [dbo].usuario ON DELETE CASCADE,
CONSTRAINT fk_evento_admin FOREIGN KEY (id_admin) REFERENCES [dbo].usuario ON DELETE NO ACTION,
CONSTRAINT chk_tipo_evento CHECK (tipo IN ('deshabilitar', 'delistar', 'liquidar'))
);


IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[portafolio]') AND type in (N'U'))
CREATE TABLE [dbo].[portafolio] (
id_portafolio INT IDENTITY(1,1) PRIMARY KEY,
id_usuario INT NOT NULL,
id_empresa INT NOT NULL,
id_mercado INT NOT NULL,
cantidad INT NOT NULL,
costo_promedio DECIMAL(18,4) NOT NULL,
CONSTRAINT fk_portafolio_usuario FOREIGN KEY (id_usuario) REFERENCES [dbo].usuario ON DELETE CASCADE,
CONSTRAINT fk_portafolio_empresa FOREIGN KEY (id_empresa) REFERENCES [dbo].empresa ON DELETE CASCADE,
CONSTRAINT fk_portafolio_mercado FOREIGN KEY (id_mercado) REFERENCES [dbo].mercado ON DELETE NO ACTION,
CONSTRAINT chk_cantidad CHECK (cantidad >= 0),
CONSTRAINT chk_costo CHECK (costo_promedio >= 0),
CONSTRAINT uq_portafolio_usuario_empresa UNIQUE (id_usuario, id_empresa)
);
