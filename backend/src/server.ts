import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Payment } from "mercadopago";


dotenv.config();
const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL =
  process.env.FRONTEND_URL || (isProd ? "https://www.dimouras.com.br" : "http://localhost:5173");
const BACKEND_URL =
  process.env.BACKEND_URL || (isProd ? "https://website-dimouras.onrender.com" : "http://localhost:3333");
const corsOrigins = FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean);
const isDev = !isProd;

// Validar variáveis de ambiente obrigatórias
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error("❌ ERRO: MERCADOPAGO_ACCESS_TOKEN não está configurado no .env");
  process.exit(1);
}
  
const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

app.post("/api/payments", async (req, res) => {
  try {
    const {
      transaction_amount,
      description,
      payment_method_id,
      token,
      installments,
      issuer_id,
      payer,
      external_reference,
      metadata,
    } = req.body;

    // Validações mais rigorosas
    if (!transaction_amount || transaction_amount <= 0) {
      return res.status(400).json({ error: "Valor de transação inválido" });
    }
    if (!payment_method_id || typeof payment_method_id !== "string") {
      return res.status(400).json({ error: "Método de pagamento inválido" });
    }
    if (!payer?.email) {
      return res.status(400).json({ error: "Email do pagador é obrigatório" });
    }

    const body: Record<string, unknown> = {
      transaction_amount: Number(transaction_amount),
      description: description || "Pedido Di Mouras",
      payment_method_id,
      payer,
      external_reference,
      metadata,
    };

    // Adiciona notification_url apenas em produção
    if (isProd) {
      body.notification_url = `${BACKEND_URL}/api/webhook/mercadopago`;
    }

    if (token) body.token = token;
    if (installments) body.installments = Number(installments);
    if (issuer_id) body.issuer_id = issuer_id;

    const payment = new Payment(client);
    const response = await payment.create({ body });

    res.json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      transaction_amount: response.transaction_amount,
      point_of_interaction: response.point_of_interaction,
      payment_method_id: response.payment_method_id,
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar pagamento:", error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || "Erro ao criar pagamento" });
  }
});

app.post("/api/webhook/mercadopago", async (req, res) => {
  const topic = req.query.type || req.body?.type;
  const paymentId = req.query["data.id"] || req.body?.data?.id;

  if (topic !== "payment" || !paymentId) {
    return res.sendStatus(200);
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Erro ao consultar pagamento no webhook:", text);
      return res.sendStatus(200);
    }

    const payment = (await response.json()) as {
      id?: string;
      status?: string;
      external_reference?: string;
      [key: string]: any;
    };

    console.log("🔔 Webhook Mercado Pago:", {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
    });
  } catch (error) {
    console.error("❌ Erro no webhook Mercado Pago:", error);
  }

  return res.sendStatus(200);
});



app.get("/api/verify-payment", async (req, res) => {
  const paymentId = req.query.id as string;

  if (!paymentId) {
    return res.status(400).json({ error: "Parâmetro 'id' é obrigatório" });
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Erro ao consultar pagamento:", text);
      return res.status(500).json({ error: "Erro ao consultar pagamento" });
    }

    // 👇 Aqui definimos o tipo explicitamente para evitar o erro "unknown"
    const payment = (await response.json()) as {
      id?: string;
      status?: string;
      transaction_amount?: number;
      [key: string]: any;
    };

    if (payment.status === "approved") {
      console.log(`✅ Pagamento aprovado: ${paymentId}`);
      return res.json({ approved: true, payment });
    } else {
      console.log(`⚠️ Pagamento não aprovado (${payment.status}): ${paymentId}`);
      return res.json({ approved: false, payment });
    }
  } catch (error) {
    console.error("❌ Erro interno ao verificar pagamento:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});


const PORT = Number(process.env.PORT) || 3333;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📍 CORS habilitado para: ${corsOrigins.join(", ")}`);
  console.log(`🔐 Ambiente: ${isProd ? "PRODUÇÃO" : "DESENVOLVIMENTO"}`);
  console.log(`💳 Mercado Pago: ${process.env.MERCADOPAGO_ACCESS_TOKEN ? "✅ Configurado" : "❌ Não configurado"}`);
  console.log(`🔔 Webhook URL:${isProd ? ` ${BACKEND_URL}/api/webhook/mercadopago` : " (desativado em desenvolvimento)"}`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Porta ${PORT} já está em uso!`);
  } else {
    console.error("❌ Erro no servidor:", err);
  }
  process.exit(1);
});
