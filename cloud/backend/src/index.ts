import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDatabase } from "./config/database";
import { setupStorage } from "./config/storage";
import eventRoutes from "./routes/events";
import washCycleRoutes from "./routes/washCycles";
import summaryRoutes from "./routes/summaries";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/events", eventRoutes);
app.use("/api/wash-cycles", washCycleRoutes);
app.use("/api/summaries", summaryRoutes);

app.use(errorHandler);

async function startServer() {
  await connectDatabase();
  await setupStorage();
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Erro ao iniciar servidor:", error);
  process.exit(1);
});
