# Etapa 1: Builder de Dependencias (Composer)
FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev

# Etapa 2: Entorno de Producción Final (PHP-FPM + Nginx en Alpine)
FROM php:8.4-fpm-alpine AS runner
WORKDIR /var/www/html
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql mbstring openssl tokenizer xml ctype bcmath
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    && mkdir -p /run/nginx /var/log/supervisor /var/www/html/storage /var/www/html/bootstrap/cache
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --from=composer-builder /app/vendor ./vendor
COPY . .
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN tr -d '\r' < /usr/local/bin/entrypoint.sh > /usr/local/bin/entrypoint-clean.sh && \
    mv /usr/local/bin/entrypoint-clean.sh /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
