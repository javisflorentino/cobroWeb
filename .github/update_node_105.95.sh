#!/bin/sh
LOCAL=/home/jenkins/jenkins_pipeline/workspace/Pro_portalpagoservicios
DEPLOY=/home/docker/9000_app.hacienda.morelos.gob.mx/9030_portalpagoservicios
echo "Borrando Deploy Pasado"
rm -rf $DEPLOY/data/portalpagoservicios/*
sleep 10
#
echo "Deteniendo Servicio en Nodo"
cd $DEPLOY
docker compose down
sleep 10
#
echo "Creando Servicio en Nodo"
mv $LOCAL/deploy/* $DEPLOY/data/portalpagoservicios/
#
echo "Iniciando Servicio"
cd $DEPLOY
docker compose up -d
sleep 8