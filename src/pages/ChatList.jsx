import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function ChatList({ setCurrentApp, rooms, setRooms, setActiveRoom, activeRoom }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
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

  // 消息截断函数
  const truncateMessage = (text, maxLength = 10) => {
    if (!text) return "暂无消息";
    // 移除换行和多余空格
    const cleanText = text.replace(/\s+/g, ' ').trim();
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  };

  // 新增房间
  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `新聊天室 ${rooms.length + 1}`,
      messages: [
        {
          sender: "system",
          text: "聊天室已创建～",
          time: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        },
      ],
      theme: "pink",
    };
    setRooms([...rooms, newRoom]);
  };

  // 修复删除逻辑
  const confirmDelete = (roomId) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setConfirmDeleteId(null);
    
    // 如果删除的是当前活跃的房间，清空活跃房间
    if (activeRoom && activeRoom.id === roomId) {
      setActiveRoom(null);
    }
  };

  const enterRoom = (room) => {
    setActiveRoom(room);
    setCurrentApp("chatroom");
  };

  // 🆕 进入朋友圈
  const enterMoments = () => {
    setCurrentApp("moments");
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
        background: 'linear-gradient(to bottom, #ffffff, #fdf2f8)'
      };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      ...backgroundStyle // 应用背景样式
    }}>
      {/* 顶部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderBottom: '1px solid rgba(255, 255, 255, 1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div 
          onClick={() => setCurrentApp("home")}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={20} color="#6b7280" />
        </div>
        <span style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#374151' 
        }}>
          聊天室列表
        </span>
        <div 
          onClick={addRoom}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Plus size={20} color="#ec4899" />
        </div>
      </div>

      {/* 房间列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '8px',
              cursor: 'pointer',
              border: '1px solid rgba(243, 244, 246, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            {/* 左侧：房间名 + 最新消息 */}
            <div 
              style={{ flex: 1 }} 
              onClick={() => enterRoom(room)}
            >
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#111827' 
              }}>
                {room.name}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '4px'
              }}>
                {truncateMessage(room.messages[room.messages.length - 1]?.text)}
              </div>
            </div>

            {/* 右侧：时间 + 删除 */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              marginLeft: '12px'
            }}>
              <span style={{ 
                fontSize: '11px', 
                color: '#9ca3af',
                marginBottom: '8px'
              }}>
                {room.messages[room.messages.length - 1]?.time}
              </span>
              <div 
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡
                  setConfirmDeleteId(room.id);
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Trash2 size={16} color="#9ca3af" />
              </div>
            </div>
          </div>
        ))}

        {/* 🆕 朋友圈入口卡片 */}
        <div
          onClick={enterMoments}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            marginTop: '8px',
            cursor: 'pointer',
            border: '1px solid rgba(243, 244, 246, 0.8)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.backgroundColor = 'rgba(253, 242, 248, 0.95)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(252, 231, 243, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            fontSize: '18px',
            backdropFilter: 'blur(5px)'
          }}>
            💫
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              朋友圈
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              marginTop: '2px'
            }}>
              分享生活，与TA互动
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            {rooms.length > 0 ? '查看动态' : '暂无动态'}
          </div>
        </div>

        {/* 空状态 */}
        {rooms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            marginTop: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>暂无聊天室</div>
            <div style={{ fontSize: '12px' }}>点击右上角 + 创建第一个聊天室</div>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {confirmDeleteId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            padding: '24px',
            width: '288px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#374151',
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              确定要删除这个聊天室吗？
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: '12px'
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#374151',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setConfirmDeleteId(null)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.transform = 'scale(0.98)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                取消
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => confirmDelete(confirmDeleteId)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'scale(0.98)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}