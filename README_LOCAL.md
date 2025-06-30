 # Sistema de Gestión Escolar - Modernizado

Este proyecto es una aplicación web completa de gestión escolar con un diseño moderno y profesional. Incluye backend en Node.js/Express, frontend en React modernizado, y base de datos PostgreSQL con funcionalidades avanzadas de autenticación y notificación por email.

## ✨ Características Principales

### 🎨 **Interfaz Modernizada**
- **Diseño profesional** con CSS moderno y consistente
- **Modo oscuro** integrado con persistencia local
- **Navegación centralizada** sin navbar tradicional
- **Componentes unificados** con estilos institucionales
- **Responsive design** optimizado para diferentes dispositivos

### 🔐 **Sistema de Autenticación Avanzado**
- **Registro automático de padres/tutores** con generación de usuario único
- **Contraseñas temporales** con expiración automática (3 días)
- **Cambio obligatorio de contraseña** en primer inicio de sesión ✅ **CORREGIDO**
- **Notificaciones por email** para nuevos usuarios ✅ **VERIFICADO**
- **Tokens JWT** con tiempo de vida configurable
- **Corrección de bug crítico**: Token se almacena correctamente durante cambio de contraseña

### 👥 **Gestión de Roles**
- **Administradores**: Gestión completa del sistema
- **Docentes**: Manejo de calificaciones y asistencia
- **Estudiantes**: Consulta de información académica
- **Padres/Tutores**: Seguimiento de hijos con acceso controlado

### 📧 **Sistema de Notificaciones**
- **Emails automáticos** para padres recién registrados ✅ **FUNCIONAL**
- **Plantillas profesionales** con información de acceso
- **Configuración SMTP** flexible (Ethereal para testing, Gmail/Outlook para producción)
- **URLs de preview** para desarrollo y testing
- **Sistema de correos verificado** y funcionando en tiempo real

## 💻 Requisitos del Sistema

### **Requisitos Mínimos**

#### **Sistema Operativo**
- **Windows**: Windows 10 (64-bit) o superior
- **macOS**: macOS 10.15 Catalina o superior
- **Linux**: Ubuntu 18.04 LTS, CentOS 7, Debian 10 o distribuciones equivalentes

#### **Hardware Mínimo**
- **Procesador**: Intel Core i3 / AMD Ryzen 3 o equivalente
- **RAM**: 4 GB mínimo (8 GB recomendado)
- **Almacenamiento**: 2 GB de espacio libre en disco
- **Conexión a Internet**: Banda ancha para funcionamiento óptimo

#### **Software Base**
- **Node.js**: v18.0.0 o superior ⚠️ **OBLIGATORIO**
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **PostgreSQL**: v13.0 o superior ⚠️ **OBLIGATORIO**
- **Git**: Para clonación y control de versiones

### **Requisitos Recomendados**

#### **Hardware Recomendado**
- **Procesador**: Intel Core i5 / AMD Ryzen 5 o superior
- **RAM**: 8 GB o más
- **Almacenamiento**: SSD con 5 GB de espacio libre
- **Resolución**: 1366x768 mínimo (1920x1080 recomendado)

#### **Software Recomendado**
- **Node.js**: v20.x.x LTS (última versión estable)
- **PostgreSQL**: v15.x o v16.x (últimas versiones estables)
- **Editor de código**: VS Code, WebStorm, o similar
- **Cliente PostgreSQL**: pgAdmin 4, DBeaver, o similar

### **Navegadores Compatibles**

#### **Navegadores Soportados**
- **Google Chrome**: v90 o superior ✅ **Recomendado**
- **Mozilla Firefox**: v88 o superior
- **Microsoft Edge**: v90 o superior
- **Safari**: v14 o superior (macOS)

#### **Características Requeridas del Navegador**
- **JavaScript**: Habilitado ⚠️ **OBLIGATORIO**
- **Cookies**: Habilitadas para autenticación
- **LocalStorage**: Para persistencia de preferencias
- **Resolución mínima**: 1024x768

### **Configuración de Red**

#### **Puertos Requeridos**
- **Puerto 3000**: Frontend React (desarrollo)
- **Puerto 3001**: Backend API Node.js
- **Puerto 5432**: PostgreSQL (por defecto)

#### **Conectividad**
- **Conexión SMTP**: Para envío de emails (configurable)
- **Acceso a Internet**: Para descargas de dependencias
- **Firewall**: Permitir conexiones en puertos especificados

