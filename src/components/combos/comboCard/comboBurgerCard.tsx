/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useCart } from "../../../CartContext";
import { Plus } from "lucide-react";
import "./comboBurger.css";
import { precoBebidas} from "../../bebidas/bebes"; 

type HamburguerCardProps = {
  nomeCombo: string;
  titulo: string;
  descricao: string;
  precoContra: number;
  precoFralda: number;
  precoPicanha: number;
  qtdHamburgueres?: number;
  qtdBebidas?: number;
  bebes?: string[];
  sanduba: string;
};

export default function HamburguerCard({
  nomeCombo,
  titulo,
  descricao,
  precoContra,
  precoFralda,
  precoPicanha,
  qtdBebidas = 1,
  qtdHamburgueres = 2,
  bebes,
  sanduba
}: HamburguerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [bebidas, setBebidas] = useState<string[]>(Array(qtdBebidas).fill(""));
  const [selectedCarnes, setSelectedCarnes] = useState<string[]>(
    Array(qtdHamburgueres).fill("")
  );

const carnes = ["Picanha", "Blend de Costela", "Contrafilé"];

const calcularPrecoCombo = () => {
  // Converte os preços das props (strings) para número
  const precoCarne: Record<string, number> = {
    Contrafilé: precoContra,
    "Blend de Costela": precoFralda,
    Picanha: precoPicanha,
  };
  const total = selectedCarnes.reduce((acc, carne) => {
    const preco = precoCarne[carne] || 0;
    return acc + preco;
  }, 0);

  // Retorna formatado
  return total.toFixed(2).replace(".", ",");
};

    const { addToCart } = useCart();

  const handleCarneClick = (index: number, carne: string) => {
    const novas = [...selectedCarnes];
    novas[index] = carne;
    setSelectedCarnes(novas);
    setErrorMessage("");
  };

  const handleBebidaChange = (index: number, value: string) => {
    const novas = [...bebidas];
    novas[index] = value;
    setBebidas(novas);
    setErrorMessage("");
  };

  const handleConfirm = () => {
    if (selectedCarnes.some((c) => !c) || bebidas.some((b) => !b)) {
      setErrorMessage("Escolha todos os hambúrgueres e bebidas antes de continuar.");
      return;
    }

    const itemName = `Combo ${titulo}\n${selectedCarnes.map((c, i) => `- ${sanduba} ${c}`).join("\n")}\n${bebidas.map((b) => `- ${b}`).join("\n")}`;

    const comboItem = {
      name: itemName,
      price: `R$${calcularPrecoCombo()}`,
      qty: 1,
    };

    addToCart(comboItem);
    setIsModalOpen(false);
    setBebidas(Array(qtdBebidas).fill(""));
    setSelectedCarnes(Array(qtdHamburgueres).fill(""));
  };

  return (
    <>
      <div className="card-combo">
        <div className="card-content-combo">
          <h3>{titulo}</h3>
          <p className="descricao-combo">{descricao}</p>
          <p className="price-combo">A partir de R${((Number(precoFralda)*2)).toFixed(2).replace(".",",")}</p>
          <button className="btn-combo" onClick={() => setIsModalOpen(true)}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-combo-burger">
          <div className="modal-combo-burger">
            <h2>
              Monte seu 
            </h2>
            <h2 style={{ color: "red" }}>Combo {nomeCombo}:</h2>

            <div className="carnes-container">
              {Array.from({ length: qtdHamburgueres }).map((_, i) => (
                <div key={i} className="hamburguer-carne">
                  <p style={{ margin: "0.5rem 0" }}>Hambúrguer {i + 1}:</p>
                  <div className="carne-options">
                    {carnes.map((carne) => (
                      <div
                        key={carne}
                        className={`carne-card ${selectedCarnes[i] === carne ? "carne-selected" : "carne-nselected"}`}
                        onClick={() => handleCarneClick(i, carne)}
                      >
                        {carne}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {bebidas.map((bebida, i) => (
              <label key={`bebe-${i}`} className="bebida-section">
                Bebida {i + 1}:
                <select value={bebida} onChange={(e) => handleBebidaChange(i, e.target.value)}>
                  <option value="">Selecione</option>
                  {(bebes ?? []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            ))}

              {errorMessage && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  margin: "10px 0 0 0",
                  textAlign: "center"
                }}
              >
                {errorMessage}
              </p>
              )}

            <div className="modal-buttons-burger">
              <button className="botao-cancelar-burger" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="botao-adicionar-burger" onClick={handleConfirm}>
                <Plus size={18} style={{ marginRight: "6px" }}/>
                Adicionar ao Carrinho
                <span style={{marginLeft: "6px"}}>R${calcularPrecoCombo()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
