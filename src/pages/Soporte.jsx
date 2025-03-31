import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AppHeader from "../components/Header";
import AppFooter from "../components/AppFooter";
import api from "../services/axiosConfig";
import "../css/Soporte.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const SoportePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (!storedUser) {
      message.error("No se encontró al usuario. Redirigiendo al login...");
      navigate("/login");
    }
  }, [navigate, storedUser]);

  const handleSupportFormSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post("/api/event/soporte", values);
      message.success("Tu caso de soporte se ha enviado correctamente. Revisa tu correo.");
    } catch (error) {
      console.error("Error al enviar soporte:", error);
      message.error(error.response?.data?.message || "No se pudo enviar el soporte.");
    } finally {
      setLoading(false);
    }
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader userName={storedUser?.name || "Soporte"} />

      <Content className="soporte-container">
        <Card className="soporte-card">
          <div className="soporte-title">
            <Title level={3}>🛠️ Centro de Soporte y Contacto</Title>
          </div>

          <Title level={4} className="soporte-subtitle">📌 Preguntas Frecuentes</Title>
          <Row gutter={[16, 16]}>
            <Col span={24}><Text strong>1) ¿Cómo cambio mi contraseña?</Text><br /><Text>Ingresa a tu perfil, selecciona “Editar Contraseña” y confirma tu nueva clave.</Text></Col>
            <Col span={24}><Text strong>2) ¿Puedo cancelar mi boleto una vez comprado?</Text><br /><Text>Puedes solicitar la cancelación hasta 48 horas antes del evento. Revisa nuestros términos para ver si aplica reembolso.</Text></Col>
            <Col span={24}><Text strong>3) ¿Cómo contacto directamente al organizador?</Text><br /><Text>En la página del evento encontrarás el email y teléfono del organizador. O envíanos un mensaje y te conectamos con ellos.</Text></Col>
            <Col span={24}><Text strong>4) ¿Qué métodos de pago aceptan?</Text><br /><Text>Aceptamos tarjetas de crédito/débito, PayPal y pagos OXXO. Para transferencias bancarias, contáctanos directamente.</Text></Col>
            <Col span={24}><Text strong>5) ¿Cómo recupero mi cuenta si perdí acceso al correo?</Text><br /><Text>Puedes responder tus preguntas de seguridad o contactarnos con un documento que valide tu identidad.</Text></Col>
            <Col span={24}><Text strong>6) ¿Puedo compartir mis boletos con otra persona?</Text><br /><Text>Sí, siempre y cuando esa persona presente el código QR del boleto. Sin embargo, en algunos eventos es personal e intransferible.</Text></Col>
          </Row>

          <Divider />

          <Title level={4} className="soporte-subtitle">☎️ Contacto Directo</Title>
          <Text className="soporte-contact">
            ¿Aún con dudas? Envíanos un correo a <Text strong>soporte@eventapp.com</Text> o llámanos al <Text strong>+52 442 123 4567</Text>.<br />
            Estamos disponibles de <Text strong>9am a 6pm</Text>, de lunes a viernes.
          </Text>

          <Divider />

          <Title level={4} className="soporte-subtitle">📝 Formulario de Quejas o Peticiones</Title>
          <Spin spinning={loading} indicator={antIcon} tip="Enviando caso...">
            <Form layout="vertical" onFinish={handleSupportFormSubmit} className="soporte-form">
              <Form.Item label="Tu Correo" name="correo" rules={[{ required: true, message: "Por favor ingresa tu correo" }, { type: "email", message: "Correo no válido" }]}> <Input placeholder="ejemplo@correo.com" /> </Form.Item>
              <Form.Item label="Mensaje" name="mensaje" rules={[{ required: true, message: "Ingresa tu mensaje" }]}> <Input.TextArea rows={4} placeholder="Escribe tu queja, duda o petición..." /> </Form.Item>
              <Button type="primary" htmlType="submit" className="soporte-enviar-btn">Enviar</Button>
            </Form>
          </Spin>

          <Divider />
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Button type="default" onClick={() => navigate("/usuario")}>
              🔙 Volver
            </Button>
          </div>
        </Card>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default SoportePage;
