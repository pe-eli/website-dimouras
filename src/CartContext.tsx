import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type CartItem = {
  name: string;
  price: string;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQty: (name: string, change: number) => void;
  removeFromCart: (name: string) => void;
  getTotal: () => string;
  clearCart: () => void; // 👈 novo
};


const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Inicializa o estado do carrinho a partir do localStorage, se existir
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sempre que o cart mudar, atualiza o localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    const existing = cart.find((i) => i.name === item.name);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart");
    };


  const updateQty = (name: string, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.name === name ? { ...item, qty: item.qty + change } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (name: string) => {
    setCart(cart.filter((item) => item.name !== name));
  };

  const getTotal = () => {
    return cart
      .reduce(
        (acc, item) =>
          acc +
          parseFloat(item.price.replace("R$", "").replace(",", ".")) *
          item.qty,
        0
      )
      .toFixed(2)
      .replace(".", ",");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, getTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
