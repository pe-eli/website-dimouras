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
  const [pedidoRef, setPedidoRef] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
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
  const [erroPedido, setErroPedido] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "error" | null>(null);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

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
      setPaymentStatus(null);
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
  const generatePedidoRef = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `pedido_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  };

  const getPedidoRef = () => pedidoRef || localStorage.getItem("pedidoRef") || "";

  const getPayerEmail = () => {
    const cleanPhone = telefone.replace(/\D/g, "");
    if (email.trim()) return email.trim();
    if (cleanPhone) return `${cleanPhone}@cliente.local`;
    return "sem-email@dimouras.com";
  };

  const finalizePagamentoAprovado = async (mensagem: string) => {
    const pedidoSalvo = JSON.parse(localStorage.getItem("pedidoPendente") || "null");

    if (!pedidoSalvo) {
      setPaymentStatus("error");
      setErroPedido("Pedido pendente nao encontrado. Tente novamente.");
      setTimeout(() => {
        setErroPedido("");
        setPaymentStatus(null);
      }, 2000);
      return;
    }

    setIsLoading(true);

    try {
      const id = await addPedido(pedidoSalvo);
      console.log("Pedido salvo com ID:", id);
      localStorage.setItem("pedidoId", id);
      setPedidoId(id);

      if (cupomAplicado) {
        await marcarCupomComoUsado(cupomAplicado);
      }

      localStorage.removeItem("pedidoPendente");
      localStorage.removeItem("pedidoRef");
      clearCart();
      setPaymentStatus("success");
      setErroPedido(mensagem);
      setTimeout(() => navigate(`/acompanhar/${id}`), 2000);
    } catch (err) {
      console.error("Erro ao registrar pedido:", err);
      setPaymentStatus("error");
      setErroPedido("Ocorreu um erro ao salvar o pedido. Tente novamente.");
      setTimeout(() => {
        setErroPedido("");
        setPaymentStatus(null);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

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

  try {
    if (paymentMethod === "site") {
      const ref = generatePedidoRef();
      setPedidoRef(ref);
      localStorage.setItem("pedidoRef", ref);
      setPaymentReady(true);
      setPaymentResult(null);
      setPixQrCode(null);
      setPixQrCodeBase64(null);
      setPixTicketUrl(null);
      return;
    }

    // 💰 Pagamento na entrega → salva direto no Firestore
    setIsLoading(true);
    const id = await addPedido(novoPedido);
    console.log("Pedido salvo com ID:", id);
    localStorage.setItem("pedidoId", id);
    setPedidoId(id);

    if (cupomAplicado) {
      await marcarCupomComoUsado(cupomAplicado);
    }

    localStorage.setItem("telefoneCliente", telefone);
    localStorage.removeItem("pedidoPendente");
    localStorage.removeItem("pedidoRef");
    clearCart();
    setPaymentStatus("success");
    setErroPedido("Pedido confirmado!\nVocê será redirecionado para o acompanhamento.");
    setTimeout(() => navigate(`/acompanhar/${id}`), 2500);
  } catch (err) {
    console.error("Erro ao registrar pedido:", err);
    setPaymentStatus("error");
    setErroPedido("Ocorreu um erro ao salvar o pedido. Tente novamente.");
    setTimeout(() => {
      setErroPedido("");
      setPaymentStatus(null);
    }, 2000);
  } finally {
    setIsLoading(false);
  }
};

const handlePaymentSubmit = async (formData: any) => {
  const referencia = getPedidoRef();

  if (!referencia) {
    setErroPedido("Pedido nao encontrado. Atualize a pagina e tente novamente.");
    throw new Error("Pedido nao encontrado");
  }

  try {
    // Extrair dados do formData se existir
    const paymentData = formData.formData || formData;

    const payer = {
      ...(paymentData.payer || {}),
      email: paymentData?.payer?.email || getPayerEmail(),
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
      external_reference: referencia,
      metadata: { pedidoRef: referencia },
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
      await finalizePagamentoAprovado(
        "Pagamento aprovado!\nVocê será redirecionado para o acompanhamento."
      );
    }

    return data;
  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error);
    setPaymentStatus("error");
    setErroPedido("Erro ao processar pagamento. Tente novamente.");
    setTimeout(() => {
      setErroPedido("");
      setPaymentStatus(null);
    }, 2000);
    throw error;
  }
};

// 🔹 Nova função para criar PIX
const handleCreatePix = async () => {
  // Validar email
  if (!email.trim()) {
    setEmailError("Email é obrigatório para pagar com PIX");
    return;
  }

  if (!validateEmail(email)) {
    setEmailError("Email inválido. Por favor, insira um email válido");
    return;
  }

  setEmailError("");
  const referencia = getPedidoRef();

  if (!referencia) {
    setPaymentStatus("error");
    setErroPedido("Pedido nao encontrado. Atualize a pagina e tente novamente.");
    setTimeout(() => {
      setErroPedido("");
      setPaymentStatus(null);
    }, 2000);
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
      payer: { email: email.trim() },
      external_reference: referencia,
      metadata: { pedidoRef: referencia },
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
    setPaymentStatus("error");
    setErroPedido("Erro ao criar PIX. Tente novamente.");
    setTimeout(() => {
      setErroPedido("");
      setPaymentStatus(null);
    }, 3000);
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
      await finalizePagamentoAprovado(
        "Pagamento aprovado!\nVocê será redirecionado para o acompanhamento."
      );
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

const isStepOneValid =
  nome.trim() !== "" &&
  telefone.trim() !== "" &&
  (deliveryMethod === "retirada" ||
    (endereco.trim() !== "" && numero.trim() !== "" && bairro.trim() !== ""));

const isFormValid = isStepOneValid;

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
            {paymentStatus === "success" && (
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✅</div>
            )}
            {paymentStatus === "error" && (
              <div style={{ fontSize: "3rem", marginBottom: "12px", color: "#e74c3c" }}>❌</div>
            )}
            <p style={{whiteSpace: "pre-line"}}>{erroPedido}</p>
          </div>
        </div>
      )}
      <div className="checkout-main">
        <div className="checkout-steps">
          <div className={`checkout-step ${checkoutStep === 1 ? "active" : ""}`}>
            1. Contato e entrega
          </div>
          <div
            className={`checkout-step ${checkoutStep === 2 ? "active" : ""} ${
              !isStepOneValid ? "disabled" : ""
            }`}
          >
            2. Pagamento
          </div>
        </div>

        {checkoutStep === 1 && (
          <>
            <div className="checkout-card checkout-card-split delivery-info-card">
              <div className="card-section">
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

              <div className="card-section">
                <h3>
                  <i className="bi bi-geo-alt"></i> Informacoes de Entrega
                </h3>
                <div className="checkout-form">
                  <h3 style={{margin: 0}}>Nome:</h3>
                  <input
                    type="text"
                    placeholder="Seu Nome *"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />

                  <h3 style={{margin: 0}}>WhatsApp:</h3>
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

            <div className="checkout-actions">
              <button
                className="confirm-btn"
                onClick={() => setCheckoutStep(2)}
                disabled={!isStepOneValid}
                style={{
                  opacity: isStepOneValid ? 1 : 0.6,
                  cursor: isStepOneValid ? "pointer" : "not-allowed",
                }}
              >
                Continuar para pagamento
              </button>
              {!isStepOneValid && (
                <p className="step-hint">Preencha os campos obrigatorios para continuar.</p>
              )}
            </div>
          </>
        )}

        {checkoutStep === 2 && (
          <>
            <div className="checkout-card payment-info-card">
              <h3>
                <i className="bi bi-credit-card"></i> Informacoes de Pagamento
              </h3>

              <label className={`payment-option ${paymentMethod === "entrega" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="entrega"
                  checked={paymentMethod === "entrega"}
                  onChange={() => {
                    setPaymentMethod("entrega");
                    setEmailError("");
                  }}
                />
                <div className="payment-info">
                  <span className="title">Pagar na Entrega/Retirada</span>
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

              {paymentMethod === "entrega" && (
                <div className="change-section">
                  <label className="change-checkbox">
                    <input
                      type="checkbox"
                      checked={precisaTroco}
                      onChange={(e) => {
                        setPrecisaTroco(e.target.checked);
                        if (!e.target.checked) setValorTroco("");
                      }}
                    />
                    Preciso de troco
                  </label>

                  {precisaTroco && (
                    <div className="troco-input-container">
                      <label htmlFor="valorTroco">Troco para quanto?</label>
                      <input
                        style={{ width: "30%", border: "1px solid black", borderRadius: "5px", padding: "2px", marginTop: "5px" }}
                        id="valorTroco"
                        type="text"
                        value={valorTroco}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
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

              {!(paymentMethod === "site" && paymentReady) && (
                <div className="payment-confirm">
                  {!isFormValid && (
                    <p
                      style={{
                        color: "red",
                        fontSize: "0.9rem",
                        margin: "10px 0",
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

            {paymentMethod === "site" && paymentReady ? (
              <div className="checkout-card checkout-card-soft payment-online-card">
                <h3>
                  <i className="bi bi-credit-card"></i> Metodo de Pagamento</h3>

                <div className="payment-tabs">
                  <button
                    className={`payment-tab ${!pixQrCodeBase64 ? "active" : ""}`}
                    onClick={() => {
                      clearPaymentVerification();
                      setPixQrCodeBase64(null);
                      setPixQrCode(null);
                      setEmailError("");
                    }}
                    type="button"
                  >
                    Cartão de crédito/débito
                  </button>
                  <button
                    className={`payment-tab ${pixQrCodeBase64 ? "active" : ""}`}
                    onClick={handleCreatePix}
                    disabled={isLoading || isCheckingPayment}
                    type="button"
                  >
                    {isCheckingPayment ? "⏳ Aguardando pagamento..." : "PIX"}
                  </button>
                </div>

                {pixQrCodeBase64 === null && (
                  <>
                    <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f0f4f8", borderRadius: "6px" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#333" }}>
                        Email para Receber Comprovante
                      </h4>
                      <input
                        type="email"
                        placeholder="seu.email@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: emailError ? "2px solid #e74c3c" : "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "0.95rem",
                          boxSizing: "border-box",
                        }}
                      />
                      {emailError && (
                        <p style={{ color: "#e74c3c", fontSize: "0.85rem", marginTop: "6px", marginBottom: "0" }}>
                          ⚠️ {emailError}
                        </p>
                      )}
                    </div>
                    <div className="mp-brick">
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
                          setPaymentStatus("error");
                          setErroPedido("Erro ao processar pagamento. Tente novamente.");
                          setTimeout(() => {
                            setErroPedido("");
                            setPaymentStatus(null);
                          }, 2000);
                        }}
                      />
                    </div>
                  </>
                )}

                {pixQrCodeBase64 && (
                  <div className="mp-brick" style={{ textAlign: "center" }}>
                    <h4>💰 Pagamento PIX</h4>
                    <p style={{ color: "#666", marginBottom: "16px" }}>
                      {isCheckingPayment ? "Escaneie o QR code ou copie o codigo abaixo" : ""}
                    </p>

                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        display: "inline-block",
                        marginBottom: "16px",
                      }}
                    >
                      <img
                        src={`data:image/png;base64,${pixQrCodeBase64}`}
                        alt="QR Code PIX"
                        style={{ maxWidth: "260px", width: "100%" }}
                      />
                    </div>

                    {pixQrCode && (
                      <div style={{ marginTop: "16px" }}>
                        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "8px" }}>Ou copie o codigo:</p>
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
                              resize: "none",
                            }}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pixQrCode);
                              alert("Codigo copiado para a area de transferencia!");
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
                              width: "100%",
                            }}
                          >
                            ✓ Copiar Codigo PIX
                          </button>
                        </div>
                      </div>
                    )}

                    {isCheckingPayment && (
                      <p
                        style={{
                          marginTop: "16px",
                          padding: "12px",
                          backgroundColor: "#fff3cd",
                          borderRadius: "6px",
                          color: "#856404",
                          fontSize: "0.9rem",
                        }}
                      >
                        <strong>⏳ Aguardando confirmacao do pagamento...</strong>
                        <br />
                        Voce sera redirecionado assim que recebermos a confirmacao.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            <div className="checkout-actions">
              <button className="step-back-btn" onClick={() => setCheckoutStep(1)}>
                Voltar para dados
              </button>
            </div>
          </>
        )}
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
      </div>
    </div>
    </>
  );
}
