import { useState } from "react";
import api from "../api";

interface Summary {
  date: string;
  totalEntries: number;
  totalExits: number;
  openCycles: number;
  closedCycles: number;
  expectedRevenue: number;
  registeredRevenue: number;
  difference: number;
}

export default function Summary() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const loadSummary = () => {
    api
      .post(`/summaries/recalculate?date=${date}`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Resumo por Data</h2>
      <div className="filters">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={loadSummary}>Calcular</button>
      </div>

      {summary && (
        <div className="grid">
          <div className="card">
            <div className="metric-label">Entradas</div>
            <div className="metric">{summary.totalEntries}</div>
          </div>
          <div className="card">
            <div className="metric-label">Saídas</div>
            <div className="metric">{summary.totalExits}</div>
          </div>
          <div className="card">
            <div className="metric-label">Em Aberto</div>
            <div className="metric">{summary.openCycles}</div>
          </div>
          <div className="card">
            <div className="metric-label">Fechados</div>
            <div className="metric">{summary.closedCycles}</div>
          </div>
          <div className="card">
            <div className="metric-label">Esperado</div>
            <div className="metric">R$ {summary.expectedRevenue.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="metric-label">Registrado</div>
            <div className="metric">R$ {summary.registeredRevenue.toFixed(2)}</div>
          </div>
          <div className="card">
            <div className="metric-label">Diferença</div>
            <div className={`metric ${summary.difference < 0 ? "danger" : "success"}`}>
              R$ {summary.difference.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
