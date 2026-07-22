import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";

interface Event {
  _id: string;
  direction: "entry" | "exit";
  timestamp: string;
  vehicleSize: "small" | "medium" | "large";
  detectedPlate?: string;
  plateConfidence?: number;
  imageUrl?: string;
  status: string;
}

const sizeLabel: Record<string, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Eventos da Câmera</h2>
      <table>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Direção</th>
            <th>Porte</th>
            <th>Placa</th>
            <th>Confiança</th>
            <th>Horário</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id}>
              <td>
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="Veículo" />
                ) : (
                  "Sem imagem"
                )}
              </td>
              <td>{event.direction === "entry" ? "Entrada" : "Saída"}</td>
              <td>{sizeLabel[event.vehicleSize]}</td>
              <td>{event.detectedPlate || "Não lida"}</td>
              <td>
                {event.plateConfidence
                  ? `${(event.plateConfidence * 100).toFixed(0)}%`
                  : "-"}
              </td>
              <td>{format(new Date(event.timestamp), "dd/MM HH:mm:ss")}</td>
              <td>
                <span className={`badge badge-${event.status}`}>{event.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
