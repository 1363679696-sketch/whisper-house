import { useState, useEffect } from "react";
import { Search, Trash2, Star, Folder, Calendar, BarChart3, Filter, RefreshCw } from "lucide-react";
import localforage from "localforage";
import { useTheme } from "../ThemeContext";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function MemoryCorridor({ setCurrentApp }) {
  const { currentFont } = useTheme();
  const [memories, setMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalChatrooms: 0,
    totalTokens: 0,
    chatroomStats: []
  });

  // 🆕 新增状态
  const [expandedRoom, setExpandedRoom] = useState(null); // 控制房间展开
  const [editedMemories, setEditedMemories] = useState({});

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

  // 🆕 修改：只从本地存储加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 🆕 直接从本地存储加载记忆
      const localMemories = await localforage.getItem("whisper_memories") || [];
      console.log("📦 从本地存储加载记忆:", localMemories.length);
      
      // 🆕 本地数据去重
      const seenIds = new Set();
      const uniqueLocalMemories = localMemories.filter(memory => {
        if (!seenIds.has(memory.id)) {
          seenIds.add(memory.id);
          return true;
        }
        return false;
      });
      
      setMemories(uniqueLocalMemories);
      
      // 🆕 基于本地数据计算统计
      const localStats = {
        totalMemories: uniqueLocalMemories.length,
        totalChatrooms: new Set(uniqueLocalMemories.map(m => m.chatroom_id)).size,
        totalTokens: uniqueLocalMemories.reduce((sum, m) => sum + (m.tokens || 0), 0),
        importantMemories: uniqueLocalMemories.filter(m => (m.importance || 0) > 0.7).length,
        chatroomStats: []
      };
      
      setStats(localStats);
    } catch (error) {
      console.error('加载本地数据失败:', error);
      alert('加载记忆数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 修改：只搜索本地数据
  const searchMemories = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      // 🆕 从本地存储搜索
      const localMemories = await localforage.getItem("whisper_memories") || [];
      const filteredMemories = localMemories.filter(memory => 
        memory.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMemories(filteredMemories);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和搜索监听
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchMemories();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 按聊天室分组
  const chatrooms = memories.reduce((acc, memory) => {
    if (!acc[memory.chatroom_id]) {
      acc[memory.chatroom_id] = {
        id: memory.chatroom_id,
        name: memory.chatroom_name,
        memories: [],
        memoryCount: 0,
        lastActive: memory.timestamp
      };
    }
    acc[memory.chatroom_id].memories.push(memory);
    acc[memory.chatroom_id].memoryCount++;
    return acc;
  }, {});

  // 🆕 修改：只删除本地数据
  const deleteMemory = async (memoryId) => {
    console.log("🗑️ 删除本地记忆:", memoryId);
    
    if (!window.confirm("确定要删除这条记忆吗？")) return;

    try {
      // 🆕 只从本地存储删除
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.filter((m) => m.id !== memoryId);
      await localforage.setItem("whisper_memories", updated);
      console.log("✅ 已从本地删除记忆");
      
      // 更新UI
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      alert('记忆删除成功');
    } catch (error) {
      console.error("删除失败:", error);
      alert('删除失败: ' + error.message);
    }
  };

  // 🆕 修改：只清空本地聊天室记忆
  const clearChatroomMemories = async (chatroomId) => {
    if (!window.confirm("确定要清空这个聊天室的所有记忆吗？此操作不可恢复！")) return;

    try {
      // 🆕 只从本地存储清空
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.filter((m) => m.chatroom_id !== chatroomId);
      await localforage.setItem("whisper_memories", updated);
      
      // 重新加载数据
      await loadData();
      alert('聊天室记忆已清空');
    } catch (error) {
      alert('清空失败: ' + error.message);
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 重要性显示
  const renderImportance = (importance) => {
    if (importance > 0.7) return "⭐";
    if (importance > 0.4) return "✨";
    return "";
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
      minHeight: "100vh",
      padding: "16px",
      fontFamily: currentFont.fontFamily,
      ...backgroundStyle, // 应用背景样式
      display: "flex",
      flexDirection: "column",
      transition: "font-family 0.3s ease, background 0.3s ease" // 添加背景过渡效果
    }}>
      {/* 顶部导航 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div 
            onClick={() => setCurrentApp("home")}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.8)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.8)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ←
          </div>
          <h1 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#374151",
            margin: 0,
            textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
          }}>
           记忆回廊
          </h1>
        </div>
        
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              padding: "8px",
              backgroundColor: loading ? "rgba(209, 213, 219, 0.8)" : "rgba(255,255,255,0.8)",
              color: "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "rgba(255,255,255,0.8)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
          
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "overview" ? "#ec4899" : "rgba(255,255,255,0.8)",
              color: activeTab === "overview" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "overview") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "overview") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.8)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            <BarChart3 size={14} style={{ marginRight: "4px" }} />
            总览
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "rooms" ? "#ec4899" : "rgba(255,255,255,0.8)",
              color: activeTab === "rooms" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "rooms") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "rooms") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.8)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            <Folder size={14} style={{ marginRight: "4px" }} />
            房间
          </button>
          <button          
            onClick={() => setActiveTab("search")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "search" ? "#ec4899" : "rgba(255,255,255,0.8)",
              color: activeTab === "search" ? "white" : "#374151",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "search") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.9)";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "search") {
                e.target.style.backgroundColor = "rgba(255,255,255,0.8)";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            <Search size={14} style={{ marginRight: "4px" }} />
            搜索
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div style={{
        position: "relative",
        marginBottom: "20px"
      }}>
        <Search 
          size={18} 
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af"
          }} 
        />
        <input
          type="text"
          placeholder="在记忆长廊中搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px 12px 44px",
            borderRadius: "12px",
            border: "1px solid rgba(229, 231, 235, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            fontSize: "14px",
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontFamily: "inherit",
            backdropFilter: "blur(5px)",
            transition: "all 0.3s ease"
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
            e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }}
        />
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "20px",
          color: "#6b7280",
          fontSize: "14px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "12px",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          <RefreshCw size={20} className="spin" style={{ marginBottom: "8px" }} />
          <div>加载中...</div>
        </div>
      )}

      {/* 内容区域 */}
      {!loading && (
        <div style={{
          flex: 1,
          overflowY: "auto"
        }}>
          {activeTab === "overview" && (
            <div>
              {/* 数据统计卡片 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{
                  padding: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#ec4899" }}>
                    {stats.totalMemories}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>总记忆数</div>
                </div>
                <div style={{
                  padding: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>
                    {stats.totalChatrooms}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>聊天室数量</div>
                </div>
                
                <div style={{
                  padding: "20px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#f59e0b" }}>
                    {stats.totalTokens}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>总Token数</div>
                </div>
              </div>
            </div>
          )}

          {/* 🏠 房间页面 - 修改为开发中提示 */}
          {activeTab === "rooms" && (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#374151",
                marginBottom: "8px"
              }}>
                房间功能正在开发中
              </h3>
              <p style={{ 
                fontSize: "14px", 
                color: "#6b7280",
                lineHeight: "1.5"
              }}>
                我们正在重新设计房间管理功能，<br/>
                让记忆整理更加智能和便捷
              </p>
            </div>
          )}

          {/* 🔍 搜索页面 - 修改为开发中提示 */}
          {activeTab === "search" && (
            <div style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#374151",
                marginBottom: "8px"
              }}>
                搜索功能正在开发中
              </h3>
              <p style={{ 
                fontSize: "14px", 
                color: "#6b7280",
                lineHeight: "1.5"
              }}>
                我们正在优化搜索算法，<br/>
                让记忆检索更加精准和快速
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}