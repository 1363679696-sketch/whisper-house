import { useState, useEffect } from "react";
import apiService from "../utils/apiService";
import { callAI } from "../utils/apiClient";
import localforage from "localforage";
import { useTheme } from "../ThemeContext";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function GameMood({ goBack }) {
  const { currentFont } = useTheme();
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastPickTime, setLastPickTime] = useState(0);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 初始化加载本地签文和壁纸
  useEffect(() => {
    (async () => {
      const saved = (await localforage.getItem("mood_history")) || [];
      setHistory(saved);
    })();

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

  // 保存签文到本地
  const saveHistory = async (newList) => {
    setHistory(newList);
    await localforage.setItem("mood_history", newList);
  };

  // 清除签文
  const clearHistory = async () => {
    if (window.confirm("确定要清空所有签文吗？")) {
      await localforage.removeItem("mood_history");
      setHistory([]);
    }
  };

  // ✨ 抽签逻辑
  const randomMood = async () => {
    const now = Date.now();
    if (now - lastPickTime < 5000) {
      setCurrent("⏳ 休息一下再抽哦，小运气在酝酿中…✨");
      return;
    }
    setLastPickTime(now);
    setLoading(true);
    setCurrent("");

    // 震动提示：开始抽签
    if (navigator.vibrate) navigator.vibrate(80);

    try {
      const currentConfig = apiService.getCurrentConfig();
      if (!currentConfig) {
        setCurrent("❌ 请先在设置中配置AI接口。");
        setLoading(false);
        return;
      }

      // 🪶 改进版 prompt
      const prompt = `请生成一句温柔治愈、富有诗意的小短句，作为"今日心情签文"。

创作要求：
- 不超过18个汉字，简洁而有深意
- 可以带一个贴切的emoji
- 避免使用"好运""幸福""快乐"等直白词汇
- 避免使用"正在路上""悄悄来临"等常见句式
- 要求意象新颖，比喻独特，有画面感

创作方向参考：
- 可以从细微的自然现象入手（露珠、晨雾、光影等）
- 可以描写内心的微妙感受（宁静、期待、释然等）
- 可以结合季节时令的独特气息
- 可以创造独特的比喻和联想

优秀示例：
- 晨露在叶尖打盹，时间慢了下来。💤
- 书页间夹着的光，是去年的秋天。📖
- 雨滴在窗上作画，心事成了风景。🎨
- 月光为夜路铺了层薄纱，脚步都轻了。👣
- 咖啡的香气，把清晨卷成了漩涡。☕

请创作一句全新的、富有诗意的签文，要求意象独特、语言清新，避免与示例重复。`;

      const result = await callAI({
        apiKey: currentConfig.apiKey,
        baseUrl: currentConfig.baseUrl,
        model: currentConfig.defaultModel,
        messages: [
          { role: "system", content: "你是一位温柔的签文诗人。" },
          { role: "user", content: prompt },
        ],
      });

      const trimmed = result.trim().replace(/^[""]|[""]$/g, "");

      // 检查重复签
      if (history.includes(trimmed)) {
        setCurrent("🍃 命运说这签刚来过，不妨换个时辰再试～");
        setLoading(false);
        return;
      }

      setCurrent(trimmed);
      const newList = [trimmed, ...history].slice(0, 6);
      await saveHistory(newList);

      // 震动提示：签文出现
      setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate([50, 40, 50]);
      }, 100);
    } catch (err) {
      console.error("生成签文失败:", err);
      setCurrent("⚠️ 网络好像打了个盹，请稍后再试。");
    }

    setLoading(false);
  };

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
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: currentFont.fontFamily,
      ...backgroundStyle, // 应用背景样式
      transition: "font-family 0.3s ease, background 0.3s ease" // 添加背景过渡效果
    }}>
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
          onClick={goBack}
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
          心情签
        </h2>
      </div>

      {/* 内容区 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 16px",
          textAlign: "center",
          overflowY: "auto",
        }}
      >
        {/* 抽签卡片 */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px",
            padding: "24px",
            width: "90%",
            maxWidth: "340px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginTop: "30px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}
        >
          <button
            onClick={randomMood}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              background: loading ? "#fcd34d" : "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
              transition: "all 0.3s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              fontFamily: "inherit"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = "#d97706";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = "#f59e0b";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
              }
            }}
          >
            {loading ? "⏳ 抽签中..." : "✨ 抽取一签"}
          </button>

          {current && (
            <div
              style={{
                marginTop: "24px",
                fontSize: "17px",
                color: "#374151",
                lineHeight: 1.6,
                transition: "opacity 0.6s ease, transform 0.6s ease",
                opacity: current ? 1 : 0,
                transform: "translateY(0)",
                fontWeight: "500",
                textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
              }}
            >
              {current}
            </div>
          )}
        </div>

        {/* 历史签文卡片 */}
        {history.length > 0 && (
          <div
            style={{
              width: "90%",
              maxWidth: "340px",
              marginTop: "32px",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              padding: "20px 16px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "12px"
            }}>
              <div style={{ 
                fontWeight: "600", 
                color: "#374151", 
                fontSize: "15px",
                textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
              }}>
                📜 最近签文
              </div>
              <button
                onClick={clearHistory}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(239, 68, 68, 0.2)";
                  e.target.style.transform = "scale(0.98)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(239, 68, 68, 0.1)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                清空
              </button>
            </div>

            <div style={{ 
              marginTop: "10px", 
              textAlign: "left", 
              color: "#6b7280", 
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              {history.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: "8px",
                  padding: "6px 0",
                  borderBottom: index < history.length - 1 ? "1px solid rgba(229, 231, 235, 0.5)" : "none"
                }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态提示 */}
        {history.length === 0 && (
          <div style={{
            width: "90%",
            maxWidth: "340px",
            marginTop: "32px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "16px",
            padding: "30px 20px",
            textAlign: "center",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💭</div>
            <div style={{ 
              fontSize: "14px", 
              color: "#6b7280",
              fontWeight: "500",
              marginBottom: "4px"
            }}>
              还没有签文记录
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#9ca3af"
            }}>
              抽一签来开启今日心情吧
            </div>
          </div>
        )}
      </div>

      {/* 底部运势栏 */}
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
        ✨ 今日运势：心情平稳，灵感上升中 ☁️
      </div>
    </div>
  );
}