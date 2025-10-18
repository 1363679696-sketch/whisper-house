import { useState, useEffect } from "react";
import { Plus, Edit2, Save, Trash2, Sparkles } from "lucide-react";
import { characterService } from "../utils/characterService";
import { useTheme } from "../ThemeContext";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function CharacterSheet({ setCurrentApp }) {
  const { currentFont } = useTheme();
  const [characters, setCharacters] = useState([]);
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [editing, setEditing] = useState(null);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态

  // 表单字段
  const [form, setForm] = useState({
    name: "",
    role: "ai", // 默认 AI
    description: "",
    style: "",
    rules: "",
    relationship: "", // 新增字段
  });

  // 初始化加载和壁纸设置
  useEffect(() => {
    const all = characterService.getAll();
    setCharacters(all);
    setActiveCharacter(characterService.getActive());
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

  // 保存角色
  const saveCharacter = () => {
    if (!form.name.trim()) return alert("请填写角色名称");
    characterService.save(form);
    setCharacters(characterService.getAll());
    setForm({ name: "", role: "ai", description: "", style: "", rules: "", relationship: "" });
    setEditing(null);
  };

  // 编辑角色
  const editCharacter = (char) => {
    setEditing(char.name);
    setForm(char);
  };

  // 删除角色
  const deleteCharacter = (name) => {
    if (!window.confirm("确定删除此角色吗？")) return;
    characterService.delete(name);
    setCharacters(characterService.getAll());
  };

  // ✅ 启用人设（并写入 localStorage）
  const activateCharacter = (char) => {
    characterService.setActive(char);
    setActiveCharacter(char);

    // 🧠 存入本地供聊天页读取
    if (char.role === "ai") {
      localStorage.setItem("active_ai_profile", JSON.stringify(char));
    } else if (char.role === "user") {
      localStorage.setItem("active_user_profile", JSON.stringify(char));
    }

    alert(`已启用 ${char.role === "ai" ? "AI" : "用户"} 人设：${char.name}`);
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

  return (
    <div style={{ 
      padding: "16px", 
      fontFamily: currentFont.fontFamily,
      minHeight: "100vh",
      ...backgroundStyle, // 应用背景样式
      transition: "font-family 0.3s ease, background 0.3s ease" // 添加背景过渡效果
    }}>
      {/* 顶部导航 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setCurrentApp("home")}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer",
              fontSize: "18px",
              color: "#374151"
            }}
          >
            ←
          </button>
          <h2 style={{ 
            fontWeight: "700", 
            color: "#374151",
            textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
          }}>
            设定手册
          </h2>
        </div>
        <button
          onClick={saveCharacter}
          style={{
            padding: "8px 14px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#059669";
            e.target.style.transform = "scale(0.98)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#10b981";
            e.target.style.transform = "scale(1)";
          }}
        >
          <Save size={16} />
          保存
        </button>
      </div>

      {/* 编辑区域 */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}
      >
        {/* 身份选择 */}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={{
            ...inputStyle,
            backgroundColor: "#f9fafb",
            fontWeight: "600",
            color: "#374151",
            fontFamily: "inherit"
          }}
        >
          <option value="ai">AI人设</option>
          <option value="user">用户人设</option>
        </select>

        <input
          placeholder="角色名称"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{...inputStyle, fontFamily: "inherit"}}
        />
        <textarea
          placeholder="角色描述（外貌、性格、背景）"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          style={{...textareaStyle, fontFamily: "inherit"}}
        />
        <textarea
          placeholder="语气风格（示例：高冷、温柔、少年感）"
          value={form.style}
          onChange={(e) => setForm({ ...form, style: e.target.value })}
          style={{...textareaStyle, fontFamily: "inherit"}}
        />
        <textarea
          placeholder="禁忌与边界（例如：禁止过分甜腻或命令语气）"
          value={form.rules}
          onChange={(e) => setForm({ ...form, rules: e.target.value })}
          style={{...textareaStyle, fontFamily: "inherit"}}
        />
        <textarea
          placeholder="与用户的关系（例如：爱人、挚友、主仆）"
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          style={{...textareaStyle, fontFamily: "inherit"}}
        />
      </div>

      {/* 角色列表 */}
      <h3 style={{ 
        fontSize: "16px", 
        fontWeight: "600", 
        marginBottom: "10px",
        color: "#374151",
        textShadow: wallpaper ? "0 1px 2px rgba(255,255,255,0.8)" : "none"
      }}>
        🎭 已保存角色
      </h3>
      {characters.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          color: "#9ca3af",
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "8px",
          backdropFilter: "blur(5px)"
        }}>
          暂无人设
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {characters.map((char) => (
            <div
              key={char.name}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "10px",
                padding: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: "600", 
                  color: "#374151",
                  marginBottom: "4px"
                }}>
                  {char.name}{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      color: char.role === "ai" ? "#f59e0b" : "#3b82f6",
                      marginLeft: "6px",
                      fontWeight: "500"
                    }}
                  >
                    {char.role === "ai" ? "🤖 AI" : "👤 用户"}
                  </span>
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  color: "#6b7280",
                  lineHeight: "1.4"
                }}>
                  {char.style || "暂无风格描述"}
                </div>
                {char.relationship && (
                  <div style={{
                    fontSize: "11px",
                    color: "#8b5cf6",
                    marginTop: "2px",
                    fontStyle: "italic"
                  }}>
                    关系: {char.relationship}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button 
                  onClick={() => activateCharacter(char)} 
                  style={btn("#f59e0b")}
                  title="启用此角色"
                >
                  <Sparkles size={14} /> 启用
                </button>
                <button 
                  onClick={() => editCharacter(char)} 
                  style={btn("#3b82f6")}
                  title="编辑角色"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => deleteCharacter(char.name)} 
                  style={btn("#ef4444")}
                  title="删除角色"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 通用样式
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  marginBottom: "12px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s ease",
  backgroundColor: "white"
};

const textareaStyle = {
  ...inputStyle,
  height: "70px",
  resize: "vertical",
  fontFamily: "inherit"
};

const btn = (color) => ({
  backgroundColor: color,
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  transition: "all 0.2s ease",
  fontWeight: "500"
});