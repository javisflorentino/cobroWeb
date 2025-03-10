FROM node:22.11.0-alpine as BUILDER
# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@16.2.4
# Set the working directory inside the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install the application dependencies
RUN npm install
# Copy the rest of the application files
COPY . .
# Build the Angular application
# RUN npm run build
RUN ng build  --base-href ./

#--------------------------------------------------------
# Stage 2
FROM nginx:1.27.3-alpine

# Copiar desde la "Etapa" build el contenido de la carpeta build/
# dentro del directorio indicado en nginx
COPY --from=builder /usr/src/app/dist/portal_pagos_gob /usr/share/nginx/html
# Copiar desde la "Etapa" build el contenido de la carpeta la
# configuracion de nginx dentro del directorio indicado en nginx
COPY --from=builder /usr/src/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Inicie NGINX
CMD nginx -g "daemon off;"
