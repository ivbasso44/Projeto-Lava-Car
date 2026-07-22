# Arquitetura do Sistema

## Visão geral

O sistema monitora um corredor único de entrada e saída de veículos em um lava-car. A câmera detecta o veículo, o edge (Raspberry Pi) classifica o evento e envia para a nuvem, onde a placa é lida por OCR e os dados são cruzados.

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────────────────┐
│   Câmera    │      │  Edge (RPI)  │      │           Nuvem             │
│  Hikvision  │──────│   Python     │──────│  Node.js + Express + MongoDB │
│             │ RTSP │  FastAPI +   │ HTTPS│  PaddleOCR + React Dashboard │
│  4MP AcuSens│      │  OpenCV      │      │  Cloudflare R2 / MinIO      │
└─────────────┘      └──────────────┘      └─────────────────────────────┘
```

## Fluxo de eventos

### 1. Detecção de veículo

A câmera Hikvision dispara eventos de detecção de veículo via ISAPI ou gera movimento no stream RTSP. O edge consome esses eventos.

### 2. Captura de imagem

No momento da detecção, o edge captura um frame do stream RTSP com a melhor qualidade possível da placa.

### 3. Detecção de direção

Como o corredor é único para entrada e saída, a direção é determinada por:

- **Rastreamento do centro do veículo** ao longo de N frames.
- **Duas linhas virtuais** no corredor: a ordem em que as linhas são cruzadas indica se o veículo entrou ou saiu.

A combinação das duas técnicas aumenta a confiança.

### 4. Classificação de porte

O edge analisa a área da caixa delimitadora do veículo e classifica em:

- Pequeno (motos, hatchs pequenos)
- Médio (sedans, SUVs compactos)
- Grande (caminhonetes, vans, SUVs grandes)

A classificação é ajustável por calibração local.

### 5. Envio para nuvem

O edge envia:

- Imagem original
- Direção (entry / exit)
- Porte estimado
- Timestamp
- Confiança da detecção

### 6. OCR na nuvem

O backend recebe a imagem, executa o PaddleOCR em uma região de interesse e tenta extrair a placa no formato brasileiro (AAA-0A00 ou antigo AAA-0000).

### 7. Cruzamento de entrada e saída

Quando uma placa é detectada saindo, o sistema procura uma entrada em aberto para a mesma placa e fecha o ciclo.

Se não encontrar placa correspondente (OCR falhou ou veículo ficou mais de 24h), o registro fica em aberto para revisão manual.

### 8. Auditoria

A proprietária acessa o dashboard e:

- Visualiza veículos do dia.
- Informa tipo de lavagem e valor recebido.
- Compara total do caixa com total esperado.
- Recebe alertas de divergências.

## Modelo de dados

### Event (evento bruto da câmera)

```json
{
  "_id": "ObjectId",
  "direction": "entry | exit",
  "timestamp": "2026-07-22T14:30:00Z",
  "vehicleSize": "small | medium | large",
  "imageUrl": "https://...",
  "detectedPlate": "AAA0A00",
  "plateConfidence": 0.92,
  "source": "camera-corredor",
  "status": "pending | matched | reviewed",
  "createdAt": "2026-07-22T14:30:01Z"
}
```

### WashCycle (ciclo de lavagem)

```json
{
  "_id": "ObjectId",
  "plate": "AAA0A00",
  "vehicleSize": "medium",
  "entryEventId": "ObjectId",
  "exitEventId": "ObjectId | null",
  "entryAt": "2026-07-22T14:30:00Z",
  "exitAt": "2026-07-22T15:15:00Z",
  "washType": "simples | enceramento | completa",
  "price": 50.00,
  "registeredValue": 50.00,
  "status": "open | closed | reviewed",
  "createdAt": "2026-07-22T14:30:01Z"
}
```

### DailySummary (resumo diário)

```json
{
  "_id": "ObjectId",
  "date": "2026-07-22",
  "totalEntries": 35,
  "totalExits": 33,
  "openCycles": 2,
  "expectedRevenue": 1750.00,
  "registeredRevenue": 1600.00,
  "difference": -150.00,
  "createdAt": "2026-07-22T23:59:59Z"
}
```

## Segurança

- Comunicação entre edge e nuvem via HTTPS com token de API.
- Imagens armazenadas em bucket privado com URL pré-assinada.
- Senhas e chaves em variáveis de ambiente.

## Escalabilidade

O sistema foi desenhado para operar em um único lava-car. Se futuramente houver múltiplas unidades, basta replicar o edge e usar o mesmo backend com identificador de unidade.
