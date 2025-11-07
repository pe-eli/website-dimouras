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
  <div className="card-pizza">
    <div className={`card-content-pizza ${classe}`}>
      <h3>{nome}</h3>
      <div className="ing">
      {ingredientes.map((ing: string, idx: number) => (
        <p key={idx} style={{ margin: 0 }}>{`- ${ing}`}</p>
      ))}
      </div>
      <h4 className="price-pizza">R${preco.toFixed(2).replace(".", ",")}</h4>
      <div className="botoes">
      <button
        className="btn half"
        onClick={() => {
          setFirstFlavor(nome);
          setOpenHalfModal(true);
        }}
      >
        Meio a meio
      </button>

      <button
        style={{ marginTop: "0.5rem" }}
        className="btn inteira"
        onClick={() =>
          addToCart({
            name: `Pizza Inteira de ${nome}`,
            price: `R$${preco.toFixed(2).replace("." , ",")}`,
            qty: 1,
          })
        }
      >
        Inteira
      </button>
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

<section className="section-pizzas">
        <h2>Pizzas</h2>
        <div className="section-sabores">
          <div className="section-sabores">

            {saboresFixos.map((pizza, i) => (
              <PizzaCard key={i} {...pizza} />
              ))}

            <div className="card-monte">
            <h3>Monte a Sua Pizza</h3>
            <p>Monte seu sabor de pizza com até 7 ingredientes:</p>
            <button onClick={() => setOpenModal(true)}>+</button>
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