import React from "react";
import "./landing.css";
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { BsGeoAlt, BsClock } from 'react-icons/bs';

const ComingSoon: React.FC = () => {
  const whatsappNumber = "5537998260420"; // seu número do WhatsApp
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const instagramLink = "https://www.instagram.com/dimouras";

  return (
    <div className="coming-soon-wrapper">
      <div className="coming-soon-card">
        <div className="header-landing">
          <h1>Di Mouras</h1>
          <h3>Pizzas e Burgers</h3>
        </div>
        <p className="subti">Aqui em Pontevila, Formiga-MG!</p>
        <button className="coming-soon-button">⏰ Pedidos pelo site em breve!</button>
        <p className="description">
          Nosso site está sendo finalizado com carinho para te oferecer a melhor experiência ao fazer seu pedido. 
          Enquanto isso, peça agora pelo nosso WhatsApp!
        </p>

        <div className="contact-buttons">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp">
              <FaWhatsapp size={32} color="white" />
             <p>Peça pelo WhatsApp!</p>
          </a>
          <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="instagram">
            <FaInstagram size={32} color="white" />
            <p>@dimouras</p>
          </a>
        </div>

        <div className="info">
          <p><BsGeoAlt size={16} /> Pontevila, Formiga-MG</p>
          <p><BsClock size={16} /> Terça a Domingo: 18h às 23h</p>
          <p>📞 (37) 99826-0420</p>
        </div>

      </div>
    </div>
  );
};

export default ComingSoon;
