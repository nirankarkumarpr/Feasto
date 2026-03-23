import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (food) => {
        const exists = cartItems.find((item) => item._id == food._id);

        if(exists) {
            setCartItems(cartItems.map((item) => item._id == food._id ? { ...item, quantity: item.quantity+1 } : item));
        } else {
            setCartItems([...cartItems, { ...food, quantity: 1 }]);
        }
    };

    const removeFromCart = (foodId) => {
        setCartItems(cartItems.filter((item) => item._id != foodId));
    };

    const updateQuantity = (foodId, quantity) => {
        if (quantity === 0) {
            removeFromCart(foodId);
            return;
        }
        setCartItems(cartItems.map((item) => item._id === foodId ? {...item, quantity} : item));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, totalAmount, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);