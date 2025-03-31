import React from "react";
import { Dropdown, Menu, Button } from "antd";
import { AppstoreOutlined, EnvironmentOutlined, DownOutlined } from "@ant-design/icons";
import "../css/CategoryBar.css";

const CategoryBar = ({ categories, locations, onCategorySelect, onLocationSelect }) => {
  const categoryMenu = (
    <Menu onClick={({ key }) => onCategorySelect(key)}>
      {categories.map((cat) => (
        <Menu.Item key={cat}>{cat}</Menu.Item>
      ))}
    </Menu>
  );

  const locationMenu = (
    <Menu onClick={({ key }) => onLocationSelect(key)}>
      {locations.map((loc) => (
        <Menu.Item key={loc}>{loc}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="category-bar">
      <Dropdown overlay={categoryMenu} trigger={['click']}>
        <Button className="category-button">
          <AppstoreOutlined /> CATEGORÍA DE EVENTOS <DownOutlined />
        </Button>
      </Dropdown>

      <Dropdown overlay={locationMenu} trigger={['click']}>
        <Button className="category-button">
          <EnvironmentOutlined /> UBICACIÓN DE EVENTOS <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
};

export default CategoryBar;
