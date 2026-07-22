FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 libgl1 \
    && pip3 install --break-system-packages \
        "numpy<2" \
        opencv-python-headless==4.9.0.80 \
        paddlepaddle==2.6.2 \
        paddleocr==2.7.3 \
        --no-cache-dir \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
