# Projeto Lava-Car

Sistema de monitoramento de entrada e saída de veículos para lava-car, com leitura de placas, classificação de porte, cruzamento de lavagens e dashboard de auditoria.

## Objetivo

Permitir que a proprietária do lava-car acompanhe quantos veículos entraram e saíram, compare com os valores informados pelo sócio e identifique possíveis divergências.

## Arquitetura

```
Câmera Hikvision (corredor) ──→ Raspberry Pi (edge) ──→ VPS na nuvem
                                                        (backend + OCR + dashboard + MongoDB)
```

- **Edge (Raspberry Pi):** captura eventos da câmera, detecta direção, classifica porte do veículo e envia dados para nuvem.
- **Nuvem (VPS):** recebe imagens, executa OCR da placa com PaddleOCR, armazena registros no MongoDB e disponibiliza dashboard.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Edge | Python 3.11 + FastAPI + OpenCV |
| Backend | Node.js 20 + TypeScript + Express + Mongoose |
| Frontend | React 18 + Vite + TypeScript |
| OCR | PaddleOCR |
| Banco | MongoDB |
| Deploy | Docker + Docker Compose |
| Armazenamento de imagens | Cloudflare R2 / MinIO |

## Estrutura do repositório

```
.
├── README.md                 # Este arquivo
├── docker-compose.yml        # Orquestração local de desenvolvimento
├── edge/                     # Código do Raspberry Pi (gateway local)
│   ├── src/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── config.example.yaml
├── cloud/                    # Código da nuvem
│   ├── backend/              # API e processamento
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/             # Dashboard
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       └── vite.config.ts
├── docs/                     # Documentação
│   ├── arquitetura.md
│   ├── instalacao-camera.md
│   └── operacao.md
└── scripts/                  # Scripts auxiliares
```

## Primeiros passos

Veja [docs/arquitetura.md](docs/arquitetura.md) para entender o fluxo completo e [docs/instalacao-camera.md](docs/instalacao-camera.md) para orientações de instalação da câmera.

## Licença

Uso interno do projeto Lava-Car. 
