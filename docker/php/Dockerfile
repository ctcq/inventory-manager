FROM php:7.2-fpm
RUN apt-get update \
  && apt-get install -y git curl zip unzip libldap2-dev libicu-dev g++ wget \
  && apt-get clean
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN docker-php-ext-install -j$(nproc) mysqli
RUN docker-php-ext-install -j$(nproc) pdo
RUN docker-php-ext-install -j$(nproc) pdo_mysql

# Install phpUnit
RUN cd /opt/ \
    && composer require --dev phpunit/phpunit ^8
