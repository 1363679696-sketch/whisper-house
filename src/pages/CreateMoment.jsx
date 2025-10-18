import { useState, useRef } from 'react';
import { ArrowLeft, X, MapPin } from 'lucide-react';

export default function CreateMoment({ setCurrentApp, onPublish }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const fileInputRef = useRef(null);

  // 处理图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 9) {
      alert('最多只能上传9张图片');
      return;
    }

    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  // 移除图片
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 发布动态
  // 在 handlePublish 函数中确保调用了 onPublish
const handlePublish = () => {
  if (!content.trim() && images.length === 0) {
    alert('请填写动态内容或上传图片');
    return;
  }

  const newMoment = {
    author: 'user',
    content: content.trim(),
    images: images,
    location: location.trim() || null
  };

  // 🆕 确保调用 onPublish 回调
  if (onPublish) {
    onPublish(newMoment);
  }
  
  setCurrentApp('moments');
};

  // 打开图片选择
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#fff'
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <div 
          onClick={() => setCurrentApp('moments')}
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
          发布动态
        </span>
        <button
          onClick={handlePublish}
          disabled={!content.trim() && images.length === 0}
          style={{
            padding: '6px 16px',
            backgroundColor: (!content.trim() && images.length === 0) ? '#e5e7eb' : '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: (!content.trim() && images.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          发布
        </button>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 文本输入框 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的生活瞬间..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            lineHeight: '1.5',
            resize: 'none',
            fontFamily: 'inherit',
            marginBottom: '16px'
          }}
        />

        {/* 图片预览 */}
        {images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {images.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={image}
                  alt={`预览 ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: 'none',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 功能按钮 */}
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '16px 0',
          borderTop: '1px solid #f3f4f6'
        }}>
          {/* 图片上传 */}
          <button
            onClick={triggerFileInput}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#fce7f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📸
            </div>
            图片
          </button>

          {/* 位置 */}
          <button
            onClick={() => setShowLocationInput(!showLocationInput)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={16} />
            </div>
            位置
          </button>
        </div>

        {/* 位置输入框 */}
        {showLocationInput && (
          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="添加位置..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}