### **Dependencias de Desarrollo**

#### **Para Instalación**
```bash
# Verificar versiones instaladas
node --version    # Debe ser v18+ 
npm --version     # Debe ser v9+
psql --version    # Debe ser v13+
git --version     # Cualquier versión reciente
```

#### **Configuración de PostgreSQL**
- **Servicio**: PostgreSQL ejecutándose como servicio
- **Usuario**: Cuenta con permisos para crear bases de datos
- **Configuración**: `postgresql.conf` con configuraciones por defecto
- **Autenticación**: `pg_hba.conf` configurado para conexiones locales

### **Variables de Entorno Requeridas**

#### **Archivo .env (Backend)**
```env
# ⚠️ OBLIGATORIAS
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secundaria
DB_USER=[tu_usuario_postgresql]
DB_PASSWORD=[tu_password_postgresql]
JWT_SECRET=[clave_secreta_segura]

# 📧 OPCIONALES (para emails)
EMAIL_SERVICE=ethereal
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=[usuario_email]
EMAIL_PASSWORD=[password_email]
```

### **Verificación de Requisitos**

#### **Script de Verificación Automática**
```bash
# Ejecutar en la carpeta del proyecto
cd backend
node check-system-requirements.js
```

#### **Verificación Manual**
1. **Node.js**: `node --version` → Debe mostrar v18+ 
2. **npm**: `npm --version` → Debe mostrar v9+
3. **PostgreSQL**: `psql --version` → Debe mostrar v13+
4. **Conectividad**: Verificar acceso a puertos 3000, 3001, 5432

### **Solución de Problemas Comunes**

#### **"Node.js version not supported"**
```bash
# Desinstalar versión antigua e instalar Node.js v18+
# Descargar desde: https://nodejs.org/
```

#### **"PostgreSQL connection failed"**
```bash
# Verificar que PostgreSQL esté ejecutándose
# Windows: services.msc → PostgreSQL
# macOS/Linux: sudo systemctl status postgresql
```

#### **"Port already in use"**
```bash
# Verificar puertos ocupados
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### **Instalación de Dependencias**

#### **Node.js y npm**
- **Windows**: Descargar desde [nodejs.org](https://nodejs.org/)
- **macOS**: `brew install node` o desde nodejs.org
- **Linux Ubuntu**: `sudo apt update && sudo apt install nodejs npm`

#### **PostgreSQL**
- **Windows**: Descargar desde [postgresql.org](https://www.postgresql.org/download/)
- **macOS**: `brew install postgresql`
- **Linux Ubuntu**: `sudo apt install postgresql postgresql-contrib`

## 🚀 Instalación y configuración

### 1. Clona el repositorio y entra a la carpeta del proyecto

```bash
# Clona el repositorio (o copia la carpeta en tu equipo)
cd ProyectoADS
```

### 2. Configura la base de datos PostgreSQL

#### Crear la base de datos:
```sql
CREATE DATABASE secundaria;
```

#### Ejecutar migraciones:
```bash
cd backend
node run-migration.js
```

#### Configuración de conexión:
Crea un archivo `.env` en la carpeta `backend` (usa `.env.example` como referencia):

```env
# Configuración del servidor
PORT=3001

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secundaria
DB_USER=postgres
DB_PASSWORD=040917

# Configuración JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# Configuración de correo electrónico (para notificaciones)
EMAIL_SERVICE=ethereal
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=tu_email_user
EMAIL_PASSWORD=tu_email_password
EMAIL_FROM="Sistema Escolar" <sistema@escuela.edu.mx>

# URL del frontend (para enlaces en emails)
FRONTEND_URL=http://localhost:3000
```

### 3. Instala las dependencias del backend
```bash
cd backend
npm install
```

### 4. Instala las dependencias del frontend
```bash
cd ../frontend
npm install
```

### 5. Inicia el backend
```bash
cd ../backend
npm run dev
```
El backend se ejecutará en `http://localhost:3001`.

### 6. Inicia el frontend
```bash
cd ../frontend
npm start
```
El frontend se ejecutará en `http://localhost:3000`.

## 📋 Funcionalidades Implementadas

### 🔧 **Administración**
- ✅ **Gestión de usuarios** con roles diferenciados
- ✅ **Registro de padres/tutores** con email automático
- ✅ **Gestión de estudiantes** y asignación de tutores
- ✅ **Control de accesos** basado en roles
- ✅ **Dashboard administrativo** centralizado
- ✅ **Horarios agrupados** por año y grupo (A/B)
- ✅ **Validación de formatos** de matrícula y usuario corregida

