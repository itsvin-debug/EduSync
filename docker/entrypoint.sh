#!/bin/sh
set -e

# Support Render dynamic $PORT
if [ -n "$PORT" ]; then
    echo "Configuring Nginx to listen on PORT $PORT..."
    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/nginx.conf
fi

# Ensure storage directories exist with right permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run database migrations if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || true
fi

# Run database seeder if enabled
if [ "$RUN_SEEDER" = "true" ]; then
    echo "Running database seeder..."
    php artisan db:seed --force || true
fi

# Cache configurations in production
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "Starting services via Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
