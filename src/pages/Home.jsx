import { useState, useEffect } from "react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

// 内联的 AppIcon 组件
function AppIcon({ app, onClick, size = "medium" }) {
  const [customIcon, setCustomIcon] = useState(null);

  useEffect(() => {
    const savedIcons = JSON.parse(localStorage.getItem("customIcons") || "{}");
    if (savedIcons[app.id]) {
      setCustomIcon(savedIcons[app.id]);
    }
  }, [app.id]);

  // 尺寸配置
  const sizeConfig = {
    small: { 
      icon: 20,
      container: 40,
      fontSize: 10,
      totalHeight: 64
    },
    medium: { 
      icon: 24,
      container: 52,
      fontSize: 11,
      totalHeight: 72
    },
    large: { 
      icon: 28,
      container: 60,
      fontSize: 12,
      totalHeight: 80
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
        justifyContent: "flex-start",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: "6px 2px 2px 2px"
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
        marginBottom: "4px",
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
      
      {/* 应用名称 */}
      <div style={{ 
        fontSize: `${config.fontSize}px`, 
        fontWeight: "600",
        color: "#374151",
        textAlign: "center",
        lineHeight: "1.3",
        width: "100%",
        height: `${config.fontSize * 2}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "0 2px"
      }}>
        {app.name}
      </div>
    </div>
  );
}

export default function Home({ setCurrentApp }) {
  // DOCK栏应用
  const dockApps = [
    { name: "聊天", icon: "💬", id: "chat" },
    { name: "设置", icon: "🛠️", id: "settings" },
    { name: "API", icon: "🚀", id: "api" },
  ];

  // 上方网格应用
  const gridApps = [
    { name: "日记", icon: "📔", id: "diary" },
    { name: "备忘录", icon: "📝", id: "memo" },
    { name: "记忆馆", icon: "📂", id: "memory" },
    { name: "记忆回廊", icon: "🏛️", id: "memoryCorridor" },
    { name: "状态", icon: "🧠", id: "status" },
    { name: "设定手册", icon: "🪶", id: "characterSheet" },
    { name: "游戏", icon: "🎮", id: "game" },
  ];

  const [wallpaper, setWallpaper] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("homeTheme") || "pink");
  const [title, setTitle] = useState(localStorage.getItem("homeTitle") || "Whisper House");
  
  // 待办列表
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("homeTodos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "写日记", done: false },
      { id: 2, text: "复习英语", done: true },
    ];
  });

  // 待办输入框
  const [newTodo, setNewTodo] = useState("");
  const addTodo = () => {
    const t = newTodo.trim();
    if (!t) return;
    setTodos([...todos, { id: Date.now(), text: t, done: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(it => it.id === id ? { ...it, done: !it.done } : it));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(it => it.id !== id));
  };

  // 监听壁纸变化
  useEffect(() => {
    const updateWallpaper = () => {
      // 使用 wallpaperHelper 获取壁纸，优先级：主页壁纸 > 全局壁纸
      const wallpaperUrl = getWallpaper('home');
      setWallpaper(wallpaperUrl);
    };

    // 初始设置
    updateWallpaper();

    // 监听壁纸变化事件
    const handleWallpaperChange = (event) => {
      if (event.detail.type === 'home' || event.detail.type === 'global') {
        updateWallpaper();
      }
    };

    window.addEventListener('wallpaperChanged', handleWallpaperChange);
    return () => window.removeEventListener('wallpaperChanged', handleWallpaperChange);
  }, []);

  // 监听主题和标题变化
  useEffect(() => {
    setTheme(localStorage.getItem("homeTheme") || "pink");
    setTitle(localStorage.getItem("homeTitle") || "Whisper House");
  }, []);
  
  useEffect(() => {
    localStorage.setItem("homeTodos", JSON.stringify(todos));
  }, [todos]);

  // 获取当前时间
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 渐变主题配色（备用背景）
  const themes = {
    pink: "linear-gradient(to bottom, #fce7f3, #fbcfe8)",
    blue: "linear-gradient(to bottom, #dbeafe, #bfdbfe)",
    purple: "linear-gradient(to bottom, #ede9fe, #c4b5fd)",
    dark: "linear-gradient(to bottom, #1f2937, #111827)",
  };

  // 统一的文字颜色
  const textColor = "#374151";
  const secondaryTextColor = "#6b7280";

  // 构建背景样式
  const backgroundStyle = wallpaper 
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }
    : {
        backgroundImage: themes[theme] || themes.pink,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "16px",
        fontFamily: "sans-serif",
        ...backgroundStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 自定义状态栏 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        marginBottom: "8px"
      }}>
        {/* 时间 - 左边 */}
        <div style={{
          fontSize: "15px",
          fontWeight: "700",
          color: textColor,
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}>
          {currentTime}
        </div>

        {/* 在线状态和电量 - 右边 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {/* 在线状态 - 小绿点 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: "600",
            color: textColor
          }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981"
            }}></div>
            在线
          </div>

          {/* iPhone风格电池 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <div style={{
              fontSize: "12px",
              fontWeight: "600",
              color: textColor
            }}>
              100%
            </div>
            <div style={{
              width: "22px",
              height: "12px",
              border: "1.5px solid",
              borderColor: textColor,
              borderRadius: "2px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "1px",
                left: "1px",
                right: "1px",
                bottom: "1px",
                backgroundColor: textColor,
                borderRadius: "1px"
              }}></div>
            </div>
            <div style={{
              width: "2px",
              height: "4px",
              backgroundColor: textColor,
              borderRadius: "0 1px 1px 0"
            }}></div>
          </div>
        </div>
      </div>

      {/* 居中标题 */}
      <h2
        style={{
          marginTop: "8px",
          marginBottom: "24px",
          color: textColor,
          textShadow: wallpaper ? "0 1px 3px rgba(255,255,255,0.8)" : "none",
          fontSize: "24px",
          fontWeight: "700",
          textAlign: "center"
        }}
      >
        {title}
      </h2>

      {/* 待办卡片 */}
      <div style={{
        padding: "20px",
        borderRadius: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
      }}
      >
        <h3 style={{
          fontSize: "18px",
          fontWeight: "700",
          color: textColor,
          marginBottom: "16px",
          textAlign: "center"
        }}>
          待办事项
        </h3>

        {/* 输入框 + 添加按钮 */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px"
        }}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="写下你的计划…"
            style={{
              flex: 1,
              fontSize: "14px",
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              outline: "none",
              color: "#374151"
            }}
          />
          <button
            onClick={addTodo}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              background: "linear-gradient(to right, #ec4899, #db2777)",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(to right, #db2777, #be185d)";
              e.target.style.transform = "scale(0.98)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(to right, #ec4899, #db2777)";
              e.target.style.transform = "scale(1)";
            }}
          >
            添加
          </button>
        </div>

        {/* 待办列表 */}
        <div style={{
          maxHeight: "200px",
          overflowY: "auto",
          borderRadius: "12px",
          paddingRight: "4px"
        }}
        className="todo-scrollbar"
        >
          <ul style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            margin: 0,
            padding: 0
          }}>
            {todos.length > 0 ? (
              todos.map((todo) => (
                <li
                  key={todo.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease",
                    minHeight: "44px"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span
                    onClick={() => toggleTodo(todo.id)}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      textDecoration: todo.done ? "line-through" : "none",
                      color: todo.done ? "#9ca3af" : "#374151",
                      fontWeight: todo.done ? "400" : "600",
                      flex: 1
                    }}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: "linear-gradient(to right, #ef4444, #dc2626)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "linear-gradient(to right, #dc2626, #b91c1c)";
                      e.target.style.transform = "scale(0.95)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "linear-gradient(to right, #ef4444, #dc2626)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    删除
                  </button>
                </li>
              ))
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                borderRadius: "12px",
                padding: "20px 16px",
                minHeight: "60px"
              }}>
                <p style={{
                  fontSize: "14px",
                  color: secondaryTextColor,
                  textAlign: "center",
                  fontStyle: "italic",
                  margin: 0,
                  fontWeight: "500"
                }}>
                  还没有待办哦
                </p>
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* App 图标区 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "80px",
        justifyItems: "center"
      }}>
        {gridApps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            onClick={() => setCurrentApp(app.id)}
            size="medium"
          />
        ))}
      </div>

      {/* 底部 DOCK 栏 */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "500px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "24px",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-around",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          alignItems: "flex-start"
        }}
      >
        {dockApps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            onClick={() => setCurrentApp(app.id)}
            size="small"
          />
        ))}
      </div>
    </div>
  );
}