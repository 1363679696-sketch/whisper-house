export default function MobileTest() {
  return (
    <div style={{ 
      padding: 16, 
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: 20, marginBottom: 16 }}>移动端测试页面</h1>
      
      <div style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: 12, 
        marginBottom: 12,
        borderRadius: 8
      }}>
        测试方块1 - 基础颜色
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12 
      }}>
        <div style={{ 
          width: 32, 
          height: 32, 
          backgroundColor: 'green', 
          borderRadius: '50%' 
        }}></div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: 8, 
          borderRadius: 12,
          flex: 1
        }}>
          消息气泡测试
        </div>
      </div>
      
      <input 
        style={{ 
          border: '1px solid #ccc', 
          padding: 12, 
          width: '100%', 
          marginBottom: 12,
          borderRadius: 8,
          fontSize: 16
        }} 
        placeholder="输入框测试" 
      />
      
      <button style={{ 
        backgroundColor: 'pink', 
        color: 'white', 
        padding: 12, 
        width: '100%',
        border: 'none',
        borderRadius: 8,
        fontSize: 16
      }}>
        按钮测试
      </button>
    </div>
  );
}