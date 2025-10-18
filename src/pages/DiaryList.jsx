import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Trash2, Calendar } from "lucide-react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function DiaryList({ setCurrentApp }) {
  const [diaries, setDiaries] = useState(() => {
    const saved = localStorage.getItem("diaries");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        date: "2024-10-28",
        title: "开心的一天",
        content: "今天和室友吃了超好吃的火锅，聊了很多有趣的话题，感觉特别温暖。下午写代码遇到了一个有趣的bug，解决后很有成就感！",
        mood: "happy",
        weather: "sunny",
        tags: ["美食", "编程"],
        createdAt: "2024-10-28T10:00:00Z"
      },
      {
        id: 2,
        date: "2024-10-27",
        title: "充实的学习日",
        content: "复习了一整天，虽然很累但感觉很充实。晚上和如如老师视频聊天，她马上就要从淄博回来了，期待！",
        mood: "neutral",
        weather: "cloudy",
        tags: ["学习", "朋友"],
        createdAt: "2024-10-27T20:30:00Z"
      },
      {
        id: 3,
        date: "2024-10-26",
        title: "雨天的宁静",
        content: "下雨天最适合窝在宿舍写代码了，听着雨声敲键盘，心情特别平静。完成了日记APP的UI设计，很有成就感。",
        mood: "peaceful",
        weather: "rainy",
        tags: ["编程", "心情"],
        createdAt: "2024-10-26T15:45:00Z"
      }
    ];
  });

  const [searchText, setSearchText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 保存到本地存储和初始化壁纸
  useEffect(() => {
    localStorage.setItem("diaries", JSON.stringify(diaries));
    updateWallpaper();
    
    // 监听壁纸变化事件
    const handleWallpaperChange = (event) => {
      if (event.detail.type === 'global') {
        updateWallpaper();
      }
    };

    window.addEventListener('wallpaperChanged', handleWallpaperChange);
    return () => window.removeEventListener('wallpaperChanged', handleWallpaperChange);
  }, [diaries]);

  // 更新壁纸
  const updateWallpaper = () => {
    const wallpaperUrl = getWallpaper('global');
    setWallpaper(wallpaperUrl);
  };

  // 心情配置
  const moodConfig = {
    happy: { emoji: "😊", color: "#fef3c7", textColor: "#92400e" },
    sad: { emoji: "😢", color: "#dbeafe", textColor: "#1e40af" },
    angry: { emoji: "😡", color: "#fee2e2", textColor: "#dc2626" },
    peaceful: { emoji: "😌", color: "#dcfce7", textColor: "#166534" },
    neutral: { emoji: "😐", color: "#f3f4f6", textColor: "#374151" },
    excited: { emoji: "🥰", color: "#fce7f3", textColor: "#be185d" }
  };

  // 天气配置
  const weatherConfig = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    windy: "🌬️"
  };

  // 过滤日记
  const filteredDiaries = diaries.filter(diary => 
    diary.title.toLowerCase().includes(searchText.toLowerCase()) ||
    diary.content.toLowerCase().includes(searchText.toLowerCase()) ||
    diary.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 按月份分组
  const groupedDiaries = filteredDiaries.reduce((groups, diary) => {
    const date = new Date(diary.date);
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(diary);
    return groups;
  }, {});

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  // 新建日记
  const createNewDiary = () => {
    setCurrentApp("diaryEditor");
  };

  // 编辑日记
  const editDiary = (diary) => {
    console.log('点击编辑日记:', diary);
    // 存储要编辑的日记到 localStorage
    localStorage.setItem('editingDiary', JSON.stringify(diary));
    console.log('已存储到 localStorage');
    setCurrentApp("diaryEditor");
  };

  // 删除日记
  const confirmDelete = (diaryId) => {
    setDiaries(prev => prev.filter(d => d.id !== diaryId));
    setConfirmDeleteId(null);
  };

  // 获取内容预览
  const getContentPreview = (content, maxLength = 40) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
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
        backgroundColor: '#f8fafc'
      };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      ...backgroundStyle // 应用背景样式
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
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
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151' 
        }}>
          我的日记
        </span>
        <div 
          onClick={createNewDiary}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Plus size={20} color="#ec4899" />
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid rgba(243, 244, 246, 0.8)',
        backdropFilter: 'blur(5px)'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="搜索日记标题、内容或标签..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid rgba(209, 213, 219, 0.8)',
              borderRadius: '20px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'rgba(249, 250, 251, 0.9)',
              backdropFilter: 'blur(5px)'
            }}
          />
        </div>
      </div>

      {/* 日记列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {Object.keys(groupedDiaries).length > 0 ? (
          Object.entries(groupedDiaries).map(([month, monthDiaries]) => (
            <div key={month} style={{ marginBottom: '24px' }}>
              {/* 月份标题 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '0 8px'
              }}>
                <Calendar size={16} color="#6b7280" style={{ marginRight: '8px' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  textShadow: wallpaper ? '0 1px 2px rgba(255,255,255,0.8)' : 'none'
                }}>
                  {month}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginLeft: '8px',
                  textShadow: wallpaper ? '0 1px 2px rgba(255,255,255,0.8)' : 'none'
                }}>
                  ({monthDiaries.length}篇)
                </span>
              </div>

              {/* 日记卡片 */}
              {monthDiaries.map((diary) => {
                const mood = moodConfig[diary.mood] || moodConfig.neutral;
                return (
                  <div
                    key={diary.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(243, 244, 246, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
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
                    onClick={() => editDiary(diary)}
                  >
                    {/* 日记头部 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827'
                          }}>
                            {diary.title}
                          </span>
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: mood.color,
                            color: mood.textColor,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backdropFilter: 'blur(5px)'
                          }}>
                            {mood.emoji} {weatherConfig[diary.weather]}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {formatDate(diary.date)}
                        </span>
                      </div>
                      
                      {/* 删除按钮 */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(diary.id);
                        }}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </div>
                    </div>

                    {/* 日记内容预览 */}
                    <p style={{
                      fontSize: '13px',
                      color: '#4b5563',
                      lineHeight: '1.5',
                      margin: '8px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {getContentPreview(diary.content)}
                    </p>

                    {/* 标签 */}
                    {diary.tags && diary.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginTop: '8px'
                      }}>
                        {diary.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '2px 6px',
                              backgroundColor: 'rgba(243, 244, 246, 0.9)',
                              color: '#6b7280',
                              borderRadius: '8px',
                              fontSize: '10px',
                              backdropFilter: 'blur(5px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          /* 空状态 */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60%',
            color: '#9ca3af',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '16px',
            padding: '40px 20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            margin: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📔</div>
            <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>还没有日记哦</p>
            <p style={{ fontSize: '14px' }}>点击右上角 + 开始记录你的第一篇文章</p>
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
            padding: '20px',
            width: '280px',
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
              确定要删除这篇日记吗？
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
                  backgroundColor: 'rgba(229, 231, 235, 0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#374151',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onClick={() => setConfirmDeleteId(null)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(209, 213, 219, 0.9)';
                  e.target.style.transform = 'scale(0.98)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(229, 231, 235, 0.9)';
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