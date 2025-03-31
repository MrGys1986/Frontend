import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Descriptions,
  Spin,
  Table,
  Typography,
  Avatar,
  message,
  Button,
  Tag,
  Divider,
} from "antd";
import {
  UserOutlined,
  DownloadOutlined,
  TrophyOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/axiosConfig";
import AppHeader from "../components/Header";
import AppFooter from "../components/AppFooter";
import "../css/ProfilePage.css";
import qrImage from "../assets/qr.png"; // Asegúrate que webpack/vite lo inyecte como data URL

const { Content } = Layout;
const { Title, Text } = Typography;

const ProfilePage = () => {
  const navigate = useNavigate();
  const storedUser = useRef(JSON.parse(localStorage.getItem("user")) || null);

  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  useEffect(() => {
    const userData = storedUser.current;
    if (!userData?.email) {
      message.error("No se encontró al usuario. Redirigiendo al login...");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, purchasesRes] = await Promise.all([
          api.get(`/api/profile/userinfo?email=${userData.email}`),
          api.get(`/api/profile/compras?email=${userData.email}`),
        ]);
        setUser(userRes.data.user);
        setPurchases(purchasesRes.data.purchases || []);
      } catch (err) {
        console.error("Error al cargar datos de perfil:", err);
        message.error("Error al obtener datos del perfil.");
      } finally {
        setLoadingUser(false);
        setLoadingPurchases(false);
      }
    };

    fetchData();
  }, [navigate]);

  

  // Generar PDF con un diseño más elaborado
  const handleDownloadTicket = (record) => {
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "letter" });

    // Encabezado del PDF
    doc.setFontSize(20);
    doc.text(`🎟️ Detalles de tu Compra - ${record.nombre}`, 40, 60);
    doc.setFontSize(12);
    doc.setTextColor(99);
    doc.text(
      `Fecha del evento: ${new Date(record.fecha).toLocaleDateString("es-MX")}`,
      40,
      80
    );
    

    // Tabla general de boletos
    autoTable(doc, {
      startY: 100,
      head: [["Tipo de Boleto", "Cantidad"]],
      body: [
        ["Básico", record.basico || 0],
        ["Premium", record.premium || 0],
        ["VIP", record.vip || 0],
      ],
      theme: "striped",
      headStyles: { fillColor: [46, 204, 113] },
    });

    doc.setFontSize(11);
    doc.setTextColor(66);
    doc.text(
      "A continuación, cada ticket cuenta con un QR de referencia:",
      40,
      doc.lastAutoTable.finalY + 40
    );

    // Dibujar un mini-ticket con QR usando la imagen importada
    // (Aquí se muestra un ejemplo sencillo)
    const miniTicketX = 40;
    const miniTicketY = doc.lastAutoTable.finalY + 60;
    const miniTicketWidth = 250;
    const miniTicketHeight = 120;

    // Dibujar un rectángulo con fondo para el mini-ticket
    doc.setDrawColor(255, 255, 255);
    doc.setFillColor(230, 230, 230); // Gris claro para Básico, por ejemplo
    doc.roundedRect(miniTicketX, miniTicketY, miniTicketWidth, miniTicketHeight, 10, 10, "F");

    // Texto del mini-ticket
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`🎫 Básico Ticket`, miniTicketX + 20, miniTicketY + 30);
    doc.setFontSize(10);
    doc.text(`Evento: ${record.nombre}`, miniTicketX + 20, miniTicketY + 50);
    doc.text(`Fecha: ${new Date(record.fecha).toLocaleDateString("es-MX")}`, miniTicketX + 20, miniTicketY + 65);

    // Agregar la imagen QR (usando qrImage importado)
    doc.addImage(qrImage, "PNG", miniTicketX + 160, miniTicketY + 20, 60, 60);

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(150);
    let finalY = miniTicketY + miniTicketHeight + 40;
    if (finalY < 700) {
      doc.text("© 2025 EventApp - La mejor experiencia en eventos", 40, finalY);
    } else {
      doc.addPage();
      doc.text("© 2025 EventApp - La mejor experiencia en eventos", 40, 50);
    }

    doc.save(`boleto_${record.nombre}.pdf`);
  };

  // Cálculo de estadísticas personales
  const totalEvents = purchases.length;
  const totalTickets = purchases.reduce((acc, item) => {
    return acc + (item.basico || 0) + (item.premium || 0) + (item.vip || 0);
  }, 0);

  let userLevel = "Bronce";
  if (totalTickets >= 10 && totalTickets < 30) userLevel = "Plata";
  else if (totalTickets >= 30) userLevel = "Oro";

  const columns = [
    {
      title: "🎫 Evento",
      dataIndex: "nombre",
      key: "nombre",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "📅 Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (fecha) =>
        new Date(fecha).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    },
    {
      title: "Básico",
      dataIndex: "basico",
      key: "basico",
      align: "center",
    },
    {
      title: "Premium",
      dataIndex: "premium",
      key: "premium",
      align: "center",
    },
    {
      title: "VIP",
      dataIndex: "vip",
      key: "vip",
      align: "center",
    },
    {
      title: "Total",
      key: "totalBoletos",
      align: "center",
      render: (_, record) => {
        const total = (record.basico || 0) + (record.premium || 0) + (record.vip || 0);
        return <strong>{total}</strong>;
      },
    },
    {
      title: "Descargar",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTicket(record)}>
          PDF
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader userName={storedUser.current?.name || "Usuario"} />

      <Content style={{ padding: "24px 16px" }}>
        <Row justify="center">
          <Col xs={24} md={20} lg={16}>
            {/* Tarjeta de Perfil */}
            <Card
              className="profile-card"
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              {loadingUser ? (
                <Spin tip="Cargando perfil..." />
              ) : (
                <>
                  <Avatar
                    size={90}
                    style={{ backgroundColor: "#f56a00", marginBottom: 16 }}
                    icon={<UserOutlined />}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    {user?.name || "Usuario"}
                  </Title>
                  <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    {user?.email}
                  </Text>
                  <Descriptions
                    column={1}
                    bordered
                    size="small"
                    style={{ backgroundColor: "#fafafa" }}
                  >
                    <Descriptions.Item label="Rol">
                      <Tag color="blue">{user?.role || "Desconocido"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Registrado en">
                      {user?.createdAt
                        ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("es-MX")
                        : "N/D"}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Card>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
  <Button
    type="default"
    onClick={() => navigate("/usuario")}
  >
    🔙 Volver
  </Button>
</div>



            {/* Tarjeta de Estadísticas */}
            {!loadingUser && (
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  marginBottom: 24,
                }}
              >
                <Title level={5} style={{ marginBottom: 8 }}>
                  <TrophyOutlined /> Estadísticas Personales
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Eventos asistidos:</Text>
                    <div>{totalEvents}</div>
                  </Col>
                  <Col span={12}>
                    <Text strong>Total boletos:</Text>
                    <div>{totalTickets}</div>
                  </Col>
                  <Col span={24}>
                    <Text strong>Nivel:</Text>{" "}<Tag color="gold" style={{ fontSize: 14 }}>{userLevel}</Tag>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Tarjeta de Compras */}
            <Card
              className="purchases-card"
              title={<> <SmileOutlined /> Mis Compras </>}
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            >
              {loadingPurchases ? (
                <Spin tip="Cargando compras..." />
              ) : purchases.length > 0 ? (
                <div className="purchases-table">
                  <Table
                    columns={columns}
                    dataSource={purchases}
                    rowKey={(record) => record.eventId}
                    pagination={{ pageSize: 5 }}
                  />
                </div>
              ) : (
                <Text type="secondary">
                  Aún no has comprado boletos, ¡anímate a asistir a un evento!
                </Text>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default ProfilePage;
