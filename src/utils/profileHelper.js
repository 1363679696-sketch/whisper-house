// src/utils/profileHelper.js
import { characterService } from "./characterService";

const defaultAIProfile = {
  name: "Whisper",
  description: "温柔体贴的AI助手，善于共情与引导，回答简洁而清晰。",
  style: "温柔、耐心、鼓励式、不过度冗长",
  rules: "避免居高临下和生硬命令语气；不捏造事实；不输出隐私信息。",
  relationship: "" // 新增字段
};

const defaultUserProfile = {
  name: "你",
  description: "应用的主人，喜好和边界可能在聊天中逐步形成。",
  style: "",
  rules: "",
  relationship: "" // 新增字段
};

/**
 * 读取当前启用的 AI 人设 与 用户人设
 * 兼容两种来源：
 * - localStorage: active_ai_profile / active_user_profile
 * - 旧版仅单一 active（从 characterService.getActive() 兜底为 AI 人设）
 */
export function getActiveProfiles() {
  let aiProfile = null;
  let userProfile = null;

  try {
    aiProfile = JSON.parse(localStorage.getItem("active_ai_profile") || "null");
    userProfile = JSON.parse(localStorage.getItem("active_user_profile") || "null");
  } catch (_) {}

  // 兼容旧逻辑：只有一个启用人设时，默认作为 AI 人设
  if (!aiProfile && characterService?.getActive) {
    aiProfile = characterService.getActive();
  }

  // 兜底
  aiProfile = aiProfile || defaultAIProfile;
  userProfile = userProfile || defaultUserProfile;

  return { aiProfile, userProfile };
}

/**
 * 把两个人设 + 记忆，拼成一个 system prompt
 */
export function buildSystemPrompt({ aiProfile, userProfile, memoryContext = "" }) {
  return `
你是AI角色「${aiProfile.name}」。
【角色描述】
${aiProfile.description || "（无）"}

【说话风格】
${aiProfile.style || "（无）"}

【必须遵守的规则】
${aiProfile.rules || "（无）"}

【与用户的关系】
${aiProfile.relationship || "（无）"}

【对话对象】
对方是「${userProfile.name}」。
其人设描述：${userProfile.description || "（无）"}
对方的语气风格：${userProfile.style || "（无）"}
对方的禁忌与边界：${userProfile.rules || "（无）"}
双方关系：${userProfile.relationship || "（无）"}

【近期相关记忆】
${memoryContext || "（暂无重要记忆）"}

请严格遵循以上人设与规则，自然地与对方对话，避免冗长，保持真诚和共情。`.trim();
}

// 图标管理工具函数
export const iconHelper = {
  // 获取所有自定义图标
  getCustomIcons: () => {
    return JSON.parse(localStorage.getItem("customIcons") || "{}");
  },

  // 设置应用的自定义图标
  setCustomIcon: (appId, iconUrl) => {
    const customIcons = iconHelper.getCustomIcons();
    customIcons[appId] = iconUrl;
    localStorage.setItem("customIcons", JSON.stringify(customIcons));
    return customIcons;
  },

  // 删除应用的自定义图标
  removeCustomIcon: (appId) => {
    const customIcons = iconHelper.getCustomIcons();
    delete customIcons[appId];
    localStorage.setItem("customIcons", JSON.stringify(customIcons));
    return customIcons;
  },

  // 重置所有图标
  resetAllIcons: () => {
    localStorage.removeItem("customIcons");
    return {};
  },

  // 获取应用图标（自定义或默认）
  getAppIcon: (app) => {
    const customIcons = iconHelper.getCustomIcons();
    return customIcons[app.id] || app.icon;
  }
};