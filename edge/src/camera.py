import threading
import time
import cv2


class CameraStream:
    def __init__(self, config: dict):
        self.config = config
        self._rtsp_url = self._build_rtsp_url()
        self._cap: cv2.VideoCapture | None = None
        self._frame: cv2.Mat | None = None
        self._running = False
        self._thread: threading.Thread | None = None

    def _build_rtsp_url(self) -> str:
        ip = self.config["ip"]
        user = self.config["user"]
        password = self.config["password"]
        port = self.config.get("rtsp_port", 554)
        channel = self.config.get("channel", 101)
        stream_type = self.config.get("stream_type", "main")
        stream_suffix = "01" if stream_type == "main" else "02"
        return f"rtsp://{user}:{password}@{ip}:{port}/Streaming/Channels/{channel}{stream_suffix}"

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def _loop(self):
        while self._running:
            if self._cap is None or not self._cap.isOpened():
                self._cap = cv2.VideoCapture(self._rtsp_url)
                time.sleep(2)

            ret, frame = self._cap.read()
            if ret:
                self._frame = frame
            else:
                time.sleep(0.1)

        if self._cap:
            self._cap.release()

    def read(self) -> cv2.Mat | None:
        return self._frame

    def is_active(self) -> bool:
        return self._cap is not None and self._cap.isOpened() and self._frame is not None

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
