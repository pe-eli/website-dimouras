import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPedido } from "../../firebase/pedidosFirebase";
import "./aprovado.css";

interface Payment {
  id?: string;
  status?: string;
  transaction_amount?: number;
  [key: string]: any;
}

export default function PagAprovado() {
  const navigate = useNavigate();
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
  const salvarPedido = async () => {
    const pedidoSalvo = JSON.parse(localStorage.getItem("pedidoPendente") || "{}");

    // if (!pedidoSalvo || !pedidoSalvo.itens) {
    //   navigate("/");
    //   return;
    // }

    try {
      // Adiciona no Firestore


      // Cria um "payment" fake só pra exibir o resumo
      

      // ✅ Remove o pedido salvo localmente após salvar no banco
      localStorage.removeItem("pedidoPendente");

    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
      // opcional: redirecionar ou exibir mensagem de erro
    }
  };

  salvarPedido();
}, [navigate]);


  // if (!payment) {
  //   return (
  //     <div className="loading">
  //       <h2>Registrando pedido...</h2>
  //     </div>
  //   );
  // }

  return (
    <div className="success-page">
      <div className="success-header">
        <div className="success-icon">✔️</div>
        <h1>Pagamento Aprovado!</h1>
        <p>Seu pedido foi confirmado com sucesso</p>
      </div>

      <div className="success-card">
        <div className="order-header">
          <h2>Pedido Confirmado</h2>
          <p className="order-id">#{payment?.id ?? pedidoId ?? "—"}</p>
          <span className="badge-paid">Essa é a identificação do seu pedido</span>
        </div>

        <div className="payment">
          <h3>Pagamento processado</h3>
          <p className="amount">
            {payment?.transaction_amount !== undefined
              ? `R$ ${Number(payment.transaction_amount).toFixed(2)}`
              : "R$ —"}
          </p>
          <p className="status">Transação realizada com sucesso</p>
        </div>

        <div className="info-cards">
          <div className="info-box">
            <h4>Tempo estimado</h4>
            <p>45–60 minutos para entrega</p>
          </div>
          <div className="info-box purple">
            <h4>Acompanhamento</h4>
            <p>Rastreie seu pedido em tempo real</p>
          </div>
        </div>

        <div className="next-steps">
          <h4>Próximos Passos</h4>
          <ul>
            <li>Seu pedido já está sendo preparado com todo cuidado</li>
            <li>
              Você pode acompanhar o status em tempo real clicando no botão abaixo
            </li>
          </ul>
        </div>

        <div className="buttons">
          <button
            className="track-btn"
            onClick={() => {
              // se não tiver id, vai para /acompanhar (o componente de acompanhar trata a ausência)
              navigate(pedidoId ? `/acompanhar/${pedidoId}` : "/acompanhar");
            }}
          >
            Acompanhar Meu Pedido
          </button>

          <button className="back-btn" onClick={() => navigate("/")}>
            Voltar ao Cardápio
          </button>
        </div>

        <div className="contact">
          <p>Precisa de ajuda? Entre em contato:</p>
          <b>(37) 99826-0420</b>
        </div>
      </div>

      <div className="footer-bar">
        <p>
          Obrigado por escolher a <b>Di Mouras!</b>
          <br />
          Estamos preparando seu pedido com muito carinho
        </p>
      </div>
    </div>
  );
}
