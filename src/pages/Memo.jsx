import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, Star, Calendar, Tag } from "lucide-react";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function Memo({ setCurrentApp }) {
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem("whisperMemos");
    return saved ? JSON.parse(saved) : [
      {
        id: 3,
        title: "周末购物清单",
        content: "牛奶、鸡蛋、水果、蔬菜",
        category: "life",
        priority: "low",
        tags: ["生活", "购物"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false
      }
    ];
  });

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态
  
  // 新备忘录表单状态
  const [newMemo, setNewMemo] = useState({
    title: "",
    content: "",
    category: "work",
    priority: "medium",
    tags: []
  });

  const [tagInput, setTagInput] = useState("");

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

  // 分类配置
  const categories = {
    all: { name: "全部", color: "#6b7280", emoji: "📁" },
    work: { name: "工作", color: "#3b82f6", emoji: "💼" },
    study: { name: "学习", color: "#10b981", emoji: "📚" },
    life: { name: "生活", color: "#f59e0b", emoji: "🏠" },
    idea: { name: "想法", color: "#8b5cf6", emoji: "💡" }
  };

  // 优先级配置
  const priorities = {
    high: { name: "高优先级", color: "#ef4444", emoji: "⭐" },
    medium: { name: "中优先级", color: "#f59e0b", emoji: "📌" },
    low: { name: "低优先级", color: "#6b7280", emoji: "🔹" }
  };

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem("whisperMemos", JSON.stringify(memos));
  }, [memos]);

  // 过滤备忘录
  const filteredMemos = memos.filter(memo => {
    const matchesSearch = searchText === "" || 
      memo.title.toLowerCase().includes(searchText.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchText.toLowerCase()) ||
      memo.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || memo.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !newMemo.tags.includes(tagInput.trim())) {
      setNewMemo(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  // 移除标签
  const removeTag = (tagToRemove) => {
    setNewMemo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 保存新备忘录
  const saveMemo = () => {
    if (!newMemo.title.trim()) {
      alert("请输入备忘录标题");
      return;
    }

    const memoData = {
      id: editingMemo ? editingMemo.id : Date.now(),
      title: newMemo.title.trim(),
      content: newMemo.content.trim(),
      category: newMemo.category,
      priority: newMemo.priority,
      tags: newMemo.tags,
      createdAt: editingMemo ? editingMemo.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: editingMemo ? editingMemo.completed : false
    };

    if (editingMemo) {
      setMemos(prev => prev.map(memo => 
        memo.id === editingMemo.id ? memoData : memo
      ));
    } else {
      setMemos(prev => [memoData, ...prev]);
    }

    // 重置表单
    setNewMemo({
      title: "",
      content: "",
      category: "work",
      priority: "medium",
      tags: []
    });
    setIsAdding(false);
    setEditingMemo(null);
  };

  // 删除备忘录
  const deleteMemo = (id) => {
    if (window.confirm("确定要删除这个备忘录吗？")) {
      setMemos(prev => prev.filter(memo => memo.id !== id));
    }
  };

  // 切换完成状态
  const toggleComplete = (id) => {
    setMemos(prev => prev.map(memo => 
      memo.id === id ? { ...memo, completed: !memo.completed } : memo
    ));
  };

  // 开始编辑备忘录
  const startEdit = (memo) => {
    setEditingMemo(memo);
    setNewMemo({
      title: memo.title,
      content: memo.content,
      category: memo.category,
      priority: memo.priority,
      tags: [...memo.tags]
    });
    setIsAdding(true);
  };

  // 取消编辑/添加
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingMemo(null);
    setNewMemo({
      title: "",
      content: "",
      category: "work",
      priority: "medium",
      tags: []
    });
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
          color: '#374151',
          textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
        }}>
          我的备忘录
        </span>
        <div style={{ width: '20px' }}></div>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>

        {/* 搜索栏 */}
        <div style={{
          position: 'relative',
          marginBottom: '16px'
        }}>
          <Search 
            size={16} 
            color="#9ca3af" 
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} 
          />
          <input
            type="text"
            placeholder="搜索备忘录..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid rgba(209, 213, 219, 0.8)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(5px)'
            }}
          />
        </div>

        {/* 分类筛选 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '16px',
          paddingBottom: '4px'
        }}>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: selectedCategory === key ? category.color : 'rgba(243, 244, 246, 0.9)',
                color: selectedCategory === key ? 'white' : '#374151',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                if (selectedCategory !== key) {
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== key) {
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {category.emoji} {category.name}
            </button>
          ))}
        </div>

        {/* 添加备忘录按钮 */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ec4899',
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
              e.target.style.backgroundColor = '#db2777';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ec4899';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Plus size={16} />
            新建备忘录
          </button>
        )}

        {/* 添加/编辑备忘录表单 */}
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
              {editingMemo ? "编辑备忘录" : "新建备忘录"}
            </h3>

            {/* 标题 */}
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="备忘录标题..."
                value={newMemo.title}
                onChange={(e) => setNewMemo(prev => ({ ...prev, title: e.target.value }))}
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

            {/* 内容 */}
            <div style={{ marginBottom: '12px' }}>
              <textarea
                placeholder="详细内容..."
                value={newMemo.content}
                onChange={(e) => setNewMemo(prev => ({ ...prev, content: e.target.value }))}
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

            {/* 分类选择 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>分类</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(categories).filter(([key]) => key !== 'all').map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setNewMemo(prev => ({ ...prev, category: key }))}
                    style={{
                      padding: '6px 10px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      backgroundColor: newMemo.category === key ? category.color : 'rgba(243, 244, 246, 0.9)',
                      color: newMemo.category === key ? 'white' : '#374151',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(5px)'
                    }}
                    onMouseOver={(e) => {
                      if (newMemo.category !== key) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (newMemo.category !== key) {
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {category.emoji} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级选择 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>优先级</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(priorities).map(([key, priority]) => (
                  <button
                    key={key}
                    onClick={() => setNewMemo(prev => ({ ...prev, priority: key }))}
                    style={{
                      padding: '6px 10px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      backgroundColor: newMemo.priority === key ? priority.color : 'rgba(243, 244, 246, 0.9)',
                      color: newMemo.priority === key ? 'white' : '#374151',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(5px)'
                    }}
                    onMouseOver={(e) => {
                      if (newMemo.priority !== key) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (newMemo.priority !== key) {
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {priority.emoji} {priority.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签管理 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>标签</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {newMemo.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(236, 72, 153, 0.9)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    #{tag}
                    <span 
                      onClick={() => removeTag(tag)}
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
                  placeholder="添加标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
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
                  onClick={addTag}
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

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={cancelEdit}
                style={{
                  flex: 1,
                  padding: '10px',
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
                onClick={saveMemo}
                style={{
                  flex: 1,
                  padding: '10px',
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
                {editingMemo ? "保存" : "创建"}
              </button>
            </div>
          </div>
        )}

        {/* 备忘录列表 */}
        <div>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginBottom: '8px',
            textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
          }}>
            共 {filteredMemos.length} 条备忘录
          </div>
          
          {filteredMemos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {searchText || selectedCategory !== 'all' ? '没有找到匹配的备忘录' : '还没有备忘录，创建一个吧！'}
            </div>
          ) : (
            filteredMemos.map(memo => (
              <div
                key={memo.id}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  borderLeft: `4px solid ${categories[memo.category].color}`,
                  opacity: memo.completed ? 0.6 : 1,
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={memo.completed}
                      onChange={() => toggleComplete(memo.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: '#374151',
                      textDecoration: memo.completed ? 'line-through' : 'none'
                    }}>
                      {memo.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ 
                      fontSize: '10px',
                      padding: '4px 8px',
                      backgroundColor: priorities[memo.priority].color,
                      color: 'white',
                      borderRadius: '8px',
                      backdropFilter: 'blur(5px)'
                    }}>
                      {priorities[memo.priority].emoji}
                    </span>
                  </div>
                </div>

                {memo.content && (
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6b7280', 
                    margin: '6px 0', 
                    lineHeight: '1.5',
                    textDecoration: memo.completed ? 'line-through' : 'none'
                  }}>
                    {memo.content}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
                    {memo.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: 'rgba(243, 244, 246, 0.9)',
                          color: '#6b7280',
                          borderRadius: '6px',
                          fontSize: '10px',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => startEdit(memo)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500',
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
                      编辑
                    </button>
                    <button
                      onClick={() => deleteMemo(memo.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500',
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
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}