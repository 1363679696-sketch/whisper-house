import { useState, useEffect } from "react";
import { ArrowLeft, Plus, TrendingUp, Heart, Target, CloudRain, Edit, Trash2 } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { wallpaperHelper } from "./Settings";

export default function Status({ setCurrentApp }) {
  const [moodRecords, setMoodRecords] = useState(() => {
    const saved = localStorage.getItem("moodRecords");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        date: "2024-10-28",
        moodScore: 8,
        mood: "happy",
        stressLevel: 2,
        notes: "今天完成了日记APP，很有成就感！",
        tags: ["成就感", "编程"],
        activities: ["工作", "学习"],
        timestamp: "2024-10-28T20:00:00Z"
      },
      {
        id: 2,
        date: "2024-10-27",
        moodScore: 6,
        mood: "neutral",
        stressLevel: 4,
        notes: "学习有点累，但坚持下来了",
        tags: ["学习", "坚持"],
        activities: ["学习", "休息"],
        timestamp: "2024-10-27T19:30:00Z"
      },
      {
        id: 3,
        date: "2024-10-26",
        moodScore: 9,
        mood: "excited",
        stressLevel: 1,
        notes: "和如如老师视频聊天很开心！",
        tags: ["社交", "开心"],
        activities: ["社交", "娱乐"],
        timestamp: "2024-10-26T21:15:00Z"
      }
    ];
  });

  const [currentMood, setCurrentMood] = useState(5);
  const [currentStress, setCurrentStress] = useState(3);
  const [quickNote, setQuickNote] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [swipedRecordId, setSwipedRecordId] = useState(null);
  const [wallpaper, setWallpaper] = useState(null);
  const { currentFont } = useTheme();

  // 心情配置
  const moodConfig = {
    1: { emoji: "😭", label: "崩溃", color: "#3b82f6" },
    2: { emoji: "😢", label: "难过", color: "#60a5fa" },
    3: { emoji: "😔", label: "低落", color: "#93c5fd" },
    4: { emoji: "😐", label: "一般", color: "#d1d5db" },
    5: { emoji: "😊", label: "不错", color: "#fbbf24" },
    6: { emoji: "😄", label: "开心", color: "#f59e0b" },
    7: { emoji: "🥰", label: "幸福", color: "#ec4899" },
    8: { emoji: "😍", label: "兴奋", color: "#db2777" },
    9: { emoji: "🤩", label: "极好", color: "#be185d" },
    10: { emoji: "🌈", label: "完美", color: "#7c3aed" }
  };

  // 标签选项
  const tagOptions = ["工作", "学习", "社交", "健康", "家庭", "爱情", "朋友", "成就", "挑战", "休息", "创意", "运动"];
  
  // 活动选项
  const activityOptions = ["工作", "学习", "运动", "社交", "休息", "娱乐", "创作", "阅读", "冥想", "外出"];

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

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem("moodRecords", JSON.stringify(moodRecords));
  }, [moodRecords]);

  // 快速记录心情
  const quickRecordMood = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const newRecord = {
      id: Date.now(),
      date: today,
      moodScore: currentMood,
      mood: Object.keys(moodConfig).find(key => moodConfig[key].label === moodConfig[currentMood].label),
      stressLevel: currentStress,
      notes: quickNote.trim(),
      tags: selectedTags,
      activities: selectedActivities,
      timestamp: now.toISOString()
    };

    setMoodRecords(prev => [newRecord, ...prev]);
    setQuickNote("");
    setSelectedTags([]);
    setSelectedActivities([]);
    alert("状态记录成功！🌈");
  };

  // 切换标签
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 切换活动
  const toggleActivity = (activity) => {
    setSelectedActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  // 删除记录
  const deleteRecord = (id) => {
    if (window.confirm("确定要删除这条记录吗？")) {
      setMoodRecords(prev => prev.filter(record => record.id !== id));
      setSwipedRecordId(null);
    }
  };

  // 开始编辑记录
  const startEditRecord = (record) => {
    setEditingRecord(record);
    setCurrentMood(record.moodScore);
    setCurrentStress(record.stressLevel);
    setQuickNote(record.notes);
    setSelectedTags([...record.tags]);
    setSelectedActivities([...record.activities]);
    setSwipedRecordId(null);
  };

  // 保存编辑
  const saveEditRecord = () => {
    if (!editingRecord) return;

    const updatedRecord = {
      ...editingRecord,
      moodScore: currentMood,
      stressLevel: currentStress,
      notes: quickNote.trim(),
      tags: selectedTags,
      activities: selectedActivities,
      timestamp: new Date().toISOString()
    };

    setMoodRecords(prev => 
      prev.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      )
    );

    setEditingRecord(null);
    setQuickNote("");
    setSelectedTags([]);
    setSelectedActivities([]);
    setCurrentMood(5);
    setCurrentStress(3);
    alert("记录更新成功！✨");
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingRecord(null);
    setQuickNote("");
    setSelectedTags([]);
    setSelectedActivities([]);
    setCurrentMood(5);
    setCurrentStress(3);
  };

  // 处理触摸开始
  const handleTouchStart = (e, recordId) => {
    setSwipedRecordId(recordId);
  };

  // 获取最近7天的平均心情
  const getWeeklyAverage = () => {
    const last7Days = moodRecords.slice(0, 7);
    if (last7Days.length === 0) return 0;
    const sum = last7Days.reduce((acc, record) => acc + record.moodScore, 0);
    return (sum / last7Days.length).toFixed(1);
  };

  // 获取压力分布
  const getStressDistribution = () => {
    const distribution = { low: 0, medium: 0, high: 0 };
    moodRecords.forEach(record => {
      if (record.stressLevel <= 3) distribution.low++;
      else if (record.stressLevel <= 6) distribution.medium++;
      else distribution.high++;
    });
    return distribution;
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

  // 毛玻璃卡片样式
  const cardStyle = {
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: currentFont.fontFamily,
      ...backgroundStyle, // 应用背景样式
      transition: 'font-family 0.3s ease, background 0.3s ease' // 添加背景过渡效果
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
            alignItems: 'center',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ArrowLeft size={20} color="#6b7280" />
        </div>
        <span style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          {editingRecord ? "编辑记录" : "我的状态"}
        </span>
        <div style={{ width: '20px' }}></div>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {/* 编辑模式 */}
        {editingRecord ? (
          <div style={{
            ...cardStyle,
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#374151',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              编辑状态记录
            </h3>

            {/* 心情选择 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>心情分数</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>😭</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentMood}
                  onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    margin: '0 12px',
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(to right, #3b82f6, #ec4899)`,
                    outline: 'none'
                  }}
                />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>🌈</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: moodConfig[currentMood].color,
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>
                  {moodConfig[currentMood].emoji} {currentMood}分 - {moodConfig[currentMood].label}
                </span>
              </div>
            </div>

            {/* 压力等级 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>压力等级</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>轻松</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentStress}
                  onChange={(e) => setCurrentStress(parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    margin: '0 12px',
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(to right, #10b981, #ef4444)`,
                    outline: 'none'
                  }}
                />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>压力大</span>
              </div>
            </div>

            {/* 快速笔记 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>记录内容</div>
              <textarea
                placeholder="记录此刻的想法或感受..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px 12px',
                  border: '1px solid rgba(209, 213, 219, 0.8)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
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

            {/* 标签选择 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>相关标签</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: selectedTags.includes(tag) ? 'rgba(236, 72, 153, 0.9)' : 'rgba(243, 244, 246, 0.8)',
                      color: selectedTags.includes(tag) ? 'white' : '#374151',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                      if (!selectedTags.includes(tag)) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!selectedTags.includes(tag)) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 活动选择 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                marginBottom: '8px',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>今日活动</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activityOptions.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: selectedActivities.includes(activity) ? 'rgba(59, 130, 246, 0.9)' : 'rgba(243, 244, 246, 0.8)',
                      color: selectedActivities.includes(activity) ? 'white' : '#374151',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                      if (!selectedActivities.includes(activity)) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!selectedActivities.includes(activity)) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* 编辑按钮 */}
            <div style={{ display: 'flex', gap: '12px' }}>
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
                  fontWeight: '600',
                  cursor: 'pointer',
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
                取消
              </button>
              <button
                onClick={saveEditRecord}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.backgroundColor = 'rgba(5, 150, 105, 0.9)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                保存修改
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 数据概览 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {/* 平均心情 */}
              <div style={{
                ...cardStyle,
                padding: '16px',
                textAlign: 'center'
              }}>
                <TrendingUp size={20} color="#ec4899" style={{ marginBottom: '8px' }} />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginBottom: '4px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>周平均心情</div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#ec4899',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>
                  {getWeeklyAverage()}
                </div>
              </div>

              {/* 总记录数 */}
              <div style={{
                ...cardStyle,
                padding: '16px',
                textAlign: 'center'
              }}>
                <Heart size={20} color="#3b82f6" style={{ marginBottom: '8px' }} />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginBottom: '4px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>总记录</div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#3b82f6',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>
                  {moodRecords.length}
                </div>
              </div>
            </div>

            {/* 快速记录区域 */}
            <div style={{
              ...cardStyle,
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#374151',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>
                记录当前状态
              </h3>

              {/* 心情选择 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '8px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>心情分数</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>😭</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      margin: '0 12px',
                      height: '4px',
                      borderRadius: '2px',
                      background: `linear-gradient(to right, #3b82f6, #ec4899)`,
                      outline: 'none'
                    }}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>🌈</span>
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: moodConfig[currentMood].color,
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>
                    {moodConfig[currentMood].emoji} {currentMood}分 - {moodConfig[currentMood].label}
                  </span>
                </div>
              </div>

              {/* 压力等级 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '8px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>压力等级</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>轻松</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentStress}
                    onChange={(e) => setCurrentStress(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      margin: '0 12px',
                      height: '4px',
                      borderRadius: '2px',
                      background: `linear-gradient(to right, #10b981, #ef4444)`,
                      outline: 'none'
                    }}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>压力大</span>
                </div>
              </div>

              {/* 快速笔记 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '8px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>快速记录</div>
                <textarea
                  placeholder="记录此刻的想法或感受..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px 12px',
                    border: '1px solid rgba(209, 213, 219, 0.8)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
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

              {/* 标签选择 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '8px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>相关标签</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tagOptions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: selectedTags.includes(tag) ? 'rgba(236, 72, 153, 0.9)' : 'rgba(243, 244, 246, 0.8)',
                        color: selectedTags.includes(tag) ? 'white' : '#374151',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedTags.includes(tag)) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedTags.includes(tag)) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 活动选择 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '8px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}>今日活动</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activityOptions.map(activity => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: selectedActivities.includes(activity) ? 'rgba(59, 130, 246, 0.9)' : 'rgba(243, 244, 246, 0.8)',
                        color: selectedActivities.includes(activity) ? 'white' : '#374151',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedActivities.includes(activity)) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedActivities.includes(activity)) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* 记录按钮 */}
              <button
                onClick={quickRecordMood}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(236, 72, 153, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
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
                记录状态
              </button>
            </div>
          </>
        )}

        {/* 最近记录 - 只在非编辑模式下显示 */}
        {!editingRecord && (
          <div>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#374151',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              最近记录
            </h3>
            {moodRecords.slice(0, 5).map(record => (
              <div
                key={record.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  ...cardStyle,
                  marginBottom: '8px',
                  borderLeft: `4px solid ${moodConfig[record.moodScore].color}`
                }}
              >
                {/* 滑动操作按钮 */}
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  bottom: '0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  backgroundColor: 'rgba(248, 250, 252, 0.9)',
                  backdropFilter: 'blur(10px)',
                  transform: swipedRecordId === record.id ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 0.3s ease'
                }}>
                  <button
                    onClick={() => startEditRecord(record)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginRight: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.9)'}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.9)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 记录内容 */}
                <div
                  style={{
                    padding: '12px',
                    transform: swipedRecordId === record.id ? 'translateX(-80px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onTouchStart={(e) => handleTouchStart(e, record.id)}
                  onClick={() => setSwipedRecordId(null)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{moodConfig[record.moodScore].emoji}</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#374151',
                        textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                      }}>
                        {record.moodScore}分 - {moodConfig[record.moodScore].label}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                    }}>
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {record.notes && (
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      margin: '4px 0', 
                      lineHeight: '1.4',
                      textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                    }}>
                      {record.notes}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {record.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: 'rgba(243, 244, 246, 0.8)',
                          color: '#6b7280',
                          borderRadius: '8px',
                          fontSize: '10px',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}