import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Heart, Star, MapPin, Users } from "lucide-react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function Memory({ setCurrentApp }) {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem("whisperMemories");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: "小梅生日",
        date: "2025-10-19",
        type: "upcoming",
        emoji: "🎂",
        description: "最亲爱的生日",
        people: ["小梅"],
        location: "家里",
        importance: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "星星生日",
        date: "2025-10-29",
        type: "upcoming",
        emoji: "⭐",
        description: "可爱的星星",
        people: ["星星"],
        location: "",
        importance: 4,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "和阿逸在一起",
        date: "2024-04-09",
        type: "memory",
        emoji: "💑",
        description: "开始的美好",
        people: ["阿逸"],
        location: "咖啡馆",
        importance: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: "回家",
        date: "2024-02-05",
        type: "memory",
        emoji: "🏠",
        description: "春节回家",
        people: ["家人"],
        location: "老家",
        importance: 4,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态
  
  // 新记忆表单状态
  const [newMemory, setNewMemory] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    type: "upcoming",
    emoji: "🎯",
    description: "",
    people: [],
    location: "",
    importance: 3
  });

  const [peopleInput, setPeopleInput] = useState("");

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

  // 类型配置
  const memoryTypes = {
    all: { name: "全部", color: "#6b7280" },
    upcoming: { name: "即将到来", color: "#ec4899" },
    memory: { name: "美好回忆", color: "#3b82f6" },
    anniversary: { name: "纪念日", color: "#10b981" },
    personal: { name: "个人", color: "#f59e0b" }
  };

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem("whisperMemories", JSON.stringify(memories));
  }, [memories]);

  // 计算日期差
  const calculateDateDiff = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return { type: "upcoming", days: diffDays, text: `还有` };
    } else if (diffDays === 0) {
      return { type: "today", days: 0, text: `就是今天！` };
    } else {
      return { type: "memory", days: Math.abs(diffDays), text: `已经` };
    }
  };

  // 添加人物
  const addPerson = () => {
    if (peopleInput.trim() && !newMemory.people.includes(peopleInput.trim())) {
      setNewMemory(prev => ({
        ...prev,
        people: [...prev.people, peopleInput.trim()]
      }));
      setPeopleInput("");
    }
  };

  // 移除人物
  const removePerson = (personToRemove) => {
    setNewMemory(prev => ({
      ...prev,
      people: prev.people.filter(person => person !== personToRemove)
    }));
  };

  // 保存记忆
  const saveMemory = () => {
    if (!newMemory.title.trim() || !newMemory.date) {
      alert("请填写标题和日期");
      return;
    }

    const memoryData = {
      id: editingMemory ? editingMemory.id : Date.now(),
      title: newMemory.title.trim(),
      date: newMemory.date,
      type: newMemory.type,
      emoji: newMemory.emoji,
      description: newMemory.description.trim(),
      people: newMemory.people,
      location: newMemory.location.trim(),
      importance: newMemory.importance,
      createdAt: editingMemory ? editingMemory.createdAt : new Date().toISOString()
    };

    if (editingMemory) {
      setMemories(prev => prev.map(memory => 
        memory.id === editingMemory.id ? memoryData : memory
      ));
    } else {
      setMemories(prev => [memoryData, ...prev]);
    }

    // 重置表单
    setNewMemory({
      title: "",
      date: new Date().toISOString().split('T')[0],
      type: "upcoming",
      emoji: "🎯",
      description: "",
      people: [],
      location: "",
      importance: 3
    });
    setIsAdding(false);
    setEditingMemory(null);
  };

  // 删除记忆
  const deleteMemory = (id) => {
    if (window.confirm("确定要删除这个记忆吗？")) {
      setMemories(prev => prev.filter(memory => memory.id !== id));
    }
  };

  // 开始编辑记忆
  const startEdit = (memory) => {
    setEditingMemory(memory);
    setNewMemory({
      title: memory.title,
      date: memory.date,
      type: memory.type,
      emoji: memory.emoji,
      description: memory.description,
      people: [...memory.people],
      location: memory.location,
      importance: memory.importance
    });
    setIsAdding(true);
  };

  // 取消编辑/添加
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingMemory(null);
    setNewMemory({
      title: "",
      date: new Date().toISOString().split('T')[0],
      type: "upcoming",
      emoji: "🎯",
      description: "",
      people: [],
      location: "",
      importance: 3
    });
  };

  // 过滤记忆
  const filteredMemories = memories.filter(memory => 
    selectedType === "all" || memory.type === selectedType
  );

  // 常用emoji选择
  const commonEmojis = ["🎂", "⭐", "💑", "🏠", "🎓", "🎉", "✈️", "🎁", "💝", "🌟", "🌹", "🍰"];

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
          color: '#374151',
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}>
          记忆馆
        </span>
        <div style={{ width: '20px' }}></div>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 今日摘要 */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderLeft: '4px solid #8b5cf6',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={16} color="#8b5cf6" />
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151',
              textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
            }}>
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </span>
          </div>
          
          {/* 最近的重要日期 */}
          {memories.filter(m => m.type === "upcoming").slice(0, 2).map(memory => {
            const dateInfo = calculateDateDiff(memory.date);
            if (dateInfo.days <= 7) {
              return (
                <div key={memory.id} style={{ 
                  fontSize: '13px', 
                  color: '#6b7280', 
                  marginTop: '4px',
                  textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
                }}>
                  {memory.emoji} {memory.title} {dateInfo.text} {dateInfo.days} 天
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* 分类筛选 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '16px',
          paddingBottom: '4px'
        }}>
          {Object.entries(memoryTypes).map(([key, type]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: selectedType === key ? type.color : 'rgba(243, 244, 246, 0.9)',
                color: selectedType === key ? 'white' : '#374151',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                if (selectedType !== key) {
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedType !== key) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 添加记忆按钮 */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Plus size={16} />
            添加重要日期
          </button>
        )}

        {/* 添加/编辑记忆表单 */}
        {isAdding && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#374151',
              textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
            }}>
              {editingMemory ? "编辑记忆" : "添加重要日期"}
            </h3>

            {/* 标题和emoji */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="事件标题..."
                  value={newMemory.title}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)'
                  }}
                />
              </div>
              <select
                value={newMemory.emoji}
                onChange={(e) => setNewMemory(prev => ({ ...prev, emoji: e.target.value }))}
                style={{
                  padding: '12px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                {commonEmojis.map(emoji => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
            </div>

            {/* 日期和类型 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="date"
                  value={newMemory.date}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)'
                  }}
                />
              </div>
              <select
                value={newMemory.type}
                onChange={(e) => setNewMemory(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  padding: '12px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <option value="upcoming">即将到来</option>
                <option value="memory">美好回忆</option>
                <option value="anniversary">纪念日</option>
                <option value="personal">个人</option>
              </select>
            </div>

            {/* 描述 */}
            <div style={{ marginBottom: '12px' }}>
              <textarea
                placeholder="描述..."
                value={newMemory.description}
                onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              />
            </div>

            {/* 人物 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>相关人物</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {newMemory.people.map((person, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.9)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <Users size={10} />
                    {person}
                    <span 
                      onClick={() => removePerson(person)}
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: '12px',
                        padding: '2px',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="添加人物..."
                  value={peopleInput}
                  onChange={(e) => setPeopleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    outline: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(5px)'
                  }}
                />
                <button
                  onClick={addPerson}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(5px)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.9)';
                    e.target.style.transform = 'scale(0.98)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  添加
                </button>
              </div>
            </div>

            {/* 地点 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>地点</div>
              <input
                type="text"
                placeholder="事件发生地点..."
                value={newMemory.location}
                onChange={(e) => setNewMemory(prev => ({ ...prev, location: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)'
                }}
              />
            </div>

            {/* 重要性 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginBottom: '4px',
                textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
              }}>
                重要性: {["低", "中低", "中等", "中高", "高"][newMemory.importance - 1]}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setNewMemory(prev => ({ ...prev, importance: level }))}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: level <= newMemory.importance ? 'rgba(236, 72, 153, 0.9)' : 'rgba(243, 244, 246, 0.9)',
                      color: level <= newMemory.importance ? 'white' : '#374151',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(5px)'
                    }}
                    onMouseOver={(e) => {
                      if (level <= newMemory.importance) {
                        e.target.style.backgroundColor = 'rgba(219, 39, 119, 0.9)';
                      } else {
                        e.target.style.backgroundColor = 'rgba(229, 231, 235, 0.9)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (level <= newMemory.importance) {
                        e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.9)';
                      } else {
                        e.target.style.backgroundColor = 'rgba(243, 244, 246, 0.9)';
                      }
                    }}
                  >
                    {level} {level <= newMemory.importance ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={cancelEdit}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'rgba(243, 244, 246, 0.9)',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(5px)'
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
                取消
              </button>
              <button
                onClick={saveMemory}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'scale(0.98)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {editingMemory ? "保存" : "创建"}
              </button>
            </div>
          </div>
        )}

        {/* 记忆列表 */}
        <div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <span>事件</span>
              <span>天数</span>
              <span>操作</span>
            </div>
          </div>
          
          {filteredMemories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {selectedType !== 'all' ? '没有找到匹配的记忆' : '还没有记忆，添加第一个重要日期吧！'}
            </div>
          ) : (
            filteredMemories.map(memory => {
              const dateInfo = calculateDateDiff(memory.date);
              const isToday = dateInfo.type === "today";
              const isUpcoming = dateInfo.type === "upcoming";
              
              return (
                <div
                  key={memory.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    borderLeft: `4px solid ${memoryTypes[memory.type].color}`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  {/* 事件信息 */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{memory.emoji}</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        {memory.title}
                      </span>
                    </div>
                    {memory.description && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {memory.description}
                      </div>
                    )}
                  </div>

                  {/* 天数信息 */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: isToday ? '#ef4444' : isUpcoming ? '#ec4899' : '#6b7280'
                    }}>
                      {dateInfo.days}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af' 
                    }}>
                      {dateInfo.text}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => startEdit(memory)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.9)';
                        e.target.style.transform = 'scale(0.95)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <Edit size={12} />
                      编辑
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
                        e.target.style.transform = 'scale(0.95)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 size={12} />
                      删除
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}