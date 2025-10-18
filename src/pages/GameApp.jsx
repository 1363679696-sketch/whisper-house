import { useState, useEffect } from "react";
import GameLottery from "./GameLottery";
import GameMood from "./GameMood";
import GameLinks from "./GameLinks";
import { useTheme } from "../ThemeContext";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function GameApp({ setCurrentApp }) {
  const { currentFont } = useTheme();
  const [currentPage, setCurrentPage] = useState("menu");
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 初始化壁纸
  useEffect(() => {
    updateWallpaper();
    
    // 监听壁纸变化事件
    const handleWallpaperChange = (event) => {
      if (event.detail.type === 'global') {
        updateWallpaper();
      }
    };

    window.addEventListener('wallpaperChanged', handleWallpaperChange);
    return () => window.removeEventListener('wallpaperChanged', handleWallpaperChange);
  }, []);

  // 更新壁纸
  const updateWallpaper = () => {
    const wallpaperUrl = getWallpaper('global');
    setWallpaper(wallpaperUrl);
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "12px",
    border: "1px solid rgba(229, 231, 235, 0.8)",
    textAlign: "center",
    fontSize: "16px",
    marginBottom: "12px",
    color: "#374151",
    fontWeight: 500,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    cursor: "pointer",
    fontFamily: "inherit",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease"
  };

  if (currentPage === "lottery") return <GameLottery goBack={() => setCurrentPage("menu")} />;
  if (currentPage === "mood") return <GameMood goBack={() => setCurrentPage("menu")} />;
  if (currentPage === "link") return <GameLinks goBack={() => setCurrentPage("menu")} />;

  // 构建背景样式
  const backgroundStyle = wallpaper 
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }
    : {
        backgroundColor: "#f8fafc"
      };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: currentFont.fontFamily,
        ...backgroundStyle, // 应用背景样式
        transition: "font-family 0.3s ease, background 0.3s ease" // 添加背景过渡效果
      }}
    >
      {/* 顶栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 16px",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid rgba(229, 231, 235, 0.8)",
          position: "relative",
          backdropFilter: "blur(10px)"
        }}
      >
        <button
          onClick={() => setCurrentApp("home")}
          style={{
            position: "absolute",
            left: "16px",
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#6b7280",
            padding: "4px",
            borderRadius: "6px",
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "rgba(107, 114, 128, 0.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          ←
        </button>
        <h2 style={{ 
          fontSize: "16px", 
          fontWeight: "600", 
          color: "#374151",
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}>
          游戏
        </h2>
      </div>

      {/* 分割线 */}
      <div style={{ 
        height: "1px", 
        backgroundColor: "rgba(241, 245, 249, 0.8)" 
      }}></div>

      {/* 内容区域 */}
      <div
        style={{
          flex: 1,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div 
          style={buttonStyle} 
          onClick={() => setCurrentPage("lottery")}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            e.target.style.background = "rgba(255, 255, 255, 0.95)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            e.target.style.background = "rgba(255, 255, 255, 0.9)";
          }}
        >
          🎯 随机抽签
        </div>
        
        <div 
          style={buttonStyle} 
          onClick={() => setCurrentPage("mood")}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            e.target.style.background = "rgba(255, 255, 255, 0.95)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            e.target.style.background = "rgba(255, 255, 255, 0.9)";
          }}
        >
          💭 心情签
        </div>
        
        <div 
          style={buttonStyle} 
          onClick={() => setCurrentPage("link")}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            e.target.style.background = "rgba(255, 255, 255, 0.95)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            e.target.style.background = "rgba(255, 255, 255, 0.9)";
          }}
        >
          🔗 链接收藏夹
        </div>

        {/* 游戏描述卡片 */}
        <div style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          textAlign: "center"
        }}>
          <h3 style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px"
          }}>
            🎮 游戏说明
          </h3>
          <p style={{
            fontSize: "12px",
            color: "#6b7280",
            lineHeight: "1.4",
            margin: 0
          }}>
            选择你感兴趣的小游戏，放松心情，享受乐趣～
          </p>
        </div>
      </div>

      {/* ✨ 游戏提示栏 */}
      <div
        style={{
          borderTop: "1px solid rgba(241, 245, 249, 0.8)",
          background: "rgba(255,255,255,0.9)",
          textAlign: "center",
          padding: "12px 0",
          fontSize: "14px",
          color: "#6b7280",
          backdropFilter: "blur(10px)",
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}
      >
        ✨ 今日运势：好运+80%，适合摸鱼与幻想 💫
      </div>
    </div>
  );
}