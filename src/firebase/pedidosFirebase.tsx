// src/firebase/pedidos.ts
import { collection, addDoc } from "firebase/firestore";
import { db } from "./config";

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
  status?: "Pendente" | "Em preparo" | "Entregue" | "Cancelado"; // já inclui "Cancelado" também, se quiser
  criadoEm: string;
}

const pedidosCollection = collection(db, "pedidos");

export const addPedido = async (pedido: Pedido) => {
  const docRef = await addDoc(pedidosCollection, pedido);
  return docRef.id;
};
