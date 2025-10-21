import { useCart } from "../../CartContext"; 
import { useState, useMemo } from "react";
import "./burger.css";
import { Plus } from "lucide-react"

interface Burger {
  nome: string;
  precoC: number;
  precoF: number;
  precoP: number;
  classe: string;
  ingredientes: string[];
}

interface CartItem {
  name: string;
  price: number; // 🔹 agora é numérico
  qty: number;
  ingredientes?: string[];
}

function Burger() {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [selectedBurger, setSelectedBurger] = useState<CartItem | null>(null);
  const [extras, setExtras] = useState<string[]>([]);

  const saboresFixos: Burger[] = [
    {
      nome: "Moura's Burger",
      precoC: 29.9,
      precoF: 25.9,
      precoP: 34.9,
      classe: "burger",
      ingredientes: ["Pão de Brioche", "Hambúrguer 140g", "2 Fatias de Cheddar"],
    },
    {
      nome: "Moura's Bacon",
      precoC: 36.9,
      precoF: 32.9,
      precoP: 39.9,
      classe: "burgerbacon",
      ingredientes: ["Pão de Brioche", "Hambúrguer 140g", "2 Fatias de Cheddar", "Bacon"],
    },
    {
      nome: "Moura's Duplo",
      precoC: 41.9,
      precoF: 37.9,
      precoP: 44.9,
      classe: "burgerduplo",
      ingredientes: ["Pão de Brioche", "2 Hambúrguer (140g cada)", "4 Fatias de Cheddar"],
    },
    {
      nome: "Moura's Duplo Bacon",
      precoC: 44.9,
      precoF: 39.9,
      precoP: 47.9,
      classe: "burgerduplobacon",
      ingredientes: ["Pão de Brioche", "2 Hambúrguer (140g cada)", "4 Fatias de Cheddar", "Bacon"],
    },
  ];

  // Alternar seleção de adicionais
  const toggleExtra = (extra: string) => {
    setExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  // Abrir modal e setar burger selecionado
  const handleOpenModal = (item: CartItem) => {
    setSelectedBurger(item);
    setExtras([]);
    setShowModal(true);
  };

  // Confirmar e adicionar ao carrinho
  const handleConfirm = () => {
    if (selectedBurger) {
      const extrasStr =
        extras.length > 0 ? ` | Extras: ${extras.join(", ")}` : "";

      addToCart({
        name: `${selectedBurger.name}${extrasStr}`,
        price: `R$${precoTotal.toFixed(2).replace(".",",")}`, // 💰 adiciona o total correto
        qty: selectedBurger.qty,
      });

      setShowModal(false);
    }
  };

  // 💰 cálculo estilo "PizzaModal"
  const precoTotal = useMemo(() => {
    const extrasLista = [
      { nome: "Bacon", preco: 5 },
      { nome: "Cheddar", preco: 3 },
      { nome: "Carne", preco: 9 },
    ];

    const totalExtras = extrasLista
      .filter((i) => extras.includes(i.nome))
      .reduce((acc, item) => acc + Number(item.preco), 0);

    return Number(selectedBurger?.price || 0) + totalExtras;
  }, [extras, selectedBurger]);

  const PizzaCard = ({ nome, precoC, precoF, precoP, classe, ingredientes }: Burger) => (
    <div className="card-burger">
      <div className={`card-content-burger ${classe}`}>
        <h3>{nome}</h3>
        <div className="ing">
          {ingredientes.map((ing: string, idx: number) => (
            <p key={idx} style={{ margin: 0 }}>{`- ${ing}`}</p>
          ))}
        </div>

        <button
          className="btn-burger"
          onClick={() =>
            handleOpenModal({
              name: `${nome} Picanha`,
              price: precoP,
              qty: 1,
            })
          }
        >
          Picanha
          <p style={{ margin: "0 0 0px auto", color: "yellow" }}>
            R${precoP.toFixed(2).replace(".", ",")}
          </p>
        </button>

        <button
          className="btn-burger"
          onClick={() =>
            handleOpenModal({
              name: `${nome} Contrafilé`,
              price: precoC,
              qty: 1,
            })
          }
        >
          Contrafilé
          <p style={{ margin: "0 0 0px auto", color: "yellow" }}>
            R${precoC.toFixed(2).replace(".", ",")}
          </p>
        </button>

        <button
          className="btn-burger"
          onClick={() =>
            handleOpenModal({
              name: `${nome} Blend de Costela`,
              price: precoF,
              qty: 1,
            })
          }
        >
          Blend de Costela
          <p style={{ margin: "0 0 0px auto", color: "yellow" }}>
            R${precoF.toFixed(2).replace(".", ",")}
          </p>
        </button>
      </div>
    </div>
  );

  return (
    <section className="section-pizzas">
      <h2>Burgers</h2>

      <div className="section-sabores">
        {saboresFixos.map((pizza, i) => (
          <PizzaCard key={i} {...pizza} />
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay-adicionais">
          <div className="modal-adicionais">
            <h2>Deseja adicionais?</h2>

            <div
              className="extras"
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
            >
              {["Bacon", "Cheddar", "Carne"].map((extra, i) => {
                const precoAdd = [5, 3, 9];
                const preco = Number(precoAdd[i]);
                const isSelected = extras.includes(extra);

                return (
                  <div
                    key={extra}
                    style={{ userSelect: "none" }}
                    onClick={() => toggleExtra(extra)}
                    className={`extra-card ${isSelected ? "e-sel" : "e-nsel"}`}
                  >
                    {extra}{" "}
                    <span>R${preco.toFixed(2).replace(".", ",")}</span>
                  </div>
                );
              })}
            </div>

            <div className="actions">
              <button
                className="btn-cancel-burger"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button className="btn-add-burger" onClick={handleConfirm}>
                <Plus size={18} style={{ marginRight: "6px", userSelect: "none" }} />
                Adicionar ao Carrinho
                <span
                  style={{
                    marginLeft: "8px",
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                >
                  R${precoTotal.toFixed(2).replace(".", ",")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Burger;
