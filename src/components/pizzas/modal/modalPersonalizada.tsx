/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo } from "react";
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

export default function PizzaModal({
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

  return (
    <div className="modal-overlay-monte-pizza">
      <div className="modal-monte-pizza">
        <h2>Monte sua Pizza Personalizada</h2>
        <p style={{ margin: 0 }}>Selecione até 7 Ingredientes:</p>
        <ul>
          {ingredientes.map((item, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={selecionados.includes(item.nome)}
                  onChange={() => {
                    if (selecionados.includes(item.nome)) {
                      setSelecionados((prev) =>
                        prev.filter((x) => x !== item.nome)
                      );
                    } else if (selecionados.length < 7) {
                      setSelecionados((prev) => [...prev, item.nome]);
                    } else {
                      alert("Você só pode selecionar até 7 ingredientes.");
                    }
                  }}
                />
                {item.nome}
                <p style={{ margin: "0 5px" }}>
                  R${item.preco.toFixed(2).replace(".", ",")}
                </p>
              </label>
            </li>
          ))}
        </ul>

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
