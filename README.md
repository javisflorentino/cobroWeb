# Portal de Pagos de Gobierno del Estado de morelos

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0.

## INSTALACION
1. Instalar NodeJs 18.17.1 – Version LTS `https://nodejs.org/es`
2. Instalar VSCode - `https://code.visualstudio.com/`
    Extensiones de VSCode
      Angular Language Service
      Angular Snippets
      Angular Schematics
      Auto Close Tag
      Activitus Bar
      Auto import
      Auto Rename Tag
      Error Lens
      Paste JSON as Code
      TypeScript Importer
      Editor Config for VSCode
      Better Comments
      Terminal
3. Instalar Angular 16.2.4 con el siguiente comando desde el CLI ```npm install -g @angular/cli```
4. Clonar el proyecto
5. Ejecutar ```npm install``` dentro de la carpeta del proyecto
6. Instalar de manera local json-server ```npm install --save-dev json-server```
7. Para levantar el servidor html de Angular ejecutar ```npm run start:proxy``` 
8. Levantamos el Servidor virtual de Banckend con ```npm run backend```
9. Levantamos el Servidor virtual de Mensajes ```npm run messages```

## DEPLOY
1. Instalar CopyFile ``` npm install --save-dev copyfiles ```
2. Ejecutar desde CMD ``` npm run build:github:local ```
3. Ejecutar desde CMD para DEV ``` npm run build:github:local-dev ```
4. Copiamos de la carpeta ``` DIST ``` la carpeta ``` ASSETS ``` Y LA PEGAMOS EN ``` DEPLOY ```   
5. La carpeta ``` DEPLOY ``` contendra el producto final


## DOCKERIZAR PROYECTO
1. Instalar Docker Desktop
2. Version de Docker 24.0.6, build ed223bc
3. Docker Compose version v2.23.0-desktop.1
4. Crear archivo Dockerfile sin extensión a nivel raiz y agregamos el contenido del archivo de este proyecto. Modificarlo de acuerdo al proyecto
5. Crear archivo .dockerignore a nivel de Dockerfile y agregamos el contenido del archivo de este proyecto y dependiendo de las necesidades
6. Crear el archivo nginx.conf Ponemos en escucha el mismo pueto que definimos en el Dockerfile   
7. Para crear la imagen de docker ejecutamos desde el CMD el siguiente comando ```docker build --no-cache --progress=plain -t portalpagoservicios .```
8. Para iniciar la imagen creada ejecutamos ```docker run -d -it -p 8080:8080/tcp portalpagoservicios```
9. Para exportar un contenedor ejecutamos ```docker save -o C:/Users/carlo/Downloads/portalpagoservicios.tar portalpagoservicios```
10. Para importar un contenedor ```docker load -i C:/Users/carlo/Downloads/portalpagoservicios.tar```
11. Una vez importado ejecutamos ```docker run -d -it -p 8080:8080/tcp portalpagoservicios```
