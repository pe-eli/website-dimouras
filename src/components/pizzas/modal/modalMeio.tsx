import { saboresFixos } from "../sabores"
import { Plus } from "lucide-react"
import React from "react";
import "./modalMeio.css"

interface HalfPizzaModalProps {
  open: boolean;
  firstFlavor: string | null;
  secondFlavor: string | null;
  setFirstFlavor: (sabor: string | null) => void;
  setSecondFlavor: (sabor: string | null) => void;
  onClose: () => void;
  addToCart: (item: { name: string; price: string; qty: number; category_id?: string }) => void;
}

const HalfPizzaModal: React.FC<HalfPizzaModalProps> = ({
  open,
  firstFlavor,
  secondFlavor,
  setFirstFlavor,
  setSecondFlavor,
  onClose,
  addToCart,
}) => {
  if (!open || !firstFlavor) return null;

  // sabores disponíveis exceto o primeiro escolhido
  const saboresDisponiveis = saboresFixos.filter(
    (sabor) => sabor.nome !== firstFlavor);

  // calcular preço final = maior entre os dois
  const precoFinal = (() => {
    const first = saboresFixos.find((s) => s.nome === firstFlavor)?.preco || saboresFixos[0].preco;
    if (!secondFlavor) return first;
    const second = saboresFixos.find((s) => s.nome === secondFlavor)?.preco || saboresFixos[0].preco;
    return Math.max(first, second);
  })();

  return (
    <div className="modal-overlay-meio">
      <div className="modal-meio">
        <h2 style={{color: 'black'}}>Pizza Meio a Meio</h2>
        <p style={{margin: 0}}>
          Você escolheu <strong>{firstFlavor}</strong>. 
        </p>
        <p>Agora selecione o outro sabor:</p>

        <ul style={{ display: "flex", gap: "1rem", flexWrap: "wrap", padding: 0 }}>
              {saboresDisponiveis.map((sabor) => {
                const isSelected = secondFlavor === sabor.nome;

                return (
                  <li key={sabor.nome} style={{ listStyle: "none", userSelect:"none"}}>
                    <div
                      style={{userSelect: "none"}}
                      onClick={() => setSecondFlavor(sabor.nome)}
                      className={`sabor-card ${isSelected ? "selected" : "not-selected"}`}
                    >
                      {sabor.nome}
                    </div>
                  </li>
                );
              })}
            </ul>


        <div className="modal-footer-meio">
          <button
            className="btn-add-meio"
            onClick={() => {
              if (!secondFlavor) {
                alert("Escolha o segundo sabor!");
                return;
              }
              addToCart({
                name: `Pizza: 1⁄2 ${firstFlavor} e 1⁄2 ${secondFlavor}`,
                price: `R$ ${precoFinal.toFixed(2).replace(".", ",")}`,
                qty: 1,
                category_id: "food",
              });
              onClose();
              setSecondFlavor(null);
              setFirstFlavor(null);
            }}
          >
            <Plus size={18} style={{ marginRight: "6px", userSelect:"none" }} />
            Adicionar ao Carrinho  <span style={{marginLeft: "8px"}}>R${precoFinal.toFixed(2).replace(".", ",")}</span>
          </button>
          <button style={{userSelect:"none"}}className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HalfPizzaModal;

