/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./acompanhar.css";

interface Pedido {
  nome: string;
  telefone: string;
  endereco?: string;
  metodoEntrega: "entrega" | "retirada";
  metodoPagamento: "entrega" | "site";
  itens: { nome: string; preco: string; quantidade: number }[];
  total: string;
  localizacao?: { lat: number; lng: number; address: string };
  status?: "Pendente" | "Em preparo" | "Entregue" | "Cancelado";
  criadoEm: string;
  observacao?: string;
}

export default function AcompanharPedido() {
  const { id } = useParams(); // 👈 pega o ID da URL
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setErro("Nenhum pedido especificado.");
      setCarregando(false);
      return;
    }

    const docRef = doc(db, "pedidos", id);

    // 🟢 Escuta em tempo real o documento do pedido
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPedido(docSnap.data() as Pedido);
          setErro("");
        } else {
          setErro("Pedido não encontrado.");
        }
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao acompanhar pedido:", error);
        setErro("Erro ao acompanhar o pedido em tempo real.");
        setCarregando(false);
      }
    );

    // 🔴 Cleanup da escuta ao desmontar
    return () => unsubscribe();
  }, [id]);

  return (
    <>
      <header className="header">
        <h1>Di Mouras</h1>
        <p>Pizzas e Burgers</p>
      </header>

      <nav className="navbar">
        <button onClick={() => navigate("/")}>Voltar ao Cardápio</button>
      </nav>

      {/* Seção de link de acompanhamento */}
<div className="acompanhamento-link-section">
  <p className="acompanhamento-link-text">
    Este é o link para acompanhar seu pedido.  
    Você pode acessá-lo a qualquer momento para ver o status atualizado:
  </p>

  <div className="acompanhamento-link-box">
    <input
      type="text"
      value={window.location.href}
      readOnly
      className="acompanhamento-link-input"
    />
    <button
      className="acompanhamento-link-copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        const btn = document.querySelector(".acompanhamento-link-copy-btn");
        if (btn) {
          const original = btn.textContent;
          btn.textContent = "Copiado!";
          setTimeout(() => (btn.textContent = original), 2000);
        }
      }}
    >
      Copiar
    </button>
  </div>
</div>

      <div className="track-container">
        <h1 className="title-">Acompanhe seu Pedido</h1>

        {carregando && <p>Carregando...</p>}
        {erro && <p className="error">{erro}</p>}

        {pedido && (
          <div
            className="pedido-card"
            style={{
              backgroundColor:
                pedido.status === "Entregue" || pedido.status === "Cancelado"
                  ? "#e0e0e0"
                  : "white",
              opacity:
                pedido.status === "Entregue" || pedido.status === "Cancelado"
                  ? 0.7
                  : 1,
              filter:
                pedido.status === "Entregue" || pedido.status === "Cancelado"
                  ? "grayscale(0.4)"
                  : "none",
              transition: "all 0.3s ease",
            }}
          >
            <header className="pedido-header">
              <div>
                <strong>{pedido.nome}</strong>
                <p>Telefone: {pedido.telefone}</p>
                <p>
                  Feito em:{" "}
                  {new Date(pedido.criadoEm).toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="pedido-total">
                <div className="valor">
                  R${Number(pedido.total).toFixed(2).replace(".", ",")}
                </div>
              </div>
            </header>

            <h3>Itens do Pedido</h3>
            <section className="pedido-itens">
              {pedido.itens.map((item, i) => (
                <div key={i} className="item-row">
                  
                  <span>
                    {item.nome} <small>x{item.quantidade || 1}</small>
                  </span>
                  <span>{item.preco}</span>
                </div>
              ))}
            </section>

            {pedido.endereco && (
              <div className="pedido-info">
                <section className="endereco">
                  <h4>Endereço de Entrega:</h4>
                  <p>{pedido.endereco}</p>
                  {pedido.localizacao?.address && (
                    <p className="mappicker">{pedido.localizacao.address}</p>
                  )}
                </section>
                <span
                  className="pedido-status"
                  style={{
                    backgroundColor:
                      pedido.status === "Entregue"
                        ? "#2ecc71"
                        : pedido.status === "Em preparo"
                        ? "#f1c40f"
                        : "#ec1f09ff",
                    color: pedido.status === "Em preparo" ? "#000" : "#fff",
                    fontWeight: "bold",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    display: "inline-block",
                  }}
                >
                  Status: {pedido.status || "Pendente"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
