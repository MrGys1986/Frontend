import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="shadow p-4 text-center" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <Card.Title className="text-danger">⚠️ Acceso no autorizado</Card.Title>
          <Card.Text>
            No estás autorizado para ver esta página.<br />
            Por favor, inicia sesión con una cuenta válida.
          </Card.Text>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Ir a Login
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Unauthorized;
