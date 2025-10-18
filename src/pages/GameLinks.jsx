import { useState, useEffect } from "react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function GameLinks({ goBack }) {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 加载本地收藏和初始化壁纸
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wh_links") || "[]");
    setLinks(saved);
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

  // 保存到本地
  const saveLinks = (newList) => {
    setLinks(newList);
    localStorage.setItem("wh_links", JSON.stringify(newList));
  };

  const addLink = () => {
    if (!title.trim() || !url.trim()) return alert("请填写标题和链接~");
    
    // 简单的URL验证
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return alert("链接需要以 http:// 或 https:// 开头~");
    }
    
    const item = { id: Date.now(), title, url, note };
    const updated = [item, ...links];
    saveLinks(updated);
    setTitle(""); setUrl(""); setNote("");
  };

  const removeLink = (id) => {
    if (!window.confirm("确定要删除这个链接吗？")) return;
    const updated = links.filter(l => l.id !== id);
    saveLinks(updated);
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
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      ...backgroundStyle // 应用背景样式
    }}>
      {/* 顶栏 */}
      <div style={{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        padding:"14px 16px",
        background:"rgba(255,255,255,0.95)",
        borderBottom:"1px solid rgba(229, 231, 235, 0.8)",
        position:"relative",
        backdropFilter: "blur(10px)"
      }}>
        <button 
          onClick={goBack} 
          style={{
            position:"absolute",
            left:16,
            background:"none",
            border:"none",
            fontSize:18,
            color:"#6b7280",
            cursor:"pointer",
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
          fontSize:16,
          fontWeight:600,
          color:"#374151",
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}>
          链接收藏夹
        </h2>
      </div>

      {/* 分割线 */}
      <div style={{ 
        height:"1px", 
        background:"rgba(241, 245, 249, 0.8)" 
      }}></div>

      {/* 内容 */}
      <div style={{
        flex:1,
        overflowY:"auto",
        padding:"16px"
      }}>
        {/* 输入区 */}
        <div style={{
          background:"rgba(255, 255, 255, 0.9)",
          padding:"16px",
          borderRadius:"12px",
          boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
          marginBottom:"16px",
          border:"1px solid rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)"
        }}>
          <input
            placeholder="标题"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            style={{
              width:"100%",
              padding:"12px",
              border:"1px solid rgba(209, 213, 219, 0.8)",
              borderRadius:"8px",
              marginBottom:"12px",
              fontSize:"14px",
              outline:"none",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(5px)"
            }}
          />
          <input
            placeholder="链接（https:// 开头）"
            value={url}
            onChange={e=>setUrl(e.target.value)}
            style={{
              width:"100%",
              padding:"12px",
              border:"1px solid rgba(209, 213, 219, 0.8)",
              borderRadius:"8px",
              marginBottom:"12px",
              fontSize:"14px",
              outline:"none",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(5px)"
            }}
          />
          <input
            placeholder="备注（可选）"
            value={note}
            onChange={e=>setNote(e.target.value)}
            style={{
              width:"100%",
              padding:"12px",
              border:"1px solid rgba(209, 213, 219, 0.8)",
              borderRadius:"8px",
              fontSize:"14px",
              outline:"none",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(5px)"
            }}
          />
          <button
            onClick={addLink}
            style={{
              marginTop:"16px",
              width:"100%",
              padding:"12px 0",
              background:"#f59e0b",
              color:"#fff",
              border:"none",
              borderRadius:"10px",
              fontWeight:600,
              fontSize:"15px",
              cursor:"pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#d97706";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#f59e0b";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ➕ 添加收藏
          </button>
        </div>

        {/* 链接列表 */}
        {links.length === 0 ? (
          <div style={{
            textAlign:"center",
            color:"#9ca3af",
            padding: "40px 20px",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: "12px",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
            <div style={{ fontSize: "14px", fontWeight: "500" }}>暂无收藏链接~</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>添加你喜欢的网站链接吧</div>
          </div>
        ) : (
          links.map((link)=>(
            <div 
              key={link.id} 
              style={{
                background:"rgba(255, 255, 255, 0.9)",
                padding:"16px",
                borderRadius:"12px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
                marginBottom:"12px",
                border:"1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
              }}
            >
              <div style={{
                fontWeight:600,
                fontSize:"15px",
                color:"#374151",
                marginBottom: "6px"
              }}>
                {link.title}
              </div>
              <div style={{
                fontSize:"13px",
                color:"#3b82f6",
                margin:"6px 0",
                wordBreak:"break-all"
              }}>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "#3b82f6",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "#1d4ed8";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "#3b82f6";
                  }}
                >
                  {link.url}
                </a>
              </div>
              {link.note && (
                <div style={{
                  fontSize:"13px",
                  color:"#6b7280",
                  fontStyle: "italic",
                  marginTop: "6px"
                }}>
                  📝 {link.note}
                </div>
              )}
              <div style={{
                display:"flex",
                justifyContent:"flex-end",
                marginTop:"12px"
              }}>
                <button
                  onClick={()=>removeLink(link.id)}
                  style={{
                    border:"none",
                    background:"rgba(254, 226, 226, 0.9)",
                    color:"#b91c1c",
                    borderRadius:"8px",
                    padding:"6px 12px",
                    fontSize:"13px",
                    fontWeight: "500",
                    cursor:"pointer",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(5px)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(254, 202, 202, 0.9)";
                    e.target.style.transform = "scale(0.98)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(254, 226, 226, 0.9)";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}