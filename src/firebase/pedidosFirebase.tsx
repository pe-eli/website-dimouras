// src/firebase/pedidos.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";
import emailjs from "@emailjs/browser";

export interface Pedido {
  nome: string;
  telefone: string;
  endereco?: string;
  metodoEntrega: "entrega" | "retirada";
  metodoPagamento: "entrega" | "site";
  itens: { nome: string; preco: string; quantidade?: number }[];
  total: string;
  localizacao?: {
    lat: number;
    lng: number;
    address: string;
  };
  observacao?: string;
  status?: "Pendente" | "Em preparo" | "Entregue" | "Cancelado";
  criadoEm: string;
}

const pedidosCollection = collection(db, "pedidos");

export const addPedido = async (pedido: Pedido) => {
  const docRef = await addDoc(pedidosCollection, pedido);

  // 🔹 Monta uma string com os itens para o corpo do e-mail
  const itensTexto = pedido.itens
    .map((item) => `- ${item.nome} (x${item.quantidade || 1}) — R$ ${item.preco}`)
    .join("\n");

  // 🔹 Envia o e-mail pelo EmailJS
  try {
    await emailjs.send(
      "service_cuvuouk", // substitua
      "template_k75swkb", // substitua
      {
        nome: pedido.nome,
        telefone: pedido.telefone,
        endereco: pedido.endereco || "Retirada no local",
        metodoPagamento: pedido.metodoPagamento,
        metodoEntrega: pedido.metodoEntrega,
        total: pedido.total,
        itens: itensTexto,
        observacao: pedido.observacao || "Nenhuma",
        criadoEm: new Date(pedido.criadoEm).toLocaleString(),
      },
      "uWKe07P6XBt6M60NQ" // substitua
    );

    console.log("📧 E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }

  return docRef.id;
};
