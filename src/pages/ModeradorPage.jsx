import { useEffect, useState } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Unauthorized from "./Unauthorized";

const ModeradorPage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "moderador") {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (authorized === false) return <Unauthorized />;
  if (authorized === null) return null;

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="w-50 shadow">
        <Card.Header className="bg-warning text-dark">
          Bienvenido, Moderador {user?.name}
        </Card.Header>
        <Card.Body>
          <Card.Title>Área de Moderador</Card.Title>
          <Card.Text>
            <p><strong>Nombre:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Rol:</strong> {user?.role}</p>
          </Card.Text>
          <Button variant="danger" onClick={handleLogout}>Cerrar Sesión</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ModeradorPage;
