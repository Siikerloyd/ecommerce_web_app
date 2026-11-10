
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { HomePage } from "./pages/home2";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext.jsx";
import MiniCartDrawer from "./components/cart/MiniCartDrawer";

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
                        <Route path="/home" element={<HomePage />} />
                    </Route>
                </Routes>
                <MiniCartDrawer />
            </CartProvider>
        </BrowserRouter>
        
    );
}

export default App;
