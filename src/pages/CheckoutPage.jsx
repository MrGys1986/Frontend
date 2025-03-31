import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Divider,
  Button,
  message,
  Typography,
  Spin,
  Modal,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

import api from "../services/axiosConfig";
import AppHeader from "../components/Header";
import AppFooter from "../components/AppFooter";
import "../css/CheckoutPage.css";

const { Content } = Layout;
const { Title, Text } = Typography;

// Componente personalizado para mostrar controles de incremento y decremento


const CustomInputNumber = ({ value, onChange, min = 0, max }) => {
  const handleDecrease = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrease = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button onClick={handleDecrease} disabled={value <= min}>
        –
      </Button>
      <div style={{ margin: "0 8px", width: "40px", textAlign: "center" }}>
        {value}
      </div>
      <Button onClick={handleIncrease} disabled={value >= max}>
        +
      </Button>
    </div>
  );
};

// Componente para cada tipo de boleto
const TicketType = ({ label, description, price, count, setCount, available }) => {
  const maxTickets = Math.min(5, available);
  return (
    <Card className="ticket-type-card">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Title level={5} style={{ marginBottom: 0 }}>{label}</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>${price}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Disponibles: {available}</Text>
        </Col>
        <Col xs={24} sm={12} md={10}>
          <Text italic style={{ color: "#555" }}>{description}</Text>
        </Col>
        <Col xs={24} sm={24} md={6} style={{ textAlign: "center" }}>
          <CustomInputNumber value={count} onChange={setCount} min={0} max={maxTickets} />
        </Col>
      </Row>
    </Card>
  );
};



