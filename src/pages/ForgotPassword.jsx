import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import { Form, Input, Button, Alert, Card } from "antd";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  // Código ingresado manualmente por el usuario
  const [codeInput, setCodeInput] = useState("");
  // Temporizador en segundos (15 minutos = 900s)
  const [timer, setTimer] = useState(900);

  const navigate = useNavigate();

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  // Temporizador: cuando llegue a 0, recarga la página para que el usuario pueda solicitar un nuevo código
  useEffect(() => {
    let interval;
    if (codeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [codeSent, timer]);

  // Manejar el envío del código al correo
  const handleSendCode = async () => {
    setMessage(null);
    setError(null);
  
    if (!validateCaptcha(captcha)) {
      setError("Captcha incorrecto. Intenta de nuevo.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      setMessage(response.data.message);
      setCodeSent(true);
      // Reiniciar el temporizador a 15 minutos
      setTimer(900);
    } catch (err) {
      setError(err.response?.data?.message || "Error al solicitar el código.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar la validación del código ingresado
  const handleValidateCode = async () => {
    setMessage(null);
    setError(null);
    try {
      const response = await api.post("/api/auth/validate-code", { email, code: codeInput });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.goToLogin) {
        setError("Código incorrecto. Has agotado tus intentos. Serás redirigido al inicio.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data?.message || "Error al validar el código.");
      }
    }
  };
  

  // Función para formatear el temporizador en mm:ss
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
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
            <h2 style={{ textAlign: "center", margin: 0 }}>Recuperar Contraseña</h2>
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
        {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />}
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        {!codeSent && (
          <Form layout="vertical" onFinish={handleSendCode}>
            <Form.Item
              label="Correo Electrónico"
              name="email"
              rules={[
                { required: true, message: "Por favor ingresa tu correo" },
                { type: "email", message: "Correo no válido" },
              ]}
            >
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item label="Captcha" required>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 14,
                  background: "#f0f8ff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <LoadCanvasTemplate />
              </div>
              <Input
                placeholder="Ingresa el captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                disabled={loading}
                style={{ textAlign: "center" }}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block disabled={loading} loading={loading}>
                {loading ? "Enviando..." : "Enviar Código"}
              </Button>
            </Form.Item>
          </Form>
        )}

        {codeSent && (
          <>
            <Alert
              message="Ingresa el código que recibiste en tu correo"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form layout="vertical" onFinish={handleValidateCode}>
              <Form.Item label="Código de 6 dígitos" required>
                <Input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Ej: 532603"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Validar Código
                </Button>
              </Form.Item>
            </Form>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#888" }}>Código expira en: {formatTimer(timer)}</span>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/login">Volver al inicio</a>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
