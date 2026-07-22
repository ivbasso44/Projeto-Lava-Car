import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Cycles from "./pages/Cycles";
import Events from "./pages/Events";
import Summary from "./pages/Summary";

function App() {
  return (
    <>
      <header>
        <div className="container">
          <h1>LavaCar Monitor</h1>
          <nav>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/cycles">Lavagens</NavLink>
            <NavLink to="/events">Eventos</NavLink>
            <NavLink to="/summary">Resumo</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cycles" element={<Cycles />} />
          <Route path="/events" element={<Events />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
