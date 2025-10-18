import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Inicializa o client do MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

app.post("/api/create_preference", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items,
        back_urls: {
          success: `${FRONTEND_URL}/acompanhar`,
          failure: `${FRONTEND_URL}/checkout`,
          pending: `${FRONTEND_URL}/pendente`,
        },
        auto_return: "approved",
      },
    });

    const preferenceId = (response as any).id;
    res.json({ id: preferenceId });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
