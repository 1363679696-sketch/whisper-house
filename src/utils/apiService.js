// src/utils/apiService.js

class ApiService {
  constructor() {
    this.configs = this.loadConfigs();
    this.currentConfigId = this.loadCurrentConfig();
  }

  // 加载所有API配置
  loadConfigs() {
    try {
      const saved = localStorage.getItem('apiConfigs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载API配置失败:', error);
      return [];
    }
  }

  // 加载当前选中的配置ID
  loadCurrentConfig() {
    return localStorage.getItem('currentApiConfigId') || '';
  }

  // 保存配置到本地存储
  saveConfigs() {
    try {
      localStorage.setItem('apiConfigs', JSON.stringify(this.configs));
    } catch (error) {
      console.error('保存API配置失败:', error);
    }
  }

  // 保存当前选中的配置ID
  saveCurrentConfig() {
    localStorage.setItem('currentApiConfigId', this.currentConfigId);
  }

  // 获取所有配置
  getConfigs() {
    return [...this.configs];
  }

  // 获取当前选中的配置
  getCurrentConfig() {
    const config = localStorage.getItem("aiConfig");
    return this.configs.find(config => config.id === this.currentConfigId) || null;
  }

  // 添加新配置
  addConfig(config) {
    const newConfig = {
      id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...config
    };

    this.configs.push(newConfig);
    this.saveConfigs();

    // 如果是第一个配置，自动设为当前配置
    if (this.configs.length === 1) {
      this.setCurrentConfig(newConfig.id);
    }

    return newConfig;
  }

  // 更新配置
  updateConfig(id, updates) {
    const index = this.configs.findIndex(config => config.id === id);
    if (index !== -1) {
      this.configs[index] = { ...this.configs[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveConfigs();
      return this.configs[index];
    }
    return null;
  }

  // 删除配置
  deleteConfig(id) {
    this.configs = this.configs.filter(config => config.id !== id);
    this.saveConfigs();

    // 如果删除的是当前配置，需要重新选择
    if (id === this.currentConfigId) {
      this.currentConfigId = this.configs.length > 0 ? this.configs[0].id : '';
      this.saveCurrentConfig();
    }
  }

  // 设置当前配置
  setCurrentConfig(id) {
    if (this.configs.some(config => config.id === id)) {
      this.currentConfigId = id;
      this.saveCurrentConfig();
      return true;
    }
    return false;
  }

  // 验证配置是否有效
  validateConfig(config) {
  if (!config.name || !config.name.trim()) {
    return { valid: false, error: '配置名称不能为空' };
  }
  if (!config.apiKey || !config.apiKey.trim()) {
    return { valid: false, error: 'API Key不能为空' };
  }
  if (!config.baseUrl || !config.baseUrl.trim()) {
    return { valid: false, error: 'Base URL不能为空' };
  }
  if (!config.defaultModel || !config.defaultModel.trim()) {
    return { valid: false, error: '默认模型不能为空' };
  }
  return { valid: true };
}


  // 测试API连接
  async testConnection(config = null) {
    const testConfig = config || this.getCurrentConfig();
    if (!testConfig) {
      throw new Error('没有可用的API配置');
    }

    try {
      const response = await this.makeRequest(testConfig, {
        model: testConfig.defaultModel,
        messages: [{ role: 'user', content: 'Hello! Please respond with "OK" if you can read this.' }],
        max_tokens: 10
      });

      return { success: true, message: 'API连接测试成功' };
    } catch (error) {
      return { success: false, message: `API连接测试失败: ${error.message}` };
    }
  }

  // 统一的API请求方法
  async makeRequest(config, requestBody) {
    const { provider = 'openai', apiKey, baseUrl } = config;

    const headers = {
      'Content-Type': 'application/json',
    };

    // 根据不同供应商设置认证头
    if (provider === 'openai' || provider === 'deepseek' || provider === 'mistral') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'azure') {
      headers['api-key'] = apiKey;
    } else if (provider === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const endpoint = provider === 'claude' ? '/messages' : '/chat/completions';

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // 处理不同供应商的响应格式
    if (provider === 'claude') {
      return data.content[0].text;
    } else {
      return data.choices[0].message.content;
    }
  }

 

  // 获取支持的模型列表（根据供应商）
  getSupportedModels(provider) {
    const modelLists = {
      openai: [
        { id: 'gpt-4o', name: 'GPT-4o', description: '最新的GPT-4模型' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '轻量级GPT-4模型' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '增强版GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '性价比高的模型' }
      ],
      deepseek: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'DeepSeek对话模型' },
        { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'DeepSeek代码模型' }
      ],
      claude: [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '最强的Claude模型' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: '平衡的Claude模型' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '快速的Claude模型' }
      ],
      azure: [
        { id: 'gpt-4', name: 'GPT-4', description: 'Azure GPT-4' },
        { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo', description: 'Azure GPT-3.5' }
      ]
    };

    return modelLists[provider] || [];
  }

  // 获取供应商信息
 // 统一：provider 的默认信息
getProviderInfo(provider) {
  const providers = {
    openai:  { name: 'OpenAI',         baseUrl: 'https://api.openai.com/v1' },
    deepseek:{ name: 'DeepSeek',       baseUrl: 'https://api.deepseek.com/v1' },
    claude:  { name: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com/v1' },
    azure:   { name: 'Azure OpenAI',   baseUrl: 'https://azure-api.openai.com/v1' },
    mistral: { name: 'Mistral AI',     baseUrl: 'https://api.mistral.ai/v1' },
  };
  return providers[provider] || { name: '自定义', baseUrl: '' };
}

// chat 方法里，取 baseUrl 要兜底到 provider 默认值，并打印出来便于排错
async chat(messages, { temperature = 0.7, maxTokens = 2000 } = {}) {
  const cfg = this.getCurrentConfig(); // 你原来的取法
  if (!cfg) throw new Error('未配置 API');

 const { provider, apiKey, defaultModel } = cfg;
const providerInfo = this.getProviderInfo(provider);
const baseUrl = (cfg.baseUrl && cfg.baseUrl.trim()) || providerInfo.baseUrl;

if (!baseUrl) throw new Error('Base URL 未配置，也没有默认值');
const model = defaultModel || 'deepseek-chat';

  // 简单去掉末尾斜杠，避免 //chat/completions
  const root = baseUrl.replace(/\/+$/, '');

  console.log('[api] provider=', provider, 'model=', model, 'baseUrl=', root);

  if (provider === 'openai' || provider === 'deepseek' || provider === 'azure' || provider === 'mistral') {
    const url = `${root}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
    return data?.choices?.[0]?.message?.content ?? '';
  }

  if (provider === 'claude') {
    const url = `${root}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
    return data?.content?.[0]?.text ?? '';
  }

  throw new Error('不支持的 provider');
}

}

// 创建单例实例
const apiService = new ApiService();

export default apiService;