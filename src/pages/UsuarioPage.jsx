import { useEffect, useState } from "react";
import { Layout, Card, Tag, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import Unauthorized from "./Unauthorized";
import AppHeader from "../components/Header";
import Slider from "../components/Slider";
import CategoryBar from "../components/CategoryBar";
import EventCard from "../components/EventCard";
import api from "../services/axiosConfig";
import AppFooter from "../components/AppFooter"; 
import "../css/HomePage.css";

const { Content } = Layout;

const UsuarioPage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [authorized, setAuthorized] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // <- Nuevo

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

 useEffect(() => {
     if (!user) {
       navigate("/login");
       return;
     }
    
      setAuthorized(true);
      fetchFilters();
      fetchEventos();
    
  }, []);

  const fetchFilters = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get("/api/event/categorias"),
        api.get("/api/event/ubicaciones"),
      ]);
      setCategories(catRes.data.categorias);
      setLocations(locRes.data.ubicaciones);
    } catch (error) {
      console.error("Error al cargar categorías y ubicaciones:", error);
    }
  };

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/event/todos");
      setEvents(res.data.eventos);
      setFilteredEvents(res.data.eventos);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    filtrarEventos(cat, selectedLocation);
  };

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    filtrarEventos(selectedCategory, loc);
  };

  const filtrarEventos = (cat, loc) => {
    const filtered = events.filter((ev) => {
      const matchCat = cat ? ev.categoria === cat : true;
      const matchLoc = loc ? ev.lugar === loc : true;
      return matchCat && matchLoc;
    });
    setFilteredEvents(filtered);
  };

  if (authorized === false) return <Unauthorized />;
  if (authorized === null) return null;

  return (
    <Layout className="layout">
      <AppHeader userName={user?.name} onProfileClick={() => navigate("/perfil")} />

      <Content>
        <Slider />

        <CategoryBar
          categories={categories}
          locations={locations}
          onCategorySelect={handleCategorySelect}
          onLocationSelect={handleLocationSelect}
        />

        <div className="centered-image-section">
          <img
            src="https://i.ibb.co/7x4tRQK4/5.png"
            alt="imagen-centrada"
            className="centered-image"
          />
        </div>

       

        <div style={{ textAlign: "center", margin: "20px 0" }}>
  <Button
    onClick={() => navigate("/soporte")}
    style={{
      background: "linear-gradient(90deg, #4CAF50, #8BC34A)",
      border: "none",
      borderRadius: "30px",
      fontWeight: 600,
      fontSize: 18,
      padding: "0 32px",
      height: "48px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}
    type="primary"
  >
    Contacto y Soporte Técnico
  </Button>
</div>




        <div className="events-section">
          <div className="events-header">
            <h2>Eventos disponibles</h2>
          </div>

          {(selectedCategory || selectedLocation) && (
            <Card
              className="selection-card"
              style={{
                margin: "0 auto 20px auto",
                maxWidth: 900,
                backgroundImage: `url("https://i.ibb.co/F8PQVYX/map.png")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
                textShadow: "2px 2px 5px #000",
              }}
            >
              {selectedCategory && selectedLocation
                ? `${selectedCategory.toUpperCase()} EN ${selectedLocation.toUpperCase()}`
                : selectedCategory
                ? selectedCategory.toUpperCase()
                : `Eventos en ${selectedLocation.toUpperCase()}`}
            </Card>
          )}

          {(selectedCategory || selectedLocation) && (
            <>
              <div style={{ textAlign: "center", marginTop: 16, marginBottom: 8 }}>
                <p style={{ fontSize: 14, color: "#555" }}>
                  Puedes eliminar cualquiera de los filtros haciendo clic en la "X" de cada etiqueta:
                </p>
              </div>

              <div style={{ textAlign: "center", marginBottom: 20 }}>
                {selectedCategory && (
                  <Tag
                    closable
                    onClose={() => {
                      setSelectedCategory(null);
                      filtrarEventos(null, selectedLocation);
                    }}
                    color="blue"
                    style={{ fontSize: 16, padding: "4px 12px", margin: "0 8px" }}
                  >
                    Categoría: {selectedCategory}
                  </Tag>
                )}
                {selectedLocation && (
                  <Tag
                    closable
                    onClose={() => {
                      setSelectedLocation(null);
                      filtrarEventos(selectedCategory, null);
                    }}
                    color="geekblue"
                    style={{ fontSize: 16, padding: "4px 12px", margin: "0 8px" }}
                  >
                    Ubicación: {selectedLocation}
                  </Tag>
                )}
              </div>
            </>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" tip="Cargando eventos..." />
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((evento, idx) => (
                <EventCard key={idx} evento={evento} user={user} />
              ))}
            </div>
          )}
        </div>
      </Content>

      <AppFooter />
    </Layout>
  );
};

export default UsuarioPage;
