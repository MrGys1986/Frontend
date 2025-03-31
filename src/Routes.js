// frontend/src/Routes.jsx
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UsuarioPage from "./pages/UsuarioPage";
import ModeradorPage from "./pages/ModeradorPage";
import AdminPage from "./pages/AdminPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EventoDetailPage from "./pages/EventoDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import SoportePage from "./pages/Soporte";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/usuario" element={<UsuarioPage />} />
      <Route path="/moderador" element={<ModeradorPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/evento/:id" element={<EventoDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/soporte" element={<SoportePage />} />

       {/* Rutas protegidas */}
       <Route
        path="/usuario"
        element={
          <PrivateRoute>
            <UsuarioPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/moderador"
        element={
          <PrivateRoute>
            <ModeradorPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/evento/:id"
        element={
          <PrivateRoute>
            <EventoDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
       <Route
        path="/soporte"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
 
);

export default AppRoutes;
