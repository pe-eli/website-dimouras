import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./pages/landing/landing"
import Home from "./pages/home/home"
import Checkout from "./pages/checkout/checkout";
import GerenciarPedidos from "./pages/pedidos/pedidos";
import AcompanharPedido from "./pages/acompanhar/acompanhar";
// import PagAprovado from "./pages/confirmacao/aprovado"
import PagRecusado from "./pages/recusado/pagRecusado"
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/notfound/NotFound";

function App() {
  return (
    <Router>
       <ScrollToTop /> 
      <Routes>

        {/* <Route path="/" element={<ComingSoon/>} /> */}

        <Route path="/" element={<Home/>} />

        <Route path="/checkout" element={<Checkout/>} />

        {/* <Route path="/orders" element={<GerenciarPedidos/>} /> */}

        <Route path="/acompanhar/:id" element={<AcompanharPedido />} />

        {/* <Route path="/aprovado" element={<PagAprovado/>} /> */}

        <Route path="/recusado" element={<PagRecusado/>} />

        <Route path="*" element={<NotFound/>} />
        
      </Routes>
    </Router>
  );
}

export default App
