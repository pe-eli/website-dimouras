/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCart } from "../../CartContext"; 
import "./combos.css"
import CardCombo from "./comboCard/comboPizzaCard";
import HamburguerCard from "./comboCard/comboBurgerCard";
import { refriLata, refri2L, precoBebidas } from "../bebidas/bebes";
function Combos(){

  const precoPizzaCombo = {
  calabresa: {
    casal: 50,
    familia: 50,
    galera: 57
  },
  frango: {
    casal: 65,
    familia: 60,
    galera: 67
  },
  quatroqueijos: {
    casal: 60,
    familia: 55,
    galera: 60 
  },
  pepperoni: {
    casal: 60,
    familia: 55,
    galera: 60
  }
};

    return(

<section className="section-combo">
        <h2>Combos</h2>
        <section className="section-combo">
        <div className="grid-combo"> 
          <div className="grid-combo">
            <CardCombo
            nomeCombo="Casal"
            titulo="Casal"
            descricao="1 Pizza + 2 Refris Lata"
            imagem="/cala.png"
            precoC={precoPizzaCombo.calabresa.casal+4.90}
            precoF={precoPizzaCombo.frango.casal+2.90}
            precoQ={precoPizzaCombo.quatroqueijos.casal+3.90}
            precoP={precoPizzaCombo.pepperoni.casal+1.90}
            qtdPizzas={1}
            qtdBebidas={2}
            bebes={refriLata}
          />

            <CardCombo
            nomeCombo="Família"
            titulo="Família"
            descricao="2 Pizzas + 1 Refri 2L"
            imagem="/fc.png"
            precoC={precoPizzaCombo.calabresa.familia+8.9/2}
            precoF={precoPizzaCombo.frango.familia+7.9/2}
            precoQ={precoPizzaCombo.quatroqueijos.familia+7.9/2}
            precoP={precoPizzaCombo.pepperoni.familia+5.9/2}
            qtdPizzas={2}
            qtdBebidas={1}
            bebes={refri2L}
          />

          <CardCombo
            nomeCombo="Galera"
            titulo="Galera"
            descricao="3 Pizzas + 2 Refris 2L"
            imagem="/pepperoni.png"
            precoC={precoPizzaCombo.calabresa.galera+4.9/3}
            precoF={precoPizzaCombo.frango.galera+1.9/3}
            precoQ={precoPizzaCombo.quatroqueijos.galera+5.9/3}
            precoP={precoPizzaCombo.pepperoni.galera+3.9/3}
            qtdPizzas={3}
            qtdBebidas={2}
            bebes={refri2L}
          />

         <HamburguerCard
                nomeCombo="Bacon"
                titulo="Bacon"
                descricao="2x Moura's Bacon + 2x Refris Lata"
            imagem="/mbacon.png"
                precoContra={71.9/2}
                precoFralda={64.9/2}
                precoPicanha={66.9/2}
                qtdBebidas={2}
                bebes={refriLata} 
                sanduba="Moura's Bacon"
                economia={10}                       
                />

          <HamburguerCard
                nomeCombo="Duplo"
                titulo="Duplo"
                descricao="2x Moura's Duplo + 2x Refris Lata"
                imagem="/mduplo.png"
                precoContra={98.9/2}
                precoFralda={81.9/2}
                precoPicanha={88.9/2}
                qtdBebidas={2}
                bebes={refriLata} 
                sanduba="Moura's Duplo Bacon"
                       
                />

          <HamburguerCard
                nomeCombo="Duplo Bacon"
                titulo="Duplo Bacon"
                descricao="2x Moura's Duplo Bacon + 1x Refri 2L"
                imagem="/mduplobacon.png"
                precoContra={103.9/2}
                precoFralda={88.9/2}
                precoPicanha={94.9/2}
                qtdBebidas={2}
                bebes={refri2L} 
                sanduba="Moura's Duplo Bacon"
                   
                />
                          
                </div>
            </div> 
          </section>
      </section>
)
      }
export default Combos