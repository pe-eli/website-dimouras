/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from "react";
import { useCart } from "../../CartContext"; 
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Combos from "../../components/combos/combos"
import Pizzas from "../../components/pizzas/pizzas"
import Burger from "../../components/burger/burger";
import Bebidas from "../../components/bebidas/bebidas";


export default function Home() {

  const navigate = useNavigate();
  
  const id = localStorage.getItem("pedidoId");

  const [ , setOpenModal] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const { cart, addToCart, updateQty, removeFromCart, getTotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const [openHalfModal, setOpenHalfModal] = useState(false);
  const [firstFlavor, setFirstFlavor] = useState<string | null>(null);
  const [secondFlavor, setSecondFlavor] = useState<string | null>(null);

  const saboresFixos = [
  { nome: "Calabresa", preco: 35.99 },
  { nome: "Frango", preco: 37.99 },
  { nome: "Quatro Queijos", preco: 39.99 },
  { nome: "Pepperoni", preco: 38.99 },
];

const precoFinal = Math.max(
  saboresFixos.find((s) => s.nome === firstFlavor)?.preco || 0,
  saboresFixos.find((s) => s.nome === secondFlavor)?.preco || 0
);

  const ingredientes = [
    { nome: "Mussarela", preco: 3.5 },
    { nome: "Calabresa", preco: 4.0 },
    { nome: "Bacon", preco: 5.0 },
    { nome: "Frango", preco: 4.5 },
    { nome: "Tomate", preco: 2.0 },
    { nome: "Cebola", preco: 1.5 },
    { nome: "Milho", preco: 2.5 },
  ];

  const combosRef = useRef<HTMLDivElement | null>(null);
  const pizzasRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLDivElement| null>(null);
  const bebidasRef = useRef<HTMLDivElement| null>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  return (
    <div className="app">
      <header className="header">
        <h1>Di Mouras</h1>
        <p>Pizzas e Burgers</p>
        <button onClick={() => navigate("/acompanhar")}>Meus Pedidos</button>
      </header>

      <nav className="navbar">
        
        <button onClick={() => scrollToSection(combosRef)}>Combos</button>
        <button onClick={() => scrollToSection(pizzasRef)}>Pizzas</button>
        <button onClick={() => scrollToSection(burgerRef)}>Burgers</button>
        <button onClick={() => scrollToSection(bebidasRef)}>Bebidas</button>

        <div className="cart-icon" onClick={() => setCartOpen(!cartOpen)}>
          <ShoppingCart size={24} color="white" /> {" "}
          <span className="cart-count">
            {cart.reduce((a, i) => a + i.qty, 0)}
          </span>
        </div>
      </nav>

      {/* SACOLA */}
      {cartOpen && (
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Sua Sacola</h3>
            <button className="close-btn" onClick={() => setCartOpen(false)}>
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p>Nenhum item adicionado.</p>
          ) : (
            <>
              <ul className="ul-cart">
                {cart.map((item, i) => (
                  <li key={i} className="cart-item">
                    <div>
                      <p>{item.name}</p>
                      <span>{item.price}</span>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.name, -1)}>
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.name, 1)}>
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.name)}
                      >
                        ✕
                      </button>
                    </div>
                    
                  </li>
                ))}
              </ul>

              <div className="cart-total">
                <span>Total:</span>
                <strong>R$ {getTotal()}</strong>
              </div>

              <button className="checkout-btn" onClick={() => navigate("/checkout", { state: { fromMenu: true } })}>Finalizar Pedido</button>
            </>
          )}
        </div>
      )}

      <div ref={combosRef}>
      <Combos/>
      </div>

      <div
        style={{
          width: "70vw",
          height: "5px",
          backgroundColor: "red",
          placeSelf: "center",
          borderRadius: "40%"
        }}
      ></div>

      <div ref={pizzasRef}>
      <Pizzas/>
      </div>
      <div
        style={{
          width: "70vw",
          height: "5px",
          backgroundColor: "red",
          placeSelf: "center",
          borderRadius: "40%"
        }}
      ></div>
      
      <div ref={burgerRef}>
      <Burger/>
      </div>
      
      <div
        style={{
          display: "flex",
          width: "70vw",
          height: "5px",
          backgroundColor: "red",
          placeSelf: "center",
          borderRadius: "40%"
        }}
      ></div>

      <div ref={bebidasRef}>
      |<Bebidas/>
      </div>
      {openHalfModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Pizza Meio a Meio</h2>
      <p>Você escolheu <strong>{firstFlavor}</strong>. Agora selecione o outro sabor:</p>
      
      <ul>
        {["Calabresa", "Frango com requeijão", "Quatro queijos", "Pepperoni"]
          .filter((sabor) => sabor !== firstFlavor)
          .map((sabor) => (
            <li key={sabor}>
              <label>
                <input
                  type="radio"
                  name="meia"
                  checked={secondFlavor === sabor}
                  onChange={() => setSecondFlavor(sabor)}
                />
                {sabor}
              </label>
            </li>
          ))}
      </ul>

      <div className="modal-footer">
        <button
          className="btn"
          onClick={() => {
                if (!secondFlavor) {
                  alert("Escolha o segundo sabor!");
                  return;
                }
                addToCart({
                  name: `Meio a Meio - ${firstFlavor} + ${secondFlavor}`,
                  price: `R$${precoFinal.toFixed(2).replace(".", ",")}`,
                  qty: 1,
                });
                setOpenHalfModal(false);
                setSecondFlavor(null);
                setFirstFlavor(null);
              }}
            >
              Adicionar ao carrinho
            </button>
            <button className="btn-cancel" onClick={() => setOpenHalfModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}
      
      <footer className="footer">
        <p>Contato: (37) 99826-0420</p>
        <p>
          Criado por <strong>@prottocode</strong>
        </p>
        <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
