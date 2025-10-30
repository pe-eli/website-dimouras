import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { addPedido } from "../../firebase/pedidosFirebase"
import "./aprovado.css";

interface Payment {
  id?: string;
  status?: string;
  transaction_amount?: number;
  [key: string]: any;
}

export default function PagAprovado() {

  const id = localStorage.getItem("pedidoId");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);

useEffect(() => {
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    navigate("/");
    return;
  }

  fetch(`${import.meta.env.VITE_API_URL}/api/verify-payment?id=${paymentId}`)
    .then(async (res) => {
      if (!res.ok) throw new Error("Erro na verificação");
      const data = await res.json();
      if (data.approved) {
        const pedidoPendente = localStorage.getItem("pedidoPendente");
        if (pedidoPendente) {
          const pedido = JSON.parse(pedidoPendente);
          await addPedido(pedido);
          localStorage.removeItem("pedidoPendente");
        }
        setPayment(data.payment);
      } else {
        navigate("/");
      }
    })
    .catch(() => navigate("/"))
    .finally(() => setLoading(false));
}, [searchParams, navigate]);
  // Enquanto valida
  if (loading) {
    return (
      <div className="loading">
        <h2>Verificando pagamento...</h2>
      </div>
    );
  }

  if (!payment) return null;

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
          <p className="order-id">#{payment.id}</p>
          <span className="badge">Pagamento Confirmado</span>
        </div>

        <div className="payment-info">
          <h3>Pagamento processado</h3>
          <p className="amount">
            R$ {payment.transaction_amount?.toFixed(2)}
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
          <button className="track-btn">Acompanhar Meu Pedido</button>
          <button className="back-btn" onClick={() => navigate(`/acompanhar/${id}`)}>
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
