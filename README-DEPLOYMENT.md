# Kruuse.cl - Deployment Guide

Este proyecto está configurado para usar Supabase como backend serverless y desplegarse en Vercel.

## Arquitectura

- **Frontend**: Next.js 15 con React 19
- **Backend**: Supabase Edge Functions (serverless)
- **Base de datos**: PostgreSQL en Supabase
- **Deployment**: Vercel
- **E-commerce**: Medusa.js adaptado para Supabase

## Configuración Local

1. Copia el archivo de variables de entorno:
```bash
cp .env.example .env.local
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el proyecto en desarrollo:
```bash
npm run dev
```

## Deployment en Vercel

### 1. Conectar el repositorio

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Importa este repositorio
3. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar variables de entorno en Vercel

En el dashboard de Vercel, ve a Settings > Environment Variables y añade:

```
NEXT_PUBLIC_SUPABASE_URL=https://qvgpmylkuermltgfzhme.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3BteWxrdWVybWx0Z2Z6aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODU1MzEsImV4cCI6MjA2ODg2MTUzMX0.o1pQ34DGbZYsF1ukGJqoiVeHTH0qzi8RVMQ1OWoxGDQ
MEDUSA_BACKEND_URL=https://qvgpmylkuermltgfzhme.supabase.co/functions/v1/medusa
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
NODE_ENV=production
```

### 3. Deploy

Vercel desplegará automáticamente cuando hagas push a la rama principal.

## Estructura del Backend Serverless

### Supabase Edge Functions

- **URL**: `https://qvgpmylkuermltgfzhme.supabase.co/functions/v1/medusa`
- **Función**: `medusa` - Maneja todas las rutas de la API de e-commerce

### Endpoints disponibles:

- `GET /store/products` - Lista productos
- `GET /store/products/{id}` - Producto específico
- `GET /store/collections` - Lista colecciones
- `GET /store/collections/{id}` - Colección específica
- `POST /store/carts` - Crear carrito
- `GET /store/carts/{id}` - Obtener carrito
- `POST /store/carts/{id}/line-items` - Añadir item al carrito
- `POST /store/customers` - Crear cliente
- `POST /store/orders` - Crear orden
- `GET /store/regions` - Lista regiones

### Base de Datos

La base de datos incluye las siguientes tablas principales:

- `products` - Productos
- `product_variants` - Variantes de productos
- `collections` - Colecciones
- `customers` - Clientes
- `carts` - Carritos de compra
- `line_items` - Items en carritos/órdenes
- `orders` - Órdenes
- `addresses` - Direcciones
- `regions` - Regiones y países

## Ventajas de esta arquitectura

1. **Serverless**: Sin servidores que mantener
2. **Escalable**: Auto-scaling automático
3. **Global**: CDN global de Vercel
4. **Económico**: Pay-per-use
5. **Rápido**: Edge functions cerca de los usuarios
6. **Seguro**: RLS (Row Level Security) habilitado

## Monitoreo

- **Vercel Analytics**: Métricas de rendimiento automáticas
- **Supabase Dashboard**: Monitoreo de base de datos y funciones
- **Logs**: Disponibles en ambas plataformas

## Próximos pasos

1. Configurar Stripe para pagos
2. Añadir autenticación de usuarios
3. Implementar búsqueda avanzada
4. Configurar emails transaccionales
5. Añadir analytics de e-commerce