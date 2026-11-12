
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./features/auth/pages/LoginForm";
import { RegisterForm } from "./features/auth/pages/RegisterForm";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { HomePage } from "./features/home/pages/HomePage";
import Shop from "./features/catalog/pages/Shop";
import ProductDetail from "./features/products/pages/ProductDetail";
import Cart from "./features/cart/pages/Cart";
import Checkout from "./features/checkout/pages/Checkout";
import Account from "./features/account/pages/Account";
import { CartProvider } from "./features/cart/context/CartContext.jsx";
import MiniCartDrawer from "./features/cart/components/MiniCartDrawer";

function App() {
    return (
        
        <BrowserRouter>
            <CartProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route
                        path="/register"
                        element={<RegisterForm BRAND="ZENTO" />}
                    />

                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/account" element={<Account />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/home" element={<HomePage />} />
                    </Route>
                </Routes>
                <MiniCartDrawer />
            </CartProvider>
        </BrowserRouter>
        
    );
}

export default App;
