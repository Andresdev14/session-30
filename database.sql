CREATE TABLE usuarios (
    id CHAR(36) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(30) NOT NULL DEFAULT 'admin',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE acudientes (
    id CHAR(36) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(120),
    direccion TEXT,
    whatsapp_activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE estudiantes (
    id CHAR(36) PRIMARY KEY,
    codigo_estudiante VARCHAR(30) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20),
    numero_documento VARCHAR(30) UNIQUE,
    fecha_nacimiento DATE,
    grado VARCHAR(30),
    anio_lectivo INT,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE estudiante_acudiente (
    id CHAR(36) PRIMARY KEY,
    estudiante_id CHAR(36) NOT NULL,
    acudiente_id CHAR(36) NOT NULL,
    parentesco VARCHAR(50),
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    responsable_pago BOOLEAN NOT NULL DEFAULT TRUE,
    recibe_notificaciones BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,

    CONSTRAINT fk_estudiante
        FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(id),

    CONSTRAINT fk_acudiente
        FOREIGN KEY (acudiente_id)
        REFERENCES acudientes(id),

    CONSTRAINT unique_estudiante_acudiente
        UNIQUE (estudiante_id, acudiente_id)
);

CREATE TABLE tipos_cobro (
    id CHAR(36) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE cuentas_por_cobrar (
    id CHAR(36) PRIMARY KEY,
    estudiante_id CHAR(36) NOT NULL,
    tipo_cobro_id CHAR(36) NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    saldo_pendiente DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_estudiante_cxc
        FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(id),

    CONSTRAINT fk_tipo_cobro
        FOREIGN KEY (tipo_cobro_id)
        REFERENCES tipos_cobro(id)
);

CREATE TABLE pagos (
    id CHAR(36) PRIMARY KEY,
    cuenta_por_cobrar_id CHAR(36) NOT NULL,
    registrado_por_id CHAR(36),
    fecha_pago TIMESTAMP NOT NULL,
    valor_pagado DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    referencia VARCHAR(100),
    created_at TIMESTAMP,

    CONSTRAINT fk_cuenta_pago
        FOREIGN KEY (cuenta_por_cobrar_id)
        REFERENCES cuentas_por_cobrar(id),

    CONSTRAINT fk_usuario_pago
        FOREIGN KEY (registrado_por_id)
        REFERENCES usuarios(id)
);

CREATE TABLE notificaciones_whatsapp (
    id CHAR(36) PRIMARY KEY,
    estudiante_id CHAR(36) NOT NULL,
    acudiente_id CHAR(36) NOT NULL,
    cuenta_por_cobrar_id CHAR(36),
    telefono_destino VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP,
    estado_envio VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP,

    CONSTRAINT fk_estudiante_notificacion
        FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(id),

    CONSTRAINT fk_acudiente_notificacion
        FOREIGN KEY (acudiente_id)
        REFERENCES acudientes(id),

    CONSTRAINT fk_cuenta_notificacion
        FOREIGN KEY (cuenta_por_cobrar_id)
        REFERENCES cuentas_por_cobrar(id)
);

CREATE TABLE asistencias (
    id CHAR(36) PRIMARY KEY,
    estudiante_id CHAR(36) NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    hora_ingreso TIME,
    hora_salida TIME,
    observacion VARCHAR(255),
    registrado_por_id CHAR(36),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_estudiante_asistencia
        FOREIGN KEY (estudiante_id)
        REFERENCES estudiantes(id),

    CONSTRAINT fk_usuario_asistencia
        FOREIGN KEY (registrado_por_id)
        REFERENCES usuarios(id),

    CONSTRAINT unique_asistencia
        UNIQUE (estudiante_id, fecha)
);