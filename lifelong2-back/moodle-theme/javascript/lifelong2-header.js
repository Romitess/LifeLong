/**
 * LLL Header Injector — pixel-matches main-layout.vue + lifelong2 theme
 */
(function () {
  'use strict';

  // Detect LLL_BASE_URL from environment or use docker/prod hostname
  var LLL_BASE_URL;
  if (typeof window !== 'undefined' && window.LLL_BASE_URL) {
    LLL_BASE_URL = window.LLL_BASE_URL;
  } else if (typeof process !== 'undefined' && process.env.VITE_LLL_URL) {
    LLL_BASE_URL = process.env.VITE_LLL_URL;
  } else {
    var _host = window.location.hostname;
    if (_host === 'moodle.localhost') {
      // Docker compose hostname routing: moodle.localhost → lll.localhost
      LLL_BASE_URL = 'http://lll.localhost';
    } else if (_host === 'localhost' || _host === '127.0.0.1') {
      // Direct port access (e.g. localhost:8080) — LLL dev server at :9000
      LLL_BASE_URL = 'http://localhost:9000';
    } else {
      // Production: strip "moodle." subdomain to get LLL domain
      LLL_BASE_URL = window.location.protocol + '//' + _host.replace(/^moodle\./, '');
    }
  }
  // Logo served locally from Moodle theme — no dependency on LLL being up
  var LOGO_URL     = window.location.origin + '/theme/lifelong2/pix/buu-lll-logo.png';
  var YELLOW       = 'rgb(247,208,70)';
  var DARK         = '#5c3d00';
  var DARKER       = '#3d2600';
  var ORANGE       = '#F5A623';

  var NAV_LINKS = [
    { icon: 'home',      label: 'หน้าหลัก',      href: LLL_BASE_URL + '/main' },
    { icon: 'school',    label: 'หมวดหมู่',      href: LLL_BASE_URL + '/categories', expandable: true },
    { icon: 'menu_book', label: 'คอร์สระยะสั้น', href: LLL_BASE_URL + '/short-courses' },
    { icon: 'info',      label: 'เกี่ยวกับเรา',  href: 'https://buulifelong.buu.ac.th', external: true },
  ];

  /* ── helpers ──────────────────────────────────────────────────────────── */
  function mdi(name, sizePx, color) {
    var s = document.createElement('span');
    s.className = 'material-icons';
    s.textContent = name;
    s.style.cssText = 'font-size:' + (sizePx || 20) + 'px;color:' + (color || 'inherit') + ';line-height:1;flex-shrink:0;vertical-align:middle;';
    return s;
  }

  function el(tag, css, html) {
    var d = document.createElement(tag);
    if (css)  d.style.cssText = css;
    if (html) d.innerHTML = html;
    return d;
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
      // Only load photo if user has a real custom picture (rev > 0 means custom, rev=0 is default)
      var photoUrl = rec && rec.profileimageurl;
      if (photoUrl && !/rev=0(&|$)/.test(photoUrl) && photoUrl.indexOf('defaultuser') < 0) {
        patchAvatarsWithPhoto(photoUrl);
      }
    });
  }

  function roleLabelFromMoodle(lastname, admin) {
    if (admin) return 'ผู้ดูแลระบบ';
    var role = String(lastname || '').trim().toLowerCase();
    if (role === 'instructor' || role === 'teacher' || role === 'editingteacher') return 'ผู้สอน';
    if (role === 'admin' || role === 'administrator' || role === 'manager') return 'ผู้ดูแลระบบ';
    if (role === 'student' || role === 'learner') return 'ผู้เรียน';
    return role ? lastname : 'ผู้เรียน';
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
      if (label !== 'ผู้เรียน') applyLabel(label);
    });
  }

  function fetchNotificationCount(user, badge) {
    moodleAjax(user, 'message_popup_get_unread_popup_notification_count', { useridto: user.userid }, function (count) {
      count = parseInt(count) || 0;
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  function fetchTeachingCourses(user, cb) {
    if (!user.userid) return;
    moodleAjax(user, 'local_wstools_get_teaching_courses', {}, function (courses) {
      cb(Array.isArray(courses) ? courses : []);
    });
  }

  function buildCourseToolUrl(user, course, tool) {
    var base = user.wwwroot || '';
    var id = encodeURIComponent(course.id);
    if (tool === 'edit') return course.viewurl + (course.viewurl.indexOf('?') >= 0 ? '&' : '?') + 'edit=on&sesskey=' + encodeURIComponent(user.sesskey || '');
    if (tool === 'assign') return base + '/course/modedit.php?add=assign&type=&course=' + id + '&section=0&return=0&sr=0';
    if (tool === 'quiz') return base + '/course/modedit.php?add=quiz&type=&course=' + id + '&section=0&return=0&sr=0';
    if (tool === 'grades') return base + '/grade/report/grader/index.php?id=' + id;
    return course.viewurl;
  }

  function getMoodleUser() {
    var cfg      = window.M && window.M.cfg;
    var sesskey  = cfg ? (cfg.sesskey || '') : '';
    var wwwroot  = cfg ? (cfg.wwwroot  || '') : '';
    var userid   = cfg ? (cfg.userid || cfg.userId || 0) : 0;
    var name     = '';
    var username = '';

    var nameEl = document.querySelector('.usermenu .usertext, [data-region="usermenu"] .usertext');
    if (nameEl) name = nameEl.textContent.trim();
    if (!name)  name = document.body.getAttribute('data-fullname') || '';

    var unEl = document.querySelector('[data-username], [data-login], .logininfo a');
    if (unEl) username = unEl.getAttribute('data-username') || unEl.getAttribute('data-login') || '';

    var img = '';

    var admin = /\/admin\//.test(window.location.pathname) ||
                !!document.querySelector('a[href*="/admin/index"]');

    return { name: name || 'ผู้ใช้งาน', username: username, img: img, sesskey: sesskey, wwwroot: wwwroot, userid: userid, admin: admin };
  }

  /* ── shared drop item (profile menu + sidebar logout) ─────────────────── */
  function makeDropItem(iconName, label, href, danger) {
    var a = el('a', [
      'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;',
      'text-decoration:none;font-size:.82rem;font-weight:700;',
      'color:' + (danger ? '#b91c1c' : '#374151') + ';transition:background .15s;',
    ].join(''));
    a.href = href;
    a.appendChild(mdi(iconName, 18, danger ? '#b91c1c' : ORANGE));
    var lb = el('span', ''); lb.textContent = label; a.appendChild(lb);
    a.addEventListener('mouseover', function () { this.style.background = danger ? 'rgba(185,28,28,.07)' : 'rgba(247,208,70,.14)'; });
    a.addEventListener('mouseout',  function () { this.style.background = ''; });
    return a;
  }

  /* ── scrape current page nav tabs → sidebar ───────────────────────────── */
  function scrapePageNavItems() {
    var items = [];
    var selectors = [
      '[data-region="secondary-navigation"] a.nav-link',
      '[data-region="tertiary-navigation"] a.nav-link',
      '.secondary-navigation a.nav-link',
      '.tertiarynavigation a.nav-link',
      'nav.nav-tabs a.nav-link',
      '.nav-tabs .nav-item > a',
    ];
    for (var si = 0; si < selectors.length; si++) {
      var nodes = document.querySelectorAll(selectors[si]);
      if (nodes.length > 0) {
        nodes.forEach(function (a) {
          var txt = a.textContent.trim().replace(/\s+/g, ' ');
          if (txt && a.href && a.href.indexOf('#') < 0) {
            items.push({ label: txt, href: a.href, active: a.classList.contains('active') });
          }
        });
        if (items.length > 0) break;
      }
    }
    return items;
  }

  /* ── avatar circle ────────────────────────────────────────────────────── */
  // avatarNodes: array of {w, size} to patch after API resolves photo URL
  var _avatarPatchQueue = [];

  function makeAvatar(user, size) {
    var w = el('div', [
      'width:' + size + 'px;height:' + size + 'px;border-radius:50%;',
      'background:' + ORANGE + ';color:#fff;flex-shrink:0;',
      'display:flex;align-items:center;justify-content:center;',
      'overflow:hidden;font-weight:800;font-size:' + Math.round(size * 0.42) + 'px;',
    ].join(''));
    // Always show colored initial; only replace if API confirms a real custom photo
    w.textContent = (user.name || '?').charAt(0).toUpperCase();
    _avatarPatchQueue.push(w);
    return w;
  }

  function patchAvatarsWithPhoto(photoUrl) {
    if (!photoUrl) return;
    fetch(photoUrl, { credentials: 'include' })
      .then(function (r) { if (!r.ok) throw new Error('img ' + r.status); return r.blob(); })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        _avatarPatchQueue.forEach(function (w) {
          var initial = w.textContent;
          var i = document.createElement('img');
          i.src = url;
          i.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
          i.onerror = function () { this.style.display = 'none'; w.textContent = initial; };
          w.textContent = '';
          w.appendChild(i);
        });
      })
      .catch(function () { /* keep initials */ });
  }

  /* ── hamburger + sidebar ──────────────────────────────────────────────── */
  function buildHamburger(user, pageNavItems) {
    var base = user.wwwroot || '';

    /* Button — 3 lines matching LLL hamburger-btn */
    var btn = el('button', [
      'background:none;border:none;cursor:pointer;',
      'width:38px;height:38px;border-radius:10px;padding:0;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;',
      'flex-shrink:0;transition:background .18s;',
    ].join(''));
    btn.title = 'เมนู';
    var lines = [];
    for (var i = 0; i < 3; i++) {
      var ln = el('span', 'display:block;width:20px;height:2.5px;background:' + DARK + ';border-radius:2px;transition:transform .28s,opacity .28s;');
      btn.appendChild(ln); lines.push(ln);
    }
    btn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,.55)'; });
    btn.addEventListener('mouseout',  function () { this.style.background = ''; });

    /* ── Sidebar — pixel-matches LLL sidebar-drawer ───────────────────── */
    var sidebar = el('div', [
      'position:fixed;top:72px;left:0;bottom:0;width:280px;z-index:99998;',
      'background:#ffffff;',
      'box-shadow:4px 0 24px rgba(0,0,0,.08);',
      'border-right:1px solid rgba(0,0,0,.06);',
      'transform:translateX(-100%);transition:transform .3s cubic-bezier(.22,1,.36,1);',
      'display:flex;flex-direction:column;overflow:hidden;',
      'font-family:"Noto Sans Thai",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    ].join(''));

    /* Helper: thin separator */
    function sep(extraCss) {
      return el('div', 'height:1px;background:rgba(0,0,0,.06);' + (extraCss || ''));
    }

    /* Helper: nav item matching .drawer-item */
    function drawerItem(iconName, label, href, opts) {
      opts = opts || {};
      var a = el('a', [
        'display:flex;align-items:center;',
        'margin:4px 12px;border-radius:12px;',
        'padding:8px;min-height:48px;width:calc(100% - 24px);',
        'color:' + (opts.danger ? '#dc2626' : '#4b5563') + ';',
        'font-weight:600;font-size:.92rem;letter-spacing:-.01em;',
        'text-decoration:none;cursor:pointer;',
        'background:transparent;border:none;',
        'transition:all .24s ease;box-sizing:border-box;',
      ].join(''));
      if (href) a.href = href;
      if (opts.external) { a.target = '_blank'; a.rel = 'noopener'; }

      /* Icon section — matches .drawer-item-icon-section */
      var iconSec = el('div', [
        'min-width:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
        'color:' + (opts.danger ? '#dc2626' : '#6b7280') + ';',
        'transition:color .24s ease;',
      ].join(''));
      iconSec.appendChild(mdi(iconName, 20));
      a.appendChild(iconSec);

      /* Label — matches .drawer-item-label */
      var lbEl = el('span', 'flex:1;min-width:0;text-align:left;');
      lbEl.textContent = label;
      a.appendChild(lbEl);

      /* Badge */
      if (opts.badge) {
        var badge = el('span', [
          'margin-left:auto;padding:2px 7px;border-radius:999px;',
          'font-size:.7rem;font-weight:700;',
          'background:rgba(20,184,166,.12);color:rgb(20,184,166);',
        ].join(''));
        badge.textContent = opts.badge;
        a.appendChild(badge);
      }

      /* Active state */
      if (opts.active) {
        a.style.color = '#3d2600';
        a.style.background = 'rgba(247,208,70,.16)';
        a.style.fontWeight = '700';
        iconSec.style.color = ORANGE;
      }

      a.addEventListener('mouseover', function () {
        if (opts.danger) {
          this.style.background = 'rgba(239,68,68,.08)';
        } else if (!opts.active) {
          this.style.background = 'rgba(247,208,70,.08)';
          this.style.color = ORANGE;
          iconSec.style.color = ORANGE;
        }
      });
      a.addEventListener('mouseout', function () {
        if (!opts.active) {
          this.style.background = 'transparent';
          this.style.color = opts.danger ? '#dc2626' : '#4b5563';
          iconSec.style.color = opts.danger ? '#dc2626' : '#6b7280';
        }
      });
      return a;
    }

    /* Helper: section label */
    function sectionLabel(text) {
      var d = el('div', [
        'padding:10px 20px 4px;',
        'font-size:.72rem;font-weight:700;color:#9ca3af;',
        'letter-spacing:.06em;text-transform:uppercase;',
      ].join(''));
      d.textContent = text;
      return d;
    }

    /* ── Logo — matches .drawer-logo-container ──────────────────────────── */
    var logoWrap = el('div', 'padding:16px 20px 8px;');
    var sLogoImg = document.createElement('img');
    sLogoImg.src = LOGO_URL; sLogoImg.alt = 'BUU LLL';
    sLogoImg.style.cssText = 'display:block;width:148px;height:auto;object-fit:contain;';
    sLogoImg.onerror = function () {
      this.style.display = 'none';
      var fb = el('span', 'font-weight:800;color:' + DARKER + ';font-size:1rem;');
      fb.textContent = 'BUU LLL'; logoWrap.appendChild(fb);
    };
    logoWrap.appendChild(sLogoImg);
    sidebar.appendChild(logoWrap);
    sidebar.appendChild(sep(''));

    /* ── Language toggle — matches .drawer-language-wrapper ─────────────── */
    var langWrap = el('div', 'padding:12px 16px;');
    langWrap.appendChild(buildLangToggle());
    sidebar.appendChild(langWrap);
    sidebar.appendChild(sep(''));

    /* Helper: expandable item with lazy-loaded children (like หมวดหมู่ in LLL) */
    function drawerExpandable(iconName, label, loadChildren) {
      var wrapper = el('div', 'display:flex;flex-direction:column;');
      var row = el('div', [
        'display:flex;align-items:center;',
        'margin:4px 12px;border-radius:12px;',
        'padding:8px;min-height:48px;width:calc(100% - 24px);',
        'color:#4b5563;font-weight:600;font-size:.92rem;letter-spacing:-.01em;',
        'cursor:pointer;background:transparent;border:none;',
        'transition:all .24s ease;box-sizing:border-box;user-select:none;',
      ].join(''));
      var iconSec = el('div', [
        'min-width:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
        'color:#6b7280;transition:color .24s ease;',
      ].join(''));
      iconSec.appendChild(mdi(iconName, 20));
      row.appendChild(iconSec);
      var lbEl = el('span', 'flex:1;min-width:0;text-align:left;');
      lbEl.textContent = label;
      row.appendChild(lbEl);
      var chevron = mdi('expand_more', 18, '#9ca3af');
      chevron.style.cssText += 'transition:transform .24s ease;';
      row.appendChild(chevron);

      var childrenWrap = el('div', 'display:none;');
      var expanded = false;
      var loaded = false;

      row.addEventListener('mouseover', function () {
        if (!expanded) { this.style.background = 'rgba(247,208,70,.08)'; this.style.color = ORANGE; iconSec.style.color = ORANGE; }
      });
      row.addEventListener('mouseout', function () {
        if (!expanded) { this.style.background = 'transparent'; this.style.color = '#4b5563'; iconSec.style.color = '#6b7280'; }
      });
      row.addEventListener('click', function () {
        expanded = !expanded;
        childrenWrap.style.display = expanded ? 'block' : 'none';
        chevron.style.transform = expanded ? 'rotate(180deg)' : '';
        row.style.background = expanded ? 'rgba(247,208,70,.08)' : 'transparent';
        row.style.color = expanded ? ORANGE : '#4b5563';
        iconSec.style.color = expanded ? ORANGE : '#6b7280';
        if (!loaded && expanded) { loaded = true; loadChildren(childrenWrap); }
      });
      wrapper.appendChild(row);
      wrapper.appendChild(childrenWrap);
      return wrapper;
    }

    /* Helper: sub-item (indented under expandable) */
    function drawerSubItem(label, href, count) {
      var a = el('a', [
        'display:flex;align-items:center;justify-content:space-between;',
        'margin:2px 12px 2px 52px;border-radius:10px;',
        'padding:6px 10px;min-height:36px;width:calc(100% - 64px);',
        'color:#6b7280;font-weight:500;font-size:.84rem;',
        'text-decoration:none;cursor:pointer;',
        'background:transparent;transition:all .2s ease;box-sizing:border-box;',
      ].join(''));
      if (href) a.href = href;
      var lbEl = el('span', 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;');
      lbEl.textContent = label;
      a.appendChild(lbEl);
      if (count !== undefined) {
        var badge = el('span', [
          'margin-left:6px;padding:1px 7px;border-radius:999px;flex-shrink:0;',
          'font-size:.7rem;font-weight:700;',
          'background:rgba(20,184,166,.12);color:rgb(20,184,166);',
        ].join(''));
        badge.textContent = count;
        a.appendChild(badge);
      }
      a.addEventListener('mouseover', function () { this.style.background = 'rgba(247,208,70,.08)'; this.style.color = DARK; });
      a.addEventListener('mouseout',  function () { this.style.background = 'transparent'; this.style.color = '#6b7280'; });
      return a;
    }

    /* ── Nav list ───────────────────────────────────────────────────────── */
    var navList = el('div', 'flex:1;overflow-y:auto;padding:4px 0 8px;');

    /* LLL Platform links */
    NAV_LINKS.forEach(function (link) {
      if (link.expandable) {
        navList.appendChild(drawerExpandable(link.icon, link.label, function (container) {
          var loading = el('div', 'padding:6px 20px 6px 52px;font-size:.82rem;color:#9ca3af;');
          loading.textContent = 'กำลังโหลด...';
          container.appendChild(loading);
          
          // Fetch categories from LLL Backend instead of Moodle webservice
          fetch(LLL_BASE_URL + '/api/categories', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          })
            .then(function (response) { 
              if (!response.ok) throw new Error('Failed to fetch categories');
              return response.json(); 
            })
            .then(function (cats) {
              container.innerHTML = '';
              if (!cats || cats.length === 0) {
                var nm = el('div', 'padding:6px 20px 6px 52px;font-size:.82rem;color:#9ca3af;');
                nm.textContent = 'ไม่พบหมวดหมู่';
                container.appendChild(nm);
                return;
              }
              cats.forEach(function (cat) {
                container.appendChild(drawerSubItem(
                  cat.name,
                  LLL_BASE_URL + '/categories?category=' + encodeURIComponent(cat.name),
                  null  // coursecount from LLL not available in this simple endpoint
                ));
              });
            })
            .catch(function (error) {
              console.warn('Failed to load categories from LLL:', error);
              container.innerHTML = '';
              var errMsg = el('div', 'padding:6px 20px 6px 52px;font-size:.82rem;color:#dc2626;');
              errMsg.textContent = 'ไม่สามารถโหลดหมวดหมู่ได้';
              container.appendChild(errMsg);
            });
        }));
      } else {
        navList.appendChild(drawerItem(link.icon, link.label, link.href, { external: link.external }));
      }
    });

    navList.appendChild(sep('margin:8px 12px;width:calc(100% - 24px);'));

    /* Moodle links */
    var defaultLinks = [
      { icon: 'dashboard',          label: 'Dashboard',     href: base + '/my/' },
      { icon: 'school',             label: 'My Courses',    href: base + '/my/courses.php' },
      { icon: 'home',               label: 'Site Home',     href: base + '/' },
      { icon: 'calendar_today',     label: 'ปฏิทิน',       href: base + '/calendar/view.php' },
      { icon: 'message',            label: 'ข้อความ',      href: base + '/message/index.php' },
      { icon: 'grade',              label: 'เกรดของฉัน',  href: base + '/grade/report/overview/index.php' },
      { icon: 'person',             label: 'โปรไฟล์',     href: base + '/user/profile.php' },
    ];
    if (user.admin) {
      defaultLinks.push({ icon: 'admin_panel_settings', label: 'Site Administration', href: base + '/admin/' });
      defaultLinks.push({ icon: 'manage_accounts',      label: 'จัดการผู้ใช้',      href: base + '/admin/user.php' });
      defaultLinks.push({ icon: 'library_books',        label: 'จัดการคอร์ส',       href: base + '/course/management.php' });
    }

    var scraped = [];
    document.querySelectorAll(
      '[data-region="primary-navigation"] .nav-item a,' +
      'ul.primary-navigation .nav-item a,' +
      '[data-key="home"] a,[data-key="myhome"] a,[data-key="mycourses"] a'
    ).forEach(function (a) {
      var txt = a.textContent.trim().replace(/\s+/g, ' ');
      if (txt && a.href && !a.href.endsWith('#')) scraped.push({ label: txt, href: a.href, icon: 'link' });
    });

    var moodleLinks = scraped.length > 0 ? scraped : defaultLinks;
    navList.appendChild(sectionLabel('Moodle'));
    moodleLinks.forEach(function (link) {
      navList.appendChild(drawerItem(link.icon || 'arrow_forward', link.label, link.href, {}));
    });

    fetchTeachingCourses(user, function (courses) {
      if (!courses.length) return;
      navList.appendChild(sep('margin:8px 12px;width:calc(100% - 24px);'));
      navList.appendChild(sectionLabel('วิชาที่สอน'));
      courses.slice(0, 8).forEach(function (course) {
        navList.appendChild(drawerItem('edit_note', course.shortname || course.fullname, buildCourseToolUrl(user, course, 'edit'), {}));
      });
    });

    /* Page navigation (current page tabs → sidebar) */
    if (pageNavItems && pageNavItems.length > 0) {
      navList.appendChild(sep('margin:8px 12px;width:calc(100% - 24px);'));
      navList.appendChild(sectionLabel('เมนูเพจ'));
      pageNavItems.forEach(function (item) {
        navList.appendChild(drawerItem('chevron_right', item.label, item.href, { active: item.active }));
      });
    }

    sidebar.appendChild(navList);

    /* ── Footer — logout matching .drawer-item--danger ──────────────────── */
    sidebar.appendChild(sep(''));
    var sftr = el('div', 'padding:8px 0;');
    var logoutUrl = base + '/login/logout.php' + (user.sesskey ? '?sesskey=' + user.sesskey : '');
    sftr.appendChild(drawerItem('logout', 'ออกจากระบบ', logoutUrl, { danger: true }));
    sidebar.appendChild(sftr);

    /* Overlay */
    var overlay = el('div', 'position:fixed;inset:0;top:72px;background:rgba(0,0,0,.32);z-index:99997;display:none;');
    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);

    var open = false;
    var openedByClick = false;

    function openSidebar(byClick) {
      open = true;
      openedByClick = !!byClick;
      sidebar.style.transform = 'translateX(0)';
      overlay.style.display = byClick ? 'block' : 'none';
      lines[0].style.transform = 'translateY(7.5px) rotate(45deg)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'translateY(-7.5px) rotate(-45deg)';
    }
    function closeSidebar() {
      open = false;
      openedByClick = false;
      sidebar.style.transform = 'translateX(-100%)';
      overlay.style.display = 'none';
      lines[0].style.transform = '';
      lines[1].style.opacity = '';
      lines[2].style.transform = '';
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); open ? closeSidebar() : openSidebar(true); });
    overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeSidebar(); });

    /* Hover trigger — thin strip on left edge, like LLL sidebar-hover-trigger */
    var hoverTrigger = el('div', [
      'position:fixed;top:72px;left:0;bottom:0;width:8px;z-index:99996;cursor:pointer;',
    ].join(''));
    hoverTrigger.addEventListener('mouseenter', function () {
      if (!open) openSidebar(false);
    });
    document.body.appendChild(hoverTrigger);

    /* Close on mouse leave sidebar — only if opened by hover, not click */
    sidebar.addEventListener('mouseleave', function () {
      if (open && !openedByClick) closeSidebar();
    });

    btn.lllSidebar = sidebar;
    btn.lllOverlay = overlay;
    return btn;
  }

  /* ── language toggle ──────────────────────────────────────────────────── */
  function buildLangToggle() {
    var current = (localStorage.getItem('lang') || 'th') === 'en-US' ? 'en-US' : 'th';

    var wrap = el('div', [
      'display:inline-flex;align-items:center;gap:6px;',
      'min-height:38px;padding:4px;',
      'border:1px solid rgba(17,24,39,.12);border-radius:999px;',
      'background:#fff;box-shadow:0 6px 18px rgba(17,24,39,.06);',
      'flex-shrink:0;cursor:default;',
    ].join(''));

    var icon = el('div', [
      'width:28px;height:28px;border-radius:50%;',
      'background:rgba(245,166,35,.14);',
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    ].join(''));
    icon.appendChild(mdi('translate', 16, ORANGE));

    var track = el('div', [
      'position:relative;display:grid;grid-template-columns:1fr 1fr;',
      'padding:2px;border-radius:999px;background:#edf1f4;overflow:hidden;width:80px;',
    ].join(''));

    var thumb = el('div', [
      'position:absolute;top:2px;left:2px;z-index:0;',
      'width:calc(50% - 2px);height:calc(100% - 4px);border-radius:999px;',
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
        'font-size:.72rem;font-weight:800;line-height:1;',
        'min-width:38px;min-height:28px;padding:0 6px;',
        'color:' + (current === value ? '#1f2937' : '#516170') + ';transition:color .2s;',
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

  /* ── notification bell — matches LLL nav-notification-btn ────────────── */
  function buildBell(user) {
    var base = user.wwwroot || '';
    var btn = el('a', [
      'position:relative;width:36px;height:36px;border-radius:50%;',
      'background:rgba(255,255,255,.72);',
      'border:1px solid rgba(17,24,39,.12);',
      'display:flex;align-items:center;justify-content:center;',
      'text-decoration:none;flex-shrink:0;cursor:pointer;',
      'transition:transform .22s ease,background-color .22s ease,box-shadow .22s ease;',
    ].join(''));
    btn.appendChild(mdi('notifications', 20, DARK));
    btn.href = base + '/message/index.php';
    btn.title = 'การแจ้งเตือน';
    btn.addEventListener('mouseover', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.background = '#ffffff';
      this.style.boxShadow = '0 6px 16px rgba(17,24,39,.1)';
    });
    btn.addEventListener('mouseout', function () {
      this.style.transform = '';
      this.style.background = 'rgba(255,255,255,.72)';
      this.style.boxShadow = '';
    });

    var badge = el('span', [
      'position:absolute;top:2px;right:2px;',
      'background:#dc2626;color:#fff;border-radius:999px;',
      'font-size:.62rem;font-weight:800;',
      'min-width:16px;height:16px;padding:0 3px;',
      'display:none;align-items:center;justify-content:center;',
      'line-height:1;border:2px solid ' + YELLOW + ';',
    ].join(''), '0');
    btn.appendChild(badge);
    if (user.userid) fetchNotificationCount(user, badge);
    return btn;
  }

  /* ── header — pixel-matches LLL top-toolbar ───────────────────────────── */
  function buildHeader(user, pageNavItems) {
    var base = user.wwwroot || '';

    var h = el('div', [
      'position:fixed;top:0;left:0;right:0;height:72px;z-index:99999;',
      'background:' + YELLOW + ';',
      'padding:8px 24px;display:flex;align-items:center;gap:12px;',
      'box-shadow:0 2px 12px rgba(0,0,0,.09);',
      'font-family:"Noto Sans Thai",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    ].join(''));
    h.id = 'lll-injected-header';

    /* Hamburger */
    var hamburger = buildHamburger(user, pageNavItems);
    h.appendChild(hamburger);

    /* Logo — matches .logo in main-layout.vue */
    var logo = el('a', [
      'display:flex;align-items:center;height:52px;padding:6px 16px;',
      'background:rgba(255,255,255,.85);border-radius:12px;',
      'box-shadow:0 2px 8px rgba(0,0,0,.06);text-decoration:none;flex-shrink:0;',
      'transition:all .24s ease;',
    ].join(''));
    logo.href = LLL_BASE_URL + '/main';
    var logoImg = document.createElement('img');
    logoImg.src = LOGO_URL;
    logoImg.alt = 'BUU LLL';
    logoImg.style.cssText = 'display:block;width:148px;height:auto;max-height:43px;object-fit:contain;';
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

    /* Spacer */
    h.appendChild(el('div', 'flex:1;min-width:0;'));

    /* Language toggle */
    var langToggle = buildLangToggle();
    h.appendChild(langToggle);

    /* ── User group — matches .nav-user-group grid ────────────────────── */
    var userGroup = el('div', [
      'display:grid;grid-template-columns:minmax(0,172px) 36px 36px;',
      'align-items:center;column-gap:10px;justify-content:end;',
      'height:46px;min-height:46px;width:326px;',
      'padding:4px 10px 4px 14px;border-radius:14px;',
      'background:rgba(255,255,255,.58);box-shadow:0 1px 4px rgba(0,0,0,.04);',
      'flex-shrink:0;',
    ].join(''));

    /* Name + role column */
    var textWrap = el('div', [
      'display:flex;flex-direction:column;justify-content:center;',
      'min-width:0;',
    ].join(''));
    var nameEl2 = el('div', [
      'font-size:.87rem;font-weight:700;color:' + DARKER + ';',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;',
    ].join(''));
    nameEl2.textContent = user.name;
    var roleEl = el('div', [
      'font-size:.71rem;color:#9e9e9e;line-height:1.2;margin-top:2px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    ].join(''));
    roleEl.textContent = user.admin ? 'ผู้ดูแลระบบ' : 'ผู้เรียน';
    textWrap.appendChild(nameEl2);
    textWrap.appendChild(roleEl);
    userGroup.appendChild(textWrap);

    /* Avatar + profile dropdown */
    var avatarWrap = el('div', 'position:relative;cursor:pointer;flex-shrink:0;width:36px;height:36px;');
    var av = makeAvatar(user, 36);
    av.style.cssText += 'outline:2.5px solid #ffffff;outline-offset:1px;box-shadow:0 2px 8px rgba(0,0,0,.1);cursor:pointer;';
    av.title = 'โปรไฟล์';
    avatarWrap.appendChild(av);

    /* Profile dropdown — matches .profile-action-card */
    var drop = el('div', [
      'position:absolute;top:calc(100% + 10px);right:0;width:238px;',
      'background:#fff;border-radius:14px;overflow:hidden;',
      'box-shadow:0 16px 38px rgba(17,24,39,.16);border:1px solid rgba(17,24,39,.08);',
      'display:none;flex-direction:column;z-index:10;',
    ].join(''));

    /* Dropdown header */
    var dropHdr = el('div', [
      'padding:12px;display:grid;grid-template-columns:42px minmax(0,1fr);',
      'gap:10px;align-items:center;',
      'background:linear-gradient(180deg,rgba(247,208,70,.16) 0%,rgba(255,255,255,0) 100%);',
      'border-bottom:1px solid rgba(17,24,39,.06);',
    ].join(''));
    var dropAv = makeAvatar(user, 42);
    dropAv.style.cssText += 'outline:2px solid #ffffff;box-shadow:0 2px 8px rgba(17,24,39,.1);';
    dropHdr.appendChild(dropAv);
    var did = el('div', 'min-width:0;');
    var dn = el('div', [
      'font-size:.86rem;font-weight:800;color:' + DARKER + ';',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25;',
    ].join(''));
    dn.textContent = user.name;
    var dr = el('div', [
      'font-size:.68rem;font-weight:700;color:rgba(61,38,0,.58);',
      'margin-top:2px;line-height:1.2;',
    ].join(''));
    dr.textContent = user.admin ? 'ผู้ดูแลระบบ' : 'ผู้เรียน';
    did.appendChild(dn); did.appendChild(dr);
    dropHdr.appendChild(did);
    drop.appendChild(dropHdr);

    /* Dropdown list */
    var dropList = el('div', 'padding:6px;');
    dropList.appendChild(makeDropItem('person', 'ข้อมูลส่วนตัว', base + '/user/profile.php', false));
    if (user.admin) dropList.appendChild(makeDropItem('settings', 'Site Administration', base + '/admin/', false));
    dropList.appendChild(el('div', 'height:1px;background:rgba(17,24,39,.06);margin:4px 0;'));
    var logoutUrl = base + '/login/logout.php' + (user.sesskey ? '?sesskey=' + user.sesskey : '');
    dropList.appendChild(makeDropItem('logout', 'ออกจากระบบ', logoutUrl, true));
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

    /* Responsive: shrink user group on mobile */
    function applyResponsive() {
      var w = window.innerWidth || document.documentElement.clientWidth || 1280;
      var isMobile = w < 720;
      userGroup.style.gridTemplateColumns = isMobile ? '36px 36px' : 'minmax(0,172px) 36px 36px';
      userGroup.style.width = isMobile ? '92px' : '326px';
      userGroup.style.padding = isMobile ? '4px 8px' : '4px 10px 4px 14px';
      userGroup.style.columnGap = isMobile ? '8px' : '10px';
      textWrap.style.display = isMobile ? 'none' : 'flex';
      hamburger.lllSidebar.style.width = isMobile ? 'min(86vw,300px)' : '280px';
      h.style.padding = isMobile ? '0 10px' : '8px 24px';
      langToggle.style.display = isMobile ? 'none' : 'inline-flex';
    }
    applyResponsive();
    window.addEventListener('resize', applyResponsive);

    return h;
  }

  /* ── mount ────────────────────────────────────────────────────────────── */
  function mount() {
    if (document.getElementById('lll-injected-header')) return;

    var inIframe = window.self !== window.top;

    /* When embedded in app iframe: hide Moodle nav but skip injecting LLL header */
    if (inIframe) {
      var iframeStyle = document.createElement('style');
      iframeStyle.textContent = [
        'nav.navbar,#usernavigation,.navbar-nav,#page-navbar{display:none!important;}',
        '[data-region="secondary-navigation"],[data-region="tertiary-navigation"],.secondary-navigation,.tertiarynavigation,nav.nav-tabs{display:none!important;}',
        '[data-action="toggle-drawer"],.drawer-toggler{display:none!important;}',
        '[data-region="courseindex-drawer"],.courseindex,aside.drawers{display:none!important;}',
        'body{padding-top:0!important;}',
      ].join('');
      document.head.appendChild(iframeStyle);
      return;
    }

    /* Load fonts */
    if (!document.getElementById('lll-mi-font')) {
      var miLink = document.createElement('link');
      miLink.id = 'lll-mi-font';
      miLink.rel = 'stylesheet';
      miLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      document.head.appendChild(miLink);
    }
    if (!document.getElementById('lll-noto-font')) {
      var notoLink = document.createElement('link');
      notoLink.id = 'lll-noto-font';
      notoLink.rel = 'stylesheet';
      notoLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(notoLink);
    }

    /* Scrape page nav BEFORE CSS hides it */
    var pageNavItems = scrapePageNavItems();

    var hidePageNav = pageNavItems.length > 0
      ? '[data-region="secondary-navigation"],[data-region="tertiary-navigation"],.secondary-navigation,.tertiarynavigation,nav.nav-tabs{display:none!important;}'
      : '.secondary-navigation,[data-region="secondary-navigation"]{display:none!important;}';

    var style = document.createElement('style');
    style.textContent = [
      'nav.navbar,#usernavigation,.navbar-nav,#page-navbar{display:none!important;}',
      hidePageNav,
      '[data-action="toggle-drawer"],.drawer-toggler{display:none!important;}',
      '[data-region="courseindex-drawer"],.courseindex,aside.drawers{display:none!important;}',
      'body{padding-top:72px!important;}','*{--lll-header-h:72px}.sticky-top,[style*="position:sticky"],[style*="position: sticky"]{top:72px!important;}',
    ].join('');
    document.head.appendChild(style);

    var user = getMoodleUser();
    document.body.insertBefore(buildHeader(user, pageNavItems), document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
