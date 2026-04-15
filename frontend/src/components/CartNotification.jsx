import { Link } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { useCart } from "../context/CartContext";
import { FaAngleDoubleRight } from "react-icons/fa";
import { useState, useEffect } from "react";

function CartNotification() {
  const { cartItems } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [lastItemCount, setLastItemCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const wasClosed = localStorage.getItem('cartNotificationClosed') === 'true';
      setIsVisible(!wasClosed && cartItems.length > 0);
      setLastItemCount(cartItems.length);
      setInitialized(true);
      return;
    }

    if (cartItems.length > lastItemCount && cartItems.length > 0) {
      localStorage.removeItem('cartNotificationClosed');
      setIsVisible(true);
    }

    if (cartItems.length === 0) {
      setIsVisible(false);
      localStorage.removeItem('cartNotificationClosed');
    }
    setLastItemCount(cartItems.length);
  }, [cartItems.length, lastItemCount, initialized]);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('cartNotificationClosed', 'true');
  };

  if (!isVisible || cartItems.length === 0) return null;

  const lastItem = cartItems[cartItems.length - 1];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
      <Link to="/cart" onClick={() => setIsVisible(false)}>
        <div className="bg-orange-500 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.4)] flex items-center gap-3 px-3 py-2">
          
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex-shrink-0 border-2 border-white/80">
            {lastItem.image ? (
              <img 
                src={lastItem.image} 
                alt={lastItem.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {lastItem.name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="text-xs font-semibold text-white whitespace-nowrap">
              {cartItems.length} item{cartItems.length > 1 ? 's' : ''} added
            </p>

            <div className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/15 border border-white/80 text-white text-xs font-semibold py-0.5 px-2.5 rounded-full transition whitespace-nowrap w-fit">
              View Cart <FaAngleDoubleRight className="text-xs" />
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-white hover:text-orange/60 bg-white/30 rounded-full p-1 transition cursor-pointer"
          >
            <MdClose className="text-sm" />
          </button>
        </div>
      </Link>
    </div>
  );
}

export default CartNotification;
