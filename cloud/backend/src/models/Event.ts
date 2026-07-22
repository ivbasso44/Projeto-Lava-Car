import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  direction: "entry" | "exit";
  timestamp: Date;
  vehicleSize: "small" | "medium" | "large";
  imageUrl?: string;
  imageKey?: string;
  detectedPlate?: string;
  plateConfidence?: number;
  source: string;
  status: "pending" | "matched" | "reviewed";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    direction: { type: String, enum: ["entry", "exit"], required: true },
    timestamp: { type: Date, required: true },
    vehicleSize: { type: String, enum: ["small", "medium", "large"], required: true },
    imageUrl: { type: String },
    imageKey: { type: String },
    detectedPlate: { type: String },
    plateConfidence: { type: Number },
    source: { type: String, required: true, default: "camera-corredor" },
    status: { type: String, enum: ["pending", "matched", "reviewed"], default: "pending" },
  },
  { timestamps: true }
);

EventSchema.index({ detectedPlate: 1, timestamp: -1 });
EventSchema.index({ direction: 1, status: 1 });

export const Event = mongoose.model<IEvent>("Event", EventSchema);
