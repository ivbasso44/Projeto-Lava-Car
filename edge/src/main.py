import os
import yaml
import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

from src.camera import CameraStream
from src.detector import VehicleDetector
from src.cloud_client import CloudClient
from src.config import Settings

settings = Settings()

stream: CameraStream | None = None
detector: VehicleDetector | None = None
cloud_client: CloudClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global stream, detector, cloud_client

    config = load_config()
    stream = CameraStream(config["camera"])
    stream.start()

    cloud_client = CloudClient(config["edge"])
    detector = VehicleDetector(config["processing"], cloud_client)
    detector.start(stream)

    yield

    detector.stop()
    stream.stop()


app = FastAPI(title="LavaCar Edge", lifespan=lifespan)


def load_config() -> dict:
    config_path = os.environ.get("CONFIG_PATH", "config.yaml")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {
        "camera": {
            "ip": settings.camera_ip,
            "user": settings.camera_user,
            "password": settings.camera_password,
            "rtsp_port": settings.camera_rtsp_port,
            "channel": 101,
            "stream_type": "main",
        },
        "edge": {
            "api_url": settings.edge_api_url,
            "api_token": settings.edge_api_token,
        },
        "processing": {
            "line_entry": [0.4, 0.0, 0.4, 1.0],
            "line_exit": [0.6, 0.0, 0.6, 1.0],
            "small_max_area": 80000,
            "medium_max_area": 180000,
        },
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "stream_active": stream.is_active() if stream else False,
        "detector_active": detector.is_active() if detector else False,
    }


@app.get("/status")
async def status():
    return {
        "pending_events": detector.pending_count() if detector else 0,
    }


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
