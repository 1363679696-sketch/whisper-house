import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { useTheme } from "../ThemeContext"; // 🆕 导入 useTheme

export default function GameLottery({ goBack }) {
  const { currentFont } = useTheme(); // 🆕 获取当前字体
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [rotation, setRotation] = useState(0);
  const [refreshAnim, setRefreshAnim] = useState(false);
  const [showHint, setShowHint] = useState(false); // ✅ 新增提示状态
  const canvasRef = useRef(null);

  const colors = [
    "#FDE68A", "#BFDBFE", "#F9A8D4", "#C7D2FE", "#FDBA74",
    "#86EFAC", "#FBCFE8", "#A5F3FC", "#FCA5A5", "#D8B4FE"
  ];

  // 初始化加载
  useEffect(() => {
    (async () => {
      const saved = (await localforage.getItem("lottery_options")) || ["保持微笑", "喝杯奶茶"];
      setOptions(saved);
    })();
  }, []);

  // 保存 + 动画 + 提示
  const saveOptions = async (opts) => {
    setOptions(opts);
    await localforage.setItem("lottery_options", opts);
    triggerRefreshAnim();
    showUpdateHint();
    setRotation(0); // ✅ 每次保存后重置角度
  };

  // 刷新动画
  const triggerRefreshAnim = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setRefreshAnim(true);
    setTimeout(() => setRefreshAnim(false), 400);
  };

  // ✅ 显示"已更新"提示
  const showUpdateHint = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 1800);
  };

  // 绘制转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options.length < 2) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const radius = size / 2;
    const angle = (2 * Math.PI) / options.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(radius, radius);

    options.forEach((opt, i) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.fillStyle = colors[i % colors.length];
      ctx.arc(0, 0, radius - 10, i * angle, (i + 1) * angle);
      ctx.fill();

      ctx.save();
      ctx.rotate(i * angle + angle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#374151";
      ctx.font = `bold 14px ${currentFont.fontFamily}`; // 🆕 使用当前字体
      ctx.fillText(opt, radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#FBBF24";
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 3, 0, 2 * Math.PI);
    ctx.stroke();
  }, [options, rotation, currentFont]); // 🆕 添加 currentFont 依赖

  // 抽签逻辑（修复动画卡顿）
  const spinWheel = () => {
    if (spinning || options.length < 2) return;

    // 🔧 修复转盘变慢问题
    setRotation(0);
    void canvasRef.current.offsetWidth; // 强制刷新 DOM 防止动画叠加

    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

    setSpinning(true);
    setResult("");
    const spinDeg = 360 * 5 + Math.floor(Math.random() * 360);
    setRotation(spinDeg);

    setTimeout(() => {
      const pickedIndex = Math.floor(((360 - (spinDeg % 360)) / 360) * options.length) % options.length;
      setResult(options[pickedIndex]);
      setSpinning(false);
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    }, 4000);
  };

  // 添加 / 删除 / 清空
  const addOption = () => {
    if (!newOption.trim() || options.length >= 10) return;
    const updated = [...options, newOption.trim()];
    saveOptions(updated);
    setNewOption("");
  };

  const deleteOption = (i) => {
    const updated = options.filter((_, idx) => idx !== i);
    saveOptions(updated);
  };

  const clearOptions = () => {
    if (window.confirm("确定要清空所有选项吗？")) {
      saveOptions([]);
      setResult("");
    }
  };

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      fontFamily: currentFont.fontFamily, // 🆕 使用当前字体
      backgroundColor: "#f8fafc",
      transition: "font-family 0.3s ease" // 🆕 添加过渡效果
    }}>
      {/* 顶栏 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 16px",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #e5e7eb",
          position: "relative",
        }}
      >
        <button
          onClick={goBack}
          style={{
            position: "absolute",
            left: "16px",
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>随机抽签</h2>
      </div>

      {/* 转盘 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div
          style={{
            position: "relative",
            transform: refreshAnim ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        >
          <canvas
            ref={canvasRef}
            width={260}
            height={260}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
          ></canvas>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70px",
              height: "70px",
              background: "#FBBF24",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
            onClick={spinWheel}
          >
            GO
          </div>
        </div>

        {result && (
          <div
            style={{
              marginTop: "20px",
              fontSize: "16px",
              color: "#374151",
              background: "white",
              borderRadius: "12px",
              padding: "12px 20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            ✨ 抽到的是：<b>{result}</b>
          </div>
        )}
      </div>

      {/* 编辑选项卡片 */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #f1f5f9",
          padding: "16px",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="输入选项内容..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px",
              outline: "none",
              fontSize: "14px",
              fontFamily: "inherit" // 🆕 继承字体
            }}
          />
          <button
            onClick={addOption}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              marginLeft: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "inherit" // 🆕 继承字体
            }}
          >
            添加
          </button>
        </div>

        {options.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
            {options.map((opt, i) => (
              <div
                key={i}
                style={{
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                }}
              >
                {opt}
                <span
                  onClick={() => deleteOption(i)}
                  style={{
                    color: "#ef4444",
                    cursor: "pointer",
                    marginLeft: "4px",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <button
            onClick={clearOptions}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit" // 🆕 继承字体
            }}
          >
            清空全部
          </button>
        </div>

        {/* ✅ 更新提示气泡 */}
        {showHint && (
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(55, 65, 81, 0.9)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              opacity: showHint ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            ✅ 转盘已更新
          </div>
        )}
      </div>
    </div>
  );
}