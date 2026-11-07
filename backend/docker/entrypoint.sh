#!/bin/sh
set -e

# Asegurar permisos correctos para Laravel
rm -f /var/www/html/bootstrap/cache/*.php
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generar APP_KEY si no está configurada
if [ -z "$APP_KEY" ]; then
    echo "Generando APP_KEY..."
    php artisan key:generate --force
fi

# Generar JWT_SECRET si falta y el paquete jwt está disponible
if [ -z "$JWT_SECRET" ]; then
    if php artisan list | grep -q "jwt:secret"; then
        echo "Configurando JWT_SECRET..."
        php artisan jwt:secret --force || true
    fi
fi

# Si se usa MySQL, esperar a que el servicio esté listo
if [ "$DB_CONNECTION" = "mysql" ] && [ -n "$DB_HOST" ]; then
    echo "Verificando disponibilidad de MySQL ($DB_HOST)..."
    max_tries=30
    count=0
    until php -r "
        try {
            new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '3306') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " >/dev/null 2>&1; do
        count=$((count+1))
        if [ $count -ge $max_tries ]; then
            echo "Tiempo de espera agotado para MySQL. Continuando..."
            break
        fi
        echo "Esperando a MySQL ($count/$max_tries)..."
        sleep 2
    done
    echo "MySQL está listo y respondiendo."

    # Ejecutar migraciones automáticamente si RUN_MIGRATIONS=true (por defecto true)
    if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
        echo "Ejecutando migraciones de Laravel..."
        php artisan migrate --force
    fi

    # Ejecutar seeders si RUN_SEEDERS=true
    if [ "${RUN_SEEDERS:-false}" = "true" ]; then
        echo "Ejecutando seeders de Laravel..."
        php artisan db:seed --force
    fi
fi

# Optimizar caches si es producción
if [ "$APP_ENV" = "production" ]; then
    echo "Optimizando caches para producción..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "Iniciando Nginx y PHP-FPM con Supervisord..."
exec "$@"
