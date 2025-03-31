import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import { Form, Input, Button, Alert, Card, Modal } from "antd";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha";
import "../css/RegisterPage.css";

// Definición de 5 preguntas de seguridad
const securityQuestionsList = [
  "¿Cuál es el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es el nombre de tu profesor favorito?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el modelo de tu primer auto?"
];

const passwordRequirements = [
  { label: "Mínimo 8 caracteres", test: (pw) => pw.length >= 8 },
  { label: "Una letra mayúscula", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Un número", test: (pw) => /\d/.test(pw) },
  { label: "Un carácter especial", test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formInstance] = Form.useForm();
  const password = Form.useWatch("password", formInstance);
  const [captcha, setCaptcha] = useState("");
  const [captchaTouched, setCaptchaTouched] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Datos recogidos en el paso 1
  const [registrationData, setRegistrationData] = useState(null);
  // Para las preguntas de seguridad (paso 2)
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [securityAnswers, setSecurityAnswers] = useState({});
  // Para el QR y el código MFA (paso 3)
  const [qrData, setQrData] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  
  // Estados para la modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [redirectOnModalClose, setRedirectOnModalClose] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  // ----- PASO 1: Datos Básicos -----
  const handleStep1Submit = async (values) => {
    setError(null);
    setLoading(true);
  
    // Validar contraseña
    const failed = passwordRequirements.filter((req) => !req.test(values.password));
    if (failed.length > 0) {
      setError("La contraseña no cumple con los requisitos.");
      setLoading(false);
      return;
    }
  
    // Validar captcha
    if (!captcha) {
      setCaptchaTouched(true);
      setError("Por favor ingresa el captcha.");
      setLoading(false);
      return;
    }
    if (!validateCaptcha(captcha.trim())) {
      setError("Captcha incorrecto. Intenta de nuevo.");
      setLoading(false);
      return;
    }
  
    // Validar correo con el backend
    try {
      await api.post("/api/auth/validate-email", {
        email: values.email.trim(),
      });
  
      // Si el correo está disponible, guarda datos y pasa al paso 2
      setRegistrationData({ ...values, captcha: captcha.trim() });
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error al validar el correo.");
    } finally {
      setLoading(false);
    }
  };  

  // ----- PASO 2: Preguntas de Seguridad -----
  const handleStep2Submit = () => {
    if (selectedQuestions.length !== 2) {
      setError("Debes seleccionar exactamente 2 preguntas de seguridad.");
      return;
    }
    for (const q of selectedQuestions) {
      if (!securityAnswers[q] || securityAnswers[q].trim() === "") {
        setError("Por favor responde todas las preguntas seleccionadas.");
        return;
      }
    }
    setError(null);
    setCurrentStep(3);
  };

  // ----- PASO 3: Obtener QR sin necesidad de estar registrado aún -----
  useEffect(() => {
    if (currentStep === 3 && registrationData) {
      setLoading(true);
      api.post("/api/auth/pre-mfa-qr", {
        email: registrationData.email,
        existingSecret: registrationData.mfaSecret || undefined
      })
        .then((response) => {
          setQrData(response.data.qr);
          if (!registrationData.mfaSecret) {
            setRegistrationData(prev => ({
              ...prev,
              mfaSecret: response.data.secret
            }));
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Error al generar QR MFA.");
          setLoading(false);
        });
    }
  }, [currentStep, registrationData]);  

  // Función para manejar la modal al cerrarla
  const handleModalOk = () => {
    setModalVisible(false);
    if (redirectOnModalClose) {
      navigate("/login");
    }
  };

  // ----- PASO 3: Enviar código MFA y registrar usuario -----
  const handleStep3Submit = async () => {
    if (!mfaCode) {
      setError("Por favor ingresa el código del autenticador.");
      return;
    }
    setLoading(true);
  
    const payload = {
      ...registrationData,
      securityQuestions: selectedQuestions.map((q) => ({
        question: securityQuestionsList[q],
        answer: securityAnswers[q].trim()
      })),
      mfaCode: mfaCode.trim(),
      role: "usuario"
    };
  
    try {
      const response = await api.post("/api/auth/register", payload);
    
      // Mostrar modal de éxito
      setModalTitle("✅ Registro Exitoso");
      setModalMessage("🎉 Tu cuenta fue creada con éxito. Da clic en 'Aceptar' para ir al login.");
      setRedirectOnModalClose(true);  // <-- solo redirigirá al cerrar la modal
      setModalVisible(true);
    } catch (err) {
      setModalTitle("❌ Error en el Registro");
      setModalMessage(err.response?.data?.message || "Ocurrió un error. Debes iniciar el proceso nuevamente.");
      setRedirectOnModalClose(true);  // también redirige al cerrar en caso de error
      setModalVisible(true);
    
      // Reset
      setCurrentStep(1);
      setRegistrationData(null);
      setSelectedQuestions([]);
      setSecurityAnswers({});
      setQrData(null);
      setMfaCode("");
      formInstance.resetFields();
    }    
  };  

  // ----- Render de cada paso -----
  const renderStep1 = () => (
    <Card
      bordered={false}
      className="register-card"
      title={<h2 style={{ margin: 0, color: "#673ab7", textAlign: "center" }}>Registro📝</h2>}
    >
      {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" form={formInstance} onFinish={handleStep1Submit}>
        <Form.Item label="Nombre 👤" name="name" rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Correo Electrónico ✉️"
          name="email"
          rules={[
            { required: true, message: "Por favor ingresa tu correo" },
            { type: "email", message: "Correo no válido" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Contraseña 🔒" name="password" rules={[{ required: true, message: "Por favor ingresa una contraseña" }]}>
          <Input.Password onChange={(e) => {
            const newValue = e.target.value.replace(/\s/g, "");
            formInstance.setFieldsValue({ password: newValue });
          }} />
        </Form.Item>
        <ul style={{ fontSize: 13, paddingLeft: 20, marginBottom: 10 }}>
          {passwordRequirements.map((req, index) => (
            <li key={index} style={{ color: req.test(password || "") ? "#4caf50" : "#888" }}>
              {req.test(password || "") ? "✔️" : "❌"} {req.label}
            </li>
          ))}
        </ul>
        <Form.Item
          label="Captcha 🛡️"
          required
          validateStatus={captchaTouched && !captcha ? "error" : ""}
          help={captchaTouched && !captcha ? "Por favor ingresa el captcha" : ""}
        >
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 14,
              background: "#fff",
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
            onChange={(e) => {
              setCaptcha(e.target.value);
              setCaptchaTouched(true);
            }}
            style={{ textAlign: "center" }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ backgroundColor: "#00c853", borderColor: "#00c853" }}>
            Continuar ➡️
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <a href="/login" style={{ color: "#3f51b5" }}>¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </Card>
  );

  const renderStep2 = () => (
    <Card
      bordered={false}
      className="register-card"
      title={<h2 style={{ margin: 0, color: "#673ab7", textAlign: "center" }}>Preguntas de Seguridad 🔒</h2>}
    >
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <p style={{ marginBottom: 16 }}>
        Selecciona <strong>2 preguntas</strong> de seguridad y responde cada una. Estas serán utilizadas para recuperar el acceso en caso de perder la app de autenticación. 💡
      </p>
      <div>
        {securityQuestionsList.map((question, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={selectedQuestions.includes(index)}
              onChange={(e) => {
                let newSelected = [...selectedQuestions];
                if (e.target.checked) {
                  if (newSelected.length < 2) {
                    newSelected.push(index);
                  }
                } else {
                  newSelected = newSelected.filter(q => q !== index);
                }
                setSelectedQuestions(newSelected);
              }}
              disabled={!selectedQuestions.includes(index) && selectedQuestions.length >= 2}
            />
            <span style={{ marginLeft: 8 }}>{question}</span>
            {selectedQuestions.includes(index) && (
              <Input
                placeholder="Tu respuesta..."
                value={securityAnswers[index] || ""}
                onChange={(e) => setSecurityAnswers({ ...securityAnswers, [index]: e.target.value })}
                style={{ marginTop: 4 }}
              />
            )}
          </div>
        ))}
      </div>
      <Button type="primary" block onClick={handleStep2Submit} style={{ backgroundColor: "#00c853", borderColor: "#00c853", marginTop: 16 }}>
        Continuar ➡️
      </Button>
    </Card>
  );

  const renderStep3 = () => (
    <Card
      bordered={false}
      className="register-card"
      title={<h2 style={{ margin: 0, color: "#673ab7", textAlign: "center" }}>Configuración MFA 🔑</h2>}
    >
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {loading && <p style={{ textAlign: "center" }}>Cargando QR... ⏳</p>}
      {qrData && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={qrData}
            alt="QR MFA"
            style={{
              width: 220,
              height: 220,
              imageRendering: "pixelated",
              border: "1px solid #ccc",
              padding: 4,
              background: "#fff"
            }}
          />
        </div>
      )}
      <Alert
        message="Solo tienes una oportunidad para ingresar el código."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <p style={{ marginBottom: 16, textAlign: "center" }}>
        Escanea el código QR con tu app de autenticación (ej. Google Authenticator, Microsoft Authenticator, etc.) y luego ingresa el código que se muestra. 📱
      </p>
      <Input
        placeholder="Ingresa el código del autenticador"
        value={mfaCode}
        onChange={(e) => setMfaCode(e.target.value)}
        style={{ textAlign: "center", marginBottom: 16 }}
      />
      <Button type="primary" block onClick={handleStep3Submit} loading={loading} style={{ backgroundColor: "#00c853", borderColor: "#00c853" }}>
        Registrar 🚀
      </Button>
    </Card>
  );

  return (
    <div className="register-container">
      <div className="image-section">
        <div className="image-overlay">
          <h1 className="image-title">🎉 ¡Bienvenido a EventApp!</h1>
          <p className="image-description">
            🚀 Regístrate ahora y accede a los <strong>mejores eventos</strong>, experiencias inolvidables, música en vivo, talleres, networking y mucho más. ¡Tu acceso VIP comienza aquí! 🎫🔥
          </p>
          <Button type="primary" className="login-button" onClick={() => navigate("/login")}>
            Iniciar sesión 🔑
          </Button>
        </div>
      </div>
  
      <div className="form-section">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
  
      <Modal
        title={modalTitle}
        open={modalVisible} // Ant Design v5 usa "open" en lugar de "visible"
        onOk={handleModalOk}
        onCancel={handleModalOk}
        okText="Aceptar"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        maskClosable={false}
        zIndex={1000}
      >
        <p style={{ textAlign: "center", fontSize: 16 }}>{modalMessage}</p>
      </Modal>
    </div>
  );
  
};

export default RegisterPage;
