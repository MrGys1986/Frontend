import React from "react";
import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";
import "../css/EventCard.css";


const EventCard = ({ evento, user }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="event-card"
      cover={
        <img
          alt={evento.nombre}
          src={evento.imagen}
          className="event-image"
        />
      }
    >
      <h3 className="event-title">{evento.nombre}</h3>
      <p className="event-location">{evento.lugar}</p>
      <p className="event-date">
        {new Date(evento.fecha).toLocaleDateString("es-MX")}
      </p>

      <Button
  type="primary"
  block
  className="event-button"
  onClick={() => {
    navigate(`/evento/${evento.id}`, {
      state: {
        user,
        eventoId: evento.id,
      },
    });
  }}
>
  Ver Evento
</Button>

    </Card>
  );
};

export default EventCard;