const CheckoutPage = () => {
    
  const location = useLocation();
  console.log("Datos recibidos en CheckoutPage:", location.state);
  const navigate = useNavigate();
  const { id } = useParams();

  const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
  const user = location.state?.user || userFromStorage;
  const eventId = location.state?.eventId || id;

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  const [basicoCount, setBasicoCount] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [vipCount, setVipCount] = useState(0);

  // Control de carga durante la compra
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user || !user.email || !eventId) {
      message.error("Usuario no autenticado o evento inválido");
      navigate("/login");
      return;
    }
    fetchEvento();
  }, [user, eventId, navigate]);

  const fetchEvento = async () => {
    try {
      const res = await api.get(`/api/event/uno/${eventId}`);
      setEvento(res.data.evento);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar evento:", err);
      setLoading(false);
    }
  };

  const calcularSubtotal = () => {
    if (!evento?.disponibilidad) return 0;
    const { basico, premium, vip } = evento.disponibilidad;
    return (
      basicoCount * (basico?.precio || 0) +
      premiumCount * (premium?.precio || 0) +
      vipCount * (vip?.precio || 0)
    );
  };

  const handleComprar = async () => {
    const totalBoletos = basicoCount + premiumCount + vipCount;
    if (totalBoletos === 0) {
      message.warning("Selecciona al menos un boleto.");
      return;
    }

    setPurchasing(true);
    const userEmail = user.email;
    console.log("Enviando compra con email:", userEmail);

    try {
      await api.post("/api/event/comprar", {
        userId: userEmail,
        eventId,
        tickets: {
          basico: basicoCount,
          premium: premiumCount,
          vip: vipCount,
        },
      });
      message.success("¡Compra realizada con éxito! Se te ha enviado un correo con los detalles. Revisa tu Superperfil para ver tu compra.");
      setTimeout(() => navigate("/usuario"), 3000);
    } catch (err) {
      console.error("Error en comprar:", err);
      message.error(err.response?.data?.message || "Error al comprar");
      setBasicoCount(0);
      setPremiumCount(0);
      setVipCount(0);
      setTimeout(() => navigate("/usuario"), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  

  const confirmarCompra = () => {
    const subTotal = calcularSubtotal();
    const tax = subTotal * 0.16;
    const total = subTotal + tax;
    Modal.confirm({
      title: "¿Confirmar tu compra?",
      content: (
        <div>
          <p>Subtotal: ${subTotal.toFixed(2)}</p>
          <p>Impuestos (16%): ${tax.toFixed(2)}</p>
          <p><strong>Total: ${total.toFixed(2)}</strong></p>
          <p>
            Se te enviará un correo con toda la información de tu compra. Revisa tu Superperfil para ver el estado de tu compra.
          </p>
        </div>
      ),
      okText: "Sí, comprar",
      cancelText: "Cancelar",
      onOk: handleComprar,
    });
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content className="checkout-loading">
          <Spin size="large" tip="Cargando datos del evento..." />
        </Content>
      </Layout>
    );
  }

  if (!evento) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ textAlign: "center", marginTop: 40 }}>
          <h2>Evento no encontrado</h2>
          <Button onClick={() => navigate("/usuario")}>Regresar</Button>
        </Content>
      </Layout>
    );
  }

  const { nombre, disponibilidad } = evento;
  const subTotal = calcularSubtotal();
  const tax = subTotal * 0.16;
  const total = subTotal + tax;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader userName={user?.name || "Usuario"} onProfileClick={() => navigate("/perfil")} />
      <Content className="checkout-container">
        <Row gutter={[24, 24]} justify="center">
          {/* Columna 1: Selección de boletos */}
          <Col xs={24} md={14}>
            <Card
              className="checkout-card"
              title={
                <div style={{ whiteSpace: "normal", wordWrap: "break-word", fontWeight: 600 }}>
                  <Title level={4} style={{ margin: 0, fontSize: "1.2rem", lineHeight: "1.4" }}>
                    Compra de boletos para {nombre}
                  </Title>
                </div>
              }
              extra={
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ fontSize: 20, color: "#999" }} />}
                  onClick={() => navigate("/usuario")}
                />
              }
            >
              <Divider orientation="left">Selecciona tus boletos</Divider>
              <Text type="warning" style={{ display: "block", marginBottom: 10 }}>
                Nota: Se permite un máximo de 5 boletos por cada tipo, o la cantidad disponible.
              </Text>
              <TicketType
                label="🎫 Básico"
                description={disponibilidad.basico?.descripcion || ""}
                price={disponibilidad.basico?.precio || 0}
                count={basicoCount}
                setCount={setBasicoCount}
                available={disponibilidad.basico?.disponibles || 0}
              />
              <TicketType
                label="⭐ Premium"
                description={disponibilidad.premium?.descripcion || ""}
                price={disponibilidad.premium?.precio || 0}
                count={premiumCount}
                setCount={setPremiumCount}
                available={disponibilidad.premium?.disponibles || 0}
              />
              <TicketType
                label="👑 VIP"
                description={disponibilidad.vip?.descripcion || ""}
                price={disponibilidad.vip?.precio || 0}
                count={vipCount}
                setCount={setVipCount}
                available={disponibilidad.vip?.disponibles || 0}
              />
            </Card>
          </Col>

          {/* Columna 2: Resumen de la compra */}
{/* Columna 2: Resumen de la compra */}
<Col xs={24} md={10}>
  <Card className="summary-card" title="Resumen de tu compra">
    <Divider />
    <div className="summary-line">
      <span>Subtotal:</span>
      <strong>${subTotal.toFixed(2)}</strong>
    </div>
    <div className="summary-line">
      <span>Impuestos (16%):</span>
      <strong>${tax.toFixed(2)}</strong>
    </div>
    <Divider />
    <div className="summary-total">
      <span>Total a pagar:</span>
      <strong>${total.toFixed(2)}</strong>
    </div>
    <Divider />
    <Button
      type="primary"
      size="large"
      block
      style={{
        background: "linear-gradient(90deg, #00c853, #64dd17)",
        border: "none",
        borderRadius: "30px",
        fontWeight: 600,
        fontSize: 18,
        marginTop: 12,
      }}
      onClick={confirmarCompra}
      disabled={purchasing}
      loading={purchasing}
    >
      Confirmar compra
    </Button>
  </Card>

  {/* 🔙 Botón volver */}
  <div style={{ textAlign: "center", marginTop: 24 }}>
    <Button type="default" onClick={() => navigate(-1)}>
      🔙 Volver
    </Button>
  </div>
</Col>

        </Row>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default CheckoutPage;
