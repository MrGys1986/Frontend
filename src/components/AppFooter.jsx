import React from "react";
import { Layout, Row, Col, Typography } from "antd";
import {
  FacebookFilled,
  TwitterSquareFilled,
  InstagramFilled,
  MailOutlined,
} from "@ant-design/icons";
import "../css/Footer.css";

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const AppFooter = () => {
  return (
    <Footer className="footer-container">
      <Row justify="space-between" gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Title level={4} style={{ color: "#fff", marginBottom: 8 }}>
            🎉 MeetEvent
          </Title>
          <Text style={{ color: "#ccc" }}>
            Tu plataforma para descubrir los mejores eventos en México 🇲🇽.
          </Text>
        </Col>

        <Col xs={24} md={8}>
          <Title level={5} style={{ color: "#fff" }}>Enlaces</Title>
          <div className="footer-links">
            <Link href="/login">Iniciar Sesión</Link>
            <Link href="/registro">Registrarse</Link>
            <Link href="/faq">Preguntas frecuentes</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <Title level={5} style={{ color: "#fff" }}>Síguenos</Title>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FacebookFilled />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <TwitterSquareFilled />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <InstagramFilled />
            </a>
            <a href="mailto:contacto@eventapp.com">
              <MailOutlined />
            </a>
          </div>
        </Col>
      </Row>

      <div className="footer-bottom">
        <Text style={{ color: "#bbb" }}>
          © {new Date().getFullYear()} MeetEvent. Todos los derechos reservados.
        </Text>
      </div>
    </Footer>
  );
};

export default AppFooter;
