---
---
// ============================================
//  Dragon_Heart Blog - Main JavaScript
// ============================================

// 预加载背景图：全部加载完后再淡入，避免逐行加载白条
(function preloadBg() {
  var day = new Image();
  var night = new Image();
  var loaded = 0;
  function onLoad() {
    loaded++;
    if (loaded === 2) {
      document.documentElement.classList.add('bg-loaded');
    }
  }
  day.onload = night.onload = onLoad;
  day.src = '/Learning-Blog/assets/images/Bg_Norway_lofoten_mountains.jpg';
  night.src = '/Learning-Blog/assets/images/Bg_Norway_dusk.jpg';
})();

document.addEventListener('DOMContentLoaded', function () {
  
  // === 暗色模式切换 ===
  initDarkMode();

  // === 眼睛按钮：隐藏/显示卡片 ===
  initEyeToggle();

  // === 回到顶部按钮 ===
  initBackToTop();
  
  // === 代码块复制按钮 ===
  initCodeCopy();

});

// ============================================
//  暗色模式
// ============================================
function initDarkMode() {
  // 读取本地存储的偏好
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // 在侧边栏加一个切换按钮
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var card = document.createElement('div');
  card.className = 'card sidebar-card';
  card.innerHTML = 
    '<div class="sidebar-title">Theme</div>' +
    '<button id="themeToggle" style="width:100%;padding:8px;border:1px solid var(--color-border);' +
    'border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text);cursor:pointer;">' +
    (isDark() ? '☀ Light' : '🌙 Dark') +
    '</button>';
  sidebar.appendChild(card);

  document.getElementById('themeToggle').addEventListener('click', function () {
    var isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.innerHTML = isDark ? '☀ Light' : '🌙 Dark';
  });
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

// ============================================
//  眼睛按钮：隐藏/显示卡片，看背景图
// ============================================
function initEyeToggle() {
  var btn = document.querySelector('.eye-toggle');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var hidden = document.documentElement.classList.toggle('hide-cards');
    btn.textContent = hidden ? '👁‍🗨' : '👁';
  });
}

// ============================================
//  回到顶部按钮
// ============================================
function initBackToTop() {
  var btn = document.createElement('button');
  btn.textContent = '↑';
  btn.style.cssText = 
    'position:fixed;bottom:24px;right:24px;width:44px;height:44px;' +
    'border-radius:50%;border:none;background:var(--color-accent);color:#fff;' +
    'font-size:1.2rem;cursor:pointer;opacity:0;transition:opacity 0.3s;z-index:99;' +
    'box-shadow:var(--shadow-md);';
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    btn.style.opacity = window.scrollY > 300 ? '1' : '0';
  });
}

// ============================================
//  代码块复制按钮（给每个 <pre> 加复制功能）
// ============================================
function initCodeCopy() {
  var blocks = document.querySelectorAll('pre');
  blocks.forEach(function (pre) {
    // 跳过没有代码块的
    if (!pre.querySelector('code')) return;

    // 给 pre 容器加上相对定位
    pre.style.position = 'relative';

    var btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.style.cssText =
      'position:absolute;top:8px;right:8px;padding:4px 10px;' +
      'font-size:0.75rem;border:1px solid rgba(255,255,255,0.2);' +
      'border-radius:4px;background:rgba(255,255,255,0.1);color:#e2e8f0;' +
      'cursor:pointer;transition:background 0.2s;';
    btn.addEventListener('mouseenter', function () {
      btn.style.background = 'rgba(255,255,255,0.2)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = 'rgba(255,255,255,0.1)';
    });

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });

    pre.appendChild(btn);
  });
}
