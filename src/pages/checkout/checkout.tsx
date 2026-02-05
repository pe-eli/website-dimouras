/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";
import { useCart } from "../../CartContext";
import MapPicker from "../../components/MapPicker";
import { addPedido, validarCupom, marcarCupomComoUsado } from "../../firebase/pedidosFirebase"
import "./checkout.css";

export default function Checkout() {

  const { cart, getTotal, clearCart } = useCart();
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorTroco, setValorTroco] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"entrega" | "site">("entrega");
  const [deliveryMethod, setDeliveryMethod] = useState<"entrega" | "retirada">("entrega");
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [mensagemCupom, setMensagemCupom] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string | null>(null);
  const [pixTicketUrl, setPixTicketUrl] = useState<string | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentVerificationInterval, setPaymentVerificationInterval] = useState<NodeJS.Timeout | null>(null);
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
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
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production"
      ? "https://website-dimouras.onrender.com"
      : "http://localhost:3333");
  const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY || "";

    const bairros = [
    { nome: "Aprolago", taxa: 15 },
    { nome: "Aroeira", taxa: 10 },
    { nome: "Aterro", taxa: 10 },
    { nome: "Capão", taxa: 10 },
    { nome: "Condomínio Pontevila", taxa: 10 },
    { nome: "Condomínio Vale do Sol", taxa: 20 },
    { nome: "Edentur", taxa: 20 },
    { nome: "Encosta do Lago", taxa: 15 },
    { nome: "FIC", taxa: 20 },
    { nome: "Fivela", taxa: 15 },
    { nome: "Furnastur", taxa: 20 },
    { nome: "Ilha das Pedras", taxa: 20 },
    { nome: "Laranjal", taxa: 15 },
    { nome: "Mangueirão", taxa: 20 },
    { nome: "Mar de Minas", taxa: 20 },
    { nome: "Pontevila", taxa: 0 },
  ];


  const bairroSelecionado = bairros.find((b) => b.nome === bairro);

  useEffect(() => {
  const fromMenu = location.state?.fromMenu;

  // Se o usuário não veio do cardápio OU o carrinho está vazio, redireciona
  if (!fromMenu ) {
    navigate("/");
  }

  // Cleanup: limpar intervalo de verificação quando sair da página
  return () => {
    clearPaymentVerification();
  };
}, [cart, location, navigate]);

  useEffect(() => {
    if (paymentMethod !== "site") {
      setPaymentReady(false);
      setPaymentResult(null);
      setPedidoId(null);
      setPixQrCode(null);
      setPixQrCodeBase64(null);
      setPixTicketUrl(null);
    }
  }, [paymentMethod]);

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

  useEffect(() => {
    if (mpPublicKey) {
      initMercadoPago(mpPublicKey);
    }
  }, [mpPublicKey]);

  const subtotalNum = Number(getTotal().replace(",", "."));
  const totalComTaxa = subtotalNum + taxaEntrega;
  const totalComDesconto = Math.max(0, totalComTaxa - desconto);
  const total = totalComDesconto.toFixed(2);
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const aplicarCupom = async () => {
    if (!cupom.trim()) {
      setMensagemCupom("Digite um cupom");
      setTimeout(() => setMensagemCupom(""), 3000);
      return;
    }

    try {
      setMensagemCupom("Validando cupom...");
      const resultado = await validarCupom(cupom.trim());

      if (resultado.valido) {
        let descontoValor = resultado.desconto || 0;
        
        // Se for percentual, calcula sobre o total com taxa
        if (resultado.tipo === "percentual") {
          descontoValor = totalComTaxa * (descontoValor / 100);
        }
        
        setDesconto(descontoValor);
        setCupomAplicado(cupom.trim().toUpperCase());
        setMensagemCupom("✓ Cupom aplicado com sucesso!");
        setCupom("");
        setTimeout(() => setMensagemCupom(""), 3000);
      } else {
        setMensagemCupom("✗ Cupom inválido ou expirado");
        setDesconto(0);
        setCupomAplicado("");
        setTimeout(() => setMensagemCupom(""), 3000);
      }
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setMensagemCupom("✗ Erro ao validar cupom");
      setDesconto(0);
      setTimeout(() => setMensagemCupom(""), 3000);
    }
  };

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
    cupom: cupomAplicado || null,
    desconto: desconto || 0,
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

  localStorage.setItem("pedidoPendente", JSON.stringify(novoPedido));

  const pedidoSalvo = JSON.parse(localStorage.getItem("pedidoPendente") || "{}");

      setIsLoading(true);
      const id = await addPedido(pedidoSalvo);
      console.log("Pedido salvo com ID:", id);
      localStorage.setItem("pedidoId", id);
      setPedidoId(id);

  try {
    if (paymentMethod === "site") {
      setPaymentReady(true);
      setPaymentResult(null);
      setPixQrCode(null);
      setPixQrCodeBase64(null);
      setPixTicketUrl(null);
      setIsLoading(false);
    } else {
      // 💰 Pagamento na entrega → salva direto no Firestore
      setIsLoading(true);

      // Marcar cupom como usado se houver
      if (cupomAplicado) {
        await marcarCupomComoUsado(cupomAplicado);
      }

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

const handlePaymentSubmit = async (formData: any) => {
  if (!pedidoId) {
    setErroPedido("Pedido não encontrado. Atualize a página e tente novamente.");
    throw new Error("Pedido não encontrado");
  }

  try {
    // Extrair dados do formData se existir
    const paymentData = formData.formData || formData;

    const payer = {
      ...(paymentData.payer || {}),
      email: paymentData?.payer?.email || email,
    };

    // Função para determinar category_id baseado no nome do item
    const getCategoryId = (itemName: string): string => {
      const name = itemName.toLowerCase();
      if (
        name.includes("refrigerante") ||
        name.includes("suco") ||
        name.includes("bebida") ||
        name.includes("água") ||
        name.includes("cerveja")
      ) {
        return "beverage";
      }
      return "food";
    };

    // Preparar items com category_id (mantém aqui apenas para referência, não envia para API)
    const items = cart.map((item) => ({
      title: item.name,
      unit_price: parseFloat(item.price.replace("R$", "").replace(",", ".")),
      quantity: item.qty,
      category_id: item.category_id || getCategoryId(item.name),
    }));

    const payload = {
      token: paymentData.token,
      issuer_id: paymentData.issuer_id,
      payment_method_id: paymentData.payment_method_id,
      installments: paymentData.installments,
      amount: Number(total),
      transaction_amount: Number(total),
      description: `Pedido Di Mouras - ${items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}`,
      external_reference: pedidoId,
      metadata: { pedidoId },
      payer,
    };

    const response = await fetch(`${apiUrl}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Erro ao processar pagamento");
    }

    setPaymentResult(data);

    if (data.status === "approved") {
      if (cupomAplicado) {
        await marcarCupomComoUsado(cupomAplicado);
      }

      localStorage.removeItem("pedidoPendente");
      clearCart();
      setErroPedido("Pagamento aprovado!\nVocê será redirecionado para o acompanhamento.");
      setTimeout(() => navigate(`/acompanhar/${pedidoId}`), 2000);
    }

    return data;
  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error);
    setErroPedido("Erro ao processar pagamento. Tente novamente.");
    setTimeout(() => setErroPedido(""), 2000);
    throw error;
  }
};

// 🔹 Nova função para criar PIX
const handleCreatePix = async () => {
  if (!pedidoId || !email.trim()) {
    setErroPedido("Preencha o email para continuar.");
    setTimeout(() => setErroPedido(""), 2000);
    return;
  }

  setIsLoading(true);
  try {
    const getCategoryId = (itemName: string): string => {
      const name = itemName.toLowerCase();
      if (
        name.includes("refrigerante") ||
        name.includes("suco") ||
        name.includes("bebida") ||
        name.includes("água") ||
        name.includes("cerveja")
      ) {
        return "beverage";
      }
      return "food";
    };

    const items = cart.map((item) => ({
      title: item.name,
      unit_price: parseFloat(item.price.replace("R$", "").replace(",", ".")),
      quantity: item.qty,
      category_id: item.category_id || getCategoryId(item.name),
    }));

    const pixPayload = {
      transaction_amount: Number(total),
      payer: { email },
      external_reference: pedidoId,
      metadata: { pedidoId },
      description: `Pedido Di Mouras - ${items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}`,
    };

    console.log("🔹 Criando PIX...", pixPayload);

    const response = await fetch(`${apiUrl}/api/payments/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pixPayload),
    });

    const pixData = await response.json();

    if (!response.ok) {
      throw new Error(pixData?.error || "Erro ao criar PIX");
    }

    console.log("✅ PIX criado:", pixData);

    setPixQrCodeBase64(pixData.qr_code_base64);
    setPixQrCode(pixData.qr_code);
    setCurrentPaymentId(pixData.id);
    setPaymentResult(pixData);

    // Iniciar polling para verificar pagamento
    startPaymentVerification(pixData.id);

    setIsLoading(false);
  } catch (error: any) {
    console.error("Erro ao criar PIX:", error);
    setErroPedido("Erro ao criar PIX. Tente novamente.");
    setTimeout(() => setErroPedido(""), 3000);
    setIsLoading(false);
  }
};

