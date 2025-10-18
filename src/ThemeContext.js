import { createContext, useState, useContext, useEffect } from "react"; // 🆕 添加 useEffect

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("homeTheme") || "pink");

  // 新增：聊天背景状态
  const [chatBackground, setChatBackground] = useState(() => {
    return localStorage.getItem("chatBackground") || null;
  });

  // ✅ 新增：自定义主题颜色支持
  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem("customTheme");
    return saved ? JSON.parse(saved) : null;
  });

  // ✅ 新增：字体状态管理
  const [currentFont, setCurrentFont] = useState(() => {
    const saved = localStorage.getItem("currentFont");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("解析字体设置失败:", error);
      }
    }
    // 默认字体
    return {
      id: "system-default",
      name: "系统默认",
      description: "清晰易读，与您设备系统风格完美统一",
      fontFamily: "system-ui, -apple-system, sans-serif",
      preview: "系统默认字体"
    };
  });

  // 🆕 获取自定义字体列表
  const [customFonts, setCustomFonts] = useState(() => {
    return JSON.parse(localStorage.getItem("customFonts") || "[]");
  });

  // 🆕 全局字体注册效果
  useEffect(() => {
    // 注册所有自定义字体
    customFonts.forEach(font => {
      if (font.custom && font.url && !document.getElementById(`font-${font.id}`)) {
        const style = document.createElement('style');
        style.id = `font-${font.id}`;
        style.textContent = `
          @font-face {
            font-family: '${font.name}';
            src: url('${font.url}');
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
      }
    });

    // 清理函数
    return () => {
      customFonts.forEach(font => {
        const style = document.getElementById(`font-${font.id}`);
        if (style) {
          document.head.removeChild(style);
        }
      });
    };
  }, [customFonts]);

  const setChatBackgroundImage = (src) => {
    setChatBackground(src);
    localStorage.setItem("chatBackground", src);
  };

  const clearChatBackground = () => {
    setChatBackground(null);
    localStorage.removeItem("chatBackground");
  };

  // ✅ 新增：更新字体设置的函数
  const updateCurrentFont = (font) => {
    setCurrentFont(font);
    localStorage.setItem("currentFont", JSON.stringify(font));
  };

  // 🆕 更新自定义字体列表的函数
  const updateCustomFonts = (fonts) => {
    setCustomFonts(fonts);
    localStorage.setItem("customFonts", JSON.stringify(fonts));
  };

  const themeStyles = {
    pink: { background: "linear-gradient(to right, #ffe6f0, #fff5f9)", color: "black" },
    blue: { background: "linear-gradient(to right, #dbeafe, #f0f9ff)", color: "black" },
    purple: { background: "linear-gradient(to right, #f3e8ff, #faf5ff)", color: "black" },
    // 🆕 新增黄白和绿白主题
    yellow: { background: "linear-gradient(to right, #fef3c7, #fef7cd)", color: "black" },
    green: { background: "linear-gradient(to right, #d1fae5, #ecfdf5)", color: "black" },
    // ❌ 移除夜间模式
    // dark: { background: "#1e1e1e", color: "white" },
    default: { background: "white", color: "black" },
    custom: customTheme || { background: "white", color: "black" }, // ✅ 加入 custom 支持
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        chatBackground,
        setChatBackgroundImage,
        clearChatBackground,
        themeStyles,
        customTheme,
        setCustomTheme,
        // ✅ 新增字体相关状态和函数
        currentFont,
        setCurrentFont: updateCurrentFont,
        customFonts,
        setCustomFonts: updateCustomFonts, // 🆕 暴露自定义字体列表
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}