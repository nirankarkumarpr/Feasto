import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem("cart");
        
        return storedCart ? JSON.parse(storedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (food) => {
        const exists = cartItems.find((item) => item._id === food._id);

        if(exists) {
            setCartItems(cartItems.map((item) => item._id === food._id ? { ...item, quantity: item.quantity+1 } : item));
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

    const getItemQuantity = (foodId) => {
        const item = cartItems.find((item) => item._id === foodId);
        return item ? item.quantity : 0;
    };

    const increaseQuantity = (foodId) => {
        const item = cartItems.find((item) => item._id === foodId);
        if (item) {
            updateQuantity(foodId, item.quantity + 1); 
        }
    };

    const decreaseQuantity = (foodId) => {
        const item = cartItems.find((item) => item._id === foodId);
        if (item) {
            updateQuantity(foodId, item.quantity - 1); 
        }
    };

    const totalAmount = cartItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, getItemQuantity, increaseQuantity, decreaseQuantity, totalAmount, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);