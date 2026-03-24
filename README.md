# TradePro - Plataforma de Trading USDT con Sistema MLM

Una plataforma de trading simulado con wallet USDT, sistema de referidos multinivel (MLM) de 3 niveles, y panel de administración.

## 🚀 Características

- **Autenticación completa**: Registro, login, logout con JWT
- **Wallet USDT**: Depósitos, retiros y transferencias entre usuarios
- **Trading simulado**: Compra/venta de BTC con precios simulados
- **Sistema MLM 3 niveles**: Comisiones automáticas del 10%, 5%, 2%
- **Panel de administración**: Gestión de usuarios y transacciones
- **Diseño moderno**: UI oscura con tema verde, totalmente responsive

## 📋 Requisitos

- Node.js 18+
- PostgreSQL (Neon, Supabase, o local)

## 🛠️ Instalación

### 1. Clonar e instalar dependencias

```bash
cd trading-platform
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita `.env`:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@host:5432/database?sslmode=require"

# JWT Secret (genera uno seguro)
JWT_SECRET="tu-clave-secreta-muy-larga-y-segura-32chars"

# URL de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Tasas de comisión MLM (porcentajes)
COMMISSION_LEVEL_1="10"
COMMISSION_LEVEL_2="5"
COMMISSION_LEVEL_3="2"
```

### 3. Configurar la base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# (Opcional) Crear usuario admin inicial
npx prisma db seed
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciales por defecto

Después de ejecutar el seed:

- **Admin**: admin@trading.com / admin123 (con 10,000 USDT)

## 📁 Estructura del Proyecto

```
trading-platform/
├── prisma/
│   ├── schema.prisma      # Modelos de base de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   │   ├── auth/      # Login, registro, logout
│   │   │   ├── wallet/    # Operaciones de wallet
│   │   │   ├── trade/     # Trading simulado
│   │   │   ├── referrals/ # Estadísticas de referidos
│   │   │   └── admin/     # Endpoints admin
│   │   ├── dashboard/     # Páginas del dashboard
│   │   ├── admin/         # Panel de administración
│   │   ├── login/         # Página de login
│   │   ├── register/      # Página de registro
│   │   └── page.tsx       # Landing page
│   ├── lib/
│   │   ├── prisma.ts      # Cliente Prisma
│   │   ├── auth.ts        # Utilidades JWT
│   │   ├── referrals.ts   # Lógica MLM
│   │   └── validations.ts # Schemas Zod
│   └── middleware.ts      # Protección de rutas
└── package.json
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Wallet
- `GET /api/wallet` - Balance y transacciones
- `POST /api/wallet` - Depositar/Retirar
- `POST /api/wallet/transfer` - Transferir a otro usuario

### Trading
- `GET /api/trade` - Precio actual
- `POST /api/trade` - Ejecutar compra/venta

### Referidos
- `GET /api/referrals` - Estadísticas de red MLM

### Admin
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/transactions` - Listar transacciones
- `POST /api/admin/adjust` - Ajustar balance de usuario

## 🌐 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

## 💡 Sistema MLM

Cuando un usuario realiza trading, las comisiones se distribuyen automáticamente:

```
Usuario A (opera $100)
    ↓ 10% ($10)
Usuario B (nivel 1 - quien refirió a A)
    ↓ 5% ($5)
Usuario C (nivel 2 - quien refirió a B)
    ↓ 2% ($2)
Usuario D (nivel 3 - quien refirió a C)
```

Los links de referido tienen el formato: `https://tu-dominio.com/register?ref=CODIGO`

## ⚠️ Notas

- Esta es una plataforma de **trading simulado** con fines educativos
- Los precios de BTC son ficticios y se actualizan automáticamente
- No hay conexión con exchanges reales
- Los depósitos y retiros son simulados

## 📝 Licencia

MIT
