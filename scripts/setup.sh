#!/bin/bash
set -e

echo "Iniciando ambiente de desenvolvimento do LavaCar..."

cd "$(dirname "$0")/.."

if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instale o Docker e o Docker Compose primeiro."
    exit 1
fi

docker-compose up --build -d

echo ""
echo "Ambiente iniciado:"
echo "  Dashboard: http://localhost:5173"
echo "  API:       http://localhost:3000"
echo "  MinIO:     http://localhost:9001"
echo ""
echo "Para parar: docker-compose down"
