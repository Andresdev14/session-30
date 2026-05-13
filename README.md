# AdminBot

AdminBot es un panel de administración escolar construido con un backend en Node.js + Express y un frontend con Vite y Vanilla JS.

## Estructura del proyecto

- `Backend/` — servidor API, conexión a MySQL, autenticación y módulo de WhatsApp.
- `Frontend/` — páginas del frontend con Vite: dashboard, estudiantes, acudientes, pagos y auth.

## Requisitos

- Node.js 18+ instalado
- Servidor MySQL disponible

## Configuración del backend

1. Rellena los datos faltantes del archivo .env para adaptarlos a tus tokens y contraseñas
2. Completa los valores de base de datos y JWT.
3. Crea la base de datos y las tablas usando `Backend/database.sql`.
4. Si deseas, carga datos de ejemplo usando `Backend/src/seed/seed.js`.

### Ejecutar backend

```bash
cd Backend
npm install
npm start
```

El backend escucha en `http://localhost:3000`.

## Configuración del frontend

```bash
cd Frontend
npm install
npm run dev
```

Abre la URL que indique Vite para usar la aplicación.

## Autenticación

Usa las credenciales de ejemplo si se cargan datos de seed:

- `admin@test.com` / `123456`
- `john@test.com` / `admin123`

## Variables de entorno

Valores de ejemplo en `Backend/.env.example`:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `JWT_SECRET`
- `PHONE_ID`
- `WHATSAPP_TOKEN`

## Notas

- Los archivos `.env` están ignorados por `.gitignore`.
- La integración con WhatsApp requiere valores válidos para `PHONE_ID` y `WHATSAPP_TOKEN`.
- La página de asistencia actualmente contiene un marcador de posición; el CRUD de asistencia no está incluido en esta entrega.
