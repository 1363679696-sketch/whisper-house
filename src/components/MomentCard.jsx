import { useState } from 'react';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';

export default function MomentCard({ moment, currentUser, onLike, onComment, onDelete, onReply }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // 格式化时间显示
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return time.toLocaleDateString('zh-CN');
  };

  // 处理点赞
  const handleLike = () => {
    onLike(moment.id, currentUser.id);
  };

  // 提交评论
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      if (replyingTo) {
        // 回复评论
        onReply(moment.id, replyingTo.id, {
          author: currentUser.id,
          content: newComment.trim()
        });
        setReplyingTo(null);
      } else {
        // 新评论
        onComment(moment.id, {
          author: currentUser.id,
          avatar: currentUser.avatar,
          content: newComment.trim()
        });
      }
      setNewComment('');
    }
  };

  // 处理回复
  const handleReply = (comment) => {
    setReplyingTo(comment);
    setShowComments(true);
  };

  const isLiked = moment.likes.includes(currentUser.id);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6'
    }}>
      {/* 发布者信息 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: moment.author === 'ai' ? '#dbeafe' : '#fce7f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          fontSize: '16px'
        }}>
          {moment.author === 'ai' ? '🤖' : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
            {moment.author === 'ai' ? 'AI助手' : '你'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {formatTime(moment.timestamp)}
            {moment.location && ` · ${moment.location}`}
          </div>
        </div>
        {moment.author === currentUser.id && (
          <div 
            onClick={() => onDelete(moment.id)}
            style={{ cursor: 'pointer', padding: '4px' }}
          >
            <Trash2 size={16} color="#9ca3af" />
          </div>
        )}
      </div>

      {/* 动态内容 */}
      <div style={{ 
        fontSize: '14px', 
        color: '#374151',
        lineHeight: '1.5',
        marginBottom: '12px'
      }}>
        {moment.content}
      </div>

      {/* 图片展示 */}
      {moment.images && moment.images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: moment.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {moment.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`动态图片 ${index + 1}`}
              style={{
                width: '100%',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
          ))}
        </div>
      )}

      {/* 互动统计 */}
      {(moment.likes.length > 0 || moment.comments.length > 0) && (
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          padding: '8px 0',
          borderBottom: '1px solid #f3f4f6',
          marginBottom: '8px'
        }}>
          {moment.likes.length > 0 && (
            <span>❤️ {moment.likes.length}人点赞</span>
          )}
          {moment.comments.length > 0 && (
            <span style={{ marginLeft: moment.likes.length > 0 ? '12px' : '0' }}>
              💬 {moment.comments.length}条评论
            </span>
          )}
        </div>
      )}

      {/* 互动按钮 */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: isLiked ? '#ec4899' : '#6b7280',
            fontWeight: '500'
          }}
        >
          <Heart size={16} fill={isLiked ? '#ec4899' : 'none'} />
          点赞
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}
        >
          <MessageCircle size={16} />
          评论
        </button>
      </div>

      {/* 评论区域 */}
      {showComments && (
        <div style={{ marginTop: '12px' }}>
          {/* 评论列表 */}
          {moment.comments.map((comment) => (
            <div key={comment.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: comment.author === 'ai' ? '#dbeafe' : '#fce7f3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  fontSize: '12px',
                  flexShrink: 0
                }}>
                  {comment.author === 'ai' ? '🤖' : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                    {comment.author === 'ai' ? 'AI助手' : '你'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', margin: '2px 0' }}>
                    {comment.content}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {formatTime(comment.timestamp)}
                    <span 
                      onClick={() => handleReply(comment)}
                      style={{ marginLeft: '8px', cursor: 'pointer' }}
                    >
                      回复
                    </span>
                  </div>

                  {/* 回复列表 */}
                  {comment.replies.map((reply, replyIndex) => (
                    <div key={replyIndex} style={{ 
                      marginTop: '8px', 
                      padding: '8px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>
                        {reply.author === 'ai' ? 'AI助手' : '你'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', margin: '2px 0' }}>
                        {reply.content}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {formatTime(reply.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 评论输入框 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `回复 ${replyingTo.author === 'ai' ? 'AI助手' : '你'}...` : "写下你的评论..."}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: newComment.trim() ? '#ec4899' : '#e5e7eb',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: newComment.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              发送
            </button>
          </div>

          {replyingTo && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px'
            }}>
              正在回复 {replyingTo.author === 'ai' ? 'AI助手' : '你'}
              <span 
                onClick={() => setReplyingTo(null)}
                style={{ marginLeft: '8px', cursor: 'pointer', color: '#ec4899' }}
              >
                取消
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}