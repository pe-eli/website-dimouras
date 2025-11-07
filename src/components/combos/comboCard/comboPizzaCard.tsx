/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useCart } from "../../../CartContext";
import { Plus } from "lucide-react";
import { saboresFixos } from "../../pizzas/sabores";
import "./comboPizzaCard.css"

const contagem = [
  "", "segunda", "terceira"
]

type ComboCardProps = {
  nomeCombo: string;
  titulo: string;
  descricao: string;
  precoC: number;
  precoF: number;
  precoQ: number;
  precoP: number;
  qtdPizzas?: number;
  qtdBebidas?: number;
  bebes?: string[];
};

export default function ComboCard({
  nomeCombo,
  titulo,
  descricao,
  precoC,
  precoF,
  precoQ,
  precoP,
  qtdPizzas = 1,
  qtdBebidas = 1,
  bebes = []
}: ComboCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pizzas, setPizzas] = useState<string[][]>(
    Array(qtdPizzas).fill([]).map(() => [])
  );
  const [bebidas, setBebidas] = useState<string[]>(Array(qtdBebidas).fill(""));
  const { addToCart } = useCart();
  const [errorMessage, setErrorMessage] = useState(""); 

  const handlePizzaToggle = (pizzaIndex: number, sabor: string) => {
    const novas = [...pizzas];
    const selecionados = novas[pizzaIndex];

    if (selecionados.includes(sabor)) {
      novas[pizzaIndex] = selecionados.filter((s) => s !== sabor);
      setErrorMessage("");
    }
    else if (selecionados.length < 2) {
      novas[pizzaIndex] = [...selecionados, sabor];
    } 
    else {
      setErrorMessage("Você pode escolher no máximo 2 sabores por pizza.");
    }

    setPizzas(novas);
  };

  const handleBebidaChange = (index: number, value: string) => {
    const novas = [...bebidas];
    novas[index] = value;
    setBebidas(novas);
    setErrorMessage("");
  };

  const preco = (): string => {
  let total = 0;

  pizzas.forEach((saboresSelecionados) => {
    // Cria um array com os preços dos sabores escolhidos
    const precosSelecionados = saboresSelecionados.map((sabor) => {
      switch (sabor) {
        case "Calabresa":
          return precoC;
        case "Frango":
          return precoF;
        case "Quatro Queijos":
          return precoQ;
        case "Pepperoni":
          return precoP;
        default:
          return 0;
      }
    });

    const precoPizza = precosSelecionados.length > 0 ? Math.max(...precosSelecionados) : precoC;

    total += precoPizza;
  });

  return `R$${total.toFixed(2).replace(".", ",")}`;
};

  const handleConfirm = () => {
    if (pizzas.some((sabores) => sabores.length === 0) || bebidas.some((b) => !b)) {
    setErrorMessage("Escolha todos os sabores de pizza e bebidas antes de continuar.");
    return;
  }
   setErrorMessage("");

    const pizzasDescricao = pizzas
  .map((p, i) => `- 1x Pizza ${p}`)
  .join("\n");

const bebidasDescricao = bebidas
  .map((b, i) => `- 1x ${b}`)
  .join("\n");

const itemName = `Combo ${titulo}\n${pizzasDescricao}\n${bebidasDescricao}`;
    
    const comboItem = {
      name: itemName,
      price: preco(),
      qty: 1,
    };

    addToCart(comboItem);
    setIsModalOpen(false);
    setPizzas(Array(qtdPizzas).fill([]).map(() => []));
    setBebidas(Array(qtdBebidas).fill(""));
  };

  return (
    <>
      <div className="card-combo">
        <div className="card-content-combo">
          <h3>{titulo}</h3>
          <p className="descricao-combo">{descricao}</p>
          <p className="price-combo">A partir de R${(precoC*qtdPizzas).toFixed(2).replace(".", ",")}</p>
          <button className="btn-combo" onClick={() => setIsModalOpen(true)}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-combo-pizza">
          <div className="modal-combo-pizza">
            <h2>Monte seu <span style={{color: "red"}}>Combo {nomeCombo}</span></h2>

            {/* Seleção de Pizzas */}
            {pizzas.map((saboresSelecionados, i) => (
              <div key={`pizza-${i}`} className="pizza-section">
                <p>Escolha até dois sabores para sua {contagem[i]} pizza:</p>
                <div className="pizza-sabores">
                  {saboresFixos.map((sabor) => (
                    <button
                      key={sabor.nome}
                      className={`pizza-sabor-btn ${
                        saboresSelecionados.includes(sabor.nome) ? "p-ativo" : "p-inativo"
                      }`}
                      onClick={() => handlePizzaToggle(i, sabor.nome)}
                    >
                      {sabor.nome}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Seleção de Bebidas */}
            {bebidas.map((bebida, i) => (
            <label key={`bebe-${i}`} className="bebida-section">
              Bebida {i + 1}:
              <select
                value={bebida}
                onChange={(e) => handleBebidaChange(i, e.target.value)}
              >
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

            <div className="modal-buttons-pizza">
              <button className="botao-cancelar"onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="botao-adicionar" onClick={handleConfirm}>
                <Plus size={18} style={{ marginRight: "6px" }} />
                Adicionar ao Carrinho 
                <span style={{marginLeft:"8px", fontSize:"0.9rem"}}>
                  {preco()}
                </span></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
