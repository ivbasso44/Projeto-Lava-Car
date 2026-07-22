import { Client } from "minio";

let minioClient: Client | null = null;

export function getMinioClient(): Client {
  if (!minioClient) {
    throw new Error("Cliente MinIO não inicializado");
  }
  return minioClient;
}

export async function setupStorage(): Promise<void> {
  const endpoint = process.env.MINIO_ENDPOINT || "localhost";
  const port = parseInt(process.env.MINIO_PORT || "9000", 10);
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin123";
  const bucket = process.env.MINIO_BUCKET || "lavacar";

  process.env.MINIO_PUBLIC_ENDPOINT = process.env.MINIO_PUBLIC_ENDPOINT || endpoint;

  minioClient = new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  const bucketExists = await minioClient.bucketExists(bucket);
  if (!bucketExists) {
    await minioClient.makeBucket(bucket);
    console.log(`Bucket ${bucket} criado`);
  }
}

export function getBucketName(): string {
  return process.env.MINIO_BUCKET || "lavacar";
}
