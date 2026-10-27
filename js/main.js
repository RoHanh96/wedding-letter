(function () {
  'use strict';

  const C = window.WEDDING;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = REDUCED ? 0.35 : 1;
  document.documentElement.style.setProperty('--k', K);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms * K));

  const SCRATCH_DONE_RATIO = 0.55; // cào được 55% diện tích thì coi như đã xem ảnh
  const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  const intro = $('#intro');
  const envelope = $('#envelope');
  const envStage = $('#envStage');
  const letter = $('#letter');
  const stage = $('#stage');
  const card = $('#photoCard');
  const frame = $('#photoFrame');
  const photo = $('#photo');
  const canvas = $('#scratch');
  const hint = $('#scratchHint');
  const greeting = $('#greeting');
  const cue = $('#scrollCue');
  const details = $('#details');

  /* ---------- Dữ liệu ---------- */

  const invitedName = (() => {
    const raw = new URLSearchParams(location.search).get('to');
    if (!raw) return '';
    return raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  })();
  const guest = invitedName || C.defaultGuest;
  const initialOf = (p) => p.initial || p.short.charAt(0);
  const initials = `${initialOf(C.groom)} & ${initialOf(C.bride)}`;

  function parseDateTime(value) {
    const [d, t = '00:00'] = value.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const date = new Date(y, m - 1, day);
    const pad = (n) => String(n).padStart(2, '0');
    return {
      time: t.slice(0, 5),
      weekday: WEEKDAYS[date.getDay()],
      date: `${pad(day)}.${pad(m)}.${y}`,
    };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ico');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', `#i-${name}`);
    svg.append(use);
    return svg;
  }

  // Ngày in trên lá thư, vd "13 & 14 · 11 · 2026" khi các sự kiện cùng tháng
  function letterDate() {
    const dates = C.events.map((ev) => ev.datetime.slice(0, 10).split('-'));
    const [y, m] = dates[0];
    const sameMonth = dates.every((d) => d[0] === y && d[1] === m);
    const days = sameMonth ? [...new Set(dates.map((d) => Number(d[2])))].join(' & ') : Number(dates[0][2]);
    return `${days} · ${Number(m)} · ${y}`;
  }

  function mapLink(ev) {
    return ev.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address)}`;
  }

  function fillContent() {
    document.title = `Thiệp cưới ${C.groom.short} & ${C.bride.short}`;
    $$('[data-guest]').forEach((n) => (n.textContent = guest));
    $$('[data-initials]').forEach((n) => (n.textContent = initials));
    $$('[data-letter-date]').forEach((n) => (n.textContent = letterDate()));
    $$('[data-short-names]').forEach((n) => (n.textContent = `${C.groom.short} & ${C.bride.short}`));
    $$('[data-letter-place]').forEach((n) => {
      n.textContent = C.letterPlace || '';
      n.hidden = !C.letterPlace;
    });

    ['groom', 'bride'].forEach((side) => {
      const f = C.families[side];
      const box = $(`[data-family="${side}"]`);
      box.append(icon('house'), el('h3', '', f.label));
      // gói tên bố mẹ trong một khối canh trái để "Ông"/"Bà" thẳng hàng, khối vẫn nằm giữa cột
      const names = el('div', 'family-names');
      [f.father, f.mother].filter(Boolean).forEach((name) => names.append(el('p', '', name)));
      box.append(names);
      if (f.address) box.append(el('p', 'addr', f.address));
    });

    const events = $('#events');
    const choices = $('#eventChoices');
    C.events.forEach((ev) => {
      const dt = parseDateTime(ev.datetime);
      const art = el('article', 'event paper reveal');
      const when = el('div', 'event-when');
      const date = el('div', 'event-date');
      date.append(el('b', '', dt.weekday), el('span', '', dt.date));
      when.append(el('span', 'event-time', dt.time), el('span', 'event-sep'), date);

      const map = el('a', 'btn');
      map.href = mapLink(ev);
      map.target = '_blank';
      map.rel = 'noopener';
      map.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
      map.append('Xem bản đồ');

      art.append(icon(ev.icon || 'heart'), el('p', 'event-side', ev.side), el('h2', '', ev.title), when);
      if (ev.lunar) art.append(el('p', 'event-lunar', `(${ev.lunar})`));
      art.append(el('p', 'event-venue', ev.venue), el('p', 'event-addr', ev.address), map);
      events.append(art);

      const label = el('label', 'choice');
      const input = el('input');
      input.type = 'checkbox';
      input.name = 'events';
      // không tích sẵn, khách tự chọn; giá trị ghi vào Sheet kèm bên tổ chức, vd "Tiệc Mừng Cưới (Nhà Gái)"
      input.value = `${ev.title} (${ev.side})`;
      label.append(input, el('span', '', input.value));
      choices.append(label);
    });

    if (invitedName) $('#rsvpForm [name="name"]').value = invitedName;

    renderCalendar();
    renderGallery();
    renderGift();
    decoratePaper();
  }

  // Mép giấy xé: đa giác nhiều đỉnh, lệch nhẹ ngẫu nhiên nhưng cố định
  function decoratePaper() {
    const root = document.documentElement.style;
    const jag = (i, amp) => (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * amp;
    const edge = [];
    const n = 40;
    for (let i = 0; i <= n; i++) edge.push(`${(i * 100) / n}% ${jag(i, 0.9).toFixed(2)}%`);
    for (let i = 0; i <= n; i++) edge.push(`${(100 - jag(i + 50, 0.9)).toFixed(2)}% ${(i * 100) / n}%`);
    for (let i = n; i >= 0; i--) edge.push(`${(i * 100) / n}% ${(100 - jag(i + 100, 0.9)).toFixed(2)}%`);
    for (let i = n; i >= 0; i--) edge.push(`${jag(i + 150, 0.9).toFixed(2)}% ${(i * 100) / n}%`);
    root.setProperty('--deckle', `polygon(${edge.join(',')})`);

    $$('.paper').forEach((node) => node.prepend(el('div', 'paper-bg')));
  }

  // Lịch của tháng có sự kiện đầu tiên, các ngày cưới được khoanh trái tim
  function renderCalendar() {
    const days = C.events.map((ev) => ev.datetime.slice(0, 10));
    const month = days[0].slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const marked = new Set(days.filter((d) => d.startsWith(month)).map((d) => Number(d.slice(8, 10))));
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7; // tuần bắt đầu từ thứ Hai
    const total = new Date(y, m, 0).getDate();

    const card = el('div', 'cal-card paper');
    card.append(icon('calendar'), el('p', 'cal-month', `Tháng ${m} · ${y}`));

    const grid = el('div', 'cal-grid');
    ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].forEach((d) => grid.append(el('span', 'cal-dow', d)));
    for (let i = 0; i < firstDow; i++) grid.append(el('span', 'cal-day'));
    for (let d = 1; d <= total; d++) grid.append(el('span', marked.has(d) ? 'cal-day marked' : 'cal-day', d));
    card.append(grid);

    const legend = el('div', 'cal-legend');
    C.events.forEach((ev) => {
      const item = el('p');
      item.append(el('b', '', parseDateTime(ev.datetime).date.slice(0, 5)), ` ${ev.title}`);
      legend.append(item);
    });
    card.append(legend);
    $('#calendar').append(card);
  }

  // Sổ lưu niệm: ảnh polaroid rải chồng lên nhau (vị trí theo thứ tự trong CSS), dán băng keo giấy
  function renderGallery() {
    const photos = C.gallery || [];
    if (!photos.length) return;
    const book = $('#galleryGrid');
    photos.forEach((src, i) => {
      const shot = el('button', `shot shot-${i + 1}`);
      shot.type = 'button';
      shot.setAttribute('aria-label', `Xem ảnh ${i + 1}`);
      shot.style.setProperty('--i', i);
      const img = el('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => shot.classList.toggle('landscape', img.naturalWidth > img.naturalHeight));
      shot.append(img);
      shot.addEventListener('click', () => openLightbox(i));
      book.append(shot);
    });
    $('#gallery').hidden = false;
  }

  // Hộp mừng cưới: mỗi người một thẻ có ảnh QR và nút tải ảnh
  function renderGift() {
    const cards = $('#giftCards');
    (C.gift || []).forEach((g) => {
      const card = el('div', 'gift-card');
      card.append(el('p', 'label', 'Mừng cưới đến'), el('p', 'gift-who', g.label), el('p', 'gift-name', g.name));
      const qr = el('div', 'gift-qr');
      if (g.qr) {
        const img = el('img');
        img.src = g.qr;
        img.alt = `Mã QR mừng cưới ${g.label.toLowerCase()}`;
        qr.append(img);
        const dl = el('a', 'btn btn-ghost', 'Tải ảnh QR');
        dl.href = g.qr;
        dl.download = g.qr.split('/').pop(); // tên file không dấu, có sẵn đuôi ảnh
        card.append(qr, dl);
        if (g.account) {
          const copy = el('button', 'btn btn-ghost btn-copy', 'Copy STK');
          copy.type = 'button';
          copy.addEventListener('click', () => copyText(g.account, copy));
          card.append(copy);
        }
      } else {
        qr.classList.add('empty');
        qr.append(el('span', '', 'Mã QR sẽ được cập nhật'));
        card.append(qr);
      }
      cards.append(card);
    });
  }

  // Chép số tài khoản để dán vào app ngân hàng; trình duyệt cũ dùng cách chọn chữ rồi copy
  function copyText(text, btn) {
    const label = btn.textContent;
    const done = (msg) => {
      btn.textContent = msg;
      clearTimeout(btn._t);
      btn._t = setTimeout(() => (btn.textContent = label), 2200);
    };
    const fallback = () => {
      const ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.append(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      done(ok ? 'Đã chép ✓' : text);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => done('Đã chép ✓'), fallback);
    } else {
      fallback();
    }
  }

  /* ---------- Xem ảnh phóng to ---------- */

  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCount = $('#lbCount');
  let lbIndex = 0;
  let lbStartX = null;

  function showPhoto(i) {
    const photos = C.gallery;
    lbIndex = (i + photos.length) % photos.length;
    lbImg.src = photos[lbIndex];
    lbCount.textContent = `${lbIndex + 1} / ${photos.length}`;
  }

  function openLightbox(i) {
    showPhoto(i);
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    requestAnimationFrame(() => lightbox.classList.add('show'));
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.classList.remove('lb-open');
    setTimeout(() => (lightbox.hidden = true), 250);
  }

  $('.lb-close').addEventListener('click', closeLightbox);
  $('.lb-prev').addEventListener('click', () => showPhoto(lbIndex - 1));
  $('.lb-next').addEventListener('click', () => showPhoto(lbIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    else if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
  });

  // Vuốt trái/phải trên ảnh để chuyển ảnh
  lbImg.addEventListener('pointerdown', (e) => (lbStartX = e.clientX));
  lbImg.addEventListener('pointerup', (e) => {
    if (lbStartX == null) return;
    const dx = e.clientX - lbStartX;
    lbStartX = null;
    if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  });

  /* ---------- Hộp mừng cưới ---------- */

  const giftModal = $('#giftModal');
  const giftBox = $('#giftOpen');

  async function openGift() {
    giftBox.classList.add('opening'); // nắp hộp nhấc lên trước khi cửa sổ hiện ra
    await wait(450);
    giftModal.hidden = false;
    document.body.classList.add('lb-open');
    requestAnimationFrame(() => giftModal.classList.add('show'));
    $('.gift-close').focus();
  }

  function closeGift() {
    giftModal.classList.remove('show');
    document.body.classList.remove('lb-open');
    giftBox.classList.remove('opening');
    setTimeout(() => (giftModal.hidden = true), 300);
    giftBox.focus();
  }

  giftBox.addEventListener('click', openGift);
  $('.gift-close').addEventListener('click', closeGift);
  giftModal.addEventListener('click', (e) => {
    if (e.target === giftModal) closeGift();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !giftModal.hidden) closeGift();
  });

  /* ---------- Nhạc nền ---------- */

  const audio = $('#bgm');
  const musicBtn = $('#musicBtn');
  let musicAvailable = Boolean(C.music);
  let pausedByVisibility = false;

  if (musicAvailable) {
    audio.src = C.music;
    audio.addEventListener('error', () => {
      musicAvailable = false;
      musicBtn.hidden = true;
    });
  }

  function setPlaying(on) {
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-label', on ? 'Tắt nhạc' : 'Bật nhạc');
  }

  function playMusic() {
    if (!musicAvailable) return;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  musicBtn.addEventListener('click', () => {
    if (audio.paused) playMusic();
    else {
      audio.pause();
      setPlaying(false);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audio.paused) {
      audio.pause();
      pausedByVisibility = true;
    } else if (!document.hidden && pausedByVisibility) {
      pausedByVisibility = false;
      playMusic();
    }
  });

  /* ---------- Mở thư ---------- */

  let opened = false;

  async function openLetter() {
    if (opened) return;
    opened = true;

    // Phải gọi play() ngay trong sự kiện chạm, nếu không trình duyệt điện thoại sẽ chặn
    if (musicAvailable) {
      musicBtn.hidden = false;
      playMusic();
    }

    // Phong bì zoom to, chừa đủ chỗ phía trên cho nắp và tấm thiệp rút ra
    const w = envelope.offsetWidth;
    const h = envelope.offsetHeight;
    const above = 1.41; // tấm thiệp nhô lên khoảng 134% chiều cao phong bì (đáy vẫn nằm trong túi), chừa thêm chút lề trên
    const avail = innerHeight * 0.86; // chừa khoảng dưới cùng cho dòng "Chạm để đọc tiếp"
    // điện thoại thì phóng to; PC phong bì đã to sẵn nên có thể thu nhỏ lại cho vừa cả tấm thiệp
    const zoom = Math.min((innerWidth * 0.98) / w, (avail * 0.96) / ((1 + above) * h));
    const box = envStage.getBoundingClientRect();
    const targetCenter = (avail - (1 + above) * h * zoom) / 2 + (above + 0.5) * h * zoom;
    intro.style.setProperty('--zoom', zoom);
    intro.style.setProperty('--dy', `${targetCenter - (box.top + box.height / 2)}px`);
    // phong bì lún nhẹ như bị ấn tay rồi mới nhấc lên zoom to
    intro.classList.add('opening', 'pressed');
    await wait(120);
    intro.classList.remove('pressed');
    intro.classList.add('zoomed');
    await wait(500); // phong bì gần zoom xong thì bắt đầu mở luôn cho nhanh

    // ruy băng, con dấu mờ dần trên chính phong bì đó (ảnh phong bì sạch nằm ngay bên dưới)
    envelope.classList.add('untied');
    await wait(250);

    envelope.classList.add('flap-open');
    await wait(350); // nắp vừa lật qua phương thẳng đứng
    envelope.classList.add('flap-behind');
    await wait(250);

    envelope.classList.add('letter-out');
    await wait(1150);

    // Thiệp dừng lại cho khách đọc, chạm vào màn hình mới sang phần ảnh cưới
    intro.classList.add('reading');
    await new Promise((resolve) => intro.addEventListener('click', resolve, { once: true }));
    intro.classList.remove('reading');

    await expandCard();
  }

  // Tấm thiệp phóng to thành khung ảnh (kỹ thuật FLIP)
  async function expandCard() {
    window.scrollTo(0, 0); // phòng trường hợp trang đã bị cuộn sẵn
    const from = letter.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    card.style.transition = 'none';
    card.style.opacity = '0';
    card.style.transform =
      `translate(${from.left - to.left}px, ${from.top - to.top}px) ` +
      `scale(${from.width / to.width}, ${from.height / to.height})`;
    card.style.transformOrigin = '0 0';
    void card.offsetWidth;

    stage.classList.add('active');
    card.style.transition =
      `transform ${1100 * K}ms cubic-bezier(.65, 0, .3, 1), opacity ${300 * K}ms ease`;
    card.style.transform = 'none';
    card.style.opacity = '1';
    envelope.classList.add('away');
    await wait(750);

    // Lớp phủ hiện dần khi thiệp gần phóng xong, tránh khoảng trắng trống
    frame.classList.add('show');
    await wait(350);

    intro.classList.add('fade');
    await wait(800);
    intro.hidden = true;
    hint.classList.add('show');
  }

  envelope.addEventListener('click', openLetter);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLetter();
    }
  });

  /* ---------- Cào ảnh ---------- */

  let ctx;
  let cssW = 0;
  let cssH = 0;
  let scratching = false;
  let scratchDone = false;
  let scratchStarted = false;
  let lastPoint = null;
  let lastCheck = 0;

  // ảnh lớp phủ trước khi cào: khung oval lá trên giấy ngà
  const coverImg = new Image();
  coverImg.src = 'assets/scratch-cover.webp';
  const coverReady = coverImg.decode().catch(() => {});

  function drawCover() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = frame.clientWidth;
    cssH = frame.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // nền giấy ngà cùng màu ảnh, rồi vẽ ảnh khung oval lá sao cho vòng oval trong ảnh
    // nằm gọn trong khung nơ (vòng oval trong ảnh 853x1280: tâm (426, 612), bán kính dọc ~482px)
    ctx.fillStyle = '#efece2';
    ctx.fillRect(0, 0, cssW, cssH);
    if (coverImg.complete && coverImg.naturalWidth) {
      const s = (cssH / 2) * 0.9 / 482;
      ctx.drawImage(coverImg, cssW / 2 - 426 * s, cssH / 2 - 612 * s, coverImg.naturalWidth * s, coverImg.naturalHeight * s);
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(38, cssW * 0.14);
  }

  function pointFrom(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * cssW) / r.width,
      y: ((e.clientY - r.top) * cssH) / r.height,
    };
  }

  function scratchTo(p) {
    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint = p;
  }

  // Chỉ đếm điểm nằm trong khung oval, 4 góc bị che nên không tính
  function clearedRatio() {
    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const step = Math.max(4, Math.round(w / 80));
    let clear = 0;
    let total = 0;
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1) continue;
        total++;
        if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] < 128) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function checkProgress(force) {
    const now = performance.now();
    if (!force && now - lastCheck < 250) return;
    lastCheck = now;
    if (clearedRatio() >= SCRATCH_DONE_RATIO) revealInvitation();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (scratchDone) return;
    scratching = true;
    scratchStarted = true;
    lastPoint = null;
    canvas.setPointerCapture(e.pointerId);
    scratchTo(pointFrom(e));
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!scratching || scratchDone) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    events.forEach((ev) => scratchTo(pointFrom(ev)));
    checkProgress(false);
  });
  ['pointerup', 'pointercancel'].forEach((type) =>
    canvas.addEventListener(type, () => {
      if (!scratching) return;
      scratching = false;
      lastPoint = null;
      if (!scratchDone) checkProgress(true);
    })
  );

  async function revealInvitation() {
    if (scratchDone) return;
    scratchDone = true;
    scratching = false;
    canvas.classList.add('cleared');
    hint.classList.remove('show');
    stage.classList.add('revealed');
    await wait(800);

    greeting.classList.add('show');
    await wait(1000);

    details.hidden = false;
    document.body.classList.remove('locked');
    cue.classList.add('show');
    observeReveals();
  }

  /* ---------- Hiện dần khi cuộn ---------- */

  function observeReveals() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach((n) => io.observe(n));
  }

  /* ---------- Xác nhận tham dự ---------- */

  const form = $('#rsvpForm');
  const attendOnly = $('#attendOnly');
  const submitBtn = $('#rsvpSubmit');
  const status = $('#rsvpStatus');

  function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle('error', Boolean(isError));
  }

  // Trình duyệt hay tự khôi phục ô đã tích khi tải lại trang; luôn bắt đầu với form trống
  const resetChoices = () => {
    form.querySelectorAll('input[name="attend"], input[name="events"]').forEach((i) => (i.checked = false));
    attendOnly.hidden = true;
  };
  resetChoices();
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && !form.hidden) resetChoices();
  });

  form.addEventListener('change', (e) => {
    if (e.target.name === 'attend') attendOnly.hidden = e.target.value !== 'yes';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const attend = data.get('attend');

    if (!name) return setStatus('Bạn cho mình xin tên nhé.', true);
    if (!attend) return setStatus('Bạn chọn giúp mình có đến được không nhé.', true);
    if (attend === 'yes' && data.getAll('events').length === 0) {
      return setStatus('Bạn chọn giúp mình sẽ tham dự sự kiện nào nhé.', true);
    }

    if (!C.rsvpEndpoint) {
      console.warn('Chưa cấu hình rsvpEndpoint trong js/config.js');
      return setStatus('Form chưa được kết nối (thiếu rsvpEndpoint trong config.js).', true);
    }

    const payload = new URLSearchParams({
      name,
      attend: attend === 'yes' ? 'Có tham dự' : 'Không tham dự',
      guests: attend === 'yes' ? data.get('guests') : '0',
      events: attend === 'yes' ? data.getAll('events').join(', ') : '',
      message: (data.get('message') || '').trim(),
      invitedAs: invitedName,
    });

    submitBtn.disabled = true;
    setStatus('Đang gửi…');
    try {
      // Apps Script không trả header CORS nên dùng no-cors; request vẫn tới được Sheet
      await fetch(C.rsvpEndpoint, { method: 'POST', mode: 'no-cors', body: payload });
      // gửi xong chỉ còn lời cảm ơn: ẩn cả biểu tượng, tiêu đề, lời dẫn của mục
      $('#rsvp').classList.add('done');
      form.hidden = true;
      $('#rsvpThanks').hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      setStatus('Gửi chưa thành công, bạn thử lại giúp mình nhé.', true);
    }
  });

  /* ---------- Khởi tạo ---------- */

  // Thiệp luôn mở từ đầu trang: bỏ "#..." trên link và không để trình duyệt khôi phục vị trí cuộn cũ,
  // nếu không màn cào ảnh sẽ bị lệch lên khi tải lại trang
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);

  // "Xem chi tiết": cuộn mượt tới phần chi tiết mà không thêm #families vào link
  cue.addEventListener('click', (e) => {
    e.preventDefault();
    $('#families').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });

  fillContent();
  photo.src = C.photo;

  const fontsReady = document.fonts
    ? Promise.all([
        document.fonts.load('italic 500 40px "Cormorant Garamond"'),
        document.fonts.load('600 14px "Cormorant Garamond"'),
        document.fonts.load('40px "Ms Madi"'),
      ]).catch(() => {})
    : Promise.resolve();
  Promise.all([fontsReady, coverReady]).then(drawCover);

  // Xoay màn hình trước khi bắt đầu cào thì vẽ lại lớp phủ cho đúng kích thước
  window.addEventListener('resize', () => {
    if (!scratchStarted && ctx) drawCover();
  });
})();
