// 动态数据管理服务
const MOMENTS_KEY = 'whisper_moments';

export const momentsService = {
  // 获取所有动态
  getMoments: () => {
    try {
      const moments = localStorage.getItem(MOMENTS_KEY);
      return moments ? JSON.parse(moments) : [];
    } catch (error) {
      console.error('获取动态失败:', error);
      return [];
    }
  },

  // 保存动态
  saveMoments: (moments) => {
    try {
      localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments));
      return true;
    } catch (error) {
      console.error('保存动态失败:', error);
      return false;
    }
  },

  // 添加新动态
  addMoment: (moment) => {
    const moments = momentsService.getMoments();
    const newMoment = {
      ...moment,
      id: `moment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    };
    moments.unshift(newMoment); // 新的在前面
    momentsService.saveMoments(moments);
    return newMoment;
  },

  // 添加评论
  addComment: (momentId, comment) => {
    const moments = momentsService.getMoments();
    const momentIndex = moments.findIndex(m => m.id === momentId);
    if (momentIndex !== -1) {
      const newComment = {
        id: `comment-${Date.now()}`,
        author: comment.author,
        avatar: comment.avatar,
        content: comment.content,
        timestamp: new Date().toISOString(),
        replies: []
      };
      moments[momentIndex].comments.push(newComment);
      momentsService.saveMoments(moments);
      return newComment;
    }
    return null;
  },

  // 添加回复
  addReply: (momentId, commentId, reply) => {
    const moments = momentsService.getMoments();
    const momentIndex = moments.findIndex(m => m.id === momentId);
    if (momentIndex !== -1) {
      const commentIndex = moments[momentIndex].comments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const newReply = {
          author: reply.author,
          content: reply.content,
          timestamp: new Date().toISOString()
        };
        moments[momentIndex].comments[commentIndex].replies.push(newReply);
        momentsService.saveMoments(moments);
        return newReply;
      }
    }
    return null;
  },

  // 点赞/取消点赞
  toggleLike: (momentId, userId) => {
    const moments = momentsService.getMoments();
    const momentIndex = moments.findIndex(m => m.id === momentId);
    if (momentIndex !== -1) {
      const likes = moments[momentIndex].likes;
      const likeIndex = likes.indexOf(userId);
      if (likeIndex > -1) {
        // 取消点赞
        likes.splice(likeIndex, 1);
      } else {
        // 点赞
        likes.push(userId);
      }
      momentsService.saveMoments(moments);
      return likes;
    }
    return [];
  },

  // 删除动态
  deleteMoment: (momentId) => {
    const moments = momentsService.getMoments();
    const filteredMoments = moments.filter(m => m.id !== momentId);
    return momentsService.saveMoments(filteredMoments);
  }
};

// AI 互动配置
export const aiReactions = {
  // 根据内容关键词触发不同的AI回复
  getAIComment: (content) => {
    const contentLower = content.toLowerCase();
    
    const reactions = [
      {
        keywords: ['开心', '高兴', '快乐', '幸福', '笑'],
        comments: ['看起来好快乐！🎉', '分享的喜悦感染到我了～', '为你感到开心！✨']
      },
      {
        keywords: ['美食', '吃', '餐厅', '美味', '蛋糕'],
        comments: ['看起来好好吃！😋', '美食分享最棒了～', '这个我也想吃！']
      },
      {
        keywords: ['学习', '工作', '努力', '进步', '成长'],
        comments: ['加油！继续努力～💪', '看到你的进步真为你高兴！', '坚持就是胜利！']
      },
      {
        keywords: ['旅行', '旅游', '风景', '美景', '拍照'],
        comments: ['风景真美！📸', '旅行的回忆最珍贵了～', '好想去这里看看！']
      },
      {
        keywords: ['猫', '狗', '宠物', '毛孩子'],
        comments: ['可爱的毛孩子！🐾', '宠物总是能带来快乐～', '想rua！']
      }
    ];

    // 匹配关键词
    for (const reaction of reactions) {
      for (const keyword of reaction.keywords) {
        if (contentLower.includes(keyword)) {
          const randomComment = reaction.comments[Math.floor(Math.random() * reaction.comments.length)];
          return randomComment;
        }
      }
    }

    // 默认回复
    const defaultComments = [
      '分享的生活点滴真美好～',
      '喜欢这样的日常记录！✨',
      '感谢分享！💫',
      '生活中的小确幸～'
    ];
    return defaultComments[Math.floor(Math.random() * defaultComments.length)];
  }
};