// 🔹 Função para verificar status do pagamento (polling)
const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`${apiUrl}/api/payments/${paymentId}`);
    const paymentData = await response.json();

    console.log("🔍 Status do pagamento:", paymentData.status);

    if (paymentData.status === "approved") {
      clearPaymentVerification();
      
      if (cupomAplicado) {
        await marcarCupomComoUsado(cupomAplicado);
      }

      localStorage.removeItem("pedidoPendente");
      clearCart();
      setErroPedido("Pagamento aprovado!\nVocê será redirecionado para o acompanhamento.");
      setTimeout(() => navigate(`/acompanhar/${pedidoId}`), 2000);
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
  }
};

// 🔹 Iniciar verificação de pagamento a cada 3 segundos (máximo 2 minutos)
const startPaymentVerification = (paymentId: string) => {
  setIsCheckingPayment(true);
  let checkCount = 0;
  const maxChecks = 40; // 40 * 3 segundos = 120 segundos (2 minutos)

  const interval = setInterval(async () => {
    checkCount++;
    await checkPaymentStatus(paymentId);

    if (checkCount >= maxChecks) {
      clearPaymentVerification();
    }
  }, 3000);

  setPaymentVerificationInterval(interval);
};

// 🔹 Limpar verificação de pagamento
const clearPaymentVerification = () => {
  if (paymentVerificationInterval) {
    clearInterval(paymentVerificationInterval);
    setPaymentVerificationInterval(null);
  }
  setIsCheckingPayment(false);
};

