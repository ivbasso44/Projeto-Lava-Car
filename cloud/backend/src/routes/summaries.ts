import { Router, Request, Response, NextFunction } from "express";
import { DailySummary } from "../models/DailySummary";
import { WashCycle } from "../models/WashCycle";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const summary = await DailySummary.findOne({ date });
    res.json(summary || { date, message: "Sem resumo para esta data" });
  } catch (error) {
    next(error);
  }
});

router.post("/recalculate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    const start = new Date(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const cycles = await WashCycle.find({
      entryAt: { $gte: start, $lt: end },
    });

    const totalEntries = cycles.length;
    const closedCycles = cycles.filter((c) => c.status === "closed").length;
    const openCycles = cycles.filter((c) => c.status === "open").length;
    const totalExits = closedCycles;
    const expectedRevenue = cycles.reduce((sum, c) => sum + (c.price || 0), 0);
    const registeredRevenue = cycles.reduce((sum, c) => sum + (c.registeredValue || 0), 0);

    const summary = await DailySummary.findOneAndUpdate(
      { date },
      {
        totalEntries,
        totalExits,
        openCycles,
        closedCycles,
        expectedRevenue,
        registeredRevenue,
        difference: registeredRevenue - expectedRevenue,
      },
      { upsert: true, new: true }
    );

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