### 📚 **Académico**
- ✅ **Gestión de calificaciones** por materia y periodo
- ✅ **Control de asistencia** con justificaciones
- ✅ **Registro de incidencias** con seguimiento
- ✅ **Horarios escolares** con agrupación jerárquica (año → grupo)
- ✅ **Talleres extracurriculares** con inscripciones
- ✅ **Consulta de calificaciones** optimizada (solo usuarios con calificaciones)

### 👨‍👩‍👧‍👦 **Padres/Tutores**
- ✅ **Registro automático** con usuario único (matrícula + homoclave)
- ✅ **Email de bienvenida** con credenciales temporales
- ✅ **Acceso controlado** a información de sus hijos
- ✅ **Cambio obligatorio de contraseña** en primer acceso
- ✅ **Dashboard personalizado** con información relevante

## 🛠️ **Mejoras y Correcciones Recientes (Junio 2025)**

### 🔧 **Problemas Críticos Resueltos:**
- ✅ **Token de autenticación**: Corregido bug donde el token no se almacenaba durante cambio de contraseña temporal
- ✅ **Validación de formatos**: Scripts ejecutados para corregir matrículas y usuarios malformados
- ✅ **Consulta de calificaciones**: Optimizada para mostrar solo usuarios con calificaciones (INNER JOIN)
- ✅ **Agrupación de horarios**: Implementada agrupación jerárquica por año y luego por grupo

### 📧 **Sistema de Correos Verificado:**
- ✅ **Envío en tiempo real**: Probado y funcional con Ethereal Email
- ✅ **Configuración flexible**: Soporta Gmail, Outlook, y otros proveedores SMTP
- ✅ **Plantillas HTML**: Emails profesionales con información completa de acceso

### 🧹 **Limpieza de Código:**
- ✅ **Archivos de debug eliminados**: Removidos componentes de depuración del frontend
- ✅ **Scripts de prueba**: Eliminados archivos temporales de testing y desarrollo
- ✅ **Logs optimizados**: Reducidos logs excesivos manteniendo solo los esenciales

### 🔐 **Flujo de Autenticación Mejorado:**
```javascript
// ANTES (❌ Bug): Token no se guardaba para cambio de contraseña
if (data.passwordChangeRequired) {
  setTempToken(data.token); // Solo variable local
  setShowPasswordChangeModal(true);
}

// DESPUÉS (✅ Corregido): Token se guarda correctamente
if (data.passwordChangeRequired) {
  login(data.token); // Guarda en localStorage
  setTempToken(data.token);
  setShowPasswordChangeModal(true);
}
```

## 🎯 **Flujo de Registro de Padres/Tutores**

### 1. **Administrador registra nuevo padre:**
```
Admin → UsuariosList → "Crear Padre" 
→ Completa formulario (nombre, email, estudiante, homoclave)
→ Sistema genera usuario único
```

### 2. **Sistema procesa automáticamente:**
```
✅ Crea usuario en tabla 'usuario' (para login)
✅ Crea registro en tabla 'padre' (datos específicos)
✅ Vincula padre-estudiante en 'padre_estudiante'
✅ Genera contraseña temporal (8 caracteres)
✅ Configura expiración (3 días)
✅ Envía email con credenciales
```

### 3. **Padre accede al sistema:**
```
Padre recibe email → Login con credenciales temporales
→ Sistema fuerza cambio de contraseña
→ Acceso completo al dashboard
```

### 4. **Generación de usuario único:**
```
Matrícula del estudiante + Homoclave del padre
Ejemplo: A003 + 4ZW = A0034ZW
```

## 🔒 **Seguridad Implementada**

- **Contraseñas temporales** que expiran automáticamente
- **Validación de formato** para homoclave y email
- **Prevención de usuarios duplicados**
- **Tokens JWT** con expiración controlada
- **Middleware de autenticación** en todas las rutas protegidas
- **Control de roles** granular por endpoint

## 🎨 **Interfaz de Usuario**

### **Características del diseño:**
- **Sin navbar tradicional**: Navegación centralizada en dashboard
- **Modo oscuro/claro**: Toggle persistente con CSS variables
- **Componentes consistentes**: Estilos unificados en toda la app
- **Colores institucionales**: Paleta azul profesional
- **Responsive**: Adaptable a móviles y tablets
- **Animaciones suaves**: Transiciones CSS elegantes

