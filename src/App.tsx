import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pizza from "./pages/home/home"
import Checkout from "./pages/checkout/checkout";
import GerenciarPedidos from "./pages/pedidos/pedidos";
import AcompanharPedido from "./pages/acompanhar/acompanhar";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Pizza />} />

        <Route path="/checkout" element={<Checkout/>} />

        <Route path="/orders" element={<GerenciarPedidos/>} />

        <Route path="/acompanhar" element={<AcompanharPedido/>} />
        
      </Routes>
    </Router>
  );
}

export default App
