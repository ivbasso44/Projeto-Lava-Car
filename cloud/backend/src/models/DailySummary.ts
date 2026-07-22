import mongoose, { Schema, Document } from "mongoose";

export interface IDailySummary extends Document {
  date: string;
  locationId: string;
  totalEntries: number;
  totalExits: number;
  openCycles: number;
  closedCycles: number;
  expectedRevenue: number;
  registeredRevenue: number;
  difference: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    date: { type: String, required: true, unique: true },
    locationId: { type: String, default: "default" },
    totalEntries: { type: Number, default: 0 },
    totalExits: { type: Number, default: 0 },
    openCycles: { type: Number, default: 0 },
    closedCycles: { type: Number, default: 0 },
    expectedRevenue: { type: Number, default: 0 },
    registeredRevenue: { type: Number, default: 0 },
    difference: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DailySummary = mongoose.model<IDailySummary>("DailySummary", DailySummarySchema);
