CREATE TABLE IF NOT EXISTS rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  CONSTRAINT chk_rol CHECK (nombre_rol IN ('Admin', 'Trader', 'Analyst'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(50) NOT NULL,
  limite_diario DECIMAL(18,2) NOT NULL,
  CONSTRAINT chk_categoria CHECK (nombre_categoria IN ('Junior', 'Mid', 'Senior') AND limite_diario >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mercado (
  id_mercado INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  estado ENUM('habilitado', 'deshabilitado') NOT NULL DEFAULT 'habilitado',
  UNIQUE KEY uq_mercado_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_rol INT NOT NULL,
  id_categoria INT,
  alias VARCHAR(50) NOT NULL,
  estado BOOLEAN NOT NULL DEFAULT TRUE,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(15),
  direccion VARCHAR(255),
  pais_de_origen VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  last_access DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_alias (alias),
  UNIQUE KEY uq_usuario_correo (correo),
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE SET NULL,
  CONSTRAINT chk_correo CHECK (correo LIKE '%@%.%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS empresa (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  id_mercado INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio_actual DECIMAL(18,4) NOT NULL,
  cantidad_acciones BIGINT NOT NULL,
  market_cap DECIMAL(18,2) AS (precio_actual * cantidad_acciones) STORED,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_empresa_mercado FOREIGN KEY (id_mercado) REFERENCES mercado(id_mercado) ON DELETE CASCADE,
  CONSTRAINT chk_precio CHECK (precio_actual > 0),
  CONSTRAINT chk_acciones CHECK (cantidad_acciones >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario_mercado (
  id_usuario INT NOT NULL,
  id_mercado INT NOT NULL,
  PRIMARY KEY (id_usuario, id_mercado),
  CONSTRAINT fk_usermkt_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_usermkt_mercado FOREIGN KEY (id_mercado) REFERENCES mercado(id_mercado) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wallet (
  id_wallet INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  saldo DECIMAL(18,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_wallet_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT chk_saldo CHECK (saldo >= 0),
  UNIQUE KEY uq_wallet_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recarga (
  id_recarga INT AUTO_INCREMENT PRIMARY KEY,
  id_wallet INT NOT NULL,
  monto DECIMAL(18,2) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recarga_wallet FOREIGN KEY (id_wallet) REFERENCES wallet(id_wallet) ON DELETE CASCADE,
  CONSTRAINT chk_monto CHECK (monto > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS portafolio (
  id_portafolio INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_empresa INT NOT NULL,
  id_mercado INT NOT NULL,
  cantidad INT NOT NULL,
  costo_promedio DECIMAL(18,4) NOT NULL,
  CONSTRAINT fk_portafolio_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_portafolio_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  CONSTRAINT fk_portafolio_mercado FOREIGN KEY (id_mercado) REFERENCES mercado(id_mercado) ON DELETE CASCADE,
  CONSTRAINT chk_cantidad CHECK (cantidad >= 0),
  CONSTRAINT chk_costo CHECK (costo_promedio >= 0),
  UNIQUE KEY uq_portafolio_usuario_empresa (id_usuario, id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tesoreria (
  id_tesoreria INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  acciones_disponibles BIGINT NOT NULL,
  CONSTRAINT fk_tesoreria_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  CONSTRAINT chk_acciones_tesoreria CHECK (acciones_disponibles >= 0),
  UNIQUE KEY uq_tesoreria_empresa (id_empresa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS historico_precio (
  id_hist INT AUTO_INCREMENT PRIMARY KEY,
  id_empresa INT NOT NULL,
  precio DECIMAL(18,4) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  CONSTRAINT chk_precio_hist CHECK (precio > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS evento_admin (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_admin INT NOT NULL,
  tipo ENUM('deshabilitar', 'delistar', 'liquidar') NOT NULL,
  justificacion TEXT,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evento_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_evento_admin FOREIGN KEY (id_admin) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transaccion (
  id_tx INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_empresa INT NOT NULL,
  tipo ENUM('compra', 'venta', 'liquidacion') NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(18,4) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_tx_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE,
  CONSTRAINT chk_cantidad_tx CHECK (cantidad > 0),
  CONSTRAINT chk_precio_tx CHECK (precio > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

