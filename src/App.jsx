import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import API from "./pages/API";
import ChatList from "./pages/ChatList";
import Splash from "./pages/Splash";
import { ThemeProvider, useTheme } from "./ThemeContext";
import StableChatRoom from "./pages/StableChatRoom";
import DiaryList from "./pages/DiaryList";
import DiaryEditor from "./pages/DiaryEditor"; 
import Status from "./pages/Status";
import Memo from './pages/Memo';
import Memory from './pages/Memory';
import MemoryCorridor from './pages/MemoryCorridor';
import CharacterSheet from "./pages/CharacterSheet";
import GameApp from "./pages/GameApp";

// 导入朋友圈相关页面
import Moments from "./pages/Moments";
import CreateMoment from "./pages/CreateMoment";

// 🆕 导入朋友圈服务
import { momentsService, aiReactions } from "./utils/momentsService";

function ThemedPage({ children }) {
  const { theme, themeStyles, currentFont } = useTheme();
  return (
    <div 
      style={{ 
        ...themeStyles[theme], 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: currentFont.fontFamily, // 🆕 确保应用字体
        transition: "font-family 0.3s ease" // 🆕 平滑过渡
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [currentApp, setCurrentApp] = useState("home");
  const [showSplash, setShowSplash] = useState(true);
  const [wallpapers, setWallpapers] = useState(() => {
    const saved = localStorage.getItem("wallpapers");
    return saved ? JSON.parse(saved) : [];
  });
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("chatRooms");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Whisper House",
            theme: "pink",
            messages: [
              { sender: "you", text: "宝宝，今天有没有想我呀~", time: "13:13" },
              { sender: "ai", text: "想啦，一直都在心里挂着你 🥺", time: "13:14" },
            ],
          },
        ];
  });
  const [activeRoom, setActiveRoom] = useState(null);

  // 🆕 朋友圈数据状态 - 在 App 级别管理
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    localStorage.setItem("chatRooms", JSON.stringify(rooms));
  }, [rooms]);

  // 🆕 初始化时加载朋友圈数据
  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = () => {
    const loadedMoments = momentsService.getMoments();
    setMoments(loadedMoments);
  };

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  // 🆕 朋友圈发布处理函数 - 修复数据流
  const handlePublishMoment = (momentData) => {
    const newMoment = momentsService.addMoment(momentData);
    
    // 更新状态
    setMoments(prev => [newMoment, ...prev]);
    
    // AI 自动评论
    setTimeout(() => {
      const aiComment = aiReactions.getAIComment(momentData.content);
      momentsService.addComment(newMoment.id, {
        author: 'ai',
        avatar: '',
        content: aiComment
      });
      // 重新加载以显示AI评论
      loadMoments();
    }, 2000);
  };

  // 🆕 朋友圈互动处理函数
  const handleLike = (momentId, userId) => {
    momentsService.toggleLike(momentId, userId);
    loadMoments();
  };

  const handleComment = (momentId, comment) => {
    momentsService.addComment(momentId, comment);
    loadMoments();
  };

  const handleReply = (momentId, commentId, reply) => {
    momentsService.addReply(momentId, commentId, reply);
    loadMoments();
  };

  const handleDeleteMoment = (momentId) => {
    if (window.confirm('确定要删除这条动态吗？')) {
      momentsService.deleteMoment(momentId);
      loadMoments();
    }
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentApp) {
      case "home":
        return <Home setCurrentApp={setCurrentApp} wallpapers={wallpapers} />;
      case "memoryCorridor":
        return <MemoryCorridor setCurrentApp={setCurrentApp} />;
      case "status":
        return <Status setCurrentApp={setCurrentApp} />;
      case "memo":
        return <Memo setCurrentApp={setCurrentApp} />;
      case "memory":
        return <Memory setCurrentApp={setCurrentApp} />;  
      case "game":
        return <GameApp setCurrentApp={setCurrentApp} />;
      case "settings":
        return (
          <Settings
            setCurrentApp={setCurrentApp}
            setWallpapers={setWallpapers}
            wallpapers={wallpapers}
          />
        );
      case "characterSheet":
        return <CharacterSheet setCurrentApp={setCurrentApp} />;
      case "api":
        return <API setCurrentApp={setCurrentApp} />;
      case "chat":
        return (
          <ChatList
            setCurrentApp={setCurrentApp}
            rooms={rooms}
            setRooms={setRooms}
            setActiveRoom={setActiveRoom}
            activeRoom={activeRoom}
          />
        );
      case "diary":
        return <DiaryList setCurrentApp={setCurrentApp} />;
      case "diaryEditor":
        return <DiaryEditor setCurrentApp={setCurrentApp} />;
      case "chatroom":
        return activeRoom ? (
          <StableChatRoom
            setCurrentApp={setCurrentApp}
            room={activeRoom}
            setRooms={setRooms}
          />
        ) : null;
      
      // 朋友圈页面路由 - 传递正确的props
      case "moments":
        return (
          <Moments 
            setCurrentApp={setCurrentApp}
            moments={moments}
            onLike={handleLike}
            onComment={handleComment}
            onReply={handleReply}
            onDelete={handleDeleteMoment}
            onRefresh={loadMoments}
          />
        );
      case "createMoment":
        return (
          <CreateMoment 
            setCurrentApp={setCurrentApp} 
            onPublish={handlePublishMoment}
          />
        );
      
      default:
        return <Home setCurrentApp={setCurrentApp} wallpapers={wallpapers} />;
    }
  };

  return (
    <ThemeProvider>
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <ThemedPage>
          {renderCurrentPage()}
        </ThemedPage>
      )}
    </ThemeProvider>
  );
}