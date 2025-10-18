import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

// 🔑 Verifica se o token foi carregado
console.log(
  "🔑 Token Mercado Pago:",
  process.env.MERCADOPAGO_ACCESS_TOKEN ? "OK" : "NÃO ENCONTRADO"
);

const app = express();

// 🌐 Define URL do frontend (para o CORS e redirecionamentos)
const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.dimouras.com.br/";
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
console.log("🌐 FRONTEND_URL:", FRONTEND_URL);

// 🧩 Inicializa o client do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// 🚀 Rota para criar preferência de pagamento
app.post("/api/create_preference", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    // Cria o corpo da preferência
    const body = {
  items: items.map((item: any, index: number) => ({
    id: `item-${index + 1}`,
    title: item.title || "Produto sem nome",
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 1,
    currency_id: item.currency_id || "BRL",
  })),
  back_urls: {
    success: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    failure: "http://localhost:5173/checkout",
    pending: "http://localhost:5173/orders",
  },
  auto_return: "approved", // ⬅️ redireciona automaticamente para success
};

    console.log("🧾 Enviando para o Mercado Pago:", JSON.stringify(body, null, 2));

    // Cria a preferência via SDK
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

// 🚪 Inicializa o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
