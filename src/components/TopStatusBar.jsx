import { useEffect, useState } from "react";

export default function TopStatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontSize: "14px", color: "#555" }}>
      🕐 {time}｜📶 在线 | 💗 心情 | 🔋 100%
    </div>
  );
}
