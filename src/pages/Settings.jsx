import { useState, useEffect } from "react";
import { ArrowLeft, Image, Palette, Type, Heading, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "../ThemeContext";

// 壁纸管理工具函数
const wallpaperHelper = {
  // 获取壁纸URL
  getWallpaper: (type = 'global') => {
    try {
      const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
      
      // 优先级：特定页面壁纸 > 全局壁纸 > 默认壁纸
      if (wallpapers[type]) {
        return wallpapers[type];
      }
      if (type !== 'global' && wallpapers.global) {
        return wallpapers.global;
      }
      return null; // 没有壁纸时返回null
    } catch (error) {
      console.error('获取壁纸失败:', error);
      return null;
    }
  },

  // 设置壁纸
  setWallpaper: (type, url) => {
    try {
      const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
      wallpapers[type] = url;
      localStorage.setItem('app_wallpapers', JSON.stringify(wallpapers));
      
      // 触发壁纸更新事件
      window.dispatchEvent(new CustomEvent('wallpaperChanged', { 
        detail: { type, url } 
      }));
      
      return true;
    } catch (error) {
      console.error('设置壁纸失败:', error);
      return false;
    }
  },

  // 清除壁纸
  clearWallpaper: (type) => {
    try {
      const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
      delete wallpapers[type];
      localStorage.setItem('app_wallpapers', JSON.stringify(wallpapers));
      
      window.dispatchEvent(new CustomEvent('wallpaperChanged', { 
        detail: { type, url: null } 
      }));
      
      return true;
    } catch (error) {
      console.error('清除壁纸失败:', error);
      return false;
    }
  },

  // 上传图片并转换为base64
  uploadWallpaper: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // 获取所有壁纸设置
  getAllWallpapers: () => {
    try {
      return JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
    } catch (error) {
      console.error('获取壁纸配置失败:', error);
      return {};
    }
  }
};

// 修改 WallpaperSettings 组件
function WallpaperSettings({ setWallpapers }) {
  const [previews, setPreviews] = useState(() => {
    const saved = localStorage.getItem("wallpapers");
    return saved ? JSON.parse(saved) : [];
  });

  const [wallpaperState, setWallpaperState] = useState({
    global: wallpaperHelper.getWallpaper('global'),
    home: wallpaperHelper.getWallpaper('home'),
    chat: wallpaperHelper.getWallpaper('chat')
  });

  const { chatBackground, setChatBackgroundImage, clearChatBackground } = useTheme();

  // 监听壁纸变化
  useEffect(() => {
    const handleWallpaperChange = () => {
      setWallpaperState({
        global: wallpaperHelper.getWallpaper('global'),
        home: wallpaperHelper.getWallpaper('home'),
        chat: wallpaperHelper.getWallpaper('chat')
      });
    };

    window.addEventListener('wallpaperChanged', handleWallpaperChange);
    return () => window.removeEventListener('wallpaperChanged', handleWallpaperChange);
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [...previews];
    
    for (const file of files) {
      try {
        const base64Url = await wallpaperHelper.uploadWallpaper(file);
        const objectUrl = URL.createObjectURL(file);
        newPreviews.push(objectUrl);
      } catch (error) {
        console.error('上传壁纸失败:', error);
      }
    }
    
    setPreviews(newPreviews);
    localStorage.setItem("wallpapers", JSON.stringify(newPreviews));
    setWallpapers(newPreviews);
  };

  const removeWallpaper = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    localStorage.setItem("wallpapers", JSON.stringify(newPreviews));
    setWallpapers(newPreviews);
  };

  const applyWallpaper = async (src, type) => {
    // 如果是文件URL，转换为base64
    let finalSrc = src;
    if (src.startsWith('blob:')) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        finalSrc = await wallpaperHelper.uploadWallpaper(blob);
      } catch (error) {
        console.error('转换壁纸失败:', error);
        finalSrc = src;
      }
    }

    wallpaperHelper.setWallpaper(type, finalSrc);
    
    if (type === 'chat') {
      setChatBackgroundImage(finalSrc);
    }
    
    alert(`已应用为${getWallpaperTypeName(type)}壁纸 ✅`);
  };

  const clearWallpaper = (type) => {
    wallpaperHelper.clearWallpaper(type);
    
    if (type === 'chat') {
      clearChatBackground();
    }
    
    alert(`已清除${getWallpaperTypeName(type)}壁纸 ✅`);
  };

  const getWallpaperTypeName = (type) => {
    const names = {
      global: '全局',
      home: '主页',
      chat: '聊天'
    };
    return names[type] || type;
  };

  // 毛玻璃卡片样式
  const cardStyle = {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  // 按钮样式
  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* 上传壁纸 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: 'rgba(252, 231, 243, 0.9)',
          color: '#ec4899',
          fontWeight: '500',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '2px dashed rgba(251, 207, 232, 0.8)',
          fontSize: '16px',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.2)';
          e.target.style.backgroundColor = 'rgba(251, 207, 232, 0.9)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
          e.target.style.backgroundColor = 'rgba(252, 231, 243, 0.9)';
        }}
        >
          📷 上传壁纸
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* 壁纸设置区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
        {/* 全局壁纸设置 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>全局壁纸</span>
            {wallpaperState.global && (
              <button
                onClick={() => clearWallpaper('global')}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'rgba(254, 242, 242, 0.9)',
                  color: '#dc2626'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)'}
              >
                清除
              </button>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            设置后所有页面都会使用此壁纸
          </p>
          {wallpaperState.global && (
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <img 
                src={wallpaperState.global} 
                alt="全局壁纸" 
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover'
                }} 
              />
            </div>
          )}
        </div>

        {/* 主页壁纸设置 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>主页壁纸</span>
            {wallpaperState.home && (
              <button
                onClick={() => clearWallpaper('home')}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'rgba(254, 242, 242, 0.9)',
                  color: '#dc2626'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)'}
              >
                清除
              </button>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            优先级高于全局壁纸
          </p>
          {wallpaperState.home && (
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <img 
                src={wallpaperState.home} 
                alt="主页壁纸" 
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover'
                }} 
              />
            </div>
          )}
        </div>

        {/* 聊天壁纸设置 */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>聊天壁纸</span>
            {wallpaperState.chat && (
              <button
                onClick={() => clearWallpaper('chat')}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'rgba(254, 242, 242, 0.9)',
                  color: '#dc2626'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)'}
              >
                清除
              </button>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            优先级高于全局壁纸
          </p>
          {wallpaperState.chat && (
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <img 
                src={wallpaperState.chat} 
                alt="聊天壁纸" 
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover'
                }} 
              />
            </div>
          )}
        </div>
      </div>

      {/* 壁纸预览和操作 */}
      {previews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            壁纸库
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {previews.map((src, index) => (
              <div key={index} style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img 
                  src={src} 
                  alt={`壁纸 ${index + 1}`} 
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover'
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <button
                    style={{
                      ...buttonStyle,
                      flex: 1
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(252, 231, 243, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                    onClick={() => applyWallpaper(src, 'global')}
                  >
                    全局
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      flex: 1
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(219, 234, 254, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                    onClick={() => applyWallpaper(src, 'home')}
                  >
                    主页
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      flex: 1
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(220, 252, 231, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                    onClick={() => applyWallpaper(src, 'chat')}
                  >
                    聊天
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      color: '#ef4444'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                    onClick={() => removeWallpaper(index)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9ca3af',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <Image size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>暂无上传的壁纸</p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>点击上方按钮上传壁纸</p>
        </div>
      )}
    </div>
  );
}

// 其他组件保持不变...
function ThemeSettings() {
  const { theme, setTheme, setCustomTheme } = useTheme();

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    localStorage.setItem("homeTheme", themeName);
  };

  const resetTheme = () => {
    setTheme("pink");
    localStorage.setItem("homeTheme", "pink");
    localStorage.removeItem("customTheme");
    setCustomTheme(null);
    alert("已恢复默认主题 ✅");
  };

  const themes = [
    { name: "粉白", value: "pink", color: "#ec4899" },
    { name: "蓝白", value: "blue", color: "#3b82f6" },
    { name: "紫白", value: "purple", color: "#8b5cf6" },
    { name: "黄白", value: "yellow", color: "#f59e0b" },
    { name: "绿白", value: "green", color: "#10b981" }
  ];

  // 毛玻璃卡片样式
  const cardStyle = {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* 渐变主题 */}
      <div style={{ marginBottom: '24px', ...cardStyle }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
          渐变主题
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {themes.map((themeItem) => (
            <button
              key={themeItem.value}
              onClick={() => handleThemeChange(themeItem.value)}
              style={{
                padding: '16px 12px',
                borderRadius: '12px',
                border: `2px solid ${theme === themeItem.value ? themeItem.color : 'rgba(229, 231, 235, 0.8)'}`,
                backgroundColor: theme === themeItem.value ? `${themeItem.color}20` : 'rgba(255, 255, 255, 0.8)',
                color: '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                if (theme !== themeItem.value) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (theme !== themeItem.value) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: themeItem.color
              }} />
              {themeItem.name}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div style={{ marginBottom: '24px', ...cardStyle }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
          自定义颜色
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <input
            type="color"
            onChange={(e) => {
              const color = e.target.value;
              const newTheme = {
                background: `linear-gradient(to right, ${color}, white)`,
                color: 'black',
              };
              localStorage.setItem('customTheme', JSON.stringify(newTheme));
              setCustomTheme(newTheme);
              setTheme('custom');
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
              选择自定义主题颜色
            </p>
          </div>
        </div>
        <button
          onClick={resetTheme}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(243, 244, 246, 0.9)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#374151',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.backgroundColor = 'rgba(229, 231, 235, 0.9)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.9)';
            e.target.style.boxShadow = 'none';
          }}
        >
          恢复默认主题
        </button>
      </div>
    </div>
  );
}

// TitleSettings, IconSettings, FontSettings 组件保持不变...
function TitleSettings() {
  const [title, setTitle] = useState(localStorage.getItem("homeTitle") || "Whisper House");

  const handleSaveTitle = () => {
    localStorage.setItem("homeTitle", title);
    alert("标题已保存～");
  };

  // 毛玻璃卡片样式
  const cardStyle = {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px', ...cardStyle }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          主页标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid rgba(209, 213, 219, 0.8)',
            borderRadius: '12px',
            fontSize: '16px',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          placeholder="输入主页标题..."
          onFocus={(e) => {
            e.target.style.borderColor = '#ec4899';
            e.target.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      <button
        onClick={handleSaveTitle}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: 'rgba(236, 72, 153, 0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.backgroundColor = 'rgba(219, 39, 119, 0.9)';
          e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.9)';
          e.target.style.boxShadow = 'none';
        }}
      >
        保存标题
      </button>
    </div>
  );
}

function IconSettings() {
  const [customIcons, setCustomIcons] = useState(() => {
    return JSON.parse(localStorage.getItem("customIcons") || "{}");
  });

  const allApps = [
    { name: "日记", icon: "📔", id: "diary" },
    { name: "备忘录", icon: "📝", id: "memo" },
    { name: "记忆馆", icon: "📂", id: "memory" },
    { name: "记忆回廊", icon: "🏛️", id: "memoryCorridor" },
    { name: "状态", icon: "🧠", id: "status" },
    { name: "设定手册", icon: "🪶", id: "characterSheet" },
    { name: "游戏", icon: "🎮", id: "game" },
    { name: "聊天", icon: "💬", id: "chat" },
    { name: "设置", icon: "🛠️", id: "settings" },
    { name: "API", icon: "🚀", id: "api" },
  ];

  const handleIconUpload = (appId, file) => {
    const iconUrl = URL.createObjectURL(file);
    const newCustomIcons = { ...customIcons, [appId]: iconUrl };
    setCustomIcons(newCustomIcons);
    localStorage.setItem("customIcons", JSON.stringify(newCustomIcons));
    alert(`已更新 ${allApps.find(app => app.id === appId)?.name} 图标`);
  };

  const removeCustomIcon = (appId) => {
    const newCustomIcons = { ...customIcons };
    delete newCustomIcons[appId];
    setCustomIcons(newCustomIcons);
    localStorage.setItem("customIcons", JSON.stringify(newCustomIcons));
    alert(`已恢复 ${allApps.find(app => app.id === appId)?.name} 默认图标`);
  };

  const resetAllIcons = () => {
    setCustomIcons({});
    localStorage.removeItem("customIcons");
    alert("已重置所有图标");
  };

  // 毛玻璃卡片样式
  const cardStyle = {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  // 按钮样式
  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '20px', ...cardStyle }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
          应用图标管理
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
          为每个应用上传自定义图标
        </p>
        
        <button
          onClick={resetAllIcons}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(254, 242, 242, 0.9)',
            color: '#dc2626',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)';
            e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)';
            e.target.style.boxShadow = 'none';
          }}
        >
          重置所有图标
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allApps.map((app) => (
          <div key={app.id} style={{
            ...cardStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(243, 244, 246, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)'
            }}>
              {customIcons[app.id] ? (
                <img 
                  src={customIcons[app.id]} 
                  alt={app.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                app.icon
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                {app.name}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                {customIcons[app.id] ? '自定义图标' : '默认图标'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{
                ...buttonStyle,
                backgroundColor: 'rgba(240, 249, 255, 0.9)',
                color: '#0369a1'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(224, 242, 254, 0.9)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(240, 249, 255, 0.9)'}
              >
                上传
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleIconUpload(app.id, e.target.files[0]);
                    }
                  }}
                />
              </label>

              {customIcons[app.id] && (
                <button
                  onClick={() => removeCustomIcon(app.id)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'rgba(254, 242, 242, 0.9)',
                    color: '#dc2626'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)'}
                >
                  重置
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FontSettings() {
  const { currentFont, setCurrentFont, customFonts, setCustomFonts } = useTheme();
  
  const defaultFonts = [
    { 
      id: "system-default", 
      name: "系统默认", 
      description: "清晰易读，与您设备系统风格完美统一",
      fontFamily: "system-ui, -apple-system, sans-serif",
      preview: "系统默认字体"
    },
    { 
      id: "lxgw", 
      name: "优雅衬线", 
      description: "精致的中文印刷体，充满书卷气与文化韵味",
      fontFamily: "'LXGW WenKai', serif",
      preview: "霞鹜文楷字体"
    },
    { 
      id: "jiangcheng", 
      name: "手写风格", 
      description: "自然、随性的手写风格，像朋友亲手写下的笔记一样亲切",
      fontFamily: "'JiangCheng Yuan', cursive",
      preview: "手写风格字体"
    }
  ];

  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(ttf|otf)$/i)) {
      alert("请上传 .ttf 或 .otf 格式的字体文件");
      return;
    }

    const fontUrl = URL.createObjectURL(file);
    const fontName = file.name.replace(/\.[^/.]+$/, "");
    
    const userFontName = prompt(`请为这个字体起个名字（当前文件名：${fontName}）:`, fontName) || fontName;
    
    if (!userFontName.trim()) {
      alert("字体名称不能为空");
      return;
    }

    const newFont = {
      id: `custom-${Date.now()}`,
      name: userFontName,
      fontFamily: `'${userFontName}', sans-serif`,
      preview: "自定义字体预览",
      custom: true,
      url: fontUrl,
      fileName: file.name
    };

    const newCustomFonts = [...customFonts, newFont];
    setCustomFonts(newCustomFonts);
    
    alert(`字体 "${userFontName}" 导入成功！`);
  };

  const applyFont = (font) => {
    setCurrentFont(font);
    alert(`已应用字体：${font.name} ✅`);
  };

  const removeCustomFont = (fontId, event) => {
    event.stopPropagation();
    
    const fontToRemove = customFonts.find(font => font.id === fontId);
    if (fontToRemove && fontToRemove.url) {
      URL.revokeObjectURL(fontToRemove.url);
    }

    const newCustomFonts = customFonts.filter(font => font.id !== fontId);
    setCustomFonts(newCustomFonts);

    if (currentFont.id === fontId) {
      applyFont(defaultFonts[0]);
    }

    alert("字体已删除");
  };

  const renameCustomFont = (fontId, event) => {
    event.stopPropagation();
    
    const font = customFonts.find(f => f.id === fontId);
    if (!font) return;

    const newName = prompt("请输入新的字体名称：", font.name);
    if (newName && newName.trim() && newName !== font.name) {
      const updatedFonts = customFonts.map(f => 
        f.id === fontId 
          ? { 
              ...f, 
              name: newName.trim(),
              fontFamily: `'${newName.trim()}', sans-serif`
            }
          : f
      );
      
      setCustomFonts(updatedFonts);
      
      if (currentFont.id === fontId) {
        const updatedCurrentFont = { ...currentFont, name: newName.trim(), fontFamily: `'${newName.trim()}', sans-serif` };
        setCurrentFont(updatedCurrentFont);
      }

      alert("字体名称已更新！");
    }
  };

  const allFonts = [...defaultFonts, ...customFonts];

  // 毛玻璃卡片样式
  const cardStyle = {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  // 按钮样式
  const buttonStyle = {
    padding: '6px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: 'rgba(240, 249, 255, 0.9)',
          color: '#0369a1',
          fontWeight: '500',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '2px dashed rgba(186, 230, 253, 0.8)',
          fontSize: '16px',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 12px rgba(3, 105, 161, 0.2)';
          e.target.style.backgroundColor = 'rgba(224, 242, 254, 0.9)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
          e.target.style.backgroundColor = 'rgba(240, 249, 255, 0.9)';
        }}
        >
          📁 导入字体文件 (.ttf/.otf)
          <input
            type="file"
            accept=".ttf,.otf"
            style={{ display: 'none' }}
            onChange={handleFontUpload}
          />
        </label>
        <p style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          textAlign: 'center', 
          marginTop: '8px',
          marginBottom: '0',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          支持 .ttf 和 .otf 格式的字体文件
        </p>
      </div>

      {(customFonts.length > 0 || currentFont.id !== defaultFonts[0].id) && (
        <button
          onClick={() => {
            customFonts.forEach(font => {
              if (font.url) {
                URL.revokeObjectURL(font.url);
              }
              const style = document.getElementById(`font-${font.id}`);
              if (style) {
                document.head.removeChild(style);
              }
            });
            
            setCustomFonts([]);
            localStorage.removeItem("customFonts");
            applyFont(defaultFonts[0]);
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(254, 242, 242, 0.9)',
            color: '#dc2626',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)';
            e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)';
            e.target.style.boxShadow = 'none';
          }}
        >
          重置所有字体设置
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allFonts.map((font) => (
          <div
            key={font.id}
            onClick={() => applyFont(font)}
            style={{
              ...cardStyle,
              backgroundColor: currentFont.id === font.id ? 'rgba(240, 249, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              border: `2px solid ${currentFont.id === font.id ? '#0369a1' : 'rgba(229, 231, 235, 0.8)'}`,
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (currentFont.id !== font.id) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
              }
            }}
            onMouseOut={(e) => {
              if (currentFont.id !== font.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.8)';
              }
            }}
          >
            <div style={{
              fontFamily: font.fontFamily,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              {font.preview}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>
                  {font.name}
                  {font.custom && (
                    <span style={{
                      fontSize: '12px',
                      color: '#059669',
                      backgroundColor: 'rgba(209, 250, 229, 0.9)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      自定义
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>
                  {font.description}
                  {font.fileName && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      文件: {font.fileName}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentFont.id === font.id && (
                  <div style={{
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>
                    ✅ 使用中
                  </div>
                )}

                {font.custom && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => renameCustomFont(font.id, e)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(240, 249, 255, 0.9)',
                        color: '#0369a1'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(224, 242, 254, 0.9)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(240, 249, 255, 0.9)'}
                    >
                      重命名
                    </button>
                    <button
                      onClick={(e) => removeCustomFont(font.id, e)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(254, 242, 242, 0.9)',
                        color: '#dc2626'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(254, 202, 202, 0.9)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(254, 242, 242, 0.9)'}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {allFonts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9ca3af',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <Type size={48} color="#d1d5db" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', margin: 0, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>暂无可用字体</p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>点击上方按钮导入字体文件</p>
        </div>
      )}
    </div>
  );
}

// 导出壁纸工具函数
export { wallpaperHelper };

export default function Settings({ setCurrentApp, setWallpapers }) {
  const [activeSection, setActiveSection] = useState("main");
  const [wallpaper, setWallpaper] = useState(null);
  const { currentFont } = useTheme();

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
    const wallpaperUrl = wallpaperHelper.getWallpaper('global');
    setWallpaper(wallpaperUrl);
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

  const settingCards = [
    {
      id: "wallpaper",
      title: "壁纸设置",
      description: "自定义全局、主页和聊天背景",
      icon: <Image size={24} />,
      color: "#ec4899"
    },
    {
      id: "theme",
      title: "主题设置",
      description: "选择渐变主题和自定义颜色",
      icon: <Palette size={24} />,
      color: "#3b82f6"
    },
    {
      id: "title",
      title: "标题设置",
      description: "修改主页显示标题",
      icon: <Heading size={24} />,
      color: "#8b5cf6"
    },
    {
      id: "icons",
      title: "图标设置",
      description: "自定义应用图标",
      icon: <SettingsIcon size={24} />,
      color: "#f59e0b"
    },
    {
      id: "font",
      title: "字体设置",
      description: "选择默认字体或上传自定义字体",
      icon: <Type size={24} />,
      color: "#10b981"
    }
  ];

  const renderMainSettings = () => (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {settingCards.map((card) => (
        <div
          key={card.id}
          onClick={() => setActiveSection(card.id)}
          style={{
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: `2px solid ${card.color}20`,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = `${card.color}40`;
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = `${card.color}20`;
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${card.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: card.color,
            backdropFilter: 'blur(10px)'
          }}>
            {card.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 4px 0',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              {card.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              {card.description}
            </p>
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: '20px'
          }}>
            →
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "wallpaper":
        return <WallpaperSettings setWallpapers={setWallpapers} />;
      case "theme":
        return <ThemeSettings />;
      case "title":
        return <TitleSettings />;
      case "icons":
        return <IconSettings />;
      case "font":
        return <FontSettings />;
      default:
        return renderMainSettings();
    }
  };

  const getPageTitle = () => {
    const currentCard = settingCards.find(card => card.id === activeSection);
    return currentCard ? currentCard.title : "设置";
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: currentFont.fontFamily,
      ...backgroundStyle, // 应用背景样式
      transition: 'font-family 0.3s ease, background 0.3s ease' // 添加背景过渡效果
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        <div 
          onClick={() => activeSection === "main" ? setCurrentApp("home") : setActiveSection("main")}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={20} color="#6b7280" />
          {activeSection !== "main" && (
            <span style={{ fontSize: '14px', color: '#6b7280', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>返回</span>
          )}
        </div>
        <span style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          {getPageTitle()}
        </span>
        <div style={{ width: '20px', height: '20px' }} />
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}