const decoderURL = new URL('./assets/vendor/draco/', import.meta.url).href;
self.ModelViewerElement = {dracoDecoderLocation: decoderURL};
const {ModelViewerElement} = await import('./assets/vendor/model-viewer.min.js');
ModelViewerElement.dracoDecoderLocation = decoderURL;
ModelViewerElement.modelCacheSize = 1;
const $ = id => document.getElementById(id);
let artifacts = [], active = null, viewer = null, selectedTab = 'notes', loadToken = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const size = bytes => `${(bytes / 1048576).toFixed(1)} MB`;
const text = (tag, content, className) => {
  const el = document.createElement(tag); el.textContent = content;
  if (className) el.className = className;
  return el;
};
function sourceLink(source) {
  const a = document.createElement('a');
  a.className = 'source-row'; a.href = source.url; a.target = '_blank'; a.rel = 'noopener';
  a.append(text('strong', `${source.authority} ↗`), text('span', source.use));
  return a;
}
function showReference(ref, index) {
  $('image-title').textContent = `${active.name} / 参考 ${index + 1}`;
  $('full-image').src = ref.image;
  $('full-image').alt = `${active.name}，${ref.category}，${ref.authority}`;
  $('image-caption').textContent = `${ref.category} · ${ref.width} × ${ref.height} 原始像素｜${ref.caption} ${ref.rights}`;
  $('image-source').href = ref.source; $('original-image').href = ref.image;
  $('image-dialog').showModal();
}
function renderPanel() {
  const content = $('detail-content'); content.replaceChildren();
  for (const button of document.querySelectorAll('[role=tab]')) {
    const chosen = button.dataset.tab === selectedTab;
    button.setAttribute('aria-selected', String(chosen)); button.tabIndex = chosen ? 0 : -1;
    if (chosen) { content.setAttribute('aria-labelledby', button.id); }
  }
  if (selectedTab === 'notes') {
    content.append(text('p', active.note));
    const p = text('p', '当前展示为自主数字复原，非扫描数据。照片支持的部位与近似构造可能在不同视角呈现明显差别。');
    content.append(p);
    const details = document.createElement('details');
    details.append(text('summary', '网页模型的转换说明'), text('p', active.exportNotes));
    content.append(details);
  } else if (selectedTab === 'images') {
    const grid = document.createElement('div'); grid.className = 'reference-grid';
    active.references.forEach((ref, i) => {
      const button = document.createElement('button'); button.className = 'reference-button';
      button.setAttribute('aria-label', `放大参考图 ${i + 1}：${ref.category}，${ref.authority}`);
      const image = new Image(); image.src = ref.thumbnail; image.alt = `${active.name} ${ref.category}`; image.loading = 'lazy';
      button.append(image, text('span', `${ref.category} / ${ref.width}×${ref.height}`), text('small', ref.authority));
      button.addEventListener('click', () => showReference(ref, i)); grid.append(button);
    });
    content.append(grid);
  } else {
    active.sources.forEach(source => content.append(sourceLink(source)));
    content.append(text('p', '逐张图像的原文链接、原始像素与权利说明，可在“参考图像”中点击查看。'));
  }
}
function setupTabs() {
  const tabs = document.createElement('div'); tabs.className = 'detail-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', '文物资料');
  [['notes', '复原说明'], ['images', '参考图像'], ['sources', '资料来源']].forEach(([key, title]) => {
    const button = text('button', title); button.dataset.tab = key; button.id = `tab-${key}`;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', 'detail-content');
    button.addEventListener('click', () => { selectedTab = key; renderPanel(); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const all = [...tabs.children], index = all.indexOf(button);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? all.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
      all[next].click(); all[next].focus();
    });
    tabs.append(button);
  });
  const panel = document.createElement('div'); panel.id = 'detail-content'; panel.className = 'detail-content'; panel.tabIndex = 0; panel.setAttribute('role', 'tabpanel');
  const links = document.createElement('div'); links.className = 'provenance-link';
  const download = text('a', '下载网页模型 ↓'); download.id = 'download-model'; download.setAttribute('download', '');
  const share = text('button', '复制本件链接 ↗'); share.id = 'share';
  share.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); share.textContent = '已复制链接 ✓'; setTimeout(() => share.textContent = '复制本件链接 ↗', 1800); }
    catch { share.textContent = '请复制地址栏链接'; }
  });
  links.append(download, share);
  $('artifact-description').parentNode.append(tabs, panel, links);
}
function loadModel(artifact) {
  const token = ++loadToken;
  $('loading').hidden = false; $('loading-text').textContent = `正在加载 ${size(artifact.bytes)}…`;
  $('load-progress').value = 0; $('load-error').hidden = true;
  $('rotate').setAttribute('aria-pressed', 'false'); $('rotate').textContent = '↻ 自动旋转';
  const element = document.createElement('model-viewer');
  element.setAttribute('alt', `${artifact.name}的数字复原模型，可拖动旋转和缩放。${artifact.note}`);
  element.setAttribute('camera-controls', ''); element.setAttribute('touch-action', 'pan-y');
  element.setAttribute('loading', 'eager'); element.setAttribute('reveal', 'auto');
  element.setAttribute('interaction-prompt', 'none'); element.setAttribute('environment-image', 'neutral');
  element.setAttribute('camera-orbit', artifact.id === 'A08' ? '0deg 55deg 105%' : '0deg 75deg 105%');
  element.setAttribute('min-camera-orbit', 'auto 0deg 12%'); element.setAttribute('max-camera-orbit', 'auto 180deg 400%');
  element.setAttribute('shadow-intensity', '0.8'); element.setAttribute('shadow-softness', '1');
  element.setAttribute('exposure', '1.1'); element.setAttribute('poster', artifact.poster);
  element.addEventListener('progress', event => {
    if (token !== loadToken) return;
    $('load-progress').value = event.detail.totalProgress;
  });
  element.addEventListener('load', () => {
    if (token !== loadToken) return;
    $('loading').hidden = true; $('load-error').hidden = true;
    document.title = `${artifact.name}｜荆楚 · 十一器`;
  });
  element.addEventListener('error', () => {
    if (token !== loadToken) return;
    $('loading').hidden = true; $('load-error').hidden = false;
    $('error-message').textContent = location.protocol === 'file:' ? '请通过本地预览服务或 GitHub Pages 打开网站，直接双击网页无法加载模型。' : '模型加载失败。请检查网络，或尝试支持 WebGL 的浏览器。';
  });
  viewer = element; $('viewer-mount').replaceChildren(element); element.src = artifact.model;
}
function selectArtifact(id, scroll = false) {
  active = artifacts.find(a => a.id === id) || artifacts[6];
  const index = artifacts.indexOf(active);
  $('stage-index').textContent = `${String(index + 1).padStart(2, '0')} — 11`;
  $('artifact-code').textContent = `${active.id} / ${active.period}`;
  $('artifact-kind').textContent = active.kind;
  $('artifact-title').textContent = active.name;
  $('artifact-description').textContent = active.description;
  $('version').textContent = active.version;
  $('model-size').textContent = size(active.bytes);
  $('download-model').href = active.model;
  $('tab-images').textContent = `参考图像 ${active.references.length}`;
  $('share').textContent = '复制本件链接 ↗';
  renderPanel(); loadModel(active);
  for (const card of document.querySelectorAll('.artifact-card')) {
    const chosen = card.dataset.id === active.id;
    card.setAttribute('aria-current', String(chosen)); card.querySelector('.selected-marker').hidden = !chosen;
  }
  history.replaceState(null, '', `${location.pathname}${location.search}#${active.id}`);
  if (scroll) $('exhibit').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}
