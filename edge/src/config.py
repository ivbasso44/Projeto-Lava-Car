from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    camera_ip: str = "192.168.1.100"
    camera_user: str = "admin"
    camera_password: str = "admin123"
    camera_rtsp_port: int = 554
    camera_channel: int = 101

    edge_api_url: str = "http://localhost:3000/api"
    edge_api_token: str = ""

    class Config:
        env_file = ".env"
