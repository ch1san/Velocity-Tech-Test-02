import './Cart.css';
import { useCart } from '~/context/CartContext';
import { useShopifyClient } from '~/context/ShopifyClient';

export default function Cart() {
  const { showCart, setShowCart, cartItems, removeFromCart, updateQuantity, formatPrice, currencyCode } = useCart();
  const client = useShopifyClient();

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        return total + parseFloat(item.price) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    const cartCreateMutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          userErrors {
            code
          }
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  discountAllocations {
                    discountedAmount {
                      amount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const lines = cartItems.map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    try {
      const { data } = await client.request(cartCreateMutation, {
        variables: {
          input: { lines },
        },
      });

      if (data?.cartCreate?.cart?.checkoutUrl) {
        window.location.href = data.cartCreate.cart.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className={`cart ${showCart ? 'cart--open' : ''}`}>
      <button type="button" className="cart__underlay" onClick={() => setShowCart(false)} />

      <button type="button" className="cart__close-btn" onClick={() => setShowCart(false)}>
        <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.37437 0.606533C1.88621 0.118378 1.09476 0.118378 0.606602 0.606533C0.118447 1.09469 0.118446 1.88614 0.606601 2.3743L9.44544 11.2131L0.606602 20.052C0.118446 20.5401 0.118447 21.3316 0.606602 21.8197C1.09476 22.3079 1.88621 22.3079 2.37437 21.8197L11.2132 12.9809L20.052 21.8197C20.5402 22.3079 21.3316 22.3079 21.8198 21.8197C22.308 21.3316 22.308 20.5401 21.8198 20.052L12.981 11.2131L21.8198 2.3743C22.308 1.88614 22.308 1.09469 21.8198 0.606533C21.3316 0.118378 20.5402 0.118378 20.052 0.606533L11.2132 9.44537L2.37437 0.606533Z"
            fill="black"
          />
        </svg>
      </button>

      <div className="cart__inner">
        <div className="cart__header">
          <h2>Your basket</h2>
          {cartItems.length > 0 && (
            <button className="cart__clear-all" onClick={() => cartItems.forEach((item) => removeFromCart(item.id))}>
              Clear all
            </button>
          )}
        </div>

        <div className="cart__content">
          {cartItems.length === 0 ? (
            <div className="cart__empty">Your cart is empty</div>
          ) : (
            <div className="cart__items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart__item">
                  <div className="cart__item-header">
                    {item.image ? <img src={item.image} alt={item.title} width={40} height={40} className="cart__item-image" loading="lazy" /> : <div className="cart__item-image-placeholder" />}

                    <div className="cart__item-info">
                      <h3>{item.title}</h3>

                      {item.variantTitle !== 'Default Title' && <p>{item.variantTitle}</p>}
                    </div>

                    <button className="cart__item-remove" aria-label="Remove item" onClick={() => removeFromCart(item.id)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_497_400)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.125 3.5V12.25C13.125 13.2169 12.3419 14 11.375 14H2.625C1.65812 14 0.875 13.2169 0.875 12.25V3.5C0.392 3.5 0 3.108 0 2.625C0 2.142 0.392 1.75 0.875 1.75H5.25C5.25 0.783125 6.03312 0 7 0C7.96688 0 8.75 0.783125 8.75 1.75H13.125C13.608 1.75 14 2.142 14 2.625C14 3.108 13.608 3.5 13.125 3.5ZM11.375 3.5H2.625V12.25H11.375V3.5ZM4.375 4.375C4.858 4.375 5.25 4.767 5.25 5.25V10.5C5.25 10.983 4.858 11.375 4.375 11.375C3.892 11.375 3.5 10.983 3.5 10.5V5.25C3.5 4.767 3.892 4.375 4.375 4.375ZM7 4.375C7.483 4.375 7.875 4.767 7.875 5.25V10.5C7.875 10.983 7.483 11.375 7 11.375C6.517 11.375 6.125 10.983 6.125 10.5V5.25C6.125 4.767 6.517 4.375 7 4.375ZM9.625 4.375C10.108 4.375 10.5 4.767 10.5 5.25V10.5C10.5 10.983 10.108 11.375 9.625 11.375C9.142 11.375 8.75 10.983 8.75 10.5V5.25C8.75 4.767 9.142 4.375 9.625 4.375Z"
                            fill="black"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_497_400">
                            <rect width="14" height="14" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </div>

                  <div className="cart__item-footer">
                    <p>{formatPrice(item.price, currencyCode)}</p>

                    <div className="cart__item-quantity">
                      <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="28" height="28" rx="14" fill="#E9ECF0" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9 15.25H19.5C19.914 15.25 20.25 14.914 20.25 14.5C20.25 14.086 19.914 13.75 19.5 13.75H9C8.586 13.75 8.25 14.086 8.25 14.5C8.25 14.914 8.586 15.25 9 15.25Z"
                            fill="#8F9296"
                          />
                        </svg>
                      </button>
                      <span>{item.quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="28" height="28" rx="14" fill="#E9ECF0" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.5833 7.58333C14.5833 7.26117 14.3222 7 14 7C13.6778 7 13.4167 7.26117 13.4167 7.58333L13.4167 13.4167H7.58333C7.26117 13.4167 7 13.6778 7 14C7 14.3222 7.26117 14.5833 7.58333 14.5833H13.4167L13.4167 20.4167C13.4167 20.7388 13.6778 21 14 21C14.3222 21 14.5833 20.7388 14.5833 20.4167L14.5833 14.5833H20.4167C20.7388 14.5833 21 14.3222 21 14C21 13.6778 20.7388 13.4167 20.4167 13.4167H14.5833L14.5833 7.58333Z"
                            fill="black"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart__footer">
          <div>
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item{cartItems.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''}
          </div>

          <div className="cart__subtotal">{formatPrice(calculateTotal(), currencyCode)}</div>

          {cartItems.length > 0 && <div className="cart__loyalty">Earn 20 points with this order</div>}

          <button className="cart__checkout" disabled={cartItems.length === 0} onClick={handleCheckout}>
            Checkout now
          </button>
        </div>
      </div>
    </div>
  );
}
