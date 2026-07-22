import { WashCycle, IWashCycle } from "../models/WashCycle";

export interface UpdateWashCycleInput {
  washType?: "simples" | "enceramento" | "completa" | "outro";
  price?: number;
  registeredValue?: number;
  notes?: string;
  status?: "open" | "closed" | "reviewed";
  plate?: string;
}

export async function updateWashCycle(
  id: string,
  input: UpdateWashCycleInput
): Promise<IWashCycle | null> {
  return WashCycle.findByIdAndUpdate(id, input, { new: true });
}

export async function listWashCycles(filters: {
  status?: string;
  date?: string;
  plate?: string;
}): Promise<IWashCycle[]> {
  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.plate) {
    query.plate = { $regex: filters.plate, $options: "i" };
  }

  if (filters.date) {
    const start = new Date(filters.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.entryAt = { $gte: start, $lt: end };
  }

  return WashCycle.find(query).sort({ entryAt: -1 }).populate("entryEventId exitEventId");
}

export async function getWashCycleById(id: string): Promise<IWashCycle | null> {
  return WashCycle.findById(id).populate("entryEventId exitEventId");
}
