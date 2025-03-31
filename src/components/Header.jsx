import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import logo from "../assets/logo1.png";
import "../css/Header.css";

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ userName = "Usuario" }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  // ✅ Hook dentro del componente
  const isMobile = useMediaQuery({ maxWidth: 576 });

  const handleProfileClick = () => {
    setShowMenu(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.clear();
    setShowMenu(false);
    navigate("/login");
  };

  return (
    <Header className="header-container">
      <div className="header-content">
        <img src={logo} alt="Logo" className="logo-img" />

        {isMobile ? (
          <>
            <Button
              type="text"
              className="menu-toggle"
              onClick={() => setShowMenu(!showMenu)}
              style={{ color: "#fff", fontSize: 18 }}
            >
              ☰
            </Button>

            {showMenu && (
              <div className="user-section-horizontal">
                <Text className="user-name">👋 {userName}</Text>
                <Button className="profile-button" onClick={handleProfileClick}>
                  Perfil
                </Button>
                <Button className="logout-button" onClick={handleLogout}>
                  Logout
                </Button>
                <Button type="link" onClick={() => setShowMenu(false)} style={{ color: "#fff", marginTop: 4 }}>
                  ❌ Cerrar
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="user-section-horizontal">
            <Text className="user-name">👋 Hola, {userName}</Text>
            <Button className="profile-button" onClick={handleProfileClick}>
              Perfil
            </Button>
            <Button className="logout-button" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
