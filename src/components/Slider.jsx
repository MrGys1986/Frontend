import React from "react";
import { Carousel } from "antd";
import "../css/Slider.css";

const Slider = () => {
  // Rutas de tus 4 imágenes
  const images = [
    require("../assets/1.png"),
    require("../assets/2.png"),
    require("../assets/3.png"),
    require("../assets/4.png"),
  ];

  return (
    <div className="slider-wrapper">
      <Carousel autoplay className="slider-container">
        {images.map((img, index) => (
          <div key={index}>
            <img src={img} alt={`slide-${index}`} className="slider-image" />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Slider;
