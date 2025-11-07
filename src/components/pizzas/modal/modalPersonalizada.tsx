/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo, useState } from "react";
import "./modalPersonalizada.css";
import { Plus } from "lucide-react";

interface Ingrediente {
  nome: string;
  preco: number;
}

interface PizzaModalProps {
  open: boolean;
  ingredientes: Ingrediente[];
  selecionados: string[];
  setSelecionados: React.Dispatch<React.SetStateAction<string[]>>;
  addPizzaPersonalizada: () => void;
  onClose: () => void;
}

export default function PizzaModal(
  {
  open,
  ingredientes,
  selecionados,
  setSelecionados,
  addPizzaPersonalizada,
  onClose,
}: PizzaModalProps) {
  if (!open) return null;

  // 💰 Calcula o preço total com base nos ingredientes selecionados
  const precoTotal = useMemo(() => {
    return 51+ingredientes
      .filter((ing) => selecionados.includes(ing.nome))
      .reduce((acc, ing) => acc + ing.preco, 0);
  }, [selecionados, ingredientes]);

  const [errorMessage, setErrorMessage] = useState(""); 

  return (
    <div className="modal-overlay-monte-pizza">
      <div className="modal-monte-pizza">
        <h2>Monte sua Pizza</h2>
        <p style={{ margin: 0 }}>Selecione até 7 Ingredientes:</p>

        <ul className="ingredientes-grid">
            {ingredientes.map((item, i) => {
              const selecionado = selecionados.includes(item.nome);

              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`ingrediente-btn ${selecionado ? "ing-ativo" : "ing-inativo"}`}
                    onClick={() => {
                      if (selecionado) {
                        setSelecionados((prev) => prev.filter((x) => x !== item.nome));
                      } else if (selecionados.length < 7) {
                        setSelecionados((prev) => [...prev, item.nome]);
                      } else {
                        setErrorMessage("Você só pode selecionar até 7 ingredientes.");
                      }
                    }}
                  >
                    <span className="ingrediente-nome">{item.nome}</span>
                    <span className="ingrediente-preco">
                      +R${item.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {errorMessage && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  margin: "10px 0 10px 0",
                  textAlign: "center"
                }}
              >
                {errorMessage}
              </p>
              )}

        <div className="modal-footer-personalizada">
          <button className="btn-monte-pizza" onClick={addPizzaPersonalizada}>
            <Plus size={18} style={{ marginRight: "6px" }} />
            Adicionar ao Carrinho
            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
            R${precoTotal.toFixed(2).replace(".", ",")}
          </span>
          </button>

          
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

           

        </div>
      </div>
    </div>
  );
}