### **Estructura de componentes:**
```
src/
├── components/
│   ├── Layout.js              # Layout principal con tema
│   ├── Dashboard.js           # Dashboard unificado por rol
│   ├── ComponentStyles.css    # Estilos globales modernos
│   ├── ThemeToggle.js         # Control de modo oscuro
│   ├── PasswordChangeModal.js # Modal para cambio de contraseña
│   └── [otros componentes]    # Vistas específicas por rol
```

## 🛠️ **Tecnologías y Dependencias**

### **Backend:**
- **Node.js + Express**: Servidor web y API REST
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticación y autorización
- **bcryptjs**: Hashing de contraseñas
- **Nodemailer**: Envío de emails
- **CORS**: Configuración de políticas de origen cruzado

### **Frontend:**
- **React**: Framework de interfaz de usuario
- **React Router**: Navegación SPA
- **Context API**: Gestión de estado global
- **CSS Variables**: Sistema de temas dinámico
- **LocalStorage**: Persistencia de preferencias

### **Base de Datos:**
```sql
-- Tablas principales
usuario                 -- Autenticación y datos base
padre                   -- Información específica de tutores
estudiante              -- Información de estudiantes
padre_estudiante        -- Relación padre-hijo
incidencia              -- Registro de incidencias
calificacion           -- Calificaciones académicas
asistencia             -- Control de asistencia
```

## 🧪 **Testing y Desarrollo**

### **Scripts útiles disponibles:**
```bash
# Listar usuarios padre activos
node list-padres.js

# Generar hash para admin
node genera_hash_admin.js

# Ejecutar migraciones de BD
node run-migration.js

# Ejecutar migraciones de admin
node run-admin-migration.js

# Probar envío de correos (Ethereal)
node test-email-final.js
```

### **Archivos de configuración:**
- `.env` - Variables de entorno del backend
- `.env.example` - Plantilla de configuración
- `migrations/` - Scripts de migración de base de datos

### **URLs de desarrollo:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Login directo**: http://localhost:3000

### **Usuario de prueba disponible:**
- **Email**: test.frontend@example.com
- **Contraseña temporal**: TEMP123
- **Propósito**: Testing de flujo de cambio de contraseña

## 📝 **Notas Importantes**

### **Para producción:**
- ✅ Configurar SMTwhaP real para emails
- ✅ Usar variables de entorno seguras
- ✅ Configurar HTTPS
- ✅ Optimizar base de datos
- ✅ Configurar backups automáticos

### **Para desarrollo:**
- ✅ Usar Ethereal para testing de emails
- ✅ Mantener `.env` fuera del control de versiones
- ✅ Usar `npm run dev` para auto-reload
- ✅ Revisar logs de consola para debugging

## 🆘 **Resolución de Problemas**

### **Backend no inicia:**
```bash
# Verificar que PostgreSQL esté corriendo
# Verificar credenciales en .env
# Ejecutar: npm install
```

### **Frontend no conecta:**
```bash
# Verificar que backend esté en puerto 3001
# Revisar configuración CORS
# Verificar API_URL en frontend
```

### **Emails no se envían:**
```bash
# Verificar credenciales SMTP en .env
# Usar Ethereal para testing: node test-email-final.js
# Revisar logs del servidor
```

### **Error "Token no proporcionado":**
```bash
# ✅ RESUELTO: Bug corregido en Login.js
# El token ahora se guarda correctamente durante cambio de contraseña
# No requiere acción adicional
```

### **Usuarios no pueden hacer login:**
```bash
# Verificar usuarios activos con: node list-padres.js
# Los usuarios pueden haber cambiado durante actualizaciones de BD
# Usar los usuarios mostrados por el script
```

### **Calificaciones no aparecen:**
```bash
# ✅ OPTIMIZADO: Consulta corregida con INNER JOIN
# Solo muestra usuarios que tienen calificaciones
# Comportamiento esperado y correcto
```

## 👥 **Créditos y Soporte**

Sistema desarrollado y modernizado para gestión escolar completa.
Para soporte técnico o dudas sobre implementación, contactar al equipo de desarrollo.

---
**Última actualización**: Junio 29, 2025  
**Versión**: 2.1 - Correcciones críticas y optimizaciones  
**Estado**: ✅ Producción lista - Todos los bugs críticos resueltos
