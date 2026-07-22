import mongoose, { Schema, Document } from "mongoose";

export interface IWashCycle extends Document {
  plate?: string;
  vehicleSize: "small" | "medium" | "large";
  entryEventId: mongoose.Types.ObjectId;
  exitEventId?: mongoose.Types.ObjectId;
  entryAt: Date;
  exitAt?: Date;
  washType?: "simples" | "enceramento" | "completa" | "outro";
  price?: number;
  registeredValue?: number;
  status: "open" | "closed" | "reviewed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WashCycleSchema = new Schema<IWashCycle>(
  {
    plate: { type: String, index: true },
    vehicleSize: { type: String, enum: ["small", "medium", "large"], required: true },
    entryEventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    exitEventId: { type: Schema.Types.ObjectId, ref: "Event" },
    entryAt: { type: Date, required: true },
    exitAt: { type: Date },
    washType: { type: String, enum: ["simples", "enceramento", "completa", "outro"] },
    price: { type: Number },
    registeredValue: { type: Number },
    status: { type: String, enum: ["open", "closed", "reviewed"], default: "open" },
    notes: { type: String },
  },
  { timestamps: true }
);

WashCycleSchema.index({ plate: 1, entryAt: -1 });
WashCycleSchema.index({ status: 1, entryAt: -1 });

export const WashCycle = mongoose.model<IWashCycle>("WashCycle", WashCycleSchema);
