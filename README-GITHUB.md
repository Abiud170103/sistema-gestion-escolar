# 🏫 Sistema de Gestión Escolar

> Sistema completo de gestión escolar con interfaz moderna, desarrollado en React + Node.js + PostgreSQL

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Características Principales

### 🎨 **Interfaz Modernizada**
- Diseño profesional con modo oscuro/claro
- Navegación centralizada sin navbar tradicional
- Responsive design optimizado
- Componentes unificados con estilos institucionales

### 🔐 **Sistema de Autenticación Robusto**
- Registro automático de padres/tutores
- Contraseñas temporales con expiración
- Notificaciones por email automáticas
- JWT con control de roles granular

### 👥 **Gestión Multi-Rol**
- **Administradores**: Gestión completa del sistema
- **Docentes**: Calificaciones y asistencia
- **Estudiantes**: Consulta de información académica
- **Padres**: Seguimiento controlado de sus hijos

### 📚 **Funcionalidades Académicas**
- Gestión de horarios agrupados por año/grupo
- Sistema de calificaciones por periodo
- Control de asistencia y justificaciones
- Registro de incidencias con seguimiento
- Talleres extracurriculares

## 🚀 Instalación Rápida

### Prerequisitos
```bash
# Verificar versiones requeridas
node --version    # v18+
npm --version     # v9+
psql --version    # v13+
```

### 1. Clonar e instalar
```bash
git clone https://github.com/TU_USUARIO/sistema-gestion-escolar.git
cd sistema-gestion-escolar
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 3. Configurar Base de Datos
```sql
-- En PostgreSQL
CREATE DATABASE secundaria;
```

```bash
# Ejecutar migraciones
node run-migration.js
```

### 4. Configurar Frontend
```bash
cd ../frontend
npm install
```

### 5. Iniciar Aplicación
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm start
```

🎉 **¡Listo!** Abre http://localhost:3000

## 📋 Variables de Entorno Requeridas

Crea un archivo `.env` en `/backend` basado en `.env.example`:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_NAME=secundaria
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro

# Email (para notificaciones)
EMAIL_SERVICE=ethereal  # o gmail
EMAIL_USER=tu_email
EMAIL_PASSWORD=tu_password
```

## 🏗️ Arquitectura del Proyecto

```
📁 sistema-gestion-escolar/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 routes/     # Endpoints de la API
│   │   ├── 📁 middlewares/ # Autenticación y validación
│   │   └── 📁 config/     # Configuración BD y email
│   ├── 📁 migrations/     # Scripts de migración BD
│   └── 📄 .env.example    # Plantilla de configuración
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/ # Componentes React
│   │   ├── 📁 context/    # Estados globales
│   │   └── 📄 api.js      # Cliente de API
└── 📄 README.md
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js + Express** - Servidor web y API REST
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación y autorización
- **Nodemailer** - Sistema de emails
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React** - Framework de UI
- **React Router** - Navegación SPA
- **Context API** - Gestión de estado
- **CSS Variables** - Sistema de temas
- **LocalStorage** - Persistencia de datos

## 📧 Sistema de Notificaciones

El sistema incluye notificaciones automáticas por email:

- **Registro de padres**: Email de bienvenida con credenciales
- **Contraseñas temporales**: Expiran automáticamente en 3 días
- **Configuración flexible**: Soporta Gmail, Outlook, Ethereal

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Middleware de autenticación en rutas protegidas
- Validación de roles granular
- Sanitización de entradas

## 🧪 Testing y Scripts Útiles

```bash
# En /backend
node run-migration.js       # Migrar base de datos
node run-admin-migration.js # Crear usuario admin
```

## 📝 Notas de Desarrollo

### Para Desarrollo
- Usar Ethereal Email para testing de correos
- Logs detallados en consola
- Auto-reload con `npm run dev`

### Para Producción
- Configurar SMTP real (Gmail/Outlook)
- Variables de entorno seguras
- Configurar HTTPS
- Optimizar base de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la [documentación completa](README.md)
2. Verifica los requisitos del sistema
3. Consulta las variables de entorno requeridas
4. Abre un issue en GitHub

---

**Desarrollado con ❤️ para la gestión escolar moderna**

📧 **Email**: soporte@sistemaescolar.com  
🌐 **Demo**: https://demo.sistemaescolar.com  
📚 **Docs**: https://docs.sistemaescolar.com
