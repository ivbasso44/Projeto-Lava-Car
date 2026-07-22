# Operação do Sistema

## Iniciar ambiente de desenvolvimento

```bash
docker-compose up --build
```

Acesse:

- Dashboard: http://localhost:5173
- API: http://localhost:3000
- MongoDB: mongodb://admin:admin123@localhost:27017
- MinIO console: http://localhost:9001

## Fluxo diário

1. Veículo passa pelo corredor.
2. Edge detecta direção e envia evento para nuvem.
3. Nuvem executa OCR e cria/atualiza ciclo de lavagem.
4. Proprietária acessa dashboard ao final do dia.
5. Proprietária informa valores registrados no caixa.
6. Sistema destaca divergências.

## Status dos ciclos

- **Aberto:** veículo entrou e ainda não saiu.
- **Fechado:** entrada e saída foram pareadas.
- **Revisado:** ciclo fechado com ajuste manual.

## Alertas

- Ciclo aberto por mais de 24h.
- Veículo saiu sem entrada correspondente.
- Diferença entre receita esperada e receita registrada.

## Manutenção

- Verifique armazenamento do bucket periodicamente.
- Ajuste sensibilidade da câmera se houver muitos falsos positivos.
- Atualize token de API do edge conforme necessário.
