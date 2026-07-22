import threading
import time
import cv2
import numpy as np
from collections import deque

from src.camera import CameraStream
from src.cloud_client import CloudClient


class VehicleDetector:
    def __init__(self, config: dict, cloud_client: CloudClient):
        self.config = config
        self.cloud_client = cloud_client
        self._running = False
        self._thread: threading.Thread | None = None
        self._stream: CameraStream | None = None
        self._pending = deque(maxlen=100)
        self._bg_subtractor = cv2.createBackgroundSubtractorMOG2(
            history=500, varThreshold=50, detectShadows=True
        )

    def start(self, stream: CameraStream):
        self._stream = stream
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def _loop(self):
        last_detection_time = 0
        cooldown_seconds = 5

        while self._running:
            frame = self._stream.read() if self._stream else None
            if frame is None:
                time.sleep(0.1)
                continue

            now = time.time()
            if now - last_detection_time < cooldown_seconds:
                continue

            vehicle = self._detect_vehicle(frame)
            if vehicle:
                direction = self._detect_direction(vehicle, frame.shape)
                size = self._classify_size(vehicle)
                image = self._crop_vehicle(frame, vehicle)
                _, encoded = cv2.imencode(".jpg", image)

                try:
                    self.cloud_client.send_event(direction, size, encoded.tobytes())
                    last_detection_time = now
                except Exception as e:
                    print(f"Falha ao enviar evento, armazenando para retry: {e}")
                    self._pending.append((direction, size, encoded.tobytes()))

            time.sleep(0.05)

    def _detect_vehicle(self, frame: cv2.Mat) -> tuple | None:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        fg_mask = self._bg_subtractor.apply(gray)
        _, thresh = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        best = None
        best_area = 0

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < self.config.get("min_plate_area", 8000):
                continue
            x, y, w, h = cv2.boundingRect(cnt)
            aspect = w / max(h, 1)
            if 0.5 < aspect < 3.5 and area > best_area:
                best_area = area
                best = (x, y, w, h, area)

        return best

    def _detect_direction(self, vehicle: tuple, frame_shape: tuple) -> str:
        _, y, _, h, _ = vehicle
        cy = y + h // 2
        height = frame_shape[0]
        # Se o centro do veículo está na metade superior do frame, considera entrada
        # Ajustar conforme orientação real da câmera
        return "entry" if cy < height // 2 else "exit"

    def _classify_size(self, vehicle: tuple) -> str:
        area = vehicle[4]
        if area < self.config.get("small_max_area", 80000):
            return "small"
        if area < self.config.get("medium_max_area", 180000):
            return "medium"
        return "large"

    def _crop_vehicle(self, frame: cv2.Mat, vehicle: tuple) -> cv2.Mat:
        x, y, w, h, _ = vehicle
        h_frame, w_frame = frame.shape[:2]
        x1 = max(0, x - int(w * 0.1))
        y1 = max(0, y - int(h * 0.1))
        x2 = min(w_frame, x + w + int(w * 0.1))
        y2 = min(h_frame, y + h + int(h * 0.1))
        return frame[y1:y2, x1:x2]

    def is_active(self) -> bool:
        return self._running

    def pending_count(self) -> int:
        return len(self._pending)

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
