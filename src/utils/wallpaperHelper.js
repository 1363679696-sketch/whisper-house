export function getWallpaper(type = 'global') {
  try {
    const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
    
    if (wallpapers[type]) return wallpapers[type];
    if (type !== 'global' && wallpapers.global) return wallpapers.global;
    
    return null; // 明确返回null表示没有壁纸
  } catch (error) {
    console.error('获取壁纸失败:', error);
    return null;
  }
}

/**
 * 设置壁纸
 * @param {string} type - wallpaper类型
 * @param {string} url - 壁纸URL（base64或外部URL）
 */
export function setWallpaper(type, url) {
  try {
    const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
    wallpapers[type] = url;
    localStorage.setItem('app_wallpapers', JSON.stringify(wallpapers));
    
    // 触发壁纸更新事件
    window.dispatchEvent(new CustomEvent('wallpaperChanged', { 
      detail: { type, url } 
    }));
    
    return true;
  } catch (error) {
    console.error('设置壁纸失败:', error);
    return false;
  }
}

/**
 * 清除壁纸
 * @param {string} type - wallpaper类型
 */
export function clearWallpaper(type) {
  try {
    const wallpapers = JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
    delete wallpapers[type];
    localStorage.setItem('app_wallpapers', JSON.stringify(wallpapers));
    
    // 触发壁纸更新事件
    window.dispatchEvent(new CustomEvent('wallpaperChanged', { 
      detail: { type, url: null } 
    }));
    
    return true;
  } catch (error) {
    console.error('清除壁纸失败:', error);
    return false;
  }
}

/**
 * 上传图片并转换为base64
 * @param {File} file - 图片文件
 * @returns {Promise<string>} base64 URL
 */
export function uploadWallpaper(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * 获取所有壁纸设置
 * @returns {Object} 所有壁纸配置
 */
export function getAllWallpapers() {
  try {
    return JSON.parse(localStorage.getItem('app_wallpapers') || '{}');
  } catch (error) {
    console.error('获取壁纸配置失败:', error);
    return {};
  }
}