import { useNavigate } from "react-router-dom";
import "./notfound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Página não encontrada</h2>
        <p className="notfound-text">
          Desculpe, a página que você está procurando não existe.
        </p>
        <button className="notfound-btn" onClick={() => navigate("/")}>
          Voltar ao Cardápio
        </button>
      </div>
    </div>
  );
}
