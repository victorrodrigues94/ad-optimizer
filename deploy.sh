#!/bin/bash

cd /home/ubuntu/ad-optimizer || exit
echo "→ Puxando últimas alterações..."
git pull

echo "→ Subindo containers com build..."
docker-compose up -d --build

echo "→ Removendo containers antigos não usados..."
docker image prune -f