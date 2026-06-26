/**
 * LLL Header Injector โ€” pixel-matches main-layout.vue + language-toggle.vue
 */
(function () {
  'use strict';

  var LLL_BASE_URL = 'http://localhost:9000';
  var LOGO_URL     = 'data:image/png;base64,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';
  var YELLOW       = 'rgb(247,208,70)';
  var DARK         = '#5c3d00';
  var DARKER       = '#3d2600';
  var ORANGE       = '#F5A623';

  var NAV_LINKS = [
    { icon: 'home',      label: 'เธซเธเนเธฒเธซเธฅเธฑเธ',     href: LLL_BASE_URL + '/main' },
    { icon: 'school',    label: 'เธซเธกเธงเธ”เธซเธกเธนเน',     href: LLL_BASE_URL + '/categories' },
    { icon: 'menu_book', label: 'เธเธญเธฃเนเธชเธฃเธฐเธขเธฐเธชเธฑเนเธ', href: LLL_BASE_URL + '/short-courses' },
    { icon: 'info',      label: 'เน€เธเธตเนเธขเธงเธเธฑเธเน€เธฃเธฒ', href: 'https://buulifelong.buu.ac.th', external: true },
  ];

  /* โ”€โ”€ helpers โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function mdi(name, sizePx, color) {
    var s = document.createElement('span');
    s.className = 'material-icons';
    s.textContent = name;
    s.style.cssText = 'font-size:' + (sizePx || 20) + 'px;' +
      'color:' + (color || 'inherit') + ';' +
      'line-height:1;flex-shrink:0;vertical-align:middle;';
    return s;
  }

  function el(tag, css, html) {
    var d = document.createElement(tag);
    if (css)  d.style.cssText = css;
    if (html) d.innerHTML = html;
    return d;
  }

  function getMoodleUser() {
    var cfg      = window.M && window.M.cfg;
    var sesskey  = cfg ? (cfg.sesskey || '') : '';
    var wwwroot  = cfg ? (cfg.wwwroot  || '') : '';
    var userid   = cfg ? (cfg.userid || cfg.userId || 0) : 0;
    var name     = '';
    var username = '';

    // Full name
    var nameEl = document.querySelector('.usermenu .usertext, [data-region="usermenu"] .usertext');
    if (nameEl) name = nameEl.textContent.trim();
    if (!name)  name = document.body.getAttribute('data-fullname') || '';

    // Login username (e.g. EXT0000002) โ€” try various Moodle attributes
    var unEl = document.querySelector('[data-username], [data-login], .logininfo a');
    if (unEl) username = unEl.getAttribute('data-username') || unEl.getAttribute('data-login') || '';

    // Avatar
    var img = '';
    if (userid && wwwroot) {
      img = wwwroot + '/user/pix.php/' + userid + '/f1.jpg';
    } else {
      var imgEl = document.querySelector('img.userpicture');
      if (imgEl) img = imgEl.src;
    }

    var admin = /\/admin\//.test(window.location.pathname) ||
                !!document.querySelector('a[href*="/admin/index"]');

    return { name: name || 'เธเธนเนเนเธเนเธเธฒเธ', username: username, img: img, sesskey: sesskey, wwwroot: wwwroot, admin: admin };
  }

  function moodleAjax(user, methodname, args, cb) {
    if (!user.wwwroot || !user.sesskey) return;
    var url = user.wwwroot + '/lib/ajax/service.php?sesskey=' + encodeURIComponent(user.sesskey) + '&info=' + methodname;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ index: 0, methodname: methodname, args: args }])
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var r = d && d[0] && !d[0].error && d[0].data;
        if (r !== false && r !== undefined) cb(r);
      })
      .catch(function () {});
  }

  function fetchAndPatchAdmin(user, dropList, base) {
    if (dropList.querySelector('a[href*="/admin/"]')) return;
    moodleAjax(user, 'core_webservice_get_site_info', {}, function (info) {
      if (info && info.siteadmin) {
        var divider = dropList.querySelector('div[style*="height:1px"]');
        var a = makeDropItem('settings', 'Site Administration', base + '/admin/', false);
        dropList.insertBefore(a, divider);
      }
    });
  }

  function fetchAndPatchUsername(user, nameEl, dropNameEl) {
    moodleAjax(user, 'core_user_get_users_by_field', { field: 'id', values: [String(user.userid)] }, function (data) {
      var rec = data && data[0];
      if (rec && rec.username) {
        nameEl.textContent = rec.username;
        if (dropNameEl) dropNameEl.textContent = rec.username;
      }
    });
  }

  function roleLabelFromMoodle(lastname, admin) {
    if (admin) return 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ';
    var role = String(lastname || '').trim().toLowerCase();
    if (role === 'instructor' || role === 'teacher' || role === 'editingteacher') return 'เธเธนเนเธชเธญเธ';
    if (role === 'admin' || role === 'administrator' || role === 'manager') return 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ';
    if (role === 'student' || role === 'learner') return 'เธเธนเนเน€เธฃเธตเธขเธ';
    return role ? lastname : 'เธเธนเนเน€เธฃเธตเธขเธ';
  }

  function fetchAndPatchRole(user, roleEl, dropRoleEl) {
    if (!user.userid) return;
    function applyLabel(label) {
      roleEl.textContent = label;
      if (dropRoleEl) dropRoleEl.textContent = label;
    }
    moodleAjax(user, 'local_wstools_get_current_user_role', {}, function (data) {
      if (data && data.label) applyLabel(data.label);
    });
    moodleAjax(user, 'core_user_get_users_by_field', { field: 'id', values: [String(user.userid)] }, function (data) {
      var rec = data && data[0];
      var label = roleLabelFromMoodle(rec && rec.lastname, user.admin);
      if (label !== 'เธเธนเนเน€เธฃเธตเธขเธ') applyLabel(label);
    });
  }

  /* โ”€โ”€ avatar circle โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function makeAvatar(user, size) {
    var w = el('div', [
      'width:' + size + 'px;height:' + size + 'px;border-radius:50%;',
      'background:' + ORANGE + ';color:#fff;flex-shrink:0;',
      'display:flex;align-items:center;justify-content:center;',
      'overflow:hidden;font-weight:800;font-size:' + Math.round(size * 0.42) + 'px;',
    ].join(''));
    if (user.img) {
      var i = document.createElement('img');
      i.src = user.img; i.alt = user.name;
      i.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
      i.onerror = function () { this.style.display = 'none'; w.textContent = user.name.charAt(0).toUpperCase(); };
      w.appendChild(i);
    } else {
      w.textContent = user.name.charAt(0).toUpperCase();
    }
    return w;
  }

  /* โ”€โ”€ hamburger + sidebar โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function makeDropItem(iconName, label, href, danger) {
    var a = el('a', [
      'display:flex;align-items:center;gap:10px;padding:10px 12px;',
      'border-radius:10px;text-decoration:none;',
      'font-size:.88rem;font-weight:600;',
      'color:' + (danger ? '#dc2626' : DARKER) + ';transition:background .15s;',
    ].join(''));
    a.href = href;
    a.appendChild(mdi(iconName, 18, danger ? '#dc2626' : DARKER));
    var lb = el('span', '');
    lb.textContent = label;
    a.appendChild(lb);
    a.addEventListener('mouseover', function () {
      this.style.background = danger ? 'rgba(220,38,38,.07)' : 'rgba(245,166,35,.08)';
    });
    a.addEventListener('mouseout', function () {
      this.style.background = '';
    });
    return a;
  }

  function buildHamburger(user) {
    var base = user.wwwroot || '';

    /* Button */
    var btn = el('button', [
      'background:none;border:none;cursor:pointer;',
      'width:38px;height:38px;border-radius:10px;padding:0;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;',
      'flex-shrink:0;transition:background .18s;',
    ].join(''));
    btn.title = 'เน€เธกเธเธน Moodle';
    var lines = [];
    for (var i = 0; i < 3; i++) {
      var ln = el('span', 'display:block;width:20px;height:2.5px;background:' + DARK + ';border-radius:2px;transition:transform .28s,opacity .28s;');
      btn.appendChild(ln); lines.push(ln);
    }
    btn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,.45)'; });
    btn.addEventListener('mouseout',  function () { this.style.background = ''; });

    /* Sidebar */
    var sidebar = el('div', [
      'position:fixed;top:72px;left:0;bottom:0;width:280px;z-index:99998;',
      'background:#fff;box-shadow:4px 0 24px rgba(0,0,0,.13);',
      'transform:translateX(-100%);transition:transform .3s cubic-bezier(.22,1,.36,1);',
      'display:flex;flex-direction:column;overflow:hidden;',
    ].join(''));

    /* Sidebar header */
    var shdr = el('div', [
      'padding:16px 20px 14px;border-bottom:1px solid rgba(0,0,0,.06);',
      'display:flex;align-items:center;gap:10px;',
      'background:linear-gradient(135deg,rgba(247,208,70,.18) 0%,rgba(255,255,255,0) 100%);',
    ].join(''));
    shdr.appendChild(mdi('menu_book', 20, ORANGE));
    var stitle = el('span', 'font-size:.95rem;font-weight:700;color:' + DARKER + ';');
    stitle.textContent = 'เน€เธกเธเธน Moodle';
    shdr.appendChild(stitle);
    sidebar.appendChild(shdr);

    /* Nav items list */
    var navList = el('div', 'flex:1;overflow-y:auto;padding:8px;');

    /* Default Moodle links */
    var defaultLinks = [
      { icon: 'dashboard',          label: 'Dashboard',          href: base + '/my/' },
      { icon: 'school',             label: 'My Courses',         href: base + '/my/courses.php' },
      { icon: 'home',               label: 'Site Home',          href: base + '/' },
      { icon: 'calendar_today',     label: 'เธเธเธดเธ—เธดเธ',            href: base + '/calendar/view.php' },
      { icon: 'message',            label: 'เธเนเธญเธเธงเธฒเธก',           href: base + '/message/index.php' },
      { icon: 'grade',              label: 'เน€เธเธฃเธ”เธเธญเธเธเธฑเธ',        href: base + '/grade/report/overview/index.php' },
      { icon: 'person',             label: 'เนเธเธฃเนเธเธฅเน',           href: base + '/user/profile.php' },
    ];
    if (user.admin) {
      defaultLinks.push({ icon: 'admin_panel_settings', label: 'Site Administration', href: base + '/admin/' });
      defaultLinks.push({ icon: 'manage_accounts',      label: 'เธเธฑเธ”เธเธฒเธฃเธเธนเนเนเธเน',       href: base + '/admin/user.php' });
      defaultLinks.push({ icon: 'library_books',        label: 'เธเธฑเธ”เธเธฒเธฃเธเธญเธฃเนเธช',        href: base + '/course/management.php' });
    }

    /* Try to scrape Moodle primary nav from hidden DOM first */
    var scraped = [];
    document.querySelectorAll(
      '[data-region="primary-navigation"] .nav-item a,' +
      'ul.primary-navigation .nav-item a,' +
      '[data-key="home"] a,[data-key="myhome"] a,[data-key="mycourses"] a,' +
      '[data-key="calendar"] a,[data-key="privatefiles"] a'
    ).forEach(function (a) {
      var txt = (a.getAttribute('data-key') ? '' : '') + a.textContent.trim().replace(/\s+/g, ' ');
      if (txt && a.href && !a.href.endsWith('#')) scraped.push({ label: txt, href: a.href, icon: 'link' });
    });

    var links = scraped.length > 0 ? scraped : defaultLinks;

    /* Section divider helper */
    function addDivider(label) {
      var d = el('div', 'padding:10px 14px 4px;font-size:.72rem;font-weight:700;color:#bdbdbd;letter-spacing:.07em;text-transform:uppercase;');
      d.textContent = label;
      navList.appendChild(d);
    }

    /* Render LLL links first */
    addDivider('LLL Platform');
    NAV_LINKS.forEach(function (link) {
      var a = el('a', [
        'display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;',
        'text-decoration:none;font-size:.9rem;font-weight:500;color:' + DARKER + ';',
        'transition:background .15s;',
      ].join(''));
      a.href = link.href;
      if (link.external) { a.target = '_blank'; a.rel = 'noopener'; }
      a.appendChild(mdi(link.icon, 19, ORANGE));
      var lb = el('span', ''); lb.textContent = link.label; a.appendChild(lb);
      a.addEventListener('mouseover', function () { this.style.background = 'rgba(245,166,35,.08)'; });
      a.addEventListener('mouseout',  function () { this.style.background = ''; });
      navList.appendChild(a);
    });

    /* Render Moodle links */
    navList.appendChild(el('div', 'height:1px;background:rgba(0,0,0,.06);margin:8px 0;'));
    addDivider('Moodle');
    links.forEach(function (link) {
      var a = el('a', [
        'display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;',
        'text-decoration:none;font-size:.9rem;font-weight:500;color:' + DARKER + ';',
        'transition:background .15s;',
      ].join(''));
      a.href = link.href;
      a.appendChild(mdi(link.icon || 'arrow_forward', 19, '#9e9e9e'));
      var lb = el('span', ''); lb.textContent = link.label; a.appendChild(lb);
      a.addEventListener('mouseover', function () { this.style.background = 'rgba(0,0,0,.04)'; });
      a.addEventListener('mouseout',  function () { this.style.background = ''; });
      navList.appendChild(a);
    });

    sidebar.appendChild(navList);

    /* Sidebar footer โ€” logout */
    var sftr = el('div', 'padding:8px;border-top:1px solid rgba(0,0,0,.06);');
    var logoutUrl = base + '/login/logout.php' + (user.sesskey ? '?sesskey=' + user.sesskey : '');
    sftr.appendChild(makeDropItem('logout', 'เธญเธญเธเธเธฒเธเธฃเธฐเธเธ', logoutUrl, true));
    sidebar.appendChild(sftr);

    /* Overlay */
    var overlay = el('div', 'position:fixed;inset:0;top:72px;background:rgba(0,0,0,.32);z-index:99997;display:none;');

    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);

    var open = false;
    function openSidebar() {
      open = true;
      sidebar.style.transform = 'translateX(0)';
      overlay.style.display = 'block';
      lines[0].style.transform = 'translateY(7.5px) rotate(45deg)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'translateY(-7.5px) rotate(-45deg)';
    }
    function closeSidebar() {
      open = false;
      sidebar.style.transform = 'translateX(-100%)';
      overlay.style.display = 'none';
      lines[0].style.transform = '';
      lines[1].style.opacity = '';
      lines[2].style.transform = '';
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); open ? closeSidebar() : openSidebar(); });
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeSidebar(); });

    btn.lllSidebar = sidebar;
    btn.lllOverlay = overlay;
    return btn;
  }

  /* โ”€โ”€ language toggle โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function buildLangToggle() {
    var current = (localStorage.getItem('lang') || 'th') === 'en-US' ? 'en-US' : 'th';

    var wrap = el('div', [
      'display:inline-flex;align-items:center;gap:6px;',
      'min-height:38px;padding:4px;',
      'border:1px solid rgba(17,24,39,.12);border-radius:999px;',
      'background:#fff;box-shadow:0 6px 18px rgba(17,24,39,.06);',
      'flex-shrink:0;cursor:default;',
    ].join(''));

    // Translate icon circle (orange bg)
    var icon = el('div', [
      'width:28px;height:28px;border-radius:50%;',
      'background:rgba(245,166,35,.14);',
      'display:flex;align-items:center;justify-content:center;',
      'flex-shrink:0;',
    ].join(''));
    icon.appendChild(mdi('translate', 16, ORANGE));

    // Toggle track
    var track = el('div', [
      'position:relative;display:grid;grid-template-columns:1fr 1fr;',
      'padding:2px;border-radius:999px;background:#edf1f4;overflow:hidden;',
      'width:80px;',
    ].join(''));

    // Sliding thumb
    var thumb = el('div', [
      'position:absolute;top:2px;left:2px;z-index:0;',
      'width:calc(50% - 2px);height:calc(100% - 4px);',
      'border-radius:999px;',
      'background:linear-gradient(135deg,#ffd977 0%,' + ORANGE + ' 100%);',
      'box-shadow:0 5px 12px rgba(245,166,35,.34),inset 0 1px 0 rgba(255,255,255,.72);',
      'transition:transform .32s cubic-bezier(.22,1,.36,1);',
    ].join(''));
    if (current === 'en-US') thumb.style.transform = 'translateX(100%)';

    function makeBtn(label, value) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.style.cssText = [
        'position:relative;z-index:1;border:0;border-radius:999px;',
        'background:transparent;cursor:pointer;',
        'font-size:.72rem;font-weight:800;letter-spacing:0;line-height:1;',
        'min-width:38px;min-height:28px;padding:0 6px;',
        'color:' + (current === value ? '#1f2937' : '#516170') + ';',
        'transition:color .2s;',
      ].join('');
      b.addEventListener('click', function () {
        current = value;
        localStorage.setItem('lang', value);
        thumb.style.transform = value === 'en-US' ? 'translateX(100%)' : '';
        thBtn.style.color = current === 'th' ? '#1f2937' : '#516170';
        enBtn.style.color = current === 'en-US' ? '#1f2937' : '#516170';
      });
      return b;
    }
    var thBtn = makeBtn('TH', 'th');
    var enBtn = makeBtn('EN', 'en-US');

    track.appendChild(thumb);
    track.appendChild(thBtn);
    track.appendChild(enBtn);
    wrap.appendChild(icon);
    wrap.appendChild(track);
    return wrap;
  }

  /* โ”€โ”€ notification bell โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function buildBell(user) {
    var base = user.wwwroot || '';
    var btn = el('a', [
      'position:relative;width:40px;height:40px;border-radius:50%;',
      'background:rgba(255,255,255,.72);border:none;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'text-decoration:none;flex-shrink:0;',
      'transition:background .18s;',
    ].join(''));
    btn.appendChild(mdi('notifications', 22, DARK));
    btn.href = base + '/message/index.php';
    btn.title = 'เธเธฒเธฃเนเธเนเธเน€เธ•เธทเธญเธ';
    btn.addEventListener('mouseover', function () { this.style.background = '#fff'; });
    btn.addEventListener('mouseout',  function () { this.style.background = 'rgba(255,255,255,.72)'; });

    // Red badge
    var badge = el('span', [
      'position:absolute;top:2px;right:2px;',
      'background:#dc2626;color:#fff;border-radius:999px;',
      'font-size:.62rem;font-weight:800;',
      'min-width:16px;height:16px;padding:0 3px;',
      'display:flex;align-items:center;justify-content:center;',
      'line-height:1;border:2px solid ' + YELLOW + ';',
    ].join(''), '1');
    btn.appendChild(badge);
    return btn;
  }

  /* โ”€โ”€ responsive header behavior โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function applyResponsiveHeader(header, parts) {
    function update() {
      var width = window.innerWidth || document.documentElement.clientWidth || 1280;
      var isDesktop = width >= 1240;
      var isTablet = width < 1240 && width >= 720;
      var isMobile = width < 720;

      header.style.padding = isMobile ? '0 10px' : '0 24px';
      header.style.gap = isMobile ? '8px' : '10px';

      parts.nav.style.display = isDesktop ? 'flex' : 'none';
      parts.divider.style.display = isDesktop ? 'block' : 'none';
      parts.langToggle.style.display = isMobile ? 'none' : 'inline-flex';

      parts.logo.style.padding = isMobile ? '6px 10px' : '6px 16px';
      parts.logoImg.style.width = isMobile ? '104px' : (isTablet ? '128px' : '148px');

      parts.userName.style.display = isMobile ? 'none' : 'flex';
      parts.userGroup.style.gridTemplateColumns = isMobile ? '36px 36px' : 'minmax(0,172px) 36px 36px';
      parts.userGroup.style.width = isMobile ? '92px' : '326px';
      parts.userGroup.style.padding = isMobile ? '4px 8px' : '4px 10px 4px 14px';
      parts.userGroup.style.columnGap = isMobile ? '8px' : '10px';

      parts.sidebar.style.top = '72px';
      parts.sidebar.style.width = isMobile ? 'min(86vw, 300px)' : '280px';
      parts.overlay.style.top = '72px';
    }

    update();
    window.addEventListener('resize', update);
  }

  /* โ”€โ”€ header โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function buildHeader(user) {
    var h = el('div', [
      'position:fixed;top:0;left:0;right:0;height:72px;z-index:99999;',
      'background:' + YELLOW + ';',
      'padding:0 20px;display:flex;align-items:center;gap:12px;',
      'box-shadow:0 2px 12px rgba(0,0,0,.09);',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    ].join(''));
    h.id = 'lll-injected-header';

    /* Hamburger */
    var hamburger = buildHamburger(user);
    h.appendChild(hamburger);


    /* Logo */
    var logo = el('a', [
      'display:flex;align-items:center;height:52px;padding:0 12px;',
      'background:rgba(255,255,255,.85);border-radius:14px;',
      'box-shadow:0 2px 8px rgba(0,0,0,.06);text-decoration:none;flex-shrink:0;',
      'transition:background .2s,box-shadow .2s;',
    ].join(''));
    logo.href = LLL_BASE_URL + '/main';
    var logoImg = document.createElement('img');
    logoImg.src = LOGO_URL;
    logoImg.alt = 'BUU LLL';
    logoImg.style.cssText = 'height:44px;width:auto;max-width:200px;object-fit:contain;display:block;';
    logoImg.onerror = function () {
      this.style.display = 'none';
      var fb = el('span', 'font-weight:800;color:' + DARKER + ';font-size:1.1rem;letter-spacing:-.5px;');
      fb.textContent = 'BUU LLL';
      logo.appendChild(fb);
    };
    logo.appendChild(logoImg);
    logo.addEventListener('mouseover', function () { this.style.background = '#fff'; this.style.boxShadow = '0 4px 14px rgba(0,0,0,.1)'; });
    logo.addEventListener('mouseout',  function () { this.style.background = 'rgba(255,255,255,.85)'; this.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; });
    h.appendChild(logo);

    /* Divider */
    var divider = el('div', 'width:1px;height:28px;background:rgba(255,255,255,.5);flex-shrink:0;align-self:center;');
    h.appendChild(divider);

    /* Nav tabs */
    var nav = el('nav', [
      'display:flex;gap:2px;',
      'background:rgba(255,255,255,.55);border-radius:14px;padding:4px;',
    ].join(''));
    NAV_LINKS.forEach(function (link) {
      var a = el('a', [
        'display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;',
        'color:' + DARK + ';text-decoration:none;white-space:nowrap;',
        'font-size:.88rem;font-weight:600;',
        'transition:background .18s;',
      ].join(''));
      a.href = link.href;
      if (link.external) { a.target = '_blank'; a.rel = 'noopener'; }

      a.appendChild(mdi(link.icon, 18, DARK));
      var labelSpan = el('span', '');
      labelSpan.textContent = link.label;
      a.appendChild(labelSpan);

      a.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,.6)'; });
      a.addEventListener('mouseout',  function () { this.style.background = ''; });
      nav.appendChild(a);
    });
    h.appendChild(nav);

    /* Spacer */
    h.appendChild(el('div', 'flex:1;'));

    /* Lang toggle */
    var langToggle = buildLangToggle();
    h.appendChild(langToggle);

    /* โ”€โ”€ User group โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
    var userGroup = el('div', 'display:flex;align-items:center;gap:6px;flex-shrink:0;');

    /* Name + role/studentId text */
    var textWrap = el('div', 'display:flex;flex-direction:column;justify-content:center;max-width:140px;');
    var nameEl2 = el('div', 'font-size:.87rem;font-weight:700;color:' + DARKER + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;');
    nameEl2.textContent = user.name;
    var roleEl = el('div', 'font-size:.71rem;color:#9e9e9e;line-height:1.2;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;');
    roleEl.textContent = user.admin ? 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ' : 'เธเธนเนเน€เธฃเธตเธขเธ';
    textWrap.appendChild(nameEl2);
    textWrap.appendChild(roleEl);
    userGroup.appendChild(textWrap);

    /* Avatar + profile dropdown */
    var avatarWrap = el('div', [
      'position:relative;cursor:pointer;flex-shrink:0;',
    ].join(''));
    var av = makeAvatar(user, 36);
    av.title = 'เนเธเธฃเนเธเธฅเน';
    avatarWrap.appendChild(av);

    /* Profile dropdown */
    var drop = el('div', [
      'position:absolute;top:calc(100% + 10px);right:0;width:220px;',
      'background:#fff;border-radius:16px;overflow:hidden;',
      'box-shadow:0 12px 40px rgba(0,0,0,.14);border:1px solid rgba(0,0,0,.05);',
      'display:none;flex-direction:column;z-index:10;',
    ].join(''));

    var dropHdr = el('div', [
      'padding:14px;display:flex;align-items:center;gap:10px;',
      'background:linear-gradient(135deg,rgba(247,208,70,.22) 0%,rgba(255,255,255,0) 100%);',
      'border-bottom:1px solid rgba(0,0,0,.06);',
    ].join(''));
    dropHdr.appendChild(makeAvatar(user, 42));
    var did = el('div', 'flex:1;min-width:0;');
    var dn = el('div', 'font-size:.9rem;font-weight:700;color:' + DARKER + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;');
    dn.textContent = user.name;
    var dr = el('div', 'font-size:.74rem;color:#9e9e9e;margin-top:2px;');
    dr.textContent = user.admin ? 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ' : 'เธเธนเนเน€เธฃเธตเธขเธ';
    did.appendChild(dn); did.appendChild(dr);
    dropHdr.appendChild(did);
    drop.appendChild(dropHdr);

    var dropList = el('div', 'padding:6px;');
    var base = user.wwwroot || '';

    function dItem(iconName, label, href, danger) {
      var a = el('a', [
        'display:flex;align-items:center;gap:10px;padding:10px 12px;',
        'border-radius:10px;text-decoration:none;',
        'font-size:.88rem;font-weight:600;',
        'color:' + (danger ? '#dc2626' : DARKER) + ';transition:background .15s;',
      ].join(''));
      a.href = href;
      a.appendChild(mdi(iconName, 18, danger ? '#dc2626' : DARKER));
      var lb = el('span', '');
      lb.textContent = label;
      a.appendChild(lb);
      a.addEventListener('mouseover', function () { this.style.background = danger ? 'rgba(220,38,38,.07)' : 'rgba(245,166,35,.08)'; });
      a.addEventListener('mouseout',  function () { this.style.background = ''; });
      return a;
    }

    dropList.appendChild(dItem('person', 'เธเนเธญเธกเธนเธฅเธชเนเธงเธเธ•เธฑเธง', base + '/user/profile.php', false));
    if (user.admin) dropList.appendChild(dItem('settings', 'Site Administration', base + '/admin/', false));
    dropList.appendChild(el('div', 'height:1px;background:rgba(0,0,0,.06);margin:4px 0;'));
    var logoutUrl = base + '/login/logout.php' + (user.sesskey ? '?sesskey=' + user.sesskey : '');
    dropList.appendChild(dItem('logout', 'เธญเธญเธเธเธฒเธเธฃเธฐเธเธ', logoutUrl, true));
    drop.appendChild(dropList);
    avatarWrap.appendChild(drop);

    var dropOpen = false;
    avatarWrap.addEventListener('click', function (e) {
      e.stopPropagation();
      dropOpen = !dropOpen;
      drop.style.display = dropOpen ? 'flex' : 'none';
    });
    document.addEventListener('click', function () {
      if (!dropOpen) return;
      dropOpen = false;
      drop.style.display = 'none';
    });

    userGroup.appendChild(avatarWrap);

    /* Notification bell */
    userGroup.appendChild(buildBell(user));

    h.appendChild(userGroup);

    fetchAndPatchAdmin(user, dropList, base);
    if (user.userid) fetchAndPatchUsername(user, nameEl2, dn);
    fetchAndPatchRole(user, roleEl, dr);

    applyResponsiveHeader(h, {
      nav: nav,
      divider: divider,
      langToggle: langToggle,
      logo: logo,
      logoImg: logoImg,
      userGroup: userGroup,
      userName: textWrap,
      sidebar: hamburger.lllSidebar,
      overlay: hamburger.lllOverlay,
    });


    return h;
  }

  /* โ”€โ”€ mount โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
  function mount() {
    if (document.getElementById('lll-injected-header')) return;

    var inIframe = window.self !== window.top;

    /* When embedded in app iframe: hide Moodle nav but skip injecting LLL header */
    if (inIframe) {
      var iframeStyle = document.createElement('style');
      iframeStyle.textContent = [
        'nav.navbar,#usernavigation,.navbar-nav,#page-navbar{display:none!important;}',
        '.secondary-navigation,[data-region="secondary-navigation"]{display:none!important;}',
        '[data-action="toggle-drawer"],.drawer-toggler{display:none!important;}',
        '[data-region="courseindex-drawer"],.courseindex,aside.drawers{display:none!important;}',
        'body{padding-top:0!important;}',
      ].join('');
      document.head.appendChild(iframeStyle);
      return;
    }

    // Load Material Icons font (same icons as LLL frontend)
    if (!document.getElementById('lll-mi-font')) {
      var miLink = document.createElement('link');
      miLink.id = 'lll-mi-font';
      miLink.rel = 'stylesheet';
      miLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      document.head.appendChild(miLink);
    }

    var style = document.createElement('style');
    style.textContent = [
      'nav.navbar,#usernavigation,.navbar-nav,#page-navbar{display:none!important;}',
      '.secondary-navigation,[data-region="secondary-navigation"]{display:none!important;}',
      '[data-action="toggle-drawer"],.drawer-toggler{display:none!important;}',
      '[data-region="courseindex-drawer"],.courseindex,aside.drawers{display:none!important;}',
      'body{padding-top:72px!important;}',
    ].join('');
    document.head.appendChild(style);

    var user = getMoodleUser();
    document.body.insertBefore(buildHeader(user), document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
