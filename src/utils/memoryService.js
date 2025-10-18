// src/utils/memoryService.js
import localforage from "localforage";

const API_BASE = "http://192.168.210.118:5001/api"; // 使用你的电脑IP

// 🧠 初始化 localforage 存储空间
localforage.config({
  name: "WhisperHouse",
  storeName: "memories_store",
  description: "Whisper House 记忆存储（支持手机端）",
});

export const memoryService = {
  // 获取记忆列表（优先后端，失败则读取本地）
  async getMemories(chatroomId = null, searchTerm = "") {
    try {
      const params = new URLSearchParams();
      if (chatroomId) params.append("chatroom_id", chatroomId);
      if (searchTerm) params.append("q", searchTerm);

      const response = await fetch(`${API_BASE}/memories?${params}`);
      if (!response.ok) throw new Error("获取记忆失败");

      const data = await response.json();
      await localforage.setItem("whisper_memories", data.memories || []);
      return data;
    } catch (error) {
      console.warn("⚠️ 网络错误，使用本地记忆数据");
      const local = (await localforage.getItem("whisper_memories")) || [];
      return { memories: local, total: local.length, message: "本地缓存" };
    }
  },

  // 获取记忆统计（支持离线）
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/memories/stats`);
      if (!res.ok) throw new Error("获取统计失败");
      return await res.json();
    } catch (error) {
      console.warn("⚠️ 获取统计失败，尝试本地估算");
      const local = (await localforage.getItem("whisper_memories")) || [];
      const totalTokens = local.reduce((sum, m) => sum + (m.tokens || 0), 0);
      const chatrooms = new Set(local.map((m) => m.chatroom_id));
      return {
        totalMemories: local.length,
        totalChatrooms: chatrooms.size,
        totalTokens,
        importantMemories: local.filter((m) => (m.importance || 0) > 0.7).length,
        chatroomStats: [],
      };
    }
  },

  // 删除记忆
  async deleteMemory(memoryId) {
    try {
      const response = await fetch(`${API_BASE}/memories/${memoryId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("删除记忆失败");
      const result = await response.json();

      // 本地同步删除
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.filter((m) => m.id !== memoryId);
      await localforage.setItem("whisper_memories", updated);

      return result;
    } catch (error) {
      console.error("删除记忆错误:", error);
      throw error;
    }
  },

  // 🆕 更新记忆（支持 localforage）
  async updateMemory(memoryId, updates) {
    try {
      const res = await fetch(`${API_BASE}/memories/${memoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.status === 405 || res.status === 404) {
        console.warn("后端不支持 PATCH，尝试使用 PUT 方式");
        const fallback = await fetch(`${API_BASE}/memories/${memoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!fallback.ok) throw new Error("PUT 更新失败");
        return await fallback.json();
      }

      if (!res.ok) throw new Error("更新失败");
      const updated = await res.json();

      // 本地同步更新
      const local = (await localforage.getItem("whisper_memories")) || [];
      const merged = local.map((m) =>
        m.id === memoryId ? { ...m, ...updates } : m
      );
      await localforage.setItem("whisper_memories", merged);

      return updated;
    } catch (err) {
      console.warn("⚠️ 后端更新失败，使用本地更新");
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.map((m) =>
        m.id === memoryId ? { ...m, ...updates } : m
      );
      await localforage.setItem("whisper_memories", updated);
      return { success: true, local: true };
    }
  },

  // 创建记忆（自动缓存到 localforage）
  async createMemory(memoryData) {
    try {
      const response = await fetch(`${API_BASE}/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoryData),
      });
      if (!response.ok) throw new Error("创建记忆失败");

      const newMemory = await response.json();

      // 写入本地缓存
      const local = (await localforage.getItem("whisper_memories")) || [];
      local.push(newMemory);
      await localforage.setItem("whisper_memories", local);

      return newMemory;
    } catch (error) {
      console.warn("⚠️ 无法连接后端，使用本地创建模式");
      const local = (await localforage.getItem("whisper_memories")) || [];
      const offlineMemory = {
        ...memoryData,
        id: "local_" + Date.now(),
        created_at: new Date().toISOString(),
        localOnly: true,
      };
      local.push(offlineMemory);
      await localforage.setItem("whisper_memories", local);
      return offlineMemory;
    }
  },

  // 清空聊天室记忆（后端+本地双清除）
  async clearChatroomMemories(chatroomId) {
    try {
      const response = await fetch(
        `${API_BASE}/memories/chatroom/${chatroomId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("清空记忆失败");

      // 本地同步清空
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.filter((m) => m.chatroom_id !== chatroomId);
      await localforage.setItem("whisper_memories", updated);

      return await response.json();
    } catch (error) {
      console.error("清空记忆错误:", error);
      // fallback：清空本地
      const local = (await localforage.getItem("whisper_memories")) || [];
      const updated = local.filter((m) => m.chatroom_id !== chatroomId);
      await localforage.setItem("whisper_memories", updated);
      return { success: true, local: true };
    }
  },
};
