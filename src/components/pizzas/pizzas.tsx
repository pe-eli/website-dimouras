/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCart } from "../../CartContext"; 
import { useRef, useState } from "react";
import {saboresFixos} from "./sabores"
import PizzaModal from "./modal/modalPersonalizada";
import HalfPizzaModal from "./modal/modalMeio";
import "./pizzas.css"

function Pizzas(){

  interface Pizza {
  nome: string;
  preco: number;
  classe: string;
  ingredientes: string[];
}

    const PizzaCard = ({ nome, preco, classe, ingredientes }: Pizza) => (
  <div className="pizza-card">
    <div
      className={`pizza-image pizza-${classe}`}
      role="img"
      aria-label={nome}
    />
    <div className="pizza-info">
      <h3>{nome}</h3>
      <div className="pizza-ingredients">
        {ingredientes.map((ing: string, idx: number) => (
          <p key={idx} className="pizza-ingredient">{`- ${ing}`}</p>
        ))}
      </div>
      <div className="pizza-footer">
        <p className="pizza-price">R${preco.toFixed(2).replace(".", ",")}</p>
        <div className="pizza-actions">
          <button
            className="pizza-btn pizza-btn--half"
            onClick={() => {
              setFirstFlavor(nome);
              setOpenHalfModal(true);
            }}
          >
            Meio a meio
          </button>

          <button
            className="pizza-btn pizza-btn--inteira"
            onClick={() =>
              addToCart({
                name: `Pizza Inteira de ${nome}`,
                price: `R$${preco.toFixed(2).replace("." , ",")}`,
                qty: 1,
                category_id: "food",
              })
            }
          >
            Inteira
          </button>
        </div>
      </div>
    </div>
  </div>
);
    const ingredientes = [
  { nome: "Alho Frito", "preco": 3.0 },
  { nome: "Azeitona", "preco": 5 },
  { nome: "Bacon", "preco": 6 },
  { nome: "Calabresa", "preco": 4 },
  { nome: "Cebola", "preco": 3 },
  { nome: "Cream Cheese", "preco": 5 },
  { nome: "Frango", "preco": 8 },
  { nome: "Gorgonzola", "preco": 12 },
  { nome: "Milho", "preco": 3 },
  { nome: "Parmesão", "preco": 9 },
  { nome: "Pepperoni", "preco": 9 },
  { nome: "Provolone", "preco": 9 },
  { nome: "Requeijão", "preco": 4 },
  { nome: "Tomate", "preco": 5 }
];

      const addPizzaPersonalizada = () => {
    if (selecionados.length === 0) {
      alert("Escolha pelo menos 1 ingrediente!");
      return;
    }
     const total = (ingredientes.filter((i) => selecionados.includes(i.nome)).reduce((acc, item) => acc + item.preco, 0) + 51).toFixed(2);

    addToCart({
      name: `Pizza Personalizada (${selecionados.join(", ")})`,
      price: `R$ ${total.replace(".", ",")}`,
      qty: 1,
      category_id: "food",
    });
    setOpenModal(false);
    setSelecionados([]);
  };

    const [openModal, setOpenModal] = useState(false);
    const [selecionados, setSelecionados] = useState<string[]>([]);
    const { cart, addToCart, updateQty, removeFromCart, getTotal } = useCart();
    const [openHalfModal, setOpenHalfModal] = useState(false);
    const [firstFlavor, setFirstFlavor] = useState<string | null>(null);
    const [secondFlavor, setSecondFlavor] = useState<string | null>(null);

    return(

<section className="pizza-section">
        <h2>Pizzas</h2>
        <div className="pizza-sabores">
            {saboresFixos.map((pizza, i) => (
              <PizzaCard key={i} {...pizza} />
              ))}

            <div className="pizza-card">
              <div
                className="pizza-image pizza-monte"
                role="img"
                aria-label="Monte a sua pizza"
              />
              <div className="pizza-info">
                <h3>Monte a Sua Pizza</h3>
                <p className="pizza-description">Monte seu sabor de pizza com até 7 ingredientes:</p>
                <div className="pizza-footer">
                  <button className="pizza-btn" onClick={() => setOpenModal(true)}>+</button>
                </div>
              </div>
            </div>
        </div>

    {/*Modal Pizza Montada*/}
    <PizzaModal
        open={openModal}
        ingredientes={ingredientes}
        selecionados={selecionados}
        setSelecionados={setSelecionados}
        addPizzaPersonalizada={addPizzaPersonalizada}
        onClose={() => setOpenModal(false)}
      />

      {/*Modal Pizza Meio a Meio*/}
      <HalfPizzaModal
        open={openHalfModal}
        firstFlavor={firstFlavor}
        secondFlavor={secondFlavor}
        setFirstFlavor={setFirstFlavor}
        setSecondFlavor={setSecondFlavor}
        onClose={() => setOpenHalfModal(false)}
        addToCart={addToCart}
      />

      </section>

          )
}

export default Pizzas