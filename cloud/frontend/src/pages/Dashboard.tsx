import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    api
      .post(`/summaries/recalculate?date=${today}`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, [today]);

  if (!summary) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Resumo do Dia</h2>
      <p style={{ color: "var(--text-muted)" }}>
        {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </p>

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
      </div>

      <div className="grid">
        <div className="card">
          <div className="metric-label">Receita Esperada</div>
          <div className="metric">R$ {summary.expectedRevenue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="metric-label">Receita Registrada</div>
          <div className="metric">R$ {summary.registeredRevenue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="metric-label">Diferença</div>
          <div className={`metric ${summary.difference < 0 ? "danger" : "success"}`}>
            R$ {summary.difference.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
