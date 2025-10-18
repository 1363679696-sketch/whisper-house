// src/components/TypingBubble.jsx
export default function TypingBubble() {
  // 🧠 从本地读取 AI 头像
  const aiAvatar = localStorage.getItem("aiAvatar") || "/avatar-ai.png";

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="relative">
        {/* 🖼️ 头像显示 */}
        <img
          src={aiAvatar}
          alt="avatar"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        {/* ✨ 动态光环 */}
        <div
          style={{
            position: "absolute",
            top: "-3px",
            left: "-3px",
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "2px solid rgba(255, 182, 193, 0.6)",
            animation: "pulseRing 1.5s infinite ease-in-out",
          }}
        />
      </div>

      {/* 🗨️ 输入提示 */}
      <div
        className="px-4 py-2 rounded-2xl shadow bg-white/90 backdrop-blur-sm text-gray-600 flex items-center gap-1"
        style={{ fontSize: "0.875rem" }}
      >
        <span>TA正在输入</span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>

      {/* 🔮 光环动画样式 */}
      <style>
        {`
          @keyframes pulseRing {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
}
