import io
import requests
from datetime import datetime


class CloudClient:
    def __init__(self, config: dict):
        self.api_url = config["api_url"].rstrip("/")
        self.api_token = config.get("api_token", "")

    def send_event(self, direction: str, vehicle_size: str, image: bytes, source: str = "camera-corredor"):
        url = f"{self.api_url}/events"
        files = {"image": ("vehicle.jpg", io.BytesIO(image), "image/jpeg")}
        data = {
            "direction": direction,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "vehicleSize": vehicle_size,
            "source": source,
        }
        headers = {}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"

        try:
            response = requests.post(url, files=files, data=data, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Erro ao enviar evento: {e}")
            raise
