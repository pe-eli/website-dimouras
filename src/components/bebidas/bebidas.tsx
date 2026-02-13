/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCart } from "../../CartContext";
import "./bebidas.css"
import { precoBebidas } from "./bebes";

function Bebidas(){

    const { cart, addToCart, updateQty, removeFromCart, getTotal } = useCart();

    const produtos = [
      {
        id: "coca-350",
        nome: "Coca-Cola 350mL",
        preco: precoBebidas[0].precoLata,
        imagem: "/coca.png",
        cartName: "Coca-Cola 350ml",
      },
      {
        id: "guarana-350",
        nome: "Guaraná Antarctica 350mL",
        preco: precoBebidas[0].precoLata,
        imagem: "/guarana.png",
        cartName: "Guaraná Antarctica 350ml",
      },
      {
        id: "coca-1l",
        nome: "Coca-Cola 1L",
        preco: precoBebidas[2].precoCoca1L,
        imagem: "/coca1L.png",
        cartName: "Coca-Cola 1L",
      },
      {
        id: "guarana-1l",
        nome: "Guaraná 1L",
        preco: precoBebidas[1].precoGuarana1L,
        imagem: "/guarana1L.png",
        cartName: "Guaraná 1L",
      },
    ];

    return(
         <section className="section-bebidas">

        <h2>Bebidas</h2>

     <div className="grid-bebidas">
       {produtos.map((produto) => (
         <div className="product-card" key={produto.id}>
           <div className="product-image">
             <img src={produto.imagem} alt={produto.nome} />
           </div>
           <div className="product-info">
             <h3>{produto.nome}</h3>
             <div className="product-footer">
               <p className="product-price">R${produto.preco}</p>
               <button
                 className="btn-bebida"
                 onClick={() =>
                   addToCart({
                     name: produto.cartName,
                     price: `R$${produto.preco}`,
                     qty: 1,
                     category_id: "beverage",
                   })
                 }
               >
                 Adicionar ao carrinho
               </button>
             </div>
           </div>
         </div>
       ))}
     </div>

</section>

    )
}

export default Bebidas