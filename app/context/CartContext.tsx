import { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useShopifyClient } from './ShopifyClient';

// Add interface for cart items
interface CartItem {
  id: string; // variant ID
  lineId: string; // cart line ID
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
  addToCart: (item: Omit<CartItem, 'quantity' | 'lineId'>, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  formatPrice: (amount: string, currencyCode: string) => string;
  currencyCode: string;
  setCurrencyCode: Dispatch<SetStateAction<string>>;
  cartId: string | null;
}

export const CartContext = createContext<CartContextType>({
  showCart: false,
  setShowCart: () => {},
  cartItems: [],
  addToCart: async () => Promise.resolve(),
  removeFromCart: async () => Promise.resolve(),
  updateQuantity: async () => Promise.resolve(),
  formatPrice: () => '',
  currencyCode: 'USD',
  setCurrencyCode: () => {},
  cartId: null,
});

interface CartProviderProps {
  children: ReactNode;
}

const CART_ID_KEY = 'shopify_cart_id';

// Add proper type for the GraphQL response
interface CartLineNode {
  node: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: {
        title: string;
      };
      price: {
        amount: string;
        currencyCode: string;
      };
      image?: {
        url: string;
      };
    };
  };
}

export function CartProvider({ children }: CartProviderProps) {
  const [showCart, setShowCart] = useState<boolean>(false);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(() => {
    // Initialize cartId from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CART_ID_KEY);
    }
    return null;
  });
  const client = useShopifyClient();

  // Update localStorage when cartId changes
  useEffect(() => {
    if (cartId) {
      localStorage.setItem(CART_ID_KEY, cartId);
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  }, [cartId]);

  // Fetch existing cart data on mount
  useEffect(() => {
    const fetchCart = async () => {
      if (!cartId) return;

      const query = `
        query getCart($cartId: ID!) {
          cart(id: $cartId) {
            id
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const { data } = await client.request(query, {
          variables: { cartId },
        });

        if (data?.cart) {
          const items = data.cart.lines.edges.map(({ node }: any) => ({
            id: node.merchandise.id,
            lineId: node.id,
            title: node.merchandise.product.title,
            price: node.merchandise.price.amount,
            quantity: node.quantity,
            image: node.merchandise.image?.url,
            variantTitle: node.merchandise.title,
          }));
          setCartItems(items);
        } else {
          // If cart not found, clear the stored ID and create a new cart
          localStorage.removeItem(CART_ID_KEY);
          setCartId(null);
          const cart = await createCart();
          if (cart) {
            setCartId(cart.id);
          }
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // If there's an error, clear the stored ID and create a new cart
        localStorage.removeItem(CART_ID_KEY);
        setCartId(null);
        const cart = await createCart();
        if (cart) {
          setCartId(cart.id);
        }
      }
    };

    fetchCart();
  }, []);

  // Create cart mutation
  const createCart = async () => {
    const mutation = `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    try {
      const { data } = await client.request(mutation);
      if (data?.cartCreate?.cart) {
        return data.cartCreate.cart;
      }
      throw new Error('Failed to create cart');
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity' | 'lineId'>, quantity: number) => {
    if (!cartId) {
      const cart = await createCart();
      if (!cart) return;
      setCartId(cart.id);
    }

    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    try {
      const { data } = await client.request(mutation, {
        variables: {
          cartId,
          lines: [
            {
              merchandiseId: item.id,
              quantity,
            },
          ],
        },
      });

      if (data?.cartLinesAdd?.cart) {
        const newItems = data.cartLinesAdd.cart.lines.edges.map(({ node }: any) => ({
          id: node.merchandise.id,
          lineId: node.id,
          title: node.merchandise.product.title,
          price: node.merchandise.price.amount,
          quantity: node.quantity,
          image: node.merchandise.image?.url,
          variantTitle: node.merchandise.title,
        }));
        setCartItems(newItems);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (variantId: string) => {
    if (!cartId) return;

    const cartLine = cartItems.find((item) => item.id === variantId);
    if (!cartLine) return;

    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    try {
      const { data } = await client.request(mutation, {
        variables: {
          cartId,
          lineIds: [cartLine.lineId],
        },
      });

      if (data?.cartLinesRemove?.cart) {
        const newItems = data.cartLinesRemove.cart.lines.edges.map(({ node }: any) => ({
          id: node.merchandise.id,
          lineId: node.id,
          title: node.merchandise.product.title,
          price: node.merchandise.price.amount,
          quantity: node.quantity,
          image: node.merchandise.image?.url,
          variantTitle: node.merchandise.title,
        }));
        setCartItems(newItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (!cartId) {
      const cart = await createCart();
      if (!cart) return;
      setCartId(cart.id);
    }

    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            message
            field
          }
        }
      }
    `;

    try {
      // Find the cart line using variant ID
      const cartLine = cartItems.find((item) => item.id === variantId);

      if (!cartLine) {
        // If the item isn't in the cart, add it instead
        const item = {
          id: variantId,
          title: '',
          price: '',
          variantTitle: '',
        };
        return await addToCart(item, quantity);
      }

      const { data } = await client.request(mutation, {
        variables: {
          cartId,
          lines: [
            {
              id: cartLine.lineId, // Use the lineId for updates
              quantity,
            },
          ],
        },
      });

      if (data?.cartLinesUpdate?.cart) {
        const newItems = data.cartLinesUpdate.cart.lines.edges.map(({ node }: any) => ({
          id: node.merchandise.id,
          lineId: node.id,
          title: node.merchandise.product.title,
          price: node.merchandise.price.amount,
          quantity: node.quantity,
          image: node.merchandise.image?.url,
          variantTitle: node.merchandise.title,
        }));
        setCartItems(newItems);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
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
        cartId,
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
