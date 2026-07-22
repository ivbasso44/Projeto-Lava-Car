import { Event, IEvent } from "../models/Event";
import { WashCycle } from "../models/WashCycle";
import { runOcr } from "./ocrService";
import { getBucketName, getMinioClient } from "../config/storage";
import { generateImageKey } from "../middlewares/upload";

async function buildPublicImageUrl(bucket: string, key: string): Promise<string> {
  const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || "localhost";
  const port = process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || "9000";
  const useSSL = process.env.MINIO_PUBLIC_USE_SSL === "true" || process.env.MINIO_USE_SSL === "true";
  const protocol = useSSL ? "https" : "http";
  const minio = getMinioClient();
  const presigned = await minio.presignedGetObject(bucket, key, 24 * 60 * 60);
  const query = presigned.split("?")[1] || "";
  return `${protocol}://${publicEndpoint}:${port}/${bucket}/${key}${query ? "?" + query : ""}`;
}

export interface CreateEventInput {
  direction: "entry" | "exit";
  timestamp: string;
  vehicleSize: "small" | "medium" | "large";
  source: string;
  imageBuffer: Buffer;
  originalName: string;
}

export async function createEvent(input: CreateEventInput): Promise<IEvent> {
  const bucket = getBucketName();
  const key = generateImageKey(input.originalName);
  const minio = getMinioClient();

  await minio.putObject(bucket, key, input.imageBuffer, input.imageBuffer.length, {
    "Content-Type": "image/jpeg",
  });

  const imageUrl = await buildPublicImageUrl(bucket, key);

  const ocrResult = await runOcr(input.imageBuffer);

  const event = await Event.create({
    direction: input.direction,
    timestamp: new Date(input.timestamp),
    vehicleSize: input.vehicleSize,
    source: input.source,
    imageKey: key,
    imageUrl,
    detectedPlate: ocrResult.plate,
    plateConfidence: ocrResult.confidence,
    status: "pending",
  });

  await processEvent(event);

  return event;
}

async function processEvent(event: IEvent): Promise<void> {
  if (!event.detectedPlate) {
    return;
  }

  if (event.direction === "entry") {
    await WashCycle.create({
      plate: event.detectedPlate,
      vehicleSize: event.vehicleSize,
      entryEventId: event._id,
      entryAt: event.timestamp,
      status: "open",
    });
    event.status = "matched";
    await event.save();
  } else {
    const openCycle = await WashCycle.findOne({
      plate: event.detectedPlate,
      status: "open",
      exitAt: { $exists: false },
    }).sort({ entryAt: -1 });

    if (openCycle) {
      openCycle.exitEventId = event._id;
      openCycle.exitAt = event.timestamp;
      openCycle.status = "closed";
      await openCycle.save();

      event.status = "matched";
      await event.save();
    }
  }
}
