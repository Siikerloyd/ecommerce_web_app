
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import Home from "./pages/Home";
import { HomePage } from "./pages/home2";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
    return (
        
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                    path="/register"
                    element={<RegisterForm BRAND="ZENTO" />}
                />

                <Route path="/login" element={<LoginForm />} />

                
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
        
    );
}

export default App;
