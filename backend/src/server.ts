import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); // libera o frontend
app.use(express.json());

// Inicializa o client do MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Rota de teste para criar preferência
app.post("/api/create_preference", async (req, res) => {
  try {
    const { items } = req.body;

    console.log("Itens recebidos:", items);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: "http://localhost:5173/acompanhar",
          failure: "http://localhost:5173/checkout",
          pending: "https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:P%C3%A1gina_principal",
        },
        auto_return: "approved",
      },
    });

    console.log("Response MercadoPago:", response); // 🔹 veja exatamente o que vem

    const preferenceId = (response as any).id;
console.log("Preference ID:", preferenceId);

res.json({ id: preferenceId });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});


const PORT = 3333;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
