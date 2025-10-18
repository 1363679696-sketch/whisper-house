import { useState, useEffect } from "react";

export default function AppIcon({ app, onClick, size = "medium" }) {
  const [customIcon, setCustomIcon] = useState(null);

  // 从 localStorage 加载自定义图标
  useEffect(() => {
    const savedIcons = JSON.parse(localStorage.getItem("customIcons") || "{}");
    if (savedIcons[app.id]) {
      setCustomIcon(savedIcons[app.id]);
    }
  }, [app.id]);

  // 尺寸配置 - 修复文字被遮挡问题
  const sizeConfig = {
    small: { 
      icon: 20,           // 减小图标字体大小
      container: 40,      // 减小容器大小
      fontSize: 10,
      totalHeight: 64     // 增加总高度给文字更多空间
    },
    medium: { 
      icon: 24,           // 减小图标字体大小
      container: 52,      // 减小容器大小
      fontSize: 11,
      totalHeight: 72     // 增加总高度
    },
    large: { 
      icon: 28,           // 减小图标字体大小
      container: 60,      // 减小容器大小
      fontSize: 12,
      totalHeight: 80     // 增加总高度
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <div
      onClick={onClick}
      style={{
        width: `${config.container}px`,
        height: `${config.totalHeight}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: "4px 2px"  // 减少内边距
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      {/* 图标容器 */}
      <div style={{ 
        width: `${config.container}px`,
        height: `${config.container}px`,
        borderRadius: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${config.icon}px`,
        marginBottom: "6px",  // 减少底部间距
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        flexShrink: 0
      }}>
        {customIcon ? (
          <img 
            src={customIcon} 
            alt={app.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          app.icon
        )}
      </div>
      
      {/* 应用名称 - 修复文字被遮挡 */}
      <div style={{ 
        fontSize: `${config.fontSize}px`, 
        fontWeight: "600",
        color: "#374151",
        textAlign: "center",
        lineHeight: "1.2",
        width: "100%",
        height: `${config.fontSize * 1.8}px`,  // 确保文字容器高度
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }}>
        {app.name}
      </div>
    </div>
  );
}