import { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { Key, Link, Cpu, MessageSquare, ArrowLeft, Inbox, Plus, Trash2, Edit, TestTube, X } from "lucide-react";
import apiService from "../utils/apiService";
import { getWallpaper } from "../utils/wallpaperHelper"; // 导入壁纸工具函数

export default function API({ setCurrentApp }) {
  const [configs, setConfigs] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [wallpaper, setWallpaper] = useState(null); // 添加壁纸状态
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    provider: "openai",
    apiKey: "",
    baseUrl: "",
    defaultModel: "gpt-4o"
  });

  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [testResult, setTestResult] = useState(null);

  const { theme, themeStyles } = useTheme();

  // 初始化数据和壁纸
  useEffect(() => {
    loadConfigs();
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

  const loadConfigs = () => {
    const allConfigs = apiService.getConfigs();
    const current = apiService.getCurrentConfig();
    setConfigs(allConfigs);
    setCurrentConfig(current);
  };

  // 供应商选项
  const providers = [
    { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
    { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com" },
    { id: "claude", name: "Claude (Anthropic)", baseUrl: "https://api.anthropic.com/v1/messages" },
    { id: "azure", name: "Azure OpenAI", baseUrl: "https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT" },
    { id: "mistral", name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1" },
    { id: "custom", name: "自定义", baseUrl: "" }
  ];

  // 处理供应商变更
  const handleProviderChange = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    const models = apiService.getSupportedModels(providerId);
    const defaultModel = models.length > 0 ? models[0].id : "";

    setFormData(prev => ({
      ...prev,
      provider: providerId,
      baseUrl: provider.baseUrl,
      defaultModel: defaultModel
    }));
  };

  // 开始添加新配置
  const startAddConfig = () => {
    setEditingConfig(null);
    setIsAdding(true);
    setFormData({
      name: "",
      provider: "openai",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o"
    });
    setTestResult(null);
  };

  // 开始编辑配置
  const startEditConfig = (config) => {
    setEditingConfig(config);
    setIsAdding(true);
    setFormData({
      name: config.name,
      provider: config.provider || "openai",
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      defaultModel: config.defaultModel
    });
    setTestResult(null);
  };

  // 保存配置
  const saveConfig = () => {
    const validation = apiService.validateConfig(formData);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (editingConfig) {
      // 更新现有配置
      apiService.updateConfig(editingConfig.id, formData);
    } else {
      // 添加新配置
      apiService.addConfig(formData);
    }

    loadConfigs();
    cancelEdit();
    alert(editingConfig ? "配置更新成功 ✅" : "配置添加成功 ✅");
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsAdding(false);
    setEditingConfig(null);
    setFormData({
      name: "",
      provider: "openai",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o"
    });
    setTestResult(null);
  };

  // 删除配置
  const deleteConfig = (id) => {
    if (window.confirm("确定要删除这个API配置吗？此操作不可恢复 ⚠️")) {
      apiService.deleteConfig(id);
      loadConfigs();
      alert("配置已删除 ❌");
    }
  };

  // 设置当前配置
  const setAsCurrent = (id) => {
    if (apiService.setCurrentConfig(id)) {
      loadConfigs();
      alert("已切换当前配置 ✅");
    }
  };

  // 测试配置连接
  const testConfig = async () => {
    if (!formData.apiKey.trim()) {
      alert("请先填写API Key");
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const result = await apiService.testConnection(formData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // 发送测试消息
  const handleSubmit = async () => {
    if (!testMessage.trim()) return;

    const newUserMsg = { 
      role: "user", 
      content: testMessage,
      id: Date.now() // 为每条消息添加唯一ID
    };
    setHistory((prev) => [...prev, newUserMsg]);
    setTestMessage("");
    setLoading(true);

    try {
      const reply = await apiService.chat([newUserMsg]);
      setHistory((prev) => [...prev, { 
        role: "ai", 
        content: reply,
        id: Date.now() + 1 // 为AI回复也添加唯一ID
      }]);
    } catch (err) {
      setHistory((prev) => [...prev, { 
        role: "ai", 
        content: `请求失败: ${err.message}`,
        id: Date.now() + 1
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 删除单条消息
  const deleteMessage = (messageId) => {
    setHistory(prev => prev.filter(msg => msg.id !== messageId));
  };

  // 清空所有对话历史
  const clearAllHistory = () => {
    if (history.length > 0 && window.confirm("确定要清空所有对话记录吗？")) {
      setHistory([]);
    }
  };

  // 获取当前供应商的模型列表
  const currentModels = apiService.getSupportedModels(formData.provider);

  // 构建背景样式
  const backgroundStyle = wallpaper 
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }
    : {
        backgroundColor: themeStyles[theme].backgroundColor || '#f8fafc'
      };

  // 卡片组件
  const Card = ({ icon: Icon, title, desc, children }) => (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #f3f4f6',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '12px' 
      }}>
        <Icon size={20} color="#ec4899" />
        <div>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: 0,
            color: '#374151'
          }}>
            {title}
          </h3>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            {desc}
          </p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      ...backgroundStyle
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
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
          fontWeight: '500', 
          color: '#374151' 
        }}>
          API 配置管理
        </span>
        <div style={{ width: '20px', height: '20px' }} />
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '100%'
        }}>

          {/* API配置列表 */}
          <Card icon={Key} title="API 配置列表" desc="管理多个API配置，一键切换">
            <div style={{ marginBottom: '12px' }}>
              <button
                onClick={startAddConfig}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                添加新配置
              </button>
            </div>

            {configs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                暂无API配置，请添加第一个配置
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {configs.map(config => (
                  <div
                    key={config.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: currentConfig?.id === config.id ? '#f3f4f6' : 'white',
                      borderRadius: '8px',
                      border: currentConfig?.id === config.id ? '2px solid #ec4899' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          {config.name}
                        </span>
                        {currentConfig?.id === config.id && (
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            当前使用
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6b7280',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <span>供应商: {apiService.getProviderInfo(config.provider).name}</span>
                        <span>模型: {config.defaultModel}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {currentConfig?.id !== config.id && (
                        <button
                          onClick={() => setAsCurrent(config.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          使用
                        </button>
                      )}
                      <button
                        onClick={() => startEditConfig(config)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={10} />
                      </button>
                      <button
                        onClick={() => deleteConfig(config.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 添加/编辑配置表单 */}
          {isAdding && (
            <Card 
              icon={editingConfig ? Edit : Plus} 
              title={editingConfig ? "编辑配置" : "添加新配置"} 
              desc="填写API配置信息"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 配置名称 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    配置名称
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="给这个配置起个名字"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 供应商选择 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    供应商
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="输入API Key"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Base URL */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="API基础地址"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* 默认模型 */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>
                    默认模型
                  </label>
                  <select
                    value={formData.defaultModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultModel: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {currentModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                    {currentModels.length === 0 && (
                      <option value="">暂无支持的模型</option>
                    )}
                  </select>
                </div>

                {/* 测试连接 */}
                {testResult && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: testResult.success ? '#d1fae5' : '#fee2e2',
                    color: testResult.success ? '#065f46' : '#991b1b',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {testResult.success ? '✅' : '❌'} {testResult.message}
                  </div>
                )}

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={testConfig}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <TestTube size={12} />
                    {loading ? '测试中...' : '测试连接'}
                  </button>
                  
                  <button
                    onClick={saveConfig}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {editingConfig ? '更新配置' : '保存配置'}
                  </button>
                  
                  <button
                    onClick={cancelEdit}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* 测试聊天区域 */}
          {currentConfig && (
            <>
              <Card icon={MessageSquare} title="测试聊天" desc="使用当前配置测试API功能">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <textarea
                      placeholder="输入测试消息..."
                      value={testMessage}
                      onChange={(e) => {
                        setTestMessage(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      rows={1}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        fontFamily: 'inherit',
                        backgroundColor: 'white',
                        minHeight: '40px'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !testMessage.trim()}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: loading || !testMessage.trim() ? '#d1d5db' : '#ec4899',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: loading || !testMessage.trim() ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {loading ? "发送中..." : "发送"}
                  </button>
                </div>

                {/* 清空所有对话按钮 */}
                {history.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '8px' 
                  }}>
                    <button
                      onClick={clearAllHistory}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                    >
                      <Trash2 size={12} />
                      清空对话
                    </button>
                  </div>
                )}
              </Card>

              {/* 对话历史 */}
              {history.length > 0 && (
                <div style={{ width: '100%' }}>
                  {history.map((msg, idx) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        marginBottom: '12px',
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: '18px',
                          maxWidth: '85%',
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          backgroundColor: msg.role === "user" ? '#ec4899' : 'rgba(255, 255, 255, 0.95)',
                          color: msg.role === "user" ? 'white' : '#374151',
                          border: msg.role === "ai" ? '1px solid #f3f4f6' : 'none',
                          position: 'relative'
                        }}
                      >
                        {/* 删除按钮 */}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = 1;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = 0;
                          }}
                        >
                          <X size={10} />
                        </button>

                        {msg.role === "ai" && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            marginBottom: '4px' 
                          }}>
                            <Inbox size={14} color="#ec4899" />
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: '500', 
                              color: '#6b7280' 
                            }}>
                              AI
                            </span>
                          </div>
                        )}
                        <span style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}