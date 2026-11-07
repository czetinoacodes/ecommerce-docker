# Tech Store — Ecosistema E-Commerce Contenerizado

Proyecto de arquitectura de microservicios contenerizado para un entorno de producción, compuesto por un **Frontend en Next.js 16**, una **API REST en Laravel (PHP 8.2+)** y una base de datos relacional **MySQL 8.0**. Toda la infraestructura está orquestada mediante **Docker Compose** y optimizada con **Dockerfiles Multi-stage** para garantizar imágenes ligeras, seguras, reproducibles y con tiempos de construcción acelerados por caché de capas.

---

## Arquitectura del Ecosistema

El sistema se compone de tres servicios interconectados en una red privada virtual de tipo puente (`bridge`), donde los componentes frontend y backend exponen puertos al host, mientras que la base de datos permanece aislada:

```mermaid
flowchart TD
    subgraph Host["Host Machine (Navegador / Cliente)"]
        Browser["Navegador Web"]
        HTTPClient["Cliente HTTP / Postman"]
    end

    subgraph DockerBridge["Red Privada Docker (ecommerce-network)"]
        subgraph FrontendContainer["Contenedor: ecommerce-frontend"]
            NextServer["Next.js 16 (App Router)<br/>Puerto 3000<br/>Usuario: nextjs (no-root)"]
        end

        subgraph BackendContainer["Contenedor: ecommerce-backend"]
            Nginx["Nginx (Proxy Inverso)<br/>Puerto 8000"]
            PHPFPM["PHP-FPM 8.3<br/>127.0.0.1:9000"]
            Supervisord["Supervisor Daemon"]
            Supervisord --> Nginx
            Supervisord --> PHPFPM
            Nginx -->|FastCGI| PHPFPM
        end

        subgraph MySQLContainer["Contenedor: ecommerce-mysql"]
            MySQL["MySQL Server 8.0<br/>Puerto interno 3306"]
        end
    end

    subgraph Storage["Volúmenes Persistentes"]
        VolMySQL[("ecommerce-mysql-data<br/>/var/lib/mysql")]
    end

    Browser -->|http://localhost:3000| NextServer
    HTTPClient -->|http://localhost:8000| Nginx
    NextServer -->|http://backend:8000 (SSR / Server Actions)| Nginx
    PHPFPM -->|Conexión PDO mysql:3306| MySQL
    MySQL --- VolMySQL
```

---

## Instrucciones de Ejecución

### 1. Requisitos Previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución (compatible con Docker Engine 20+ y Docker Compose v2+).
* Git para clonar el repositorio.

### 2. Configuración de Variables de Entorno
Crea el archivo `.env` en la raíz del proyecto a partir de la plantilla documentada `.env.example`:

```powershell
# En Windows PowerShell:
Copy-Item .env.example .env

# En Linux / macOS / Bash:
cp .env.example .env
```

El archivo `.env` viene preconfigurado con valores seguros y funcionales para iniciar de inmediato. Puedes personalizar contraseñas o nombres de base de datos si lo requieres.

### 3. Construir y Levantar el Ecosistema
Ejecuta el siguiente comando en la raíz del proyecto para compilar las imágenes multi-stage y arrancar los contenedores en segundo plano:

```bash
docker compose up --build -d
```

### 4. Verificación de Estado
Verifica que los tres contenedores estén en estado saludable (`healthy` / `running`):

```bash
docker compose ps
```

