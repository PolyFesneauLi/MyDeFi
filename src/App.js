import React from 'react';
import Content from './views/Content';
import { Provider } from 'react-redux';
import store from './redux/store';
import { Card } from 'antd';
import backgroundSvg from "./assets/icons/currency-exchange.svg";

export default function App() {
  return (
    <Provider store={store}>
      <div style={{
        backgroundImage: `url(${backgroundSvg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        position: "relative",
        backgroundColor: "rgba(255,255,255,0.4)",
        color: "#333"
      }}>
        {/* 标题卡片 */}
        <Card style={{ 
          margin: "2rem auto",
          maxWidth: "800px",
          textAlign: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)"
        }}>
          <h1 style={{ fontSize: "2rem", margin: "1rem 0" }}>
            COMP5521 DeFi Swap
          </h1>
        </Card>

        {/* 内容区域 */}
        <div style={{ 
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "8px"
        }}>
          <Content />
        </div>
      </div>
    </Provider>
  );
}