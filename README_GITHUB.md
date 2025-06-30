# 🏫 Sistema de Gestión Escolar

Sistema web completo de gestión escolar desarrollado con **React**, **Node.js**, **Express** y **PostgreSQL**. Incluye funcionalidades avanzadas de autenticación, gestión de usuarios, horarios, calificaciones y notificaciones por email.

## 🚀 Características Principales

- ✅ **Autenticación JWT** con roles diferenciados (Admin, Docente, Estudiante, Padre)
- ✅ **Registro automático de padres** con emails de bienvenida
- ✅ **Gestión de horarios** con agrupación jerárquica
- ✅ **Sistema de calificaciones** y control de asistencia
- ✅ **Interfaz moderna** con modo oscuro/claro
- ✅ **Notificaciones por email** en tiempo real
- ✅ **Dashboard personalizado** por rol de usuario

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (Base de datos)
- **JWT** (Autenticación)
- **bcryptjs** (Encriptación)
- **Nodemailer** (Emails)

### Frontend
- **React** 18+
- **React Router** (Navegación)
- **Context API** (Estado global)
- **CSS Variables** (Temas)

## 📋 Requisitos Previos

- **Node.js** v18.0.0 o superior
- **PostgreSQL** v13.0 o superior
- **npm** v9.0.0 o superior

## ⚡ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/sistema-gestion-escolar.git
cd sistema-gestion-escolar
```

### 2. Configurar base de datos
```sql
-- En PostgreSQL
CREATE DATABASE secundaria;
```

### 3. Configurar backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de base de datos
node run-migration.js
```

### 4. Configurar frontend
```bash
cd ../frontend
npm install
```

### 5. Ejecutar el proyecto
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Configuración

### Variables de Entorno (.env)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secundaria
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT y seguridad
JWT_SECRET=tu_jwt_secret_super_seguro

# Email (opcional)
EMAIL_SERVICE=ethereal
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=tu_email_user
EMAIL_PASSWORD=tu_email_password
```

## 👥 Roles y Funcionalidades

| Rol | Funcionalidades |
|-----|----------------|
| **Admin** | Gestión completa: usuarios, horarios, calificaciones |
| **Docente** | Calificaciones, asistencia, consulta de horarios |
| **Estudiante** | Consulta de calificaciones, horarios, información personal |
| **Padre** | Seguimiento de hijos, horarios, calificaciones |

## 📁 Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Middlewares de autenticación
│   │   └── config/         # Configuración de BD
│   ├── migrations/         # Scripts de migración
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API
│   │   └── styles/         # Estilos CSS
│   └── package.json
└── README.md
```

## 🧪 Scripts Útiles

```bash
# Backend
npm run dev          # Servidor con auto-reload
node run-migration.js # Ejecutar migraciones
node list-padres.js  # Listar usuarios padre

# Frontend
npm start            # Desarrollo
npm run build        # Producción
```

## 📧 Sistema de Emails

El sistema incluye notificaciones automáticas por email:
- **Registro de padres**: Credenciales de acceso
- **Contraseñas temporales**: Con expiración automática
- **Configuración flexible**: Soporta Gmail, Outlook, Ethereal

## 🔒 Seguridad

- **Contraseñas encriptadas** con bcryptjs
- **Tokens JWT** con expiración
- **Middleware de autenticación** en rutas protegidas
- **Validación de roles** granular
- **Prevención de inyección SQL** con consultas parametrizadas

## 📱 Interfaz

- **Diseño responsive** para móviles y desktop
- **Modo oscuro/claro** con persistencia
- **Navegación intuitiva** sin navbar tradicional
- **Componentes modernos** con animaciones CSS

## 🚀 Despliegue

### Variables de Producción
- Configurar base de datos PostgreSQL en la nube
- Usar variables de entorno seguras
- Configurar HTTPS
- Configurar proveedor de email real (Gmail/SendGrid)

### Servicios Recomendados
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Netlify, Vercel
- **Base de datos**: ElephantSQL, AWS RDS

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear un [Issue](https://github.com/tuusuario/sistema-gestion-escolar/issues)
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para instituciones educativas**
