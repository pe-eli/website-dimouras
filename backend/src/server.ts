import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";


dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.dimouras.com.br";


const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());


const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

app.post("/api/create_preference", async (req, res) => {
  try {
    const { items, pedidoId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    const body = {
  items: items.map((item: any, index: number) => ({
    id: `item-${index + 1}`,
    title: item.title || "Produto sem nome",
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 1,
    currency_id: item.currency_id || "BRL",
  })),
  back_urls: {
    success: `https://www.dimouras.com.br/acompanhar/${pedidoId}`,
    failure: "https://www.dimouras.com.br/recusado",
    pending: "https://www.dimouras.com.br",
  },
  auto_return: "approved", 
};

    const preference = new Preference(client);
    const response = await preference.create({ body });

    const preferenceId = response.id;
    console.log("✅ Preferência criada com sucesso:", preferenceId);

    res.json({ id: preferenceId });
  } catch (error: any) {
    console.error("❌ Erro ao criar preferência:", error);
    res.status(500).json({ error: error.message || "Erro ao criar preferência" });
  }
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


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
