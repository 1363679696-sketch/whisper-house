import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import apiService from "../utils/apiService";
import { memoryService } from "../utils/memoryService";
import UserTypingBubble from "../components/UserTypingBubble";
import TypingBubble from "../components/TypingBubble";
import { useTheme } from "../ThemeContext";
import { callAI } from "../utils/apiClient";
import { getActiveProfiles, buildSystemPrompt } from "../utils/profileHelper";
import localforage from "localforage";

export default function StableChatRoom({ setCurrentApp, room, setRooms }) {
  const [messages, setMessages] = useState(room.messages || []);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState(room.theme || "pink");
  // 🧍 用户 & AI 头像
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || "");
  const [aiAvatar, setAiAvatar] = useState(localStorage.getItem("aiAvatar") || "");
  // 🎨 自定义气泡颜色
  const [customColor, setCustomColor] = useState(localStorage.getItem("customColor") || "");

  const [roomName, setRoomName] = useState(room.name || "新聊天室");
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState("");
  const bottomRef = useRef(null);
  const { chatBackground } = useTheme();

  // 🛑 修复：使用 useRef + localStorage 持久化保存的消息ID
  const savedMessageIds = useRef(new Set());

  // 🆕 获取当前格式化时间
  const getCurrentTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      time: now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      period: getTimePeriod(now.getHours())
    };
  };

  // 🆕 根据小时获取时间段
  const getTimePeriod = (hour) => {
    if (hour >= 5 && hour < 8) return "清晨";
    if (hour >= 8 && hour < 11) return "上午";
    if (hour >= 11 && hour < 13) return "中午";
    if (hour >= 13 && hour < 17) return "下午";
    if (hour >= 17 && hour < 19) return "傍晚";
    if (hour >= 19 && hour < 23) return "晚上";
    return "深夜";
  };

  // 🆕 初始化时从 localStorage 加载已保存的消息ID
  useEffect(() => {
    const savedIds = localStorage.getItem(`savedMessageIds_${room.id}`);
    if (savedIds) {
      savedMessageIds.current = new Set(JSON.parse(savedIds));
    }
  }, [room.id]);

  // 🆕 保存消息ID到 localStorage
  const saveMessageIdToStorage = (messageId) => {
    savedMessageIds.current.add(messageId);
    localStorage.setItem(
      `savedMessageIds_${room.id}`, 
      JSON.stringify([...savedMessageIds.current])
    );
  };

  const themes = {
    pink: { 
      bubbleYou: "rgba(236, 72, 153, 0.8)",
      bubbleAI: "rgba(255, 255, 255, 0.9)", 
      background: "#fdf2f8" 
    },
    blue: { 
      bubbleYou: "rgba(59, 130, 246, 0.8)", 
      bubbleAI: "rgba(255, 255, 255, 0.9)", 
      background: "#f0f9ff" 
    },
    purple: { 
      bubbleYou: "rgba(139, 92, 246, 0.8)", 
      bubbleAI: "rgba(255, 255, 255, 0.9)", 
      background: "#faf5ff" 
    },
    gray: { 
      bubbleYou: "rgba(107, 114, 128, 0.8)", 
      bubbleAI: "rgba(249, 250, 251, 0.9)", 
      background: "#f9fafb" 
    },
  };

  const currentTheme = {
    ...themes[theme],
    bubbleYou: customColor || themes[theme].bubbleYou, // 优先用自定义色
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = () => {
    const currentConfig = apiService.getCurrentConfig();
    if (!currentConfig) {
      setApiStatus("❌ 未配置API，请先在设置中配置API");
    } else {
      setApiStatus(`✅ 使用: ${currentConfig.name} (${currentConfig.defaultModel})`);
    }
  };

  useEffect(() => {
    setRooms(prev =>
      prev.map(r =>
        r.id === room.id ? { ...r, messages, theme, name: roomName } : r
      )
    );
  }, [messages, theme, roomName, room.id, setRooms]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🛑 修复：更严格的人设内容检测
  const isPersonaContent = (content) => {
    if (!content || content.length < 10) return false;
    
    const normalizedContent = content.toLowerCase().replace(/\s+/g, '');
    
    const personaPatterns = [
      '你是ai角色', '角色描述', '说话风格', '必须遵守的规则', 
      '对话对象', '近期相关记忆', '外表干净帅气', '少年感十足',
      '身高186', '对别人冷淡', '占有欲强', '随时能把', '抱起来吻',
      '脾气不算好', '嘴贱但不会嘴毒', '有点色但不过头', '只有.*能让他心软',
      '禁止用.*描述动作', '禁止机械式', '禁止把.*当', '禁止重复使用',
      '禁止滥用', '清冷、懒散、轻微痞气', '平时喜欢叫她', '宝宝', '宝贝',
      '小猫', '老婆', '哥哥', '老公', 'daddy', '【角色描述】', '【说话风格】',
      '【必须遵守的规则】', '【对话对象】', '【近期相关记忆】'
    ];
    
    return personaPatterns.some(pattern => {
      try {
        if (pattern.includes('.*')) {
          const regex = new RegExp(pattern);
          return regex.test(normalizedContent);
        }
        return normalizedContent.includes(pattern);
      } catch (e) {
        return normalizedContent.includes(pattern);
      }
    });
  };

  // 🛑 修复：保存消息到记忆库
  const saveToMemory = async (message) => {
    try {
      console.log("🔍 尝试保存消息:", message.id, message.text.substring(0, 50));
      
      // 🆕 检查是否已保存过（基于消息ID）
      if (savedMessageIds.current.has(message.id)) {
        console.log("🔄 跳过已保存的消息:", message.text.substring(0, 40));
        return;
      }

      const { text, sender } = message;
      const role = sender === 'you' ? 'user' : 'assistant';

      // 🧩 过滤掉人设内容
      if (isPersonaContent(text)) {
        console.log("⚠️ 跳过保存人设内容:", text.substring(0, 50));
        // 🆕 即使是人设内容也标记为已保存，避免重复检查
        saveMessageIdToStorage(message.id);
        return;
      }

      // 🧩 过滤空或太短内容
      if (!text.trim() || text.length < 3) return;

      // 🧩 检查是否已存在相同内容的记忆（数据库级别去重）
      const existingMemories = await memoryService.getMemories();
      const alreadyExists = existingMemories.memories.some(
        (mem) => mem.content === text
      );
      if (alreadyExists) {
        console.log("🟡 跳过重复记忆:", text.substring(0, 40));
        saveMessageIdToStorage(message.id);
        return;
      }

      // 计算重要性
      const importance = calculateMessageImportance(message);

      // 🧩 写入记忆
      const newMemory = await memoryService.createMemory({
        user_id: "current_user",
        chatroom_id: room.id,
        chatroom_name: roomName,
        role,
        content: text,
        importance,
        tags: role === "user" ? ["用户消息"] : ["AI回复"],
        tokens: text.length,
        source: "auto_save",
        timestamp: new Date().toISOString(),
      });

      console.log("✅ 记忆保存成功:", text.substring(0, 50));
      
      // 🆕 标记为已保存
      saveMessageIdToStorage(message.id);

      // 🧩 同步到 localforage
      try {
        const localMemories = (await localforage.getItem("whisper_memories")) || [];
        localMemories.push(newMemory);
        await localforage.setItem("whisper_memories", localMemories);
        console.log("📦 本地缓存同步成功");
      } catch (err) {
        console.warn("⚠️ 本地缓存同步失败:", err);
      }
    } catch (error) {
      console.error("❌ 保存记忆失败:", error);
    }
  };

  // 🛑 修复：发送消息函数 - 只保存新消息
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const currentConfig = apiService.getCurrentConfig();
    if (!currentConfig) {
      const systemMsg = { 
        sender: "system", 
        text: "❌ 请先配置API设置。点击右下角菜单 → 配置API", 
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }),
        id: `system-${Date.now()}`
      };
      setMessages(prev => [...prev, systemMsg]);
      return;
    }

    const now = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // 创建用户消息
    const userMsg = { 
      sender: "you", 
      text: input, 
      time: now,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`  // 🆕 添加随机数确保唯一性
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 读取启用的人设
      const { aiProfile, userProfile } = getActiveProfiles();
      const relevantMemories = await getRelevantMemories(input, 5);
      const memoryContext = relevantMemories.map(m => `- ${m.content}`).join("\n");
      
      // 🆕 获取当前时间信息
      const currentTime = getCurrentTime();
      
      // 🆕 构建包含时间感知的系统提示词
      const baseSystemPrompt = buildSystemPrompt({ aiProfile, userProfile, memoryContext });
      const timeAwareSystemPrompt = `${baseSystemPrompt}

【时间感知】
当前真实时间：${currentTime.date} ${currentTime.time}（${currentTime.period}）
请根据这个真实时间来回应用户，不要虚构时间信息。`;

      // 调用 AI
      const reply = await callAI({
        apiKey: currentConfig.apiKey,
        baseUrl: currentConfig.baseUrl,
        model: currentConfig.defaultModel,
        messages: [
          { role: "system", content: timeAwareSystemPrompt },
          ...messages.filter(msg => msg.sender === 'you' || msg.sender === 'ai')
            .map(msg => ({
              role: msg.sender === 'you' ? 'user' : 'assistant',
              content: msg.text
            })),
          { role: "user", content: input }
        ],
        chatroom_id: room.id,
        chatroom_name: roomName
      });

      setIsTyping(false);
      
      // 创建AI消息
      const aiMsg = {
        sender: "ai",
        text: reply,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`  // 🆕 添加随机数确保唯一性
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // 🛑 修复：只保存新产生的两条消息
      console.log("💾 开始保存新消息到记忆库...");
      await saveToMemory(userMsg);
      await saveToMemory(aiMsg);
      console.log("💾 消息保存完成");

    } catch (err) {
      setIsTyping(false);
      console.error("API调用失败:", err);

      let errorMessage = `❌ 请求失败：${err.message}`;
      if (err.message.includes("401")) {
        errorMessage = "❌ API Key无效，请检查配置";
      } else if (err.message.includes("404")) {
        errorMessage = "❌ 请求地址不存在，请检查Base URL";
      } else if (err.message.includes("429")) {
        errorMessage = "❌ 请求频率过高，请稍后重试";
      } else if (err.message.includes("500")) {
        errorMessage = "❌ 服务器内部错误，请稍后重试";
      } else if (err.message.includes("network") || err.message.includes("Failed to fetch")) {
        errorMessage = "❌ 网络连接失败，请检查网络设置";
      }

      const errorMsg = {
        sender: "ai",
        text: errorMessage,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        id: `error-${Date.now()}`
      };

      setMessages(prev => [...prev, errorMsg]);
    }
  };

  // 🆕 清空消息时也清空保存记录
  const clearMessages = () => {
    setMessages([]);
    setShowMenu(false);
    // 🆕 清空时也清空已保存的消息ID记录
    savedMessageIds.current.clear();
    localStorage.removeItem(`savedMessageIds_${room.id}`);
  };

  // 🆕 导入现有聊天记录到记忆库
  const importExistingMessages = async () => {
    if (!window.confirm("是否将现有聊天记录导入到记忆库？")) return;
    
    try {
      const existingMemories = await memoryService.getMemories();
      const existingContentSet = new Set(existingMemories.memories.map(m => m.content));
      
      let importedCount = 0;
      let skippedCount = 0;
      
      for (const msg of messages) {
        if (msg.sender === 'system' || msg.text.includes('❌')) {
          continue;
        }
        
        if (isPersonaContent(msg.text)) {
          console.log("⚠️ 跳过导入人设内容:", msg.text.substring(0, 50));
          skippedCount++;
          continue;
        }
        
        if (existingContentSet.has(msg.text)) {
          skippedCount++;
          continue;
        }
        
        let importance = 0.5;
        let role = 'user';
        
        if (msg.sender === 'you') {
          role = 'user';
          importance = 0.6;
          if (msg.text.length > 30 || containsImportantKeywords(msg.text)) {
            importance = 0.8;
          }
        } else if (msg.sender === 'ai') {
          role = 'assistant';
          importance = 0.7;
          if (msg.text.length > 50 || containsImportantKeywords(msg.text)) {
            importance = 0.9;
          }
        }
        
        await memoryService.createMemory({
          user_id: "current_user",
          chatroom_id: room.id,
          chatroom_name: roomName,
          role: role,
          content: msg.text,
          importance: importance,
          tags: role === 'user' ? ["用户消息"] : ["AI回复"],
          tokens: msg.text.length,
          source: 'manual_import'
        });
        
        importedCount++;
        existingContentSet.add(msg.text);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const resultMessage = `成功导入 ${importedCount} 条新消息到记忆库` +
        (skippedCount > 0 ? `，跳过 ${skippedCount} 条消息（包含人设内容和重复消息）` : '');
      alert(resultMessage);
      
    } catch (error) {
      console.error('导入消息失败:', error);
      alert('导入消息失败: ' + error.message);
    }
  };

  // 其他辅助函数保持不变...
  const shouldAutoSaveAsMemory = (message) => {
    if (message.sender === 'system' || message.text.includes('❌')) {
      return false;
    }
    
    const content = message.text;
    if (content.length < 15) return false;
    if (content.length > 500) return false;
    
    const importantKeywords = [
      '学习', '教学', '教育', '知识', '理解', '掌握', '学会',
      '教程', '指南', '步骤', '方法', '技巧', '经验',
      '喜欢', '爱', '爱好', '兴趣', '偏好', '钟意',
      '讨厌', '不喜欢', '反感',
      '目标', '计划', '规划', '安排', '打算', '想要',
      '梦想', '理想', '愿望', '期待',
      '重要', '关键', '核心', '要点', '重点', '记住',
      '备忘', '笔记', '记录',
      'python', '编程', '代码', '开发', '技术', '算法',
      '数据', '分析', '机器学习', '人工智能', 'AI',
      '认为', '觉得', '观点', '看法', '想法', '见解',
      '总结', '结论', '发现', '体会'
    ];
    
    const hasImportantKeyword = importantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const hasQuestionMark = content.includes('?') || content.includes('？');
    const hasExplanation = content.includes('因为') || content.includes('所以') || 
                           content.includes('原因') || content.includes('结果');
    
    let score = 0;
    
    if (content.length > 50) score += 2;
    if (content.length > 100) score += 1;
    if (hasImportantKeyword) score += 3;
    if (hasExplanation) score += 2;
    if (!hasQuestionMark) score += 1;
    
    if (message.sender === 'you') {
      score += 2;
    } else if (message.sender === 'ai') {
      if (content.length > 80 && hasExplanation) {
        score += 2;
      }
    }
    
    return score >= 5;
  };

  const calculateMessageImportance = (message) => {
    const content = message.text;
    let importance = 0.5;
    
    if (shouldAutoSaveAsMemory(message)) {
      importance = 0.7;
      
      if (content.length > 100) importance += 0.1;
      if (containsImportantKeywords(content)) importance += 0.1;
      if (message.sender === 'you') importance += 0.05;
      
      importance = Math.min(importance, 0.95);
    }
    
    return importance;
  };

  const containsImportantKeywords = (text) => {
    const importantKeywords = [
      '喜欢', '爱', '重要', '记住', '学习', '目标', '计划',
      '梦想', '想法', '观点', '经验', '教训', '总结', 'python',
      '编程', '数据', '分析', '机器学习', '人工智能'
    ];

    return importantKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const getRelevantMemories = async (currentMessage, limit = 3) => {
    try {
      let allMemories = [];

      try {
        const result = await memoryService.getMemories();
        allMemories = result.memories || [];
      } catch (err) {
        console.warn("⚠️ 后端记忆读取失败，使用本地缓存：", err);
        allMemories = (await localforage.getItem("whisper_memories")) || [];
      }

      if (!allMemories || allMemories.length === 0) {
        return [];
      }

      const relevantMemories = allMemories
        .filter((memory) => {
          if (memory.content === currentMessage) return false;
          const messageKeywords = extractKeywords(currentMessage);
          const memoryKeywords = extractKeywords(memory.content);
          const matchScore = calculateMatchScore(messageKeywords, memoryKeywords);
          return matchScore > 0.3;
        })
        .sort((a, b) => b.importance - a.importance)
        .slice(0, limit);

      return relevantMemories;
    } catch (error) {
      console.error("检索记忆失败:", error);
      return [];
    }
  };

  const extractKeywords = (text) => {
    const words = text.split(/[\s,，.。!！?？;；:：、]+/);
    return words.filter(word => 
      word.length > 1 &&
      !['的', '了', '在', '是', '我', '你', '他', '她', '它'].includes(word)
    );
  };

  const calculateMatchScore = (messageKeywords, memoryKeywords) => {
    const commonKeywords = messageKeywords.filter(keyword => 
      memoryKeywords.includes(keyword)
    );
    return commonKeywords.length / Math.max(messageKeywords.length, 1);
  };

  const exportMessages = () => {
    if (!messages || messages.length === 0) {
      alert("当前没有聊天记录可导出哦～");
      return;
    }

    // 🕒 自动加日期
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    // 📝 拼接内容
    const content = messages
      .map(
        (m) =>
          `[${m.time || "--:--"}] ${m.sender === "you" ? "你" : m.sender === "ai" ? "AI" : m.sender}: ${m.text}`
      )
      .join("\n");

    // ✨ 加上 UTF-8 BOM 头，防止中文乱码
    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roomName || "聊天记录"}_${formattedDate}.txt`;

    // 📱 兼容 iOS/Android：部分浏览器不支持 a.click()
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    setShowMenu(false);

    alert("✅ 聊天记录已成功导出，可以在下载目录或文件管理器中查看～");
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowMenu(false);
  };

  const openApiConfig = () => {
    setCurrentApp("api");
    setShowMenu(false);
  };

  const openMemoryCorridor = () => {
    setCurrentApp("memoryCorridor");
    setShowMenu(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: chatBackground ? 'transparent' : currentTheme.background,
      backgroundImage: chatBackground ? `url(${chatBackground})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(8px)'
      }}>
        <div 
          onClick={() => setCurrentApp("chat")}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} color="#6b7280" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#374151' 
          }}>
            {roomName}
          </span>
          {apiStatus && (
            <span style={{ 
              fontSize: '10px', 
              color: apiStatus.includes('❌') ? '#ef4444' : '#10b981',
              marginTop: '2px'
            }}>
              {apiStatus}
            </span>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowMenu(!showMenu)}
            style={{
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <MoreHorizontal size={20} color="#6b7280" />
          </div>
          
          {showMenu && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "32px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              padding: "8px",
              width: "220px",
              zIndex: 1000
            }}>
              {/* API状态和配置 */}
              <div style={{ 
                padding: "8px 12px", 
                fontSize: "12px", 
                color: "#6b7280",
                borderBottom: "1px solid #e5e7eb",
                marginBottom: "8px"
              }}>
                {apiStatus}
              </div>
              
              <button 
                onClick={openApiConfig}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#3b82f6",
                  fontWeight: "500"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#dbeafe"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              >
                ⚙️ 配置API
              </button>
              
              <button 
                onClick={openMemoryCorridor}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#ec4899",
                  fontWeight: "500"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#fce7f3"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              >
                🏛️ 记忆回廊
              </button>
              
              <button 
                onClick={importExistingMessages}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              >
                📥 导入到记忆库
              </button>
              
              <div style={{
                height: "1px",
                backgroundColor: "#e5e7eb",
                margin: "8px 0"
              }}></div>
              
              <button
                onClick={() => {
                  if (window.confirm("确定要清空所有聊天记录吗？\n此操作不可恢复！")) {
                    clearMessages();
                  }
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                🗑️ 清空聊天
              </button>
              
              <button 
                onClick={exportMessages}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
              >
                💾 保存聊天
              </button>
              
              <div style={{ padding: "8px 12px 4px", fontSize: "12px", color: "#6b7280" }}>
                更换头像
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "0 12px 12px" }}>
                {/* 用户头像上传 */}
                <label style={{ cursor: "pointer" }}>
                  <img
                    src={userAvatar}
                    alt="user"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const url = event.target.result;
                          setUserAvatar(url);
                          localStorage.setItem("userAvatar", url);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* AI头像上传 */}
                <label style={{ cursor: "pointer" }}>
                  <img
                    src={aiAvatar}
                    alt="ai"
                    style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const url = event.target.result;
                          setAiAvatar(url);
                          localStorage.setItem("aiAvatar", url);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* 🎨 自定义颜色 */}
              <div style={{ padding: "8px 12px", fontSize: "12px", color: "#6b7280" }}>气泡颜色</div>
              <div style={{ padding: "0 12px 8px" }}>
                <input
                  type="color"
                  value={customColor || currentTheme.bubbleYou}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    localStorage.setItem("customColor", e.target.value);
                  }}
                />
              </div>
              
              <div style={{
                height: "1px",
                backgroundColor: "#e5e7eb",
                margin: "8px 0"
              }}></div>
              
              <input 
                type="text"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                placeholder="修改聊天室名称"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />

            </div>
          )}
        </div>
      </div>

      {/* 聊天区域 */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "12px 16px" 
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: msg.sender === "you" ? "flex-end" : "flex-start",
            marginBottom: "12px",
            alignItems: "flex-start"
          }}>
            {/* AI头像和时间 */}
            {msg.sender !== "you" && msg.sender !== "system" && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: "8px",
                minWidth: "40px"
              }}>
               {aiAvatar ? (
                  <img
                    src={aiAvatar}
                    alt="AI"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "4px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "10px",
                    flexShrink: 0,
                    marginBottom: "4px"
                  }}>
                    AI
                  </div>
                )}

                <span style={{
                  fontSize: "10px",
                  color: "#9ca3af"
                }}>
                  {msg.time}
                </span>
              </div>
            )}
            
            {/* 系统消息样式 */}
            {msg.sender === "system" && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: "8px",
                minWidth: "40px"
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "10px",
                  flexShrink: 0,
                  marginBottom: "4px"
                }}>
                  ⚠️
                </div>
                <span style={{
                  fontSize: "10px",
                  color: "#9ca3af"
                }}>
                  {msg.time}
                </span>
              </div>
            )}
            
            {/* 消息气泡 */}
            <div style={{
              backgroundColor:
                msg.sender === "you"
                  ? currentTheme.bubbleYou
                  : msg.sender === "system"
                  ? "#fef3c7"
                  : currentTheme.bubbleAI,
              color:
                msg.sender === "you"
                  ? "white"
                  : msg.sender === "system"
                  ? "#92400e"
                  : "#374151",
              padding: "8px 12px",
              borderRadius: "12px",
              maxWidth: "70%",
              border:
                msg.sender === "you"
                  ? "none"
                  : msg.sender === "system"
                  ? "1px solid #fbbf24"
                  : "1px solid rgba(229,231,235,0.5)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: "14px", lineHeight: "1.4", wordBreak: "break-word" }}>
                {msg.text}
              </div>
            </div>

            {/* 用户头像和时间 */}
            {msg.sender === "you" && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "8px",
                minWidth: "40px"
              }}>
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="user"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "4px"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: currentTheme.bubbleYou,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "10px",
                    flexShrink: 0,
                    marginBottom: "4px"
                  }}>
                    你
                  </div>
                )}

                <span style={{
                  fontSize: "10px",
                  color: "#9ca3af"
                }}>
                  {msg.time}
                </span>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && <TypingBubble />}
        <div ref={bottomRef}></div>
      </div>

      {/* 输入栏 */}
      <div style={{
        padding: "12px 16px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderTop: "1px solid #e5e7eb",
        backdropFilter: "blur(8px)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f3f4f6",
          borderRadius: "20px",
          padding: "6px 12px"
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="开始聊天吧..."
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "14px",
              padding: "6px 0",
              fontFamily: "inherit",
              lineHeight: "1.4",
            }}
          />

          
          <button 
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              backgroundColor: input.trim() ? currentTheme.bubbleYou : "#d1d5db",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "12px",
              marginLeft: "8px",
              cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}