### 5. Acceso a las Aplicaciones
* **Frontend Web:** Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
* **API REST Backend:** Accede al endpoint público de catálogo en [http://localhost:8000/api/products](http://localhost:8000/api/products).

---

## Inicialización de Base de Datos, Migraciones y Seeders

Uno de los desafíos principales al desplegar Laravel en contenedores con MySQL es cómo poblar la base de datos de manera consistente y automatizada. En este proyecto se implementaron dos soluciones:

### 1. Estrategia Nativa de Laravel (Automatizada vía `entrypoint.sh`)
El contenedor del backend cuenta con un script de inicio (`backend/docker/entrypoint.sh`) que:
1. **Espera activa a MySQL:** Antes de ejecutar cualquier comando de Laravel, realiza un sondeo mediante PDO hacia el servicio `mysql:3306` hasta que la base de datos esté lista para aceptar conexiones (evitando errores de tipo *"Connection refused"* durante el arranque).
2. **Ejecución de Migraciones:** Si la variable `RUN_MIGRATIONS=true` está activa en `.env`, ejecuta automáticamente `php artisan migrate --force`.
3. **Poblado con Seeders:** Si la variable `RUN_SEEDERS=true` está activa, ejecuta `php artisan db:seed --force`, poblando los usuarios, productos y órdenes iniciales.


### 3. Soporte para Scripts SQL en `/docker-entrypoint-initdb.d/`
Tal como lo solicita la rúbrica de la actividad, se ha configurado el montaje:
```yaml
volumes:
  - ./database/init:/docker-entrypoint-initdb.d:ro
```
Cualquier archivo `.sql` o `.sh` que se coloque dentro de la carpeta `database/init/` será ejecutado automáticamente por MySQL la primera vez que se inicialice el volumen físico de almacenamiento.

---

## Decisiones Técnicas y Optimización de Dockerfiles

### 1. Servicio Frontend (`frontend/Dockerfile`)

* **Uso de Imagen Base Alpine (`node:20-alpine`):**  
  Reduce drásticamente el tamaño base frente a las imágenes de Debian/Ubuntu (de ~1 GB a ~150 MB), reduciendo vulnerabilidades en paquetes del sistema operativo.
* **Estrategia Multi-Stage en 4 Etapas:**
  1. `deps`: Instala únicamente las dependencias completas basándose en `package.json` y `pnpm-lock.yaml`.
  2. `builder`: Copia el código fuente y compila la aplicación (`pnpm run build`), generando el directorio optimizado `.next`.
  3. `prod-deps`: Instala de forma aislada **únicamente las dependencias de producción** (`pnpm install --prod`), descartando TypeScript, ESLint, Tailwind compilers y herramientas de desarrollo.
  4. `runner`: Etapa final limpia donde **solo se transfieren** `.next`, `node_modules` de producción, `public` y `package.json`.
* **Caché Eficiente de Capas:**  
  La copia de `pnpm-lock.yaml` ocurre antes de copiar el código fuente. Si se modifica un componente de React, Docker reutiliza la capa de instalación de dependencias sin volver a descargarlas.
* **Principio de Menor Privilegio (Usuario No-Root):**  
  Se crea el usuario y grupo del sistema `nextjs:nodejs` (UID/GID 1001). La aplicación no corre como `root`, mitigando riesgos de escalada de privilegios en el contenedor.
* **Archivos Estrictamente Necesarios:**  
  El contenedor solo incluye lo indispensable para ejecutar `next start` en el puerto `3000`.

### 2. Servicio Backend (`backend/Dockerfile`)

* **Estrategia Multi-Stage:**
  1. `composer-builder`: Utiliza la imagen oficial de `composer:2` para descargar dependencias con `--no-dev --optimize-autoloader --no-scripts`. Todo el tooling de Composer y Git queda confinado en esta etapa descartable.
  2. `runner`: Parte de `php:8.3-fpm-alpine`, copia únicamente el directorio `vendor/` resultante y el código de la aplicación.
* **Integración Nginx + PHP-FPM en un Solo Servicio:**  
  Para respetar la consigna de un ecosistema de **tres servicios** (Frontend, Backend, Base de Datos) sin recurrir a un cuarto contenedor para el servidor web, se instaló Nginx y Supervisord en la imagen del backend. Supervisord supervisa en primer plano (`nodaemon=true`) tanto el proceso de Nginx como el de PHP-FPM, enviando todos los logs a `stdout`/`stderr`.
* **Extensiones PHP Nativas y de Alto Rendimiento:**  
  Mediante `install-php-extensions` se instalan de forma limpia: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json` y `bcmath`, eliminando herramientas de compilación una vez instaladas.
* **Seguridad de Archivos y Permisos:**  
  Los directorios `storage` y `bootstrap/cache` se configuran con propietario `www-data:www-data` y permisos `775`. La configuración de Nginx bloquea explícitamente cualquier acceso a archivos ocultos (como `.env` o `.git`).
* **Optimización con `.dockerignore`:**  
  Evita que directorios pesados del host (`vendor/`, `node_modules/`, `storage/logs/`, archivos temporales) se envíen en el contexto de construcción de Docker.

### 3. Servicio de Base de Datos (`mysql` en `docker-compose.yml`)

* **Imagen Oficial MySQL 8.0:**  
  Configurada con autenticación compatible (`mysql_native_password`) y variables de entorno (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`).
* **Volumen Persistente Nombrado:**  
  Los datos se guardan en el volumen `mysql_data` montado en `/var/lib/mysql`, impidiendo la pérdida de información al reiniciar o recrear los contenedores.
* **Seguridad de Red (Puerto 3306 No Expuesto):**  
  Se utiliza la directiva `expose: - "3306"` en lugar de `ports: - "3306:3306"`. Esto asegura que el puerto 3306 únicamente sea accesible por otros contenedores dentro de `ecommerce-network`, protegiendo la base de datos de ataques o escaneos desde la red exterior del host.
* **Healthcheck Integrado:**  
  Monitorea la disponibilidad del motor MySQL mediante `mysqladmin ping`. El servicio `backend` depende de esta condición (`condition: service_healthy`) para asegurar que no intente arrancar antes de que la base de datos esté lista para recibir conexiones.

---