const isFormValid =
  nome.trim() !== "" &&
  telefone.trim() !== "" &&
  (paymentMethod !== "site" || emailValido) &&
  (deliveryMethod === "retirada" ||
    (endereco.trim() !== "" && numero.trim() !== "" && bairro.trim() !== ""));

  return (
    <>
    <header className="header">

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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={paymentMethod === "site"}
              placeholder="Digite seu E-mail"
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
                  <option value="">Selecione a localidade: *</option>
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

        {desconto > 0 && (
          <div className="summary-line" style={{ color: "#27ae60", fontWeight: "bold" }}>
            <span>Desconto:</span> <span>-R${desconto.toFixed(2).replace(".", ",")}</span>
          </div>
        )}

        <div className="summary-total">
          <strong>Total:</strong> <strong>R${total.replace(".", ",")}</strong>
        </div>

        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "6px" }}>
          <h4 style={{ marginTop: 0, marginBottom: "10px", fontSize: "0.95rem" }}>Cupom de Desconto</h4>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Digite seu cupom"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  aplicarCupom();
                }
              }}
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}
            />
            <button
              onClick={aplicarCupom}
              style={{
                padding: "8px 16px",
                backgroundColor: "#e67e22",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.9rem",
                transition: "background-color 0.2s ease"
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d35400")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e67e22")}
            >
              Aplicar
            </button>
          </div>
          {mensagemCupom && (
            <p style={{
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "0.85rem",
              color: mensagemCupom.startsWith("✓") ? "#27ae60" : "#e74c3c",
              fontWeight: "bold"
            }}>
              {mensagemCupom}
            </p>
          )}
        </div>

        <h4>Alguma observação para o pedido?</h4>
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


       {paymentMethod === "site" && paymentReady ? (
            <div>
              <h3>Pagamento Online</h3>
              
              {/* Abas de seleção de método PIX vs Cartão */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                  onClick={() => {
                    clearPaymentVerification();
                    setPixQrCodeBase64(null);
                    setPixQrCode(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "2px solid",
                    borderColor: !pixQrCodeBase64 ? "#e67e22" : "#ddd",
                    backgroundColor: !pixQrCodeBase64 ? "#e67e22" : "white",
                    color: !pixQrCodeBase64 ? "white" : "black",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                  }}
                >
                  💳 Cartão de Crédito
                </button>
                <button
                  onClick={handleCreatePix}
                  disabled={isLoading || isCheckingPayment}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "2px solid",
                    borderColor: pixQrCodeBase64 ? "#e67e22" : "#ddd",
                    backgroundColor: pixQrCodeBase64 ? "#e67e22" : "white",
                    color: pixQrCodeBase64 ? "white" : "black",
                    borderRadius: "6px",
                    cursor: isLoading || isCheckingPayment ? "not-allowed" : "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s ease",
                    opacity: isLoading || isCheckingPayment ? 0.6 : 1,
                  }}
                >
                  {isCheckingPayment ? "⏳ Aguardando pagamento..." : "🏦 PIX"}
                </button>
              </div>

              {/* Mostrar Payment Brick para Cartão */}
              {!pixQrCodeBase64 && (
                <Payment
                  initialization={{ amount: Number(total) }}
                  customization={{
                    paymentMethods: {
                      creditCard: "all",
                      debitCard: "all",
                    },
                  }}
                  onSubmit={handlePaymentSubmit}
                  onError={(error) => {
                    console.error("Erro no pagamento:", error);
                    setErroPedido("Erro ao processar pagamento. Tente novamente.");
                    setTimeout(() => setErroPedido(""), 2000);
                  }}
                />
              )}

              {/* Mostrar QR Code para PIX */}
              {pixQrCodeBase64 && (
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <h4>💰 Pagamento PIX</h4>
                  <p style={{ color: "#666", marginBottom: "16px" }}>
                    {isCheckingPayment ? "Escaneie o QR code ou copie o código abaixo" : ""}
                  </p>
                  
                  {/* QR Code */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    display: "inline-block",
                    marginBottom: "16px"
                  }}>
                    <img
                      src={`data:image/png;base64,${pixQrCodeBase64}`}
                      alt="QR Code PIX"
                      style={{ maxWidth: "260px", width: "100%" }}
                    />
                  </div>

                  {/* Código Copia-e-Cola */}
                  {pixQrCode && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "8px" }}>Ou copie o código:</p>
                      <div style={{ position: "relative" }}>
                        <textarea
                          readOnly
                          value={pixQrCode}
                          style={{
                            width: "100%",
                            minHeight: "100px",
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            resize: "none"
                          }}
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pixQrCode);
                            alert("Código copiado para a área de transferência!");
                          }}
                          style={{
                            marginTop: "8px",
                            padding: "10px 16px",
                            backgroundColor: "#27ae60",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            width: "100%"
                          }}
                        >
                          ✓ Copiar Código PIX
                        </button>
                      </div>
                    </div>
                  )}

                  {isCheckingPayment && (
                    <p style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "#fff3cd",
                      borderRadius: "6px",
                      color: "#856404",
                      fontSize: "0.9rem"
                    }}>
                      <strong>⏳ Aguardando confirmação do pagamento...</strong><br />
                      Você será redirecionado assim que recebermos a confirmação.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
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
                  Preencha todos os campos antes de confirmar o pedido.
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
          )}

      </div>
    </div>
    </>
  );
}
