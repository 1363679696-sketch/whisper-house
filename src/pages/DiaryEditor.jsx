import { useState, useEffect } from "react";
import { ArrowLeft, Save, Smile, Cloud, Tag } from "lucide-react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function DiaryEditor({ setCurrentApp }) {
  const [editDiary, setEditDiary] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [weather, setWeather] = useState("sunny");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 从 localStorage 读取要编辑的日记和初始化壁纸
  useEffect(() => {
    console.log('DiaryEditor 加载，读取 localStorage');
    const saved = localStorage.getItem('editingDiary');
    console.log('从 localStorage 读取的数据:', saved);
    if (saved) {
      const diaryData = JSON.parse(saved);
      console.log('解析后的日记数据:', diaryData);
      setEditDiary(diaryData);
      setTitle(diaryData.title || "");
      setContent(diaryData.content || "");
      setMood(diaryData.mood || "happy");
      setWeather(diaryData.weather || "sunny");
      setTags(diaryData.tags || []);
      localStorage.removeItem('editingDiary');
      console.log('已清除 localStorage');
    } else {
      console.log('没有找到编辑数据，进入新建模式');
    }

    // 初始化壁纸
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

  // 心情配置
  const moodConfig = {
    happy: { emoji: "😊", label: "开心", color: "#fef3c7" },
    sad: { emoji: "😢", label: "难过", color: "#dbeafe" },
    angry: { emoji: "😡", label: "生气", color: "#fee2e2" },
    peaceful: { emoji: "😌", label: "平静", color: "#dcfce7" },
    neutral: { emoji: "😐", label: "一般", color: "#f3f4f6" },
    excited: { emoji: "🥰", label: "兴奋", color: "#fce7f3" }
  };

  // 天气配置
  const weatherConfig = {
    sunny: { emoji: "☀️", label: "晴天" },
    cloudy: { emoji: "☁️", label: "多云" },
    rainy: { emoji: "🌧️", label: "雨天" },
    snowy: { emoji: "❄️", label: "雪天" },
    windy: { emoji: "🌬️", label: "大风" }
  };

  // 添加标签
  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setCurrentTag("");
    }
  };

  // 移除标签
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 保存日记
  const saveDiary = async () => {
    if (!title.trim() || !content.trim()) {
      alert("请填写标题和内容～");
      return;
    }

    setIsSaving(true);

    // 模拟保存过程
    setTimeout(() => {
      const diaries = JSON.parse(localStorage.getItem("diaries") || "[]");
      const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const newDiary = {
        id: editDiary?.id || Date.now(),  // 使用 editDiary 的 id
        date: editDiary?.date || now,
        title: title.trim(),
        content: content.trim(),
        mood,
        weather,
        tags,
        createdAt: editDiary?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedDiaries;
      if (editDiary) {
        // 编辑现有日记
        updatedDiaries = diaries.map(d => d.id === editDiary.id ? newDiary : d);
      } else {
        // 新建日记
        updatedDiaries = [newDiary, ...diaries];
      }

      localStorage.setItem("diaries", JSON.stringify(updatedDiaries));
      setIsSaving(false);
      alert(editDiary ? "日记更新成功！" : "日记保存成功！");
      setCurrentApp("diary");
    }, 1000);
  };

  // 处理键盘快捷键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveDiary();
    }
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      addTag();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentTag]);

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
          onClick={() => setCurrentApp("diary")}
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
          {editDiary ? "编辑日记" : "写日记"}
        </span>
        <button
          onClick={saveDiary}
          disabled={isSaving}
          style={{
            padding: '6px 12px',
            backgroundColor: isSaving ? '#d1d5db' : '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (!isSaving) {
              e.target.style.backgroundColor = '#db2777';
              e.target.style.transform = 'scale(0.98)';
            }
          }}
          onMouseOut={(e) => {
            if (!isSaving) {
              e.target.style.backgroundColor = '#ec4899';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <Save size={14} />
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* 编辑区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 标题输入 */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="日记标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '600',
              outline: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#111827',
              borderRadius: '8px',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>

        {/* 心情和天气选择 */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {/* 心情选择 */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <Smile size={16} style={{ marginRight: '6px' }} />
              心情
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {Object.entries(moodConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setMood(key)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: mood === key ? config.color : 'rgba(243, 244, 246, 0.9)',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* 天气选择 */}
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <Cloud size={16} style={{ marginRight: '6px' }} />
              天气
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {Object.entries(weatherConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setWeather(key)}
                  style={{
                    padding: '6px 10px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: weather === key ? 'rgba(229, 231, 235, 0.9)' : 'rgba(243, 244, 246, 0.9)',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {config.emoji} {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 标签输入 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Tag size={16} style={{ marginRight: '6px' }} />
            标签
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(252, 231, 243, 0.9)',
                  color: '#be185d',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: '#be185d',
                    padding: '2px',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(190, 24, 93, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="添加标签..."
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid rgba(209, 213, 219, 0.8)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(5px)'
              }}
            />
            <button
              onClick={addTag}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(243, 244, 246, 0.9)',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(229, 231, 235, 0.9)';
                e.target.style.transform = 'scale(0.98)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.9)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              添加
            </button>
          </div>
        </div>

        {/* 内容编辑器 */}
        <div style={{
          border: '1px solid rgba(229, 231, 235, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <textarea
            placeholder="写下今天的心情和故事..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '16px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'inherit',
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* 编辑提示 */}
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(240, 249, 255, 0.9)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#0369a1',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          💡 提示：按 Ctrl + Enter 快速保存日记
        </div>
      </div>
    </div>
  );
}