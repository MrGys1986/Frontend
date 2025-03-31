import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import { Form, Input, Button, Alert, Card } from "antd";

const passwordRequirements = [
  { label: "🔑 Mínimo 8 caracteres", test: (pw) => pw.length >= 8 },
  { label: "🔠 Una letra mayúscula", test: (pw) => /[A-Z]/.test(pw) },
  { label: "🔢 Un número", test: (pw) => /\d/.test(pw) },
  { label: "💥 Un carácter especial", test: (pw) => /[!@#$%^&*(),.?\":{}|<>]/.test(pw) },
];

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value.replace(/\s/g, "") }); // Elimina espacios
  };

  const handleSubmit = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);

    if (!form.newPassword || !form.confirmPassword) {
      setError("❗ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    const failed = passwordRequirements.filter((req) => !req.test(form.newPassword));
    if (failed.length > 0) {
      setError("⚠️ La contraseña no cumple con los requisitos.");
      setLoading(false);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("❌ Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/reset-password", {
        email,
        newPassword: form.newPassword,
      });

      setMessage("✅ " + response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at center, #007BFF, #66B2FF, #D0E7FF)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Card
        title={
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img src="/logo.png" alt="Logo" style={{ maxWidth: 120 }} />
            </div>
            <h2 style={{ textAlign: "center", margin: 0 }}>🔐 Restablecer Contraseña</h2>
          </>
        }
        bordered={false}
        style={{
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        {message && (
          <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />
        )}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="🆕 Nueva Contraseña" required>
            <Input.Password
              name="newPassword"
              value={form.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              disabled={loading}
            />
          </Form.Item>

          <ul style={{ fontSize: 13, marginTop: -8, paddingLeft: 20, marginBottom: 10 }}>
            {passwordRequirements.map((req, index) => (
              <li key={index} style={{ color: req.test(form.newPassword) ? "green" : "#888" }}>
                {req.test(form.newPassword) ? "✔️" : "❌"} {req.label}
              </li>
            ))}
          </ul>

          <Form.Item label="✅ Confirmar Contraseña" required>
            <Input.Password
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Restablecer Contraseña 🔁
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href="/login">🔙 Volver al inicio</a>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
