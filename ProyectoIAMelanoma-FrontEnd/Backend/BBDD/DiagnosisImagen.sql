-- Eliminar base de datos para actualizar (descomentar linea 2 para su uso)
-- DROP DATABASE IF EXISTS DiagnosisImagen;

-- Crear la base de datos
CREATE DATABASE DiagnosisImagen;

-- Usar la base de datos recién creada
USE DiagnosisImagen;

-- Tabla Usuario
CREATE TABLE Usuario (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(100) NOT NULL,
    rol VARCHAR(50)
);

-- Tabla Categorizacion
CREATE TABLE Categorizacion (
    codigo VARCHAR(50) PRIMARY KEY,
    descripcion VARCHAR(255)
);

-- Tabla Imagen
CREATE TABLE Imagen (
    id VARCHAR(50) PRIMARY KEY,
    usuarioId VARCHAR(50),
    ruta VARCHAR(255),
    fechaSubida DATE,
    codigoCategoria VARCHAR(50),
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id),
    FOREIGN KEY (codigoCategoria) REFERENCES Categorizacion(codigo)
);

-- Tabla InformePDF
CREATE TABLE InformePDF (
    id VARCHAR(50) PRIMARY KEY,
    usuarioId VARCHAR(50),
    contenido TEXT,
    fechaGeneracion DATE,
    FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
);

-- Tabla DiagnosticoIA
CREATE TABLE DiagnosticoIA (
    id VARCHAR(50) PRIMARY KEY,
    imagenId VARCHAR(50),
    resultado TEXT,
    FOREIGN KEY (imagenId) REFERENCES Imagen(id)
);