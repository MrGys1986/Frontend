import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Layout, Card, Button, Descriptions, Spin, Tag, Divider } from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleTwoTone,
  CrownTwoTone,
  StarTwoTone,
  CopyOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { Statistic } from "antd"; 
import Countdown from "antd/es/statistic/Countdown"; 

import api from "../services/axiosConfig";
import AppHeader from "../components/Header";
import AppFooter from "../components/AppFooter";
import "../css/EventoDetailPage.css";
import Unauthorized from "./Unauthorized";

const { Content } = Layout;
const { Countdown: AntdCountdown } = Statistic; // altern. a la import directa
const EventoDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
  const user = location.state?.user || userFromStorage;
  const eventId = location.state?.eventoId || id;

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // 1) Carga inicial del evento
    api.get(`/api/event/uno/${eventId}`)
      .then((res) => {
        setEvento(res.data.evento);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar evento:", err);
        setLoading(false);
      });

    
  }, [eventId, user, navigate]);

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" tip="Cargando evento..." />
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

  // Datos del evento
const {
    nombre,
    descripcion,
    lugar,
    fecha,
    imagen,
    categoria,
    subcategoria,
    disponibilidad = {},
  } = evento;
  
  // Tipos de boleto
  const {
    basico = {},
    premium = {},
    vip = {},
  } = disponibilidad;
  
  // Valores individuales (con fallback en caso de que falten)
  const basicoDisponibles = basico.disponibles || 0;
  const basicoPrecio = basico.precio || 0;
  const basicoDescripcion = basico.descripcion || "";
  
  const premiumDisponibles = premium.disponibles || 0;
  const premiumPrecio = premium.precio || 0;
  const premiumDescripcion = premium.descripcion || "";
  
  const vipDisponibles = vip.disponibles || 0;
  const vipPrecio = vip.precio || 0;
  const vipDescripcion = vip.descripcion || "";
  

  // Función compartir en WhatsApp
  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `Te invito al evento: ${nombre}`;
    const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text + " " + url
    )}`;
    window.open(whatsAppUrl, "_blank");
  };

  // Función copiar enlace
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader userName={user.name} onProfileClick={() => navigate("/perfil")} />
      <Content style={{ padding: "24px" }}>
        <Card
          style={{
            maxWidth: 800,
            margin: "0 auto",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          }}
          cover={
            <img
              alt={nombre}
              src={imagen}
              style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            />
          }
        >
          {/* Título y etiquetas */}
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              {nombre}
            </h2>
            <Tag color="blue">{subcategoria}</Tag>
            <Tag color="geekblue">{categoria}</Tag>
          </div>

          <Divider />

          {/* Descripción principal */}
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="📄 Descripción">
              {descripcion}
            </Descriptions.Item>
            <Descriptions.Item label="📍 Lugar">
              <EnvironmentOutlined /> {lugar}
            </Descriptions.Item>
            <Descriptions.Item label="📅 Fecha">
              <CalendarOutlined />{" "}
              {new Date(fecha).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="center" style={{ marginTop: 24 }}>
            🎫 <strong>Disponibilidad de boletos</strong>
          </Divider>

          {/* Tarjetas de boletos */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
  <div style={{ maxWidth: 800, width: "100%" }}>
    <Descriptions
      
      bordered
      column={1}
      labelStyle={{ width: "150px", fontWeight: "bold", fontSize: 16 }}
      contentStyle={{ fontSize: 15, padding: "8px 16px" }}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Descriptions.Item label="👑 VIP">
        <p style={{ margin: 0 }}><strong>Disponibles:</strong> {vipDisponibles}</p>
        <p style={{ margin: 0 }}><strong>Precio:</strong> ${vipPrecio}</p>
        <p style={{ marginTop: 6, color: "#555", fontStyle: "italic" }}>{vipDescripcion}</p>
      </Descriptions.Item>

      <Descriptions.Item label="⭐ Premium">
        <p style={{ margin: 0 }}><strong>Disponibles:</strong> {premiumDisponibles}</p>
        <p style={{ margin: 0 }}><strong>Precio:</strong> ${premiumPrecio}</p>
        <p style={{ marginTop: 6, color: "#555", fontStyle: "italic" }}>{premiumDescripcion}</p>
      </Descriptions.Item>

      <Descriptions.Item label="🎫 Básico">
        <p style={{ margin: 0 }}><strong>Disponibles:</strong> {basicoDisponibles}</p>
        <p style={{ margin: 0 }}><strong>Precio:</strong> ${basicoPrecio}</p>
        <p style={{ marginTop: 6, color: "#555", fontStyle: "italic" }}>{basicoDescripcion}</p>
      </Descriptions.Item>
    </Descriptions>
  </div>
</div>




          {/* Temporizador */}
          <Divider orientation="center">⏳ Cuenta regresiva</Divider>
          <div className="event-countdown">
  <h3 className="countdown-title">⏳ Faltan para el evento:</h3>
  <Countdown
    value={new Date(fecha)}
    format="D [días] HH:mm:ss"
    valueStyle={{ fontSize: "28px", color: "#003376", fontWeight: "bold" }}
  />
</div>



          {/* Google Maps estático */}
          <Divider orientation="center">Mapa del evento</Divider>
          <div className="event-map">
  <iframe
    src={`https://www.google.com/maps?q=${encodeURIComponent(lugar)}&output=embed`}
    width="100%"
    height="200"
    style={{ border: 0 }}
    loading="lazy"
    allowFullScreen
  ></iframe>
</div>


          {/* Sección de info adicional */}
          <Divider orientation="left" plain>
            
          </Divider>
          <Card className="info-card" title="📌 Información adicional">
  <p>Recuerda llegar 30 minutos antes para evitar contratiempos. Lleva tu entrada digital o física.</p>
  <p>Vestimenta recomendada: Casual elegante.</p>
</Card>


          {/* Contacto con organizador */}
          <Divider orientation="left" plain>
          
          </Divider>
          <Card className="info-card" title="📬 Contacto con el organizador">
  <p>📧 <strong>Email</strong>: contacto@eventapp.com</p>
  <p>📞 <strong>Teléfono</strong>: +52 442 123 4567</p>
</Card>


          {/* Botones finales */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
  type="primary"
  size="large"
  style={{ marginRight: 12 }}
  onClick={() => navigate("/checkout", { state: { user, eventId } })}
>
  Comprar Boletos
</Button>


            <div className="event-actions">
  <Button
    type="primary"
    style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
    onClick={() =>
      window.open(
        `https://wa.me/?text=Mira este evento: ${window.location.href}`,
        "_blank"
      )
    }
  >
    📲 Compartir por WhatsApp
  </Button>

  <Button
    style={{ margin: "0 12px" }}
    onClick={() => navigator.clipboard.writeText(window.location.href)}
  >
    📋 Copiar enlace
  </Button>

  <Button type="default" onClick={() => navigate("/usuario")}>
    🔙 Volver
  </Button>
</div>

          </div>
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default EventoDetailPage;
