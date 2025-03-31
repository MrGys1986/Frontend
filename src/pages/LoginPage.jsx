import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import { Form, Input, Button, Alert, Card } from "antd";
import { LoadCanvasTemplate, validateCaptcha, loadCaptchaEnginge } from "react-simple-captcha";
import "../css/LoginPage.css";

const LoginPage = () => {
  // Estados generales
  const [loginStep, setLoginStep] = useState(1);
  const [form] = Form.useForm();
  const [captcha, setCaptcha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Estado para el bloqueo: tiempo restante en segundos
  const [blockCountdown, setBlockCountdown] = useState(null);

  // Estados para MFA (paso 2)
  const [token, setToken] = useState("");
  const [qr, setQr] = useState(null);
  const [fetchingQr, setFetchingQr] = useState(false);
  
  // Estados para preguntas de seguridad
  const [showSecurity, setShowSecurity] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [userSecurityAnswers, setUserSecurityAnswers] = useState({});
  const [securityAttempts, setSecurityAttempts] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadCaptchaEnginge(5);
    // Limpia toda la sesión al montar la vista de login
    localStorage.clear();

    // Forzar que si se usa el botón atrás, se vuelva a limpiar la sesión
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      localStorage.clear();
      // Forzar redirección a login sin dejar rastro en el historial
      navigate("/login", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);
  

  // Efecto para actualizar el contador de bloqueo cada segundo
  useEffect(() => {
    let interval;
    if (blockCountdown !== null && blockCountdown > 0) {
      interval = setInterval(() => {
        setBlockCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blockCountdown]);
 

  // ----- Paso 1: Inicio de sesión (credenciales, captcha) -----
  const handleLoginSubmit = async (values) => {
    setError(null);
    setLoading(true);
    if (!captcha) {
      setError("Por favor ingresa el captcha.");
      setLoading(false);
      return;
    }
    if (!validateCaptcha(captcha.trim())) {
      setError("Captcha incorrecto. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.post("/api/login/login", values);
      if (response.data.mfaRequired) {
        setUserEmail(values.email.trim());
        setLoginStep(2);
        return;
      }
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      switch (response.data.user.role) {
        case "usuario":
          navigate("/usuario");
          break;
        case "moderador":
          navigate("/moderador");
          break;
        case "administrador":
          navigate("/admin");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      const data = err.response?.data;
      // Si se recibió el tiempo restante del bloqueo, lo guardamos para el contador
      if (data?.remaining) {
        setBlockCountdown(data.remaining);
      }
      setError(data?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Paso 2: Flujo MFA -----
  const handleMfaSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post("/api/login/verify-mfa", { email: userEmail, token });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      switch (response.data.user.role) {
        case "usuario":
          navigate("/usuario");
          break;
        case "moderador":
          navigate("/moderador");
          break;
        case "administrador":
          navigate("/admin");
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.goToLogin) {
        setError("Has agotado tus intentos. Serás redirigido al inicio.");
        // Forzar recarga completa de la página
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setError(data?.message || "Error al verificar MFA.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowSecurity = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post("/api/login/get-security-questions", { email: userEmail });
      setSecurityQuestions(response.data.questions);
      setShowSecurity(true);
    } catch (err) {
      setError("Error al obtener las preguntas de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async () => {
    setError(null);
    const answers = securityQuestions.map((q, index) => ({
      question: q.question,
      answer: userSecurityAnswers[index] || ""
    }));
  
    try {
      const response = await api.post("/api/login/verify-security-questions", { email: userEmail, answers });
      setQr(response.data.qr);
      setShowSecurity(false);
      setError(null);
    } catch (err) {
      const data = err.response?.data;
      const attempts = securityAttempts + 1;
      setSecurityAttempts(attempts);
  
      if (data?.goToLogin || attempts >= 2) {
        setError("Respuestas incorrectas. Has agotado tus intentos. Serás redirigido al inicio en 3s.");
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setError("Respuestas incorrectas. Solo tienes 1 intento más.");
      }
    }
  };
  
  // Render del Paso 1: Login con credenciales
  const renderStep1 = () => (
    <Card
      bordered={false}
      className="login-card"
      title={<h2 style={{ margin: 0, color: "#007bff", textAlign: "center" }}>Iniciar Sesión 🔐</h2>}
    >
      {blockCountdown !== null ? (
        <Alert 
          type="warning" 
          message={`Cuenta bloqueada. Inténtalo de nuevo en ${blockCountdown} segundos.`} 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      ) : error && (
        <Alert 
          type="error" 
          message={error} 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      <Form form={form} layout="vertical" onFinish={handleLoginSubmit}>
        <Form.Item
          label="Correo Electrónico ✉️"
          name="email"
          rules={[
            { required: true, message: "Por favor ingresa tu correo" },
            { type: "email", message: "Correo no válido" },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>
        <Form.Item
          label="Contraseña 🔒"
          name="password"
          rules={[{ required: true, message: "Por favor ingresa tu contraseña" }]}
        >
          <Input.Password disabled={loading} />
        </Form.Item>
        <Form.Item label="Captcha 🧩" required>
          <div className="captcha-container">
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
          <Button type="primary" htmlType="submit" block loading={loading}>
            Continuar 🚀
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
      </div>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <a href="/register">¿No tienes cuenta? Regístrate</a>
      </div>
    </Card>
  );

  // Render del Paso 2: MFA y preguntas de seguridad
  const renderStep2 = () => (
    <Card
      bordered={false}
      className="login-card"
      title={<h2 style={{ margin: 0, color: "#007bff", textAlign: "center" }}>Verificación MFA</h2>}
    >
      <Alert
        message="Solo tienes una oportunidad para ingresar el código."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}
      <p style={{ textAlign: "center", marginBottom: 12 }}>
        Abre <strong>Microsoft Authenticator</strong> y accede a la aplicación <strong>EventApp WEB MFA</strong> para obtener tu código.
        <br /><br />
        Si no tienes la app registrada, haz clic en "Reenlazar QR" para responder tus preguntas de seguridad y generar un nuevo código.
      </p>
      {!showSecurity && (
        <Form layout="vertical" onFinish={handleMfaSubmit}>
          <Form.Item label="Código MFA" required>
            <Input
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Verificar e Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      )}
      {showSecurity && (
        <div style={{ marginTop: 16 }}>
          <p style={{ textAlign: "center" }}>
            Responde las siguientes preguntas de seguridad:
          </p>
          {securityQuestions.map((item, index) => (
            <Form.Item key={index} label={item.question} required>
              <Input
                placeholder="Tu respuesta"
                value={userSecurityAnswers[index] || ""}
                onChange={(e) =>
                  setUserSecurityAnswers((prev) => ({
                    ...prev,
                    [index]: e.target.value,
                  }))
                }
              />
            </Form.Item>
          ))}
          <Button type="primary" block onClick={handleSecuritySubmit} loading={loading}>
            Enviar Respuestas
          </Button>
        </div>
      )}
      {!showSecurity && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="dashed" onClick={handleShowSecurity} disabled={loading}>
            Reenlazar QR mediante preguntas de seguridad
          </Button>
        </div>
      )}
      {qr && !showSecurity && (
        <div style={{ textAlign: "center", marginBottom: 16, marginTop: 16 }}>
          <img src={qr} alt="Código QR MFA" style={{ maxWidth: "100%" }} />
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <a href="/login">Volver al inicio</a>
      </div>
    </Card>
  );

  return (
    <div className="login-container">
      {loginStep === 1 && (
        <div className="form-section">
          {renderStep1()}
        </div>
      )}
      {loginStep === 2 && (
        <div className="form-section">
          {renderStep2()}
        </div>
      )}
      <div className="image-section-login">
        <div className="image-overlay">
          <h1 className="image-title">🎉 ¡Bienvenido de vuelta!</h1>
          <p className="image-description">
            💼 Accede a tu cuenta para disfrutar de todos los beneficios. Eventos, networking, experiencias y mucho más te esperan. 🎫🔥
          </p>
          <p className="image-description" style={{ marginTop: 12 }}>
            🧑‍🚀 ¿Aún no tienes cuenta? ¡Únete ahora y no te pierdas nada!
          </p>
          <Button type="primary" className="login-button" onClick={() => navigate("/register")}>
            Regístrate 🔑
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
