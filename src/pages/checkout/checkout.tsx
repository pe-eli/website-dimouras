/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";
import { useCart } from "../../CartContext";
import MapPicker from "../../components/MapPicker";
import { addPedido } from "../../firebase/pedidosFirebase"
import "./checkout.css";

export default function Checkout() {

  const { cart, getTotal, clearCart } = useCart();
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorTroco, setValorTroco] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"entrega" | "site">("entrega");
  const [deliveryMethod, setDeliveryMethod] = useState<"entrega" | "retirada">("entrega");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [localSelecionado, setLocalSelecionado] = useState<any>(null);
  const [enderecoMessage, setEnderecoMessage] = useState(""); 
  const [observacao, setObservacao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erroPedido, setErroPedido] = useState("")

  const navigate = useNavigate();
  const location = useLocation();

    const bairros = [
    { nome: "Centro", taxa: 10 },
    { nome: "Jardim América", taxa: 15 },
    { nome: "Vila Nova", taxa: 18 },
    { nome: "Industrial", taxa: 20 },
    { nome: "São José", taxa: 25 },
  ];

  const bairroSelecionado = bairros.find((b) => b.nome === bairro);


  
  useEffect(() => {
  const fromMenu = location.state?.fromMenu;

  // Se o usuário não veio do cardápio OU o carrinho está vazio, redireciona
  if (!fromMenu ) {
    navigate("/");
  }
}, [cart, location, navigate]);

  const handleLocalSelect = (data: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    console.log("Local selecionado:", data);
    setLocalSelecionado(data);
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 10) {
      return numeros.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return numeros.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  const taxaEntrega = deliveryMethod === "entrega" ? bairroSelecionado?.taxa || 0 : 0;
  initMercadoPago("APP_USR-10f7c568-9e67-49d1-ada9-9e7bbdfbd5de");

  const total = (Number(getTotal().replace(",", ".")) + taxaEntrega).toFixed(2);

const handlePayment = async () => {
  if (!isFormValid) return;

  const telefoneLimpo = telefone.replace(/\D/g, "");

  const novoPedido = {
    nome,
    telefone: telefoneLimpo,
    endereco:
      deliveryMethod === "entrega"
        ? `${endereco}, ${numero} - ${bairro}`
        : "Retirada no local",
    metodoEntrega: deliveryMethod,
    metodoPagamento: paymentMethod,
    itens: cart.map((item: any) => ({
      nome: item.name,
      preco: item.price,
      quantidade: item.qty || 1,
    })),
    observacao,
    total,
    localizacao: localSelecionado,
    status: "Pendente" as const,
    criadoEm: new Date().toISOString(),

    ...(paymentMethod === "entrega"
      ? {
          precisaTroco,
          valorTroco: precisaTroco ? valorTroco : null,
        }
      : {}),

  };

  // 💾 Salva o pedido localmente (temporário)
  localStorage.setItem("pedidoPendente", JSON.stringify(novoPedido));

  const pedidoSalvo = JSON.parse(localStorage.getItem("pedidoPendente") || "{}");

      setIsLoading(true);
      const id = await addPedido(pedidoSalvo);
      console.log("Pedido salvo com ID:", id);
      localStorage.setItem("pedidoId", id);

  try {
    if (paymentMethod === "site") {
      // 🔹 Pagamento via site
      setIsLoading(true);

      const response = await fetch("https://website-dimouras.onrender.com/api/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              title: "DI MOURA'S PIZZAS E BURGERS",
              quantity: 1,
              unit_price: parseFloat(total),
              currency_id: "BRL",
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.id) {
        // 🔸 Redireciona pro checkout do Mercado Pago
        window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
      } else {
        setIsLoading(false);
        setErroPedido("Erro ao criar preferência de pagamento.\nEntre em contato conosco no WhatsApp.");
        setTimeout(() => setErroPedido(""), 2000);
      }
    } else {
      // 💰 Pagamento na entrega → salva direto no Firestore
      setIsLoading(true);

      localStorage.setItem("telefoneCliente", telefone);
       
      localStorage.removeItem("pedidoPendente"); // Limpa
      setIsLoading(false);
      clearCart();
      setErroPedido("Pedido confirmado!\nVocê será redirecionado para o acompanhamento.");
      setTimeout(() => navigate(`/acompanhar/${id}`), 2500);
    }
  } catch (err) {
    console.error("Erro ao registrar pedido:", err);
    setIsLoading(false);
    setErroPedido("Ocorreu um erro ao salvar o pedido. Tente novamente.");
    setTimeout(() => setErroPedido(""), 2000);
  }
};

const isFormValid =
  nome.trim() !== "" &&
  telefone.trim() !== "" &&
  (deliveryMethod === "retirada" ||
    (endereco.trim() !== "" && numero.trim() !== "" && bairro.trim() !== ""));

  return (
    <>
    <header className="header">
        <h1>Di Mouras</h1>
        <p>Pizzas e Burgers</p>
      </header>

      <nav className="navbar">
         <button className="navbutton" onClick={() => navigate("/")}>
          Voltar ao Cardápio
         </button>
      </nav>
    <div className="checkout-wrapper">

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Só um momento...</p>
          </div>
        </div>
      )}

      {erroPedido && (
        <div className="loading-overlay">
          <div className="loading-box">
            <p style={{whiteSpace: "pre-line"}}>{erroPedido}</p>
          </div>
        </div>
      )}
      <div className="checkout-main">
        {/* MÉTODO DE ENTREGA */}
        <div className="checkout-card">
          <h3>
            <i className="bi bi-truck"></i> Método de Entrega
          </h3>

          <label
            className={`delivery-option ${deliveryMethod === "entrega" ? "active" : ""}`}
            onClick={() => setDeliveryMethod("entrega")}
          >
            <input
              type="radio"
              name="delivery"
              value="entrega"
              checked={deliveryMethod === "entrega"}
              onChange={() => setDeliveryMethod("entrega")}
            />
            <div style={{ display: "flex", flexDirection: "column" }} className="delivery-info">
              <span className="title">Entrega</span>
              
            </div>
          </label>

          <label
            className={`delivery-option ${
              deliveryMethod === "retirada" ? "active" : ""
            }`}
            onClick={() => {
              setDeliveryMethod("retirada");
              setEnderecoMessage("Endereço para retirada: Rua Dona Carolina, 175 - Pontevila, Formiga - MG");
            }}
          >
            <input
              type="radio"
              name="delivery"
              value="retirada"
              checked={deliveryMethod === "retirada"}
              onChange={() => {
                setDeliveryMethod("retirada");
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }} className="delivery-info">
              <span className="title">Retirada no Local</span>
            
            </div>

            
          </label>
          
           {deliveryMethod === "retirada" && (
                <p className="endereco-message">{enderecoMessage}</p>
              )}
          
        </div>
        
        
      

        {/* DADOS DE ENTREGA */}
        <div className="checkout-card">
          <h3>
            <i className="bi bi-geo-alt"></i> Dados de Entrega
          </h3>
          <div className="checkout-form">
            <input
              type="text"
              placeholder="Seu Nome *"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              required
              placeholder="Digite seu WhatsApp"
            />
            {deliveryMethod === "entrega" && (
              <>
                <input
                  type="text"
                  placeholder="Seu Endereço *"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Número *"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  required
                />
                <input type="text" placeholder="Complemento (opcional)" />
                
                 {deliveryMethod === "entrega" && (
                <select
                className="select-bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  required
                >
                  <option value="">Selecione o bairro *</option>
                  {bairros.map((b) => (
                    <option key={b.nome} value={b.nome}>
                      {b.nome}
                    </option>
                  ))}
                </select>
              )}
               
              </>
            )}
          </div>
        </div>
      </div>

      {/* RESUMO DO PEDIDO */}
      <div className="checkout-summary">
        <h3>Resumo do Pedido</h3>
        <ul style={{ whiteSpace: "pre-line" }} className="resumo-lista">
          {cart.map((item: any, i: number) => (
            <li key={i}>
              <div>
               {item.name} 
               <span style={{fontWeight:"bold", fontSize: "0.75rem"}}> (x{item.qty})</span>
               </div>
               <span>R${(((item.price).replace("R$", "").replace(",","."))*item.qty).toFixed(2).replace(".",",")}</span>
            </li>
          ))}
        </ul>

        <div className="summary-line">
          <span>Subtotal:</span> <span>R${getTotal()}</span>
        </div>
        <div className="summary-line">
          <span>Taxa de entrega:</span> <span>R${taxaEntrega.toFixed(2).replace(".", ",")}</span>
        </div>

        <div className="summary-total">
          <strong>Total:</strong> <strong>R${total.replace(".", ",")}</strong>
        </div>

        <h4>Alguma Observação Para o Pedido?</h4>
        <input 
            type="text"
            style={{
              width: "100%",
              height: "10vh",
              textAlign: "start",
              justifyContent: "start",
              borderRadius: "6px",
              border: "1px solid black"
            }}
            placeholder="Escreva a Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        <div className="checkout-card">
  <h3>
    <i className="bi bi-credit-card"></i> Forma de Pagamento
  </h3>

  <label className={`payment-option ${paymentMethod === "entrega" ? "active" : ""}`}>
    <input
      type="radio"
      name="payment"
      value="entrega"
      checked={paymentMethod === "entrega"}
      onChange={() => setPaymentMethod("entrega")}
    />
    <div className="payment-info">
      <span className="title">Pagar na Entrega</span>
      <span className="subtitle">Dinheiro, Cartão ou PIX</span>
    </div>
  </label>

  <label className={`payment-option ${paymentMethod === "site" ? "active" : ""}`}>
    <input
      type="radio"
      name="payment"
      value="site"
      checked={paymentMethod === "site"}
      onChange={() => setPaymentMethod("site")}
    />
    <div className="payment-info">
      <span className="title">Pagar pelo Site</span>
      <span className="subtitle">PIX ou Cartão de Crédito</span>
    </div>
  </label>

  {/* 🔹 Pergunta sobre troco */}
  {paymentMethod === "entrega" && (
    <div className="change-section">
      <label className="change-checkbox">
         <input
          type="checkbox"
          checked={precisaTroco}
          onChange={(e) => {
            setPrecisaTroco(e.target.checked);
            if (!e.target.checked) setValorTroco(""); // limpa o valor se desmarcar
          }}
        />
        Preciso de troco
      </label>

       {precisaTroco && (
    <div className="troco-input-container">
      <label htmlFor="valorTroco">Troco para quanto?</label>
      <input
        style={{width: "30%", border:"1px solid black",borderRadius: "5px", padding: "2px", marginTop: "5px"}}
        id="valorTroco"
        type="text"
        value={valorTroco}
        onChange={(e) => {
          const rawValue = e.target.value.replace(/\D/g, ""); // remove tudo que não for número
          const formattedValue = (Number(rawValue) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
          setValorTroco(formattedValue);
        }}
        placeholder="R$0,00"
      />
    </div>
  )}
    </div>
  )}
</div>


       {!preferenceId ? (
            <div style={{ textAlign: "center" }}>
              {!isFormValid && (
                <p
                  style={{
                    color: "red",
                    fontSize: "0.9rem",
                    margin:"10px 0",
                    fontWeight: 500,
                  }}
                >
                  Preencha Todos os Campos Antes de Confirmar o Pedido.
                </p>
              )}
              <button
                className="confirm-btn"
                onClick={handlePayment}
                disabled={!isFormValid}
                style={{
                  opacity: isFormValid ? 1 : 0.6,
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  transition: "opacity 0.2s ease",
                }}
              >
                Confirmar Pedido
              </button>
            </div>
          ) : (
            <div>
              <h3>Pagamento Online</h3>
              <Wallet initialization={{ preferenceId }} />
            </div>
          )}

      </div>
    </div>
    </>
  );
}
