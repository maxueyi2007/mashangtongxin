/* ==========================================================================
   马上同心 · 文化信使 — 交互脚本
   原生 JS，无依赖
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- 1. 导航 */
  var nav = $('#nav');
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');

  function closeNav() {
    if (nav) nav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav && nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(Boolean(open)));
      document.body.classList.toggle('is-locked', Boolean(open));
    });
  }
  if (navLinks) {
    navLinks.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeNav(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ------------------------------------------- 2. 滚动进度 / 吸顶 / 回顶 */
  var progress = $('#progress');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (toTop) toTop.classList.toggle('is-on', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------ 3. 滚动监听 */
  var sections = $$('main section[id]');
  var linkMap = {};
  $$('#navLinks a').forEach(function (a) { linkMap[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (!linkMap[id]) return; // sections without a nav link keep the previous highlight
        $$('#navLinks a').forEach(function (a) { a.classList.remove('is-active'); });
        linkMap[id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------ 4. 进场动画 */
  var revealables = $$('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      ro.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------------- 5. Tabs */
  $$('[data-tabs]').forEach(function (tabs) {
    var btns = $$('.tabs__btn', tabs);
    var panels = $$('.tabs__panel', tabs);
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { select(i); });
      btn.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
        if (n === -1) return; // only ignore non-left/right keys
        e.preventDefault();
        n = (n + btns.length) % btns.length;
        btns[n].focus(); select(n);
      });
    });
    function select(i) {
      btns.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
      panels.forEach(function (p, k) { p.classList.toggle('is-active', k === i); });
    }
  });

  /* ----------------------------------------------------------- 6. 六骏弹窗 */
  var HORSES = [
    { name: '特勒骠', side: '东侧第一骏', element: '光', spirit: '守望', praise: '应策腾空，承声半汉',
      color: '#b8860b', pos: '东侧第一骏', coat: '黄白相间，属西域大宛汗血宝马',
      wound: '经典姿态：对侧步，从容沉稳（三日连经八仗仍步履从容）', art: 'telebiao' },
    { name: '青骓', side: '东侧第二骏', element: '电', spirit: '和睦', praise: '足轻电影，神发天机',
      color: '#6b4c9a', pos: '东侧第二骏', coat: '青白相间杂色',
      wound: '战伤记载：身中五箭', art: 'qingzhui' },
    { name: '什伐赤', side: '东侧第三骏', element: '火', spirit: '奋进', praise: '瀍涧未静，斧钺申威',
      color: '#b03a2e', pos: '东侧第三骏', coat: '通体赤红',
      wound: '战伤记载：臀部身中五箭', art: 'shifachi' },
    { name: '飒露紫', side: '西侧第一骏', element: '露', spirit: '同心', praise: '紫燕超跃，骨腾神骏',
      color: '#3f7d7a', pos: '西侧第一骏', coat: '紫燕骝，通体紫红',
      wound: '战伤记载：前胸正中一箭（丘行恭为其拔箭）', art: 'sa-luzi' },
    { name: '拳毛騧', side: '西侧第二骏', element: '月', spirit: '聚力', praise: '月精按辔，天驷横行',
      color: '#34497a', pos: '西侧第二骏', coat: '黄身黑喙，毛发天然卷曲',
      wound: '战伤记载：身中九箭', art: 'quanmaogua' },
    { name: '白蹄乌', side: '西侧第三骏', element: '云', spirit: '兴旺', praise: '倚天长剑，追风骏足',
      color: '#6b7f99', pos: '西侧第三骏', coat: '通体墨黑，四蹄雪白',
      wound: '经典姿态：四蹄腾空、昂首奔袭，鬃毛迎风飞扬', art: 'baitiwu' }
  ];

  var horseModal = $('#horseModal');
  var hmCurrent = 0;
  var lastFocus = null;

  function fillHorse(i) {
    var h = HORSES[i];
    if (!h) return;
    hmCurrent = i;
    var el;
    el = $('#hmHero'); if (el) el.style.background = 'linear-gradient(135deg,' + h.color + ',' + shade(h.color, -22) + ')';
    el = $('#hmSide'); if (el) el.textContent = h.side;
    el = $('#hmName'); if (el) el.textContent = h.name;
    el = $('#hmPraise'); if (el) el.textContent = '「' + h.praise + '」';
    el = $('#hmPos'); if (el) el.textContent = h.pos;
    el = $('#hmColor'); if (el) el.textContent = h.coat;
    el = $('#hmWound'); if (el) el.textContent = h.wound;
    el = $('#hmElem'); if (el) el.textContent = h.element;
    el = $('#hmSpirit'); if (el) el.textContent = h.spirit;
    var art = $('#hmArt'); if (art) { art.src = 'assets/img/horses/' + h.art + '.webp'; art.alt = h.name; }
    var tpl = $('#horseTemplates [data-tpl="' + i + '"]');
    var hmExtra = $('#hmExtra'); if (hmExtra) hmExtra.innerHTML = tpl ? tpl.innerHTML : '';
    $$('.horse').forEach(function (b) {
      try { b.style.borderColor = b.dataset.horse === String(i) ? h.color : ''; } catch (e) {}
    });
  }
  function shade(hex, pct) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + pct));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + pct));
    var b = Math.max(0, Math.min(255, (n & 255) + pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function openHorse(i) {
    if (!horseModal) return;
    lastFocus = document.activeElement;
    fillHorse(i);
    openModal(horseModal);
  }

  $$('.horse').forEach(function (btn) {
    btn.addEventListener('click', function () { openHorse(Number(btn.dataset.horse)); });
  });
  $$('[data-horse-prev]').forEach(function (b) {
    b.addEventListener('click', function () { fillHorse((hmCurrent + HORSES.length - 1) % HORSES.length); });
  });
  $$('[data-horse-next]').forEach(function (b) {
    b.addEventListener('click', function () { fillHorse((hmCurrent + 1) % HORSES.length); });
  });

  /* --------------------------------------------------------- 7. 成员海报弹窗 */
  var MEMBERS = [
    { slug: 'ma-xueyi',    name: '马雪宜', group: '线下组 · 实地调研与宣讲' },
    { slug: 'luo-yixin',   name: '罗怡欣', group: '线下组 · 实地调研与宣讲' },
    { slug: 'tian-lihan',  name: '田丽涵', group: '线下组 · 实地调研与宣讲' },
    { slug: 'li-shichao',  name: '李世超', group: '线下组 · 实地调研与宣讲' },
    { slug: 'xu-mengyuan', name: '徐梦媛', group: '线上组 · 内容运营与传播' },
    { slug: 'li-muzi',     name: '李木子', group: '线上组 · 内容运营与传播' },
    { slug: 'zou-yaning',  name: '邹亚宁', group: '线上组 · 内容运营与传播' },
    { slug: 'zhang-nan',   name: '张楠',   group: '线上组 · 内容运营与传播' },
    { slug: 'zeng-lilin',  name: '曾丽霖', group: '线上组 · 内容运营与传播' }
  ];

  var memberModal = $('#memberModal');
  var mmIndex = 0;

  function fillMember(i) {
    mmIndex = ((i % MEMBERS.length) + MEMBERS.length) % MEMBERS.length;
    var m = MEMBERS[mmIndex];
    var img = $('#mmPoster'); if (img) { img.src = 'assets/img/members/' + m.slug + '.webp'; img.alt = m.name + '的个人介绍海报'; }
    var el = $('#mmName'); if (el) el.textContent = m.name;
    el = $('#mmGroup'); if (el) el.textContent = m.group;
    el = $('#mmIndex'); if (el) el.textContent = (mmIndex + 1) + ' / ' + MEMBERS.length;
    $$('.member').forEach(function (b) {
      try { b.classList.toggle('is-active', b.dataset.member === m.slug); } catch (e) {}
    });
  }
  function openMember(slug) {
    if (!memberModal) return;
    var i = MEMBERS.findIndex(function (m) { return m.slug === slug; });
    if (i < 0) return;
    lastFocus = document.activeElement;
    fillMember(i);
    openModal(memberModal);
  }

  $$('.member').forEach(function (b) {
    b.addEventListener('click', function () { openMember(b.dataset.member); });
  });
  $$('[data-member-prev]').forEach(function (b) {
    b.addEventListener('click', function () { fillMember(mmIndex - 1); });
  });
  $$('[data-member-next]').forEach(function (b) {
    b.addEventListener('click', function () { fillMember(mmIndex + 1); });
  });
  document.addEventListener('keydown', function (e) {
    if (!memberModal || !memberModal.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); fillMember(mmIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); fillMember(mmIndex - 1); }
  });
  // 预取海报：首次悬停/聚焦成员卡片时按需加载，避免一进页面就下 2.4MB
  function prefetch(slug) {
    if (!slug || prefetch.done[slug]) return;
    prefetch.done[slug] = 1;
    var im = new Image();
    im.src = 'assets/img/members/' + slug + '.webp';
  }
  prefetch.done = {};
  $$('.member').forEach(function (b) {
    b.addEventListener('mouseenter', function () { prefetch(b.dataset.member); });
    b.addEventListener('focus', function () { prefetch(b.dataset.member); });
    b.addEventListener('touchstart', function () { prefetch(b.dataset.member); }, { passive: true });
  });

  /* ------------------------------------------------------- 8. 弹窗通用逻辑 */
  var openStack = [];

  function openModal(el) {
    if (!el) return;
    el.classList.add('is-open');
    var box = el.querySelector('.modal__box');
    if (box) box.scrollTop = 0; // 重新打开时回到顶部，避免残留上次的滚动位置
    document.body.classList.add('is-locked');
    openStack.push(el);
    var focusable = el.querySelector('[data-close], button, a[href], input, textarea, [tabindex], video');
    if (focusable) focusable.focus({ preventScroll: true });
  }
  function closeModal(el) {
    if (!el) return;
    el.classList.remove('is-open');
    if (el.id === 'videoModal') {
      var v = $('#videoPlayer');
      if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} }
    }
    openStack = openStack.filter(function (m) { return m !== el; });
    if (!openStack.length) document.body.classList.remove('is-locked');
    if (lastFocus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} lastFocus = null; }
  }
  $$('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeModal(b.closest('.modal, .lightbox')); });
  });
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(m); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !openStack.length) return;
    closeModal(openStack[openStack.length - 1]);
  });
  // 六骏弹窗：左右方向键切换（弹窗打开时全局生效）
  document.addEventListener('keydown', function (e) {
    if (!horseModal || !horseModal.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); fillHorse((hmCurrent + 1) % HORSES.length); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); fillHorse((hmCurrent + HORSES.length - 1) % HORSES.length); }
  });

  /* -------------------------------------------------------------- 9. 灯箱 */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var shots = $$('[data-full]');
  var lbIndex = 0;

  function showLb(i) {
    if (!shots.length) return;
    lbIndex = (i + shots.length) % shots.length;
    var el = shots[lbIndex];
    if (lbImg) lbImg.src = el.dataset.full;
    if (lbImg) lbImg.alt = el.dataset.cap || '';
    if (lbCap) lbCap.textContent = el.dataset.cap || '';
  }
  shots.forEach(function (el, i) {
    el.addEventListener('click', function () { lastFocus = el; showLb(i); openModal(lightbox); });
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lastFocus = el; showLb(i); openModal(lightbox); }
    });
  });
  var lbPrev = $('[data-lb-prev]'), lbNext = $('[data-lb-next]');
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showLb(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); showLb(lbIndex + 1); });
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeModal(lightbox); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  /* -------------------------------------------------------------- 10. 视频 */
  var videoModal = $('#videoModal');
  var player = $('#videoPlayer');

  $$('[data-video]').forEach(function (card) {
    function play() {
      lastFocus = card;
      if (!player) return openModal(videoModal);
      player.src = card.dataset.video;
      player.setAttribute('aria-label', card.dataset.title || '视频');
      openModal(videoModal);
      var p = player.play();
      if (p && p.catch) p.catch(function () { /* 自动播放被拦截时由用户手动点击播放 */ });
    }
    card.addEventListener('click', play);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  });

  /* --------------------------------------------------- 11. 锚点平滑滚动 */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      var navOffset = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - (navOffset + 12);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* --------------------------------------------- 12. 图片加载失败兜底 */
  $$('img').forEach(function (img) {
    img.addEventListener('error', function () {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      img.style.background = 'linear-gradient(135deg,#efe7da,#ddd2c0)';
      img.style.minHeight = '80px';
    });
  });

})();
