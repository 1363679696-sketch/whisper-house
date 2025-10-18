// src/utils/apiClient.js
import { memoryService } from "./memoryService";

/**
 * 统一的 AI 请求方法
 * 支持 OpenAI / DeepSeek / Anthropic Claude / Google Gemini
 * @param {Object} config
 * @param {string} config.apiKey - API Key
 * @param {string} config.baseUrl - Base URL
 * @param {string} config.model - 模型 ID
 * @param {Array} config.messages - 聊天消息 [{ role: "user"|"assistant", content: "..." }]
 * @param {string} config.chatroom_id - 聊天室 ID（用来存/取记忆）
 * @param {string} config.chatroom_name - 聊天室名称
 */
export async function callAI({ apiKey, baseUrl, model, messages, chatroom_id, chatroom_name }) {
  // 1. 先从数据库取最近的记忆
  let contextMemories = [];
  try {
    const res = await memoryService.getMemories(chatroom_id);
    // 取最近 5 条（你可以改成更多/更智能的筛选）
    contextMemories = res.memories.slice(-5).map(m => ({
      role: m.role,
      content: m.content
    }));
  } catch (err) {
    console.warn("获取记忆失败，继续对话:", err.message);
  }

  // 把记忆加到当前 messages 前面
  const finalMessages = [...contextMemories, ...messages];

  let reply = "⚠️ 暂不支持该模型";

  // ============ OpenAI / DeepSeek ============
  if (model.startsWith("gpt-") || model.startsWith("deepseek-")) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "请求失败");
    reply = data?.choices?.[0]?.message?.content || "⚠️ 没有回复";
  }

  // ============ Anthropic Claude ============
  if (model.startsWith("claude-")) {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        messages: finalMessages,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "请求失败");
    reply = data?.content?.[0]?.text || "⚠️ 没有回复";
  }

  // ============ Google Gemini ============
  if (model.startsWith("gemini-")) {
    const res = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: finalMessages.map((m) => m.content).join("\n") }],
          },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "请求失败");
    reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ 没有回复";
  }

  // 🛑 删除这里的自动保存代码！保存逻辑应该在 StableChatRoom.jsx 中处理
  
  return reply;
}