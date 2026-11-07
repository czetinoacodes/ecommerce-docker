# Tech Store — frontend

Frontend de comercio electrónico construido con Next.js 16 y conectado a una
API de Laravel. El catálogo es público; iniciar sesión es necesario para
administrar el carrito y realizar compras. El checkout crea una orden y
descuenta las existencias desde el backend. No se integra Stripe.

## Requisitos

- Node.js compatible con Next.js 16 y pnpm 12.
- PHP 8.3 o superior y Composer.
- La base de datos que usa el backend Laravel.

## Ejecutar el proyecto

El frontend y el backend son proyectos separados. Inicia primero Laravel y
después Next.js; deja ambos procesos corriendo en terminales distintas.

### 1. Preparar y ejecutar el backend

Desde la carpeta del backend:

```powershell
cd "C:\Users\Carlos Ruiz\Desktop\fsj36\actividad-evaluada\ecommerce-backend\ecommercer-api"
composer install
```

Si todavía no existe el archivo `.env`, créalo a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

Configura en `.env` la conexión a la base de datos. El ejemplo del proyecto usa
SQLite. Después ejecuta las migraciones, los datos de prueba y configura las
claves necesarias para Laravel y JWT:

```powershell
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan db:seed
php artisan serve --host 127.0.0.1 --port 8000
```

`db:seed` crea los usuarios, productos y órdenes de ejemplo. Si la base de datos
ya contiene datos, no vuelvas a ejecutar los seeders sin revisar primero si sus
registros se pueden duplicar.

### 2. Preparar y ejecutar el frontend

Desde la carpeta de este proyecto:

```powershell
cd "C:\Users\Carlos Ruiz\Desktop\fsj36\actividad-evaluada\ecommerce-frontend\ecommerce-frontend"
pnpm install
```

Crea `.env.local` en la raíz del frontend y configura la URL del backend:

```env
LARAVEL_API_URL=http://127.0.0.1:8000
```

Inicia Next.js:

```powershell
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). Para generar y ejecutar la
versión de producción:

```powershell
pnpm build
pnpm start
```

## Rutas implementadas

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Público | Página de inicio con acceso al catálogo. |
| `/productos` | Público | Catálogo en tarjetas con nombre, precio y stock. Para añadir al carrito se requiere iniciar sesión; si no hay sesión, se solicita login o registro y luego se recupera el producto seleccionado. |
| `/login` | Público | Formulario para iniciar sesión o crear una cuenta. |
| `/ordenes` | Con sesión | Historial de compras del usuario, con ID de orden, estado, productos, total y paginación. |

El carrito aparece en la barra de navegación. Se conserva localmente por usuario,
permite quitar productos y evita compartir artículos entre cuentas. El botón
**Realizar compra** envía los productos y cantidades a Laravel; el backend valida
el stock, calcula el total, descuenta las existencias y crea la orden. Al
completarse la compra, el carrito se limpia y se muestra la orden creada.

Las rutas de productos y órdenes incluyen estados de carga y manejo de errores
con opción para reintentar. Las secciones de catálogo e historial se cargan con
`Suspense`.

## API utilizada

El frontend se conecta a la API mediante las rutas:

- `GET /api/products` — catálogo público.
- `POST /api/login` y `POST /api/register` — autenticación y creación de cuenta.
- `GET /api/me` — datos del usuario autenticado.
- `GET /api/orders` — historial de órdenes del usuario.
- `POST /api/orders` — crear una orden y descontar existencias.

Las peticiones protegidas usan el token JWT guardado en una cookie `httpOnly`
por el frontend; el token no se expone al JavaScript del navegador.

## OBSERVACIONES
No se realizó la implementación de Stripe debido a complicaciones en el proceso.
