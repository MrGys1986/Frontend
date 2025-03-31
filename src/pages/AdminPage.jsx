import { useEffect, useState } from "react";
import { Container, Card, Button, Table, Form, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import Unauthorized from "./Unauthorized";

const AdminPage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(null); 

  useEffect(() => {
    if (!user || user.role !== "administrador") {
      setAuthorized(false);
    } else {
      setAuthorized(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("Error al obtener usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { role: newRole });
      setMessage("Rol actualizado correctamente.");
      fetchUsers();
    } catch (err) {
      console.error("Error al actualizar rol:", err);
      setError("Error al actualizar rol.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setMessage("Usuario eliminado correctamente.");
      fetchUsers();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar usuario.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (authorized === false) return <Unauthorized />;
  if (authorized === null) return null; // Podrías poner un spinner si quieres

  return (
    <Container className="mt-5">
      <Card className="shadow-lg">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <div>Bienvenido, Administrador {user?.name}</div>
          <Button variant="danger" onClick={handleLogout}>Cerrar Sesión</Button>
        </Card.Header>
        <Card.Body>
          <Card.Title>Gestión de Usuarios</Card.Title>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Cambiar Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <Form.Select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="usuario">usuario</option>
                        <option value="moderador">moderador</option>
                        <option value="administrador">administrador</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPage;
