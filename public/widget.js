(function() {
  // shipped.fyi Feedback Widget
  // Usage: Add <script src="https://shipped.fyi/widget.js" data-slug="your-project-slug"></script>

  var script = document.currentScript;
  var slug = script.getAttribute('data-slug');
  var position = script.getAttribute('data-position') || 'right'; // 'left' or 'right'
  var buttonText = script.getAttribute('data-button-text') || 'Feedback';
  var primaryColor = script.getAttribute('data-primary-color') || '#262520';

  if (!slug) {
    console.error('shipped.fyi widget: Missing data-slug attribute');
    return;
  }

  var host = script.src.replace('/widget.js', '');

  // Styles
  var styles = document.createElement('style');
  styles.textContent = `
    .shipped-fyi-widget-button {
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      background: ${primaryColor};
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 9999px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999998;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .shipped-fyi-widget-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    .shipped-fyi-widget-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .shipped-fyi-widget-backdrop.open {
      opacity: 1;
      visibility: visible;
    }
    .shipped-fyi-widget-iframe-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 90%;
      max-width: 500px;
      height: 80%;
      max-height: 600px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      z-index: 1000000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
    }
    .shipped-fyi-widget-iframe-container.open {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, -50%) scale(1);
    }
    .shipped-fyi-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .shipped-fyi-widget-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      background: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      transition: background 0.2s;
    }
    .shipped-fyi-widget-close:hover {
      background: rgba(0, 0, 0, 0.2);
    }
    .shipped-fyi-widget-close svg {
      width: 16px;
      height: 16px;
    }
  `;
  document.head.appendChild(styles);

  // Create button
  var button = document.createElement('button');
  button.className = 'shipped-fyi-widget-button';
  button.textContent = buttonText;
  document.body.appendChild(button);

  // Create backdrop
  var backdrop = document.createElement('div');
  backdrop.className = 'shipped-fyi-widget-backdrop';
  document.body.appendChild(backdrop);

  // Create iframe container
  var iframeContainer = document.createElement('div');
  iframeContainer.className = 'shipped-fyi-widget-iframe-container';
  iframeContainer.innerHTML = `
    <button class="shipped-fyi-widget-close">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <iframe class="shipped-fyi-widget-iframe" src="${host}/widget/${slug}"></iframe>
  `;
  document.body.appendChild(iframeContainer);

  var closeButton = iframeContainer.querySelector('.shipped-fyi-widget-close');

  function openWidget() {
    backdrop.classList.add('open');
    iframeContainer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeWidget() {
    backdrop.classList.remove('open');
    iframeContainer.classList.remove('open');
    document.body.style.overflow = '';
  }

  button.addEventListener('click', openWidget);
  backdrop.addEventListener('click', closeWidget);
  closeButton.addEventListener('click', closeWidget);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeWidget();
    }
  });
})();
