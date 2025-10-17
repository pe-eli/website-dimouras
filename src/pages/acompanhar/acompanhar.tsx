/* eslint-disable react-hooks/exhaustive-deps */
 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import "./acompanhar.css";

interface Pedido {
  nome: string;
  telefone: string;
  endereco?: string;
  metodoEntrega: "entrega" | "retirada";
  metodoPagamento: "entrega" | "site";
  itens: { nome: string; preco: string; quantidade?: number }[];
  total: string;
  localizacao?: { lat: number; lng: number; address: string };
  status?: "Pendente" | "Em preparo" | "Entregue" | "Cancelado";
  criadoEm: string;
}

export default function AcompanharPedido() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [telefone, setTelefone] = useState("");

  const navigate = useNavigate();

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  // 🔹 Função para buscar pedidos pelo telefone
  const buscarPedido = async (numero?: string) => {
    const telefoneBusca = numero || telefone.trim();

    if (!telefoneBusca) {
      setErro("Digite seu telefone para buscar o pedido.");
      return;
    }

    setErro("");
    setCarregando(true);
    setPedidos([]);

    try {
      const pedidosRef = collection(db, "pedidos");
      const filtro = query(
        pedidosRef,
        where("telefone", "==", telefoneBusca),
        orderBy("criadoEm", "desc")
      );
      const snapshot = await getDocs(filtro);

      if (snapshot.empty) {
        setErro("Nenhum pedido encontrado com esse telefone.");
      } else {
        const data = snapshot.docs.map((doc) => doc.data() as Pedido);
        setPedidos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
      setErro("Erro ao buscar o pedido. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  };

  // ✅ 1. Recupera telefone salvo no localStorage ao abrir a página
  useEffect(() => {
    const telefoneSalvo = localStorage.getItem("telefoneCliente");
    if (telefoneSalvo) {
      setTelefone(telefoneSalvo);
      buscarPedido(telefoneSalvo); // busca automática
    }
  }, []);

  // ✅ 2. Salva o telefone no localStorage sempre que mudar
  useEffect(() => {
    if (telefone) {
      localStorage.setItem("telefoneCliente", telefone);
    }
  }, [telefone]);

  return (
    <>
    <header className="header">
        <h1>Di Mouras</h1>
        <p>Pizzas e Burgers</p>
      </header>

      <nav className="navbar">  
        <button onClick={() => navigate("/")}>
          Voltar ao Cardápio
        </button>
        

      </nav>

   
    <div className="track-container">
      <h1 className="title-">Acompanhe seu Pedido</h1>
      <h4 style={{margin: 0}}>Insira abaixo o número do seu telefone:</h4>
      <div className="search-box">
        <input
          type="text"
          placeholder="Digite seu telefone"
          value={telefone}
          onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
        />
        <button onClick={() => buscarPedido()} disabled={carregando}>
          {carregando ? "Buscando..." : "Buscar Pedido"}
        </button>
      </div>

      {erro && <p className="error">{erro}</p>}

      {pedidos.map((pedido, index) => (
                <div key={index} 
                style={{
          backgroundColor:
            pedido.status === "Entregue" || pedido.status === "Cancelado"
              ? "#e0e0e0"
              : "white", // fundo cinza quando entregue ou cancelado
          opacity:
            pedido.status === "Entregue" || pedido.status === "Cancelado"
              ? 0.7
              : 1, // efeito de "desativado"
          filter:
            pedido.status === "Entregue" || pedido.status === "Cancelado"
              ? "grayscale(0.4)"
              : "none", // tom acinzentado
          transition: "all 0.3s ease", // transição suave
        }}

            className="pedido-card">
          <header
            className="pedido-header"
          >
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
                R$
                {Number(pedido.total)
                  .toFixed(2)
                  .replace(".", ",")}
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
      ))}
    </div>
     </>
  );
}
