export function ThemeScript() {
  const script = `
    (function() {
      function applyTheme(theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      
      try {
        // 避免FOUC (Flash of Unstyled Content)
        var theme = 'light'; // 默认主题
        
        // 只在客户端环境中读取localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            var storedTheme = localStorage.getItem('theme') || 'system';
            if (storedTheme === 'system') {
              theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else if (storedTheme === 'dark' || storedTheme === 'light') {
              theme = storedTheme;
            }
          } catch (localStorageError) {
            // localStorage可能被禁用，使用默认主题
            console.warn('localStorage access failed, using default theme');
          }
        }
        
        applyTheme(theme);
      } catch (e) {
        // 出错时使用默认浅色主题
        applyTheme('light');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
} 