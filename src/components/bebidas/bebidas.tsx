/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCart } from "../../CartContext";
import "./bebidas.css"
import { precoBebidas } from "./bebes";

function Bebidas(){

    const { cart, addToCart, updateQty, removeFromCart, getTotal } = useCart();

    return(
         <section className="section-bebidas">

        <h2>Bebidas</h2>

     <div className="grid-bebidas">
        
  <div className="card-bebida">
    <div className="card-content-bebida coca">
      <h3>Coca-Cola 350mL</h3>
      <p className="price">R${precoBebidas[0].precoLata}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Coca-Cola 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1, category_id: "beverage"
      })}>Adicionar ao carrinho</button>
    </div>
  </div>


  <div className="card-bebida">
    <div className="card-content-bebida guarana350">
      <h3>Guaraná Antarctica 350mL</h3>
      <p className="price">R${precoBebidas[0].precoLata}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Coca-Cola Zero 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1, category_id: "beverage"
      })}>Adicionar ao carrinho</button>
    </div>
  </div>

  {/* <div className="card-bebida">
    <div className="card-content-bebida pepsi">
      <h3>Pepsi 350ml</h3>
      <p className="price">R${precoBebidas[0].precoLata}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Pepsi 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1
      })}>Adicionar ao carrinho</button>
    </div>
  </div> */}
{/* 
        <div className="card-bebida">
          <div className="card-content-bebida pepsib">
            <h3> Pepsi Black 350ml</h3>
            <p className="price">R${precoBebidas[0].precoLata}</p>
            <button className="btn-bebida" onClick={() => addToCart({
              name: "Pepsi Black 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1
              })}>Adicionar ao carrinho</button>
          </div>
        </div> */}

  {/* <div className="card-bebida">
    <div className="card-content-bebida fanta">
      <h3>Fanta Laranja 350ml</h3>
      <p className="price">R${precoBebidas[0].precoLata}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Fanta Laranja 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1
      })}>Adicionar ao carrinho</button>
    </div>
  </div> */}

 

  {/* <div className="card-bebida">
    <div className="card-content-bebida soda">
      <h3>Soda Antarctica 350ml</h3>
      <p className="price">R${precoBebidas[0].precoLata}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Soda Antarctica 350ml", price: `R$${precoBebidas[0].precoLata}`, qty: 1
      })}>Adicionar ao carrinho</button>
    </div>
  </div> */}

  
  <div className="card-bebida">
    <div className="card-content-bebida cocagrande">
      <h3>Coca-Cola 1L</h3>
      <p className="price">R${precoBebidas[2].precoCoca1L}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Coca-Cola 1L", price: `R$${precoBebidas[1].precoCoca1L}`, qty: 1, category_id: "beverage"
      })}>Adicionar ao carrinho</button>
    </div>
  </div>

  <div className="card-bebida">
    <div className="card-content-bebida guarana">
      <h3>Guaraná 1L</h3>
      <p className="price">R${precoBebidas[1].precoGuarana1L}</p>
      <button className="btn-bebida" onClick={() => addToCart({
        name: "Guaraná 1L", price: `R$${precoBebidas[1].precoGuarana1L}`, qty: 1, category_id: "beverage"
      })}>Adicionar ao carrinho</button>
    </div>
  </div>
  

</div>

</section>

    )
}

export default Bebidas