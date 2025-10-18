import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react';
import MomentCard from '../components/MomentCard';

export default function Moments({ 
  setCurrentApp, 
  moments, 
  onLike, 
  onComment, 
  onReply, 
  onDelete,
  onRefresh 
}) {
  const [refreshing, setRefreshing] = useState(false);

  // 当前用户信息
  const currentUser = {
    id: 'user',
    avatar: localStorage.getItem('userAvatar') || ''
  };

  // 手动刷新
  const handleRefresh = () => {
    setRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  // 进入发布页面
  const enterCreateMoment = () => {
    setCurrentApp('createMoment');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div 
          onClick={() => setCurrentApp('chatlist')}
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
          朋友圈
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            onClick={handleRefresh}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw 
              size={18} 
              color="#6b7280" 
              style={{ 
                transform: refreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s ease'
              }} 
            />
          </div>
          <div 
            onClick={enterCreateMoment}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Plus size={20} color="#ec4899" />
          </div>
        </div>
      </div>

      {/* 动态列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {moments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💫</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>还没有动态</div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>分享你的生活瞬间，与AI互动吧～</div>
            <button
              onClick={enterCreateMoment}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              发布第一条动态
            </button>
          </div>
        ) : (
          moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              currentUser={currentUser}
              onLike={onLike}
              onComment={onComment}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}