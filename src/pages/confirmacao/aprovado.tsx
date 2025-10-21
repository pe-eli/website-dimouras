import React from "react";
import "./aprovado.css";

export default function PagAprovado() {
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
          <p className="order-id">#17608939</p>
          <span className="badge">Pagamento Confirmado</span>
        </div>

        <div className="payment">
          <h3>Pagamento processado</h3>
          <p className="amount">R$ 83.50</p>
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
          <h4 style={{margin: 0}}>Próximos Passos</h4>
          <ul style={{padding: "0"}}>
            <li>Seu pedido já está sendo preparado com todo cuidado</li>
            <li>
              Você pode acompanhar o status em tempo real clicando no botão
              abaixo
            </li>
          </ul>
        </div>

        <div className="buttons">
          <button className="track-btn">Acompanhar Meu Pedido</button>
          <button className="back-btn">Voltar ao Cardápio</button>
        </div>

        <div className="contact">
          <p>
            Precisa de ajuda? Entre em contato:
          </p>
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
