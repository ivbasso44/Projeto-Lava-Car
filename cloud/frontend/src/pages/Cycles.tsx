import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";

interface Cycle {
  _id: string;
  plate?: string;
  vehicleSize: "small" | "medium" | "large";
  entryAt: string;
  exitAt?: string;
  washType?: string;
  price?: number;
  registeredValue?: number;
  status: "open" | "closed" | "reviewed";
}

const sizeLabel: Record<string, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

const sizePrice: Record<string, number> = {
  small: 35,
  medium: 45,
  large: 60,
};

export default function Cycles() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const loadCycles = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.append("status", statusFilter);
    if (dateFilter) params.append("date", dateFilter);

    api
      .get(`/wash-cycles?${params.toString()}`)
      .then((res) => setCycles(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter]);

  const updateCycle = async (
    id: string,
    updates: Partial<Cycle>
  ) => {
    await api.patch(`/wash-cycles/${id}`, updates);
    loadCycles();
  };

  const handleWashTypeChange = (cycle: Cycle, value: string) => {
    const price = sizePrice[cycle.vehicleSize] || 0;
    let finalPrice = price;
    if (value === "enceramento") finalPrice += 20;
    if (value === "completa") finalPrice += 35;

    updateCycle(cycle._id, {
      washType: value,
      price: finalPrice,
      status: cycle.status === "open" ? "open" : "reviewed",
    });
  };

  return (
    <div>
      <h2>Ciclos de Lavagem</h2>
      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="open">Aberto</option>
          <option value="closed">Fechado</option>
          <option value="reviewed">Revisado</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <button onClick={loadCycles}>Atualizar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Porte</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Tipo</th>
            <th>Valor Esperado</th>
            <th>Valor Registrado</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cycles.map((cycle) => (
            <tr key={cycle._id}>
              <td>{cycle.plate || "Não lida"}</td>
              <td>{sizeLabel[cycle.vehicleSize]}</td>
              <td>{format(new Date(cycle.entryAt), "dd/MM HH:mm")}</td>
              <td>
                {cycle.exitAt
                  ? format(new Date(cycle.exitAt), "dd/MM HH:mm")
                  : "-"}
              </td>
              <td>
                <select
                  value={cycle.washType || ""}
                  onChange={(e) => handleWashTypeChange(cycle, e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="simples">Simples</option>
                  <option value="enceramento">Enceramento</option>
                  <option value="completa">Completa</option>
                  <option value="outro">Outro</option>
                </select>
              </td>
              <td>R$ {cycle.price?.toFixed(2) || "0.00"}</td>
              <td>
                <input
                  type="number"
                  value={cycle.registeredValue ?? ""}
                  onChange={(e) =>
                    updateCycle(cycle._id, {
                      registeredValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  onBlur={() => loadCycles()}
                />
              </td>
              <td>
                <span className={`badge badge-${cycle.status}`}>
                  {cycle.status === "open"
                    ? "Aberto"
                    : cycle.status === "closed"
                    ? "Fechado"
                    : "Revisado"}
                </span>
              </td>
              <td>
                <button
                  className="secondary"
                  onClick={() =>
                    updateCycle(cycle._id, { status: "reviewed" })
                  }
                >
                  Revisar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
