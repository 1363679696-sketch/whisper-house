import { useEffect } from "react";

// 动画开屏页
export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // 3 秒后结束开屏
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #fce7f3, #fbcfe8)",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      {/* 引入 Google Fonts Dancing Script */}
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* LOGO文字动画 */}
      <h1
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "clamp(2.5rem, 8vw, 4rem)", // 响应式字体大小
          color: "#db2777",
          animation: "fadeInScale 2s ease-in-out",
          textAlign: "center",
          margin: "0 0 20px 0",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          lineHeight: "1.2"
        }}
      >
        Whisper House
      </h1>

      {/* 副标题（可选） */}
      <p
        style={{
          fontSize: "clamp(1rem, 4vw, 1.2rem)",
          color: "#ec4899",
          animation: "fadeIn 1.5s ease-in-out 0.5s both",
          textAlign: "center",
          margin: "0 0 40px 0",
          fontWeight: "300",
          opacity: 0
        }}
      >
        你的私人聊天室
      </p>

      {/* 加载动画 */}
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(219, 39, 119, 0.3)",
          borderTop: "3px solid #db2777",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "30px"
        }}
      />

      {/* 底部声明 */}
      <p
        style={{
          marginTop: "20px",
          fontSize: "clamp(12px, 3vw, 14px)",
          color: "#6b7280",
          animation: "fadeIn 3s ease-in-out",
          textAlign: "center",
          position: "absolute",
          bottom: "30px",
          left: "0",
          right: "0",
          padding: "0 20px"
        }}
      >
        Created with ❤️ by Yeni
      </p>

      {/* 动画定义 */}
      <style>
        {`
          @keyframes fadeInScale {
            0% { 
              opacity: 0; 
              transform: scale(0.8) translateY(20px); 
            }
            70% {
              opacity: 1;
              transform: scale(1.05) translateY(0);
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* 移动端优化 */
          @media (max-width: 480px) {
            .splash-content {
              padding: 10px;
            }
          }
          
          /* 防止字体闪烁 */
          .dancing-script {
            font-display: swap;
          }
        `}
      </style>
    </div>
  );
}