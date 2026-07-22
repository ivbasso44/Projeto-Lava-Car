import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { listWashCycles, updateWashCycle, getWashCycleById } from "../services/washCycleService";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cycles = await listWashCycles({
      status: req.query.status as string | undefined,
      date: req.query.date as string | undefined,
      plate: req.query.plate as string | undefined,
    });
    res.json(cycles);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cycle = await getWashCycleById(req.params.id);
    if (!cycle) {
      res.status(404).json({ error: "Ciclo não encontrado" });
      return;
    }
    res.json(cycle);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  [
    param("id").isMongoId(),
    body("washType").optional().isIn(["simples", "enceramento", "completa", "outro"]),
    body("price").optional().isFloat({ min: 0 }),
    body("registeredValue").optional().isFloat({ min: 0 }),
    body("status").optional().isIn(["open", "closed", "reviewed"]),
    body("plate").optional().isString(),
    body("notes").optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const cycle = await updateWashCycle(req.params.id, req.body);
      if (!cycle) {
        res.status(404).json({ error: "Ciclo não encontrado" });
        return;
      }
      res.json(cycle);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
