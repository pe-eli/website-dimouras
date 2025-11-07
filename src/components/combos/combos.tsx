/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCart } from "../../CartContext"; 
import "./combos.css"
import CardCombo from "./comboCard/comboPizzaCard";
import HamburguerCard from "./comboCard/comboBurgerCard";
import { refriLata, refri2L, precoBebidas } from "../bebidas/bebes";
function Combos(){

  const precoPizzaCombo = {
  calabresa: {
    casal: 55.9,
    familia: 55.9,
    galera: 55.9
  },
  frango: {
    casal: 55.9,
    familia: 55.9,
    galera: 55.9
  },
  quatroqueijos: {
    casal: 62.9,
    familia: 62.9,
    galera: 62.9 
  },
  pepperoni: {
    casal: 62.9,
    familia: 62.9,
    galera: 62.9
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
            precoC={precoPizzaCombo.calabresa.casal+12}
            precoF={precoPizzaCombo.frango.casal+12}
            precoQ={precoPizzaCombo.quatroqueijos.casal+12}
            precoP={precoPizzaCombo.pepperoni.casal+12}
            qtdPizzas={1}
            qtdBebidas={2}
            bebes={refriLata}
          />

            <CardCombo
            nomeCombo="Família"
            titulo="Família"
            descricao="2 Pizzas + 1 Refri 2L"
            precoC={precoPizzaCombo.calabresa.familia+6.95}
            precoF={precoPizzaCombo.frango.familia+6.95}
            precoQ={precoPizzaCombo.quatroqueijos.familia+6.95}
            precoP={precoPizzaCombo.pepperoni.familia+6.95}
            qtdPizzas={2}
            qtdBebidas={1}
            bebes={refri2L}
          />

          <CardCombo
            nomeCombo="Galera"
            titulo="Galera"
            descricao="3 Pizzas + 2 Refris 2L"
            precoC={precoPizzaCombo.calabresa.galera+9.25}
            precoF={precoPizzaCombo.frango.galera+9.25}
            precoQ={precoPizzaCombo.quatroqueijos.galera+9.25}
            precoP={precoPizzaCombo.pepperoni.galera+9.25}
            qtdPizzas={3}
            qtdBebidas={2}
            bebes={refri2L}
          />

         <HamburguerCard
                nomeCombo="Bacon"
                titulo="Bacon"
                descricao="2x Moura's Bacon + 2x Refris Lata"
                precoContra={35.95+6}
                precoFralda={31.95+6}
                precoPicanha={38.95+6}
                qtdBebidas={2}
                bebes={refriLata} 
                sanduba="Moura's Bacon"
                       
                />

          <HamburguerCard
                nomeCombo="Duplo"
                titulo="Duplo"
                descricao="2x Moura's Duplo + 2x Refris Lata"
                precoContra={41.95+6}
                precoFralda={34.95+6}
                precoPicanha={43.95+6}
                qtdBebidas={2}
                bebes={refriLata} 
                sanduba="Moura's Duplo Bacon"
                       
                />

          <HamburguerCard
                nomeCombo="Duplo Bacon"
                titulo="Duplo Bacon"
                descricao="2x Moura's Duplo Bacon + 1x Refri 2L"
                precoContra={49.95+6.75}
                precoFralda={41.95+6.75}
                precoPicanha={51.95+6.75}
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