import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { Event } from "../models/Event";
import { createEvent } from "../services/eventService";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(100);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  upload.single("image"),
  [
    body("direction").isIn(["entry", "exit"]),
    body("timestamp").isISO8601(),
    body("vehicleSize").isIn(["small", "medium", "large"]),
    body("source").optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "Imagem obrigatória" });
        return;
      }

      const event = await createEvent({
        direction: req.body.direction,
        timestamp: req.body.timestamp,
        vehicleSize: req.body.vehicleSize,
        source: req.body.source || "camera-corredor",
        imageBuffer: req.file.buffer,
        originalName: req.file.originalname,
      });

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