function renderGrid() {
  const term = $('search').value.trim().toLowerCase(), category = $('category').value;
  const filtered = artifacts.filter(a => `${a.id} ${a.name} ${a.kind} ${a.period}`.toLowerCase().includes(term) && (!category || a.kind.startsWith(category)));
  $('artifact-grid').replaceChildren();
  filtered.forEach(artifact => {
    const card = document.createElement('button'); card.className = 'artifact-card'; card.dataset.id = artifact.id;
    card.setAttribute('aria-label', `查看 ${artifact.name} 的3D模型`); card.setAttribute('aria-current', String(active?.id === artifact.id));
    const frame = document.createElement('div'); frame.className = 'card-image';
    const image = new Image(); image.src = artifact.poster; image.alt = `${artifact.name} 数字模型预览`; image.loading = 'lazy'; image.width = 800; image.height = 800;
    const marker = text('span', '正在展出', 'selected-marker'); marker.hidden = active?.id !== artifact.id;
    frame.append(image, text('span', artifact.id, 'card-code'), marker);
    const caption = document.createElement('div'); caption.className = 'card-caption';
    const meta = document.createElement('div'); meta.className = 'card-meta';
    meta.append(text('span', `${artifact.period} / ${artifact.kind.split(' · ')[0]}`), text('span', `${artifact.version} · ${artifact.references.length} 张参考`));
    caption.append(text('h3', artifact.name), meta); card.append(frame, caption);
    card.addEventListener('click', () => selectArtifact(artifact.id, true)); $('artifact-grid').append(card);
  });
  $('empty-state').hidden = filtered.length !== 0;
  $('result-count').textContent = `显示 ${filtered.length} 件文物，共 ${artifacts.length} 件。`;
}
$('previous').addEventListener('click', () => selectArtifact(artifacts[(artifacts.indexOf(active) + 10) % 11].id));
$('next').addEventListener('click', () => selectArtifact(artifacts[(artifacts.indexOf(active) + 1) % 11].id));
$('rotate').addEventListener('click', () => {
  if (!viewer) return;
  const rotating = viewer.hasAttribute('auto-rotate'); viewer.toggleAttribute('auto-rotate', !rotating);
  $('rotate').setAttribute('aria-pressed', String(!rotating)); $('rotate').textContent = rotating ? '↻ 自动旋转' : 'Ⅱ 暂停旋转';
});
$('reset').addEventListener('click', () => {
  if (!viewer) return;
  viewer.removeAttribute('auto-rotate'); $('rotate').setAttribute('aria-pressed', 'false'); $('rotate').textContent = '↻ 自动旋转';
  viewer.cameraOrbit = active.id === 'A08' ? '0deg 55deg 105%' : '0deg 75deg 105%'; viewer.cameraTarget = 'auto auto auto'; viewer.fieldOfView = 'auto'; viewer.resetTurntableRotation(); viewer.jumpCameraToGoal();
});
$('back').addEventListener('click', () => { if (viewer) viewer.cameraOrbit = '180deg 75deg 105%'; });
$('top').addEventListener('click', () => { if (viewer) viewer.cameraOrbit = '0deg 0deg 105%'; });
$('expand').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('stage').requestFullscreen(); }
  catch { $('expand').title = '此浏览器不支持全屏，请使用横屏或放大页面查看。'; }
});
if (!document.fullscreenEnabled) $('expand').hidden = true;
$('retry').addEventListener('click', () => active ? loadModel(active) : location.reload());
$('search').addEventListener('input', renderGrid); $('category').addEventListener('change', renderGrid);
$('close-dialog').addEventListener('click', () => $('image-dialog').close());
$('image-dialog').addEventListener('click', event => { if (event.target === $('image-dialog')) { const rect = $('image-dialog').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('image-dialog').close(); } });
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (artifacts.some(a => a.id === id) && active?.id !== id) selectArtifact(id); });
try {
  const response = await fetch('./collection.json'); if (!response.ok) throw new Error(`HTTP ${response.status}`);
  artifacts = (await response.json()).artifacts;
  setupTabs(); selectArtifact(location.hash.slice(1)); renderGrid(); document.body.classList.add('app-ready');
} catch (error) {
  $('loading').hidden = true; $('load-error').hidden = false;
  $('error-message').textContent = location.protocol === 'file:' ? '请先运行本地预览，或将项目部署到 GitHub Pages。直接双击 HTML 无法读取文物清单。' : `文物清单加载失败，请刷新重试。（${error.message}）`;
  $('retry').onclick = () => location.reload();
}
