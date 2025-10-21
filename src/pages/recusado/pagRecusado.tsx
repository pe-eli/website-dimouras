import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./pagRecusado.css";

interface Payment {
  id?: string;
  status?: string;
  transaction_amount?: number;
  [key: string]: any;
}

export default function PagRecusado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    // 🚫 Bloqueia acesso direto (sem payment_id)
    if (!paymentId) {
      navigate("/");
      return;
    }

    // 🔍 Verifica no backend se o pagamento foi realmente recusado
    fetch(`${import.meta.env.VITE_API_URL}/api/verify-payment?id=${paymentId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao verificar pagamento");
        const data = await res.json();

        // ✅ Só continua se for status "rejected"
        if (data.payment?.status === "rejected") {
          setPayment(data.payment);
        } else {
          navigate("/");
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [searchParams, navigate]);

  // 🔄 Tela de verificação
  if (loading) {
    return (
      <div className="loading-recusado">
        <h2>Verificando pagamento...</h2>
      </div>
    );
  }

  // 🚫 Se não houver dados válidos, nada é renderizado
  if (!payment) return null;

  // ✅ Conteúdo normal (mantido igual ao seu)
  const handleTryAgain = () => {
    navigate("/checkout", { state: { fromMenu: true } });
  };

  return (
    <div className="error-page-recusado">
      <div className="error-header-recusado">
        <div className="error-icon-recusado">❌</div>
        <h1>Pagamento Recusado</h1>
      </div>

      <div className="error-card-recusado">
        <div className="order-header-recusado">
          <h2>Transação Não Autorizada</h2>
          <span className="badge-recusado">Não foi possível processar seu pagamento</span>
        </div>

        <div className="payment-info-recusado">
          <p className="alert-recusado">
            A transação foi recusada pela operadora do cartão.<br />
            <b>Não se preocupe, nenhum valor foi cobrado.</b>
          </p>
          <p className="order-id-recusado">ID do Pagamento: #{payment.id}</p>
        </div>

        <div className="reason-section-recusado">
          <h4>Motivos comuns para recusa</h4>
          <ul>
            <li><span>💳</span> Dados do cartão incorretos — verifique número, CVV e validade.</li>
            <li><span>⚠️</span> Saldo insuficiente — confirme se há limite disponível.</li>
            <li><span>📞</span> Problema na operadora — entre em contato com seu banco.</li>
          </ul>
        </div>

        <div className="next-steps-recusado">
          <h4>O que fazer agora?</h4>
          <ol>
            <li>Verifique os dados do cartão e tente novamente.</li>
            <li>Utilize outro cartão ou forma de pagamento.</li>
            <li>Entre em contato com o banco para mais informações.</li>
            <li>Escolha “Pagar na Entrega” para finalizar o pedido.</li>
          </ol>
        </div>

        <div className="buttons-recusado">
          <button onClick={handleTryAgain} className="retry-btn-recusado">
            Tentar Novamente
          </button>
          <button onClick={() => navigate("/")} className="back-btn-recusado">
            Voltar ao Cardápio
          </button>
        </div>

        <div className="contact-recusado">
          <p>Precisa de ajuda com o pagamento?</p>
          <b>(37) 99826-0420</b><br />
          <span>Você também pode pedir pelo WhatsApp.</span>
        </div>
      </div>

      <div className="footer-bar-recusado">
        <div className="cash-option-recusado">
          <p>Prefere pagar na entrega?</p>
          <p><b>Aceitamos dinheiro, cartão e PIX no momento da entrega</b></p>
        </div>
      </div>
    </div>
  );
}
