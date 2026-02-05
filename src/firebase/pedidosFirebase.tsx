// src/firebase/pedidos.ts
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
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
  cupom?: string | null;
  desconto?: number;
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
      "service_q2fbg57", // substitua
      "template_9w5w19q", // substitua
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
      "Zx_ej2NKTM3Xb0rlr" // substitua
    );

    console.log("📧 E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }

  return docRef.id;
};

export const validarCupom = async (codigoCupom: string): Promise<{ valido: boolean; desconto?: number; tipo?: string }> => {
  try {
    const cuponsCollection = collection(db, "cupons");
    const q = query(cuponsCollection, where("codigo", "==", codigoCupom.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valido: false };
    }

    const cupomData = querySnapshot.docs[0].data();
    
    // Verifica se o cupom está ativo
    if (cupomData.ativo === false) {
      return { valido: false };
    }

    // Verifica se já foi usado (para cupons de uso único)
    if (cupomData.usoUnico === true && cupomData.usado === true) {
      return { valido: false };
    }

    // Verifica se o cupom expirou
    if (cupomData.dataExpiracao) {
      const dataExpiracao = new Date(cupomData.dataExpiracao);
      if (new Date() > dataExpiracao) {
        return { valido: false };
      }
    }

    return {
      valido: true,
      desconto: cupomData.desconto || 0,
      tipo: cupomData.tipo || "percentual" // "percentual" ou "fixo"
    };
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    return { valido: false };
  }
};

export const marcarCupomComoUsado = async (codigoCupom: string): Promise<void> => {
  try {
    const cuponsCollection = collection(db, "cupons");
    const q = query(cuponsCollection, where("codigo", "==", codigoCupom.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const cupomDoc = querySnapshot.docs[0];
      const cupomData = cupomDoc.data();

      // Se for de uso único, marca como usado e desativa
      if (cupomData.usoUnico === true) {
        await updateDoc(doc(db, "cupons", cupomDoc.id), {
          usado: true,
          ativo: false
        });
        console.log(`Cupom ${codigoCupom} marcado como usado e desativado`);
      }
    }
  } catch (error) {
    console.error("Erro ao marcar cupom como usado:", error);
  }
};
