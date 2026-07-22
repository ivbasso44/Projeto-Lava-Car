"""
Script para simular o envio de um evento da câmera para o backend.
Útil para testar o fluxo sem precisar da câmera real.

Exemplo de uso:
    python scripts/simulate_event.py \
        --image /caminho/para/foto.jpg \
        --direction entry \
        --vehicle-size medium \
        --api-url http://localhost:3000/api
"""

import argparse
import requests
from datetime import datetime, timezone


def main():
    parser = argparse.ArgumentParser(description="Simula evento da câmera")
    parser.add_argument("--image", required=True, help="Caminho da imagem do veículo")
    parser.add_argument(
        "--direction", choices=["entry", "exit"], default="entry", help="Direção do veículo"
    )
    parser.add_argument(
        "--vehicle-size",
        choices=["small", "medium", "large"],
        default="medium",
        help="Porte do veículo",
    )
    parser.add_argument(
        "--api-url", default="http://localhost:3000/api", help="URL base da API"
    )
    args = parser.parse_args()

    with open(args.image, "rb") as f:
        files = {"image": ("vehicle.jpg", f, "image/jpeg")}
        data = {
            "direction": args.direction,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vehicleSize": args.vehicle_size,
            "source": "simulator",
        }

        response = requests.post(f"{args.api_url}/events", files=files, data=data)
        print(f"Status: {response.status_code}")
        print(response.json())


if __name__ == "__main__":
    main()
