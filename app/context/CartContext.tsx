import { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';

// Add interface for cart items
interface CartItem {
  id: string;
  title: string;
  price: string;
  quantity: number;
  image?: string;
  variantTitle: string;
}

interface CartContextType {
  showCart: boolean;
  setShowCart: Dispatch<SetStateAction<boolean>>;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  formatPrice: (amount: string, currencyCode: string) => string;
  currencyCode: string;
  setCurrencyCode: Dispatch<SetStateAction<string>>;
}

export const CartContext = createContext<CartContextType>({
  showCart: false,
  setShowCart: () => {},
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  formatPrice: () => '',
  currencyCode: 'USD',
  setCurrencyCode: () => {},
});

interface CartProviderProps {
  children: ReactNode;
}

// Add localStorage keys
const CART_STORAGE_KEY = 'shopify_cart_items';

export function CartProvider({ children }: CartProviderProps) {
  const [showCart, setShowCart] = useState<boolean>(false);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];

    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      let newItems;
      if (existingItem) {
        newItems = prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      } else {
        newItems = [...prevItems, { ...item, quantity }];
      }

      return newItems;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== itemId);

      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      // Remove item if quantity is 0
      if (quantity === 0) {
        const newItems = prevItems.filter((item) => item.id !== itemId);

        return newItems;
      }

      // Update quantity for existing item
      const newItems = prevItems.map((item) => (item.id === itemId ? { ...item, quantity: quantity } : item));

      return newItems;
    });
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  return (
    <CartContext.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        formatPrice,
        currencyCode,
        setCurrencyCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
