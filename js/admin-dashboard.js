// ================================
// Tabs
// ================================
const tabs = document.querySelectorAll('.tab-pill');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    contents.forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    const el = document.getElementById(tab.dataset.tab);
    if (el) el.classList.add('active');
  });
});

/* -----------------------------
   Backend API helpers
------------------------------ */
async function apiGet(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiPostJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.error || 'Request failed');
  return json;
}

let reports = []; // loaded from api/admin/reports_list.php
let stats = null; // loaded from api/admin/stats.php
let assignedToFilter = ''; // set by Settings -> View Reports
let studentsForPasswordReset = [];

// Settings data
let settingsCategories = [];

let settingsTags = [
  "Requires Follow-up",
  "Student Welfare",
  "Urgent Response",
  "Legal Review",
  "Counseling Needed",
  "Facilities Action",
  "IT Support",
  "Policy Violation",
  "Parent Contact",
  "Documentation Required"
];

let adminAssignments = [
  { name: "Dr. J. Smith", active: 0 },
  { name: "Prof. M. Johnson", active: 0 },
  { name: "Dr. K. Davis", active: 0 }
];

const canonicalAdminNames = [
  'Dr. J. Smith',
  'Prof. M. Johnson',
  'Dr. K. Davis'
];

function canonicalAssignedToName(rawName) {
  const key = String(rawName || '').trim().toLowerCase();
  if (!key) return '';

  const aliases = {
    'dr. j. smith': 'Dr. J. Smith',
    'dr. j. smith (dean of students)': 'Dr. J. Smith',
    'm. johnson': 'Prof. M. Johnson',
    'prof. m. johnson': 'Prof. M. Johnson',
    'prof. m. johnson (safety officer)': 'Prof. M. Johnson',
    'k. davis': 'Dr. K. Davis',
    'dr. k. davis': 'Dr. K. Davis',
    'dr. k. davis (counseling services)': 'Dr. K. Davis'
  };

  return aliases[key] || String(rawName || '').trim();
}

function syncAdminAssignmentActiveCounts() {
  const openReports = reports.filter((r) => {
    const status = String(r?.status || '').toLowerCase();
    return !status.includes('resolved') && !status.includes('withdrawn');
  });

  const counts = new Map();
  canonicalAdminNames.forEach((name) => counts.set(name, 0));

  openReports.forEach((r) => {
    const key = canonicalAssignedToName(r?.assigned_to || '');
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  adminAssignments = adminAssignments.map((admin) => {
    const name = canonicalAssignedToName(admin?.name || '');
    return {
      ...admin,
      name: name || String(admin?.name || '').trim(),
      active: counts.get(name) || 0,
    };
  });
}


// ================================
// Elements
// ================================
const totalReportsEl = document.getElementById("totalReports");
const pendingReviewEl = document.getElementById("pendingReview");
const highPriorityCountEl = document.getElementById("highPriorityCount");
const resolutionRateEl = document.getElementById("resolutionRate");

const overviewHighTbodyEl = document.getElementById("overviewHighTbody");
const overviewLowMedTbodyEl = document.getElementById("overviewLowMedTbody");
const workloadListEl = document.getElementById("workloadList");

const wkNewReportsEl = document.getElementById("wkNewReports");
const wkResolvedEl = document.getElementById("wkResolved");
const wkAvgRespEl = document.getElementById("wkAvgResp");

// Settings elements
const catSettingsList = document.getElementById("catSettingsList");
const tagSettingsList = document.getElementById("tagSettingsList");
const adminAssignList = document.getElementById("adminAssignList");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const addTagBtn = document.getElementById("addTagBtn");
const saveAllSettingsBtn = document.getElementById("saveAllSettingsBtn");

const npEmail = document.getElementById("npEmail");
const npUrgent = document.getElementById("npUrgent");
const npDaily = document.getElementById("npDaily");
const npWeekly = document.getElementById("npWeekly");
const studentPasswordStudent = document.getElementById("studentPasswordStudent");
const studentPasswordNew = document.getElementById("studentPasswordNew");
const studentPasswordConfirm = document.getElementById("studentPasswordConfirm");
const studentPasswordSaveBtn = document.getElementById("studentPasswordSaveBtn");
const studentPasswordStatus = document.getElementById("studentPasswordStatus");

// Category modal elements
const catModalBackdrop = document.getElementById("catModalBackdrop");
const catModalTitle = document.getElementById("catModalTitle");
const catModalSub = document.getElementById("catModalSub");
const catModalInput = document.getElementById("catModalInput");
const catModalError = document.getElementById("catModalError");
const catModalForm = document.getElementById("catModalForm");
const catModalCloseBtn = document.getElementById("catModalCloseBtn");
const catModalCancelBtn = document.getElementById("catModalCancelBtn");
const catModalSaveBtn = document.getElementById("catModalSaveBtn");

let categoryModalMode = 'add';
let categoryEditIndex = -1;
let categoryEditId = 0;


// Top actions
const exportBtn = document.getElementById("exportBtn");
const logoutBtn = document.getElementById("logoutBtn");
const notifBtn = document.getElementById("notifBtn");
const notifDot = document.getElementById("notifDot");
const adminBrandHomeLink = document.getElementById("adminBrandHomeLink");

if (adminBrandHomeLink) {
  adminBrandHomeLink.addEventListener('click', (e) => {
    const overviewTabBtn = document.querySelector('.tab-pill[data-tab="tabOverview"]');
    if (overviewTabBtn) {
      e.preventDefault();
      overviewTabBtn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Modal
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const rmAttachmentGrid = document.getElementById("rmAttachmentGrid");
const rmAttachmentEmpty = document.getElementById("rmAttachmentEmpty");
let selectedId = null;
let selectedReport = null;

// ================================
// Helpers
// ================================
function statusToChipClass(status){
  const s = String(status || "").toLowerCase();
  if (s.includes("pending")) return "pending";
  if (s.includes("review")) return "review";
  if (s.includes("progress")) return "progress";
  if (s.includes("resolved")) return "resolved";
  return "";
}

function elFromHTML(html){
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  return div.firstChild;
}

function submittedByLabel(r) {
  const privacy = String(r.privacy || '').toLowerCase();
  if (privacy === 'anonymous') return 'Anonymous';
  return r.user_name || '—';
}

function formatMeta(r) {
  return `${submittedByLabel(r)} • ${r.date || ''}`;
}

function toReportId(n){
  return "#"+String(n).padStart(6,"0");
}

function formatDateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function normalizeAdminCommentMessage(message) {
  const raw = String(message || '').trim();
  return raw.replace(/^Admin Comment:\s*/i, '').trim();
}

function renderAdminCommentHistory(updates, adminNotes) {
  const wrap = document.getElementById('rmHistory');
  if (!wrap) return;

  const rows = Array.isArray(updates) ? [...updates] : [];
  rows.sort((a, b) => {
    const at = new Date(a?.created_at || 0).getTime();
    const bt = new Date(b?.created_at || 0).getTime();
    return bt - at;
  });

  const comments = rows
    .map((u) => {
      const role = String(u?.author_role || '').toLowerCase() === 'admin' ? 'admin' : 'student';
      const rawMessage = String(u?.message || '').trim();
      const message = role === 'admin' ? normalizeAdminCommentMessage(rawMessage) : rawMessage;
      return {
        message,
        author_name: String(u?.author_name || (role === 'admin' ? 'Administrator' : 'Student')),
        author_role: role,
        created_at: u?.created_at || '',
        attachment_path: String(u?.attachment_path || '').trim(),
      };
    })
    .filter((u) => u.message !== '');

  const existing = String(adminNotes || '').trim();
  if (existing && !comments.some((c) => c.author_role === 'admin' && c.message === existing)) {
    comments.unshift({
      message: existing,
      author_name: 'Administrator',
      author_role: 'admin',
      created_at: '',
      attachment_path: '',
    });
  }

  if (!comments.length) {
    wrap.className = 'rm-history-empty';
    wrap.textContent = 'No comments yet.';
    return;
  }

  wrap.className = 'rm-history-list';
  wrap.innerHTML = comments.map((item) => `
    <div class="rm-history-item">
      <div class="rm-history-meta">
        <span class="rm-history-author-wrap">
          <span class="rm-history-role ${item.author_role === 'admin' ? 'is-admin' : 'is-student'}">${item.author_role === 'admin' ? 'Admin' : 'Student'}</span>
          <span>${escapeHtml(item.author_name || 'Administrator')}</span>
        </span>
        <span>${escapeHtml(formatDateTime(item.created_at))}</span>
      </div>
      <p class="rm-history-message">${escapeHtml(item.message)}</p>
      ${item.attachment_path ? `
      <a class="rm-history-attachment" href="${escapeHtml(item.attachment_path)}" target="_blank" rel="noreferrer noopener">
        <img src="${escapeHtml(item.attachment_path)}" alt="Student update attachment" loading="lazy" />
        <span>Open attachment</span>
      </a>
      ` : ''}
    </div>
  `).join('');
}

function renderRmAttachments(list){
  if (!rmAttachmentGrid || !rmAttachmentEmpty) return;
  const items = (Array.isArray(list) ? list : [])
    .map((src) => String(src || '').trim())
    .filter((src) => src !== '');

  rmAttachmentGrid.innerHTML = '';

  if (!items.length){
    rmAttachmentEmpty.style.display = 'block';
    return;
  }

  rmAttachmentEmpty.style.display = 'none';

  items.forEach((src, idx) => {
    const fileName = src.split('/').pop() || `Attachment ${idx + 1}`;
    const card = document.createElement('a');
    card.className = 'rm-attachment-card';
    card.href = src;
    card.target = '_blank';
    card.rel = 'noreferrer noopener';

    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.alt = `Attachment ${idx + 1}`;
    thumb.loading = 'lazy';

    const label = document.createElement('span');
    label.className = 'rm-attachment-label';
    label.textContent = fileName;

    card.appendChild(thumb);
    card.appendChild(label);
    rmAttachmentGrid.appendChild(card);
  });
}

function priorityClass(p){
  if (p === "High") return "pri-high";
  if (p === "Medium") return "pri-medium";
  return "pri-low";
}
function statusClass(s){
  if (s === "Under Review") return "st-review";
  if (s === "Pending") return "st-pending";
  if (s === "In Progress") return "st-progress";
  if (s === "Resolved") return "st-resolved";
  return "";
}

// ================================
// Render
// ================================
function renderOverview() {
  const total = stats?.stats?.total ?? reports.length;
  const pendingReview = stats?.stats?.pending ?? reports.filter((r) => r.status === 'Pending' || r.status === 'Under Review' || r.status === 'Draft').length;
  const highPriority = stats?.stats?.high ?? reports.filter((r) => r.priority === 'High').length;
  const rate = stats?.stats?.resolution_rate ?? 0;

  if (totalReportsEl) totalReportsEl.textContent = String(total);
  if (pendingReviewEl) pendingReviewEl.textContent = String(pendingReview);
  if (highPriorityCountEl) highPriorityCountEl.textContent = String(highPriority);
  if (resolutionRateEl) resolutionRateEl.textContent = `${rate}%`;

  // Priority tables (top 6 each; exclude Resolved/Withdrawn)
  const isOpen = (r) => r.status !== 'Resolved' && r.status !== 'Withdrawn';
  const tsOf = (r) => {
    const d = new Date(String(r.updated_at || r.created_at || r.date || ''));
    const t = d.getTime();
    return Number.isFinite(t) ? t : 0;
  };
  const byNewest = (a, b) => tsOf(b) - tsOf(a);

  const hp = reports
    .filter((r) => r.priority === 'High' && isOpen(r))
    .sort(byNewest)
    .slice(0, 6);

  const lm = reports
    .filter((r) => (r.priority === 'Low' || r.priority === 'Medium') && isOpen(r))
    .sort(byNewest)
    .slice(0, 6);

  function renderMiniTable(tbodyEl, list) {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = '';

    if (!list.length) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="padding:14px 12px; color:#6b8a7a; font-weight:800;">
            No reports to show.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach((r) => {
      const isAnon = String(r.privacy || '').toLowerCase() === 'anonymous';
      const submittedBy = isAnon
        ? `<span style="font-weight:800; color:#6b8a7a;">Anonymous</span>`
        : `<span style="font-weight:800;">${escapeHtml(r.user_name || '—')}</span>`;

      const stCls = statusClass(r.status);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="title-link" title="${escapeHtml(r.title || '')}">${escapeHtml(r.title || '')}</span></td>
        <td>${submittedBy}</td>
        <td>${escapeHtml(r.date || '')}</td>
        <td><span class="badge ${stCls}">${escapeHtml(r.status || '')}</span></td>
        <td>
          <button class="table-view-btn" type="button" data-id="${r.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View
          </button>
        </td>
      `;
      tr.querySelector('.table-view-btn').addEventListener('click', () => openModal(r.id));
      tbodyEl.appendChild(tr);
    });
  }

  renderMiniTable(overviewHighTbodyEl, hp);
  renderMiniTable(overviewLowMedTbodyEl, lm);

  // Week summary (best-effort from timestamps)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const createdWithinWeek = reports.filter((r) => {
    const d = new Date(String(r.date || ''));
    return Number.isFinite(d.getTime()) && d >= weekStart;
  });

  const resolvedWithinWeek = reports.filter((r) => {
    if (r.status !== 'Resolved') return false;
    const d = new Date(String(r.updated_at || r.date || ''));
    return Number.isFinite(d.getTime()) && d >= weekStart;
  });

  if (wkNewReportsEl) wkNewReportsEl.textContent = String(createdWithinWeek.length);
  if (wkResolvedEl) wkResolvedEl.textContent = String(resolvedWithinWeek.length);

  // Avg response time (resolved only, using created_at -> updated_at)
  const resolved = reports
    .filter((r) => r.status === 'Resolved' && r.created_at && r.updated_at)
    .map((r) => {
      const a = new Date(String(r.created_at));
      const b = new Date(String(r.updated_at));
      const ms = b.getTime() - a.getTime();
      return Number.isFinite(ms) ? ms : null;
    })
    .filter((v) => typeof v === 'number' && v >= 0);

  if (wkAvgRespEl) {
    if (!resolved.length) {
      wkAvgRespEl.textContent = '—';
    } else {
      const avgMs = resolved.reduce((s, v) => s + v, 0) / resolved.length;
      const hrs = avgMs / (1000 * 60 * 60);
      wkAvgRespEl.textContent = `${hrs.toFixed(1)} hours`;
    }
  }

  // Workload (group by assigned_to)
  if (workloadListEl) {
    const active = reports.filter((r) => r.status !== 'Resolved' && r.status !== 'Withdrawn');
    const map = new Map();
    canonicalAdminNames.forEach((name) => map.set(name, 0));

    active.forEach((r) => {
      const normalized = canonicalAssignedToName(r.assigned_to || '');
      const key = normalized || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
    });

    const canonicalList = canonicalAdminNames.map((name) => ({
      name,
      count: map.get(name) || 0,
    }));

    const extras = Array.from(map.entries())
      .filter(([name]) => !canonicalAdminNames.includes(name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const list = [...canonicalList, ...extras];

    workloadListEl.innerHTML = '';
    list.forEach((w) => {
      workloadListEl.appendChild(elFromHTML(`
        <div class="work-item">
          <div class="work-name">${escapeHtml(w.name)}</div>
          <div class="work-pill">${w.count} Reports</div>
        </div>
      `));
    });
  }

  // View buttons are attached per-row in the mini tables.
}

//lagaymo d2//
// ================================
// Analytics (like screenshot)
// ================================
const catListEl = document.getElementById("catList");
const mAvgEl = document.getElementById("mAvg");
const mFastEl = document.getElementById("mFast");
const mLongEl = document.getElementById("mLong");
const mMonthEl = document.getElementById("mMonth");
const mRateEl = document.getElementById("mRate");

function renderAnalytics() {
  if (!catListEl) return;

  // Category distribution (top categories)
  const countsMap = new Map();
  reports.forEach((r) => {
    const key = String(r.category || 'Other') || 'Other';
    countsMap.set(key, (countsMap.get(key) || 0) + 1);
  });
  const counts = Array.from(countsMap.entries())
    .map(([label, count], i) => ({ label, count, idx: i }))
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...counts.map((x) => x.count));
  const palette = ['rgb(46,125,82)', 'rgb(249,115,22)', 'rgb(59,130,246)', 'rgb(168,85,247)', 'rgb(239,68,68)'];

  catListEl.innerHTML = '';
  counts.forEach((c, i) => {
    const pct = Math.round((c.count / max) * 100);
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML = `
      <div class="cat-name">${escapeHtml(c.label)}</div>
      <div class="cat-bar">
        <div class="cat-fill" style="width:${pct}%; background:${palette[i % palette.length]};"></div>
      </div>
      <div class="cat-count">${c.count}</div>
    `;
    catListEl.appendChild(row);
  });

  // Resolution time metrics from created_at -> updated_at for resolved reports
  const timesDays = reports
    .filter((r) => r.status === 'Resolved' && r.created_at && r.updated_at)
    .map((r) => {
      const a = new Date(String(r.created_at));
      const b = new Date(String(r.updated_at));
      const ms = b.getTime() - a.getTime();
      const days = ms / (1000 * 60 * 60 * 24);
      return Number.isFinite(days) && days >= 0 ? days : null;
    })
    .filter((v) => typeof v === 'number');

  const avg = timesDays.length ? (timesDays.reduce((a, b) => a + b, 0) / timesDays.length) : 0;
  const fastest = timesDays.length ? Math.min(...timesDays) : 0;
  const longest = timesDays.length ? Math.max(...timesDays) : 0;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = reports.filter((r) => String(r.date || '').startsWith(monthKey)).length;
  const rate = stats?.stats?.resolution_rate ?? (reports.length ? Math.round((reports.filter((r) => r.status === 'Resolved').length / reports.length) * 100) : 0);

  if (mAvgEl) mAvgEl.textContent = `${avg ? avg.toFixed(1) : '0'} days`;
  if (mFastEl) mFastEl.textContent = `${fastest ? fastest.toFixed(1) : '0'} days`;
  if (mLongEl) mLongEl.textContent = `${longest ? longest.toFixed(1) : '0'} days`;
  if (mMonthEl) mMonthEl.textContent = `${thisMonth} Reports`;
  if (mRateEl) mRateEl.textContent = `${rate}%`;
}

function renderSettings(){
  syncAdminAssignmentActiveCounts();

  // categories
  if (catSettingsList){
    catSettingsList.innerHTML = "";
    settingsCategories.forEach((category, idx) => {
      const name = String(category?.name || '').trim();
      const id = Number(category?.id || 0);
      const row = document.createElement("div");
      row.className = "set-row";
      row.innerHTML = `
        <div class="set-row-left">
          <div class="set-row-text">${escapeHtml(name)}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button class="set-icon-btn" type="button" data-i="${idx}" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="set-edit" type="button" data-delete-id="${id}" data-delete-name="${escapeHtml(name)}">Delete</button>
        </div>
      `;
      row.querySelector(".set-icon-btn").addEventListener("click", () => {
        openCategoryModal('edit', name, idx, id);
      });
      row.querySelector("[data-delete-id]")?.addEventListener("click", () => {
        deleteCategoryById(id, name);
      });
      catSettingsList.appendChild(row);
    });
  }

  // tags
  if (tagSettingsList){
    tagSettingsList.innerHTML = "";
    settingsTags.forEach((name, idx) => {
      const row = document.createElement("div");
      row.className = "set-row";
      row.innerHTML = `
        <div class="set-row-left">
          <div class="set-row-text">🏷 ${escapeHtml(name)}</div>
        </div>
        <button class="set-edit" type="button" data-i="${idx}">
          ✎ Edit
        </button>
      `;
      row.querySelector(".set-edit").addEventListener("click", () => {
        const next = prompt("Edit tag name:", name);
        if (next && next.trim()){
          settingsTags[idx] = next.trim();
          renderSettings();
        }
      });
      tagSettingsList.appendChild(row);
    });
  }

  // admin assignments
  if (adminAssignList){
    adminAssignList.innerHTML = "";
    adminAssignments.forEach((a) => {
      const raw = String(a.name || '').trim();
      const m = raw.match(/^(.+?)\s*\((.+)\)\s*$/);
      const displayName = (m ? m[1] : raw) || raw;
      const role = m ? m[2] : '';

      const card = document.createElement('div');
      card.className = 'admin-card';
      card.innerHTML = `
        <div class="admin-top">
          <div class="admin-left">
            <div class="admin-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <div class="admin-name">${escapeHtml(displayName)}</div>
              <div class="admin-role">${escapeHtml(role)}</div>
            </div>
          </div>
          <div class="admin-pill-right">${Number(a.active || 0)} Active</div>
        </div>

        <div class="admin-actions">
          <button class="admin-view-btn" type="button" data-admin="${escapeHtml(raw)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View Reports
          </button>
        </div>
      `;

      card.querySelector('.admin-view-btn').addEventListener('click', () => viewReportsForAdmin(raw));
      adminAssignList.appendChild(card);
    });
  }
}

function viewReportsForAdmin(adminName){
  assignedToFilter = String(adminName || '').trim();

  // Clear other filters for clarity
  if (arSearch) arSearch.value = '';
  if (arStatus) arStatus.value = '';
  if (arType) arType.value = '';

  const allReportsTab = document.querySelector('.tab-pill[data-tab="tabAllReports"]');
  if (allReportsTab) allReportsTab.click();

  renderAllReportsTable();
}

function setStudentPasswordStatus(message, kind = '') {
  if (!studentPasswordStatus) return;
  studentPasswordStatus.textContent = String(message || '');
  studentPasswordStatus.classList.remove('error', 'success');
  if (kind === 'error' || kind === 'success') {
    studentPasswordStatus.classList.add(kind);
  }
}

function renderStudentPasswordOptions(selectedId = 0) {
  if (!studentPasswordStudent) return;

  const selected = Number(selectedId || studentPasswordStudent.value || 0);
  studentPasswordStudent.innerHTML = '<option value="">Select student</option>';

  studentsForPasswordReset.forEach((student) => {
    const opt = document.createElement('option');
    opt.value = String(student.id || '');
    const fullName = String(student.full_name || '').trim() || 'Student';
    const schoolId = String(student.school_id || '').trim();
    const email = String(student.email || '').trim();
    const suffix = schoolId ? ` • ${schoolId}` : (email ? ` • ${email}` : '');
    opt.textContent = `${fullName}${suffix}`;
    studentPasswordStudent.appendChild(opt);
  });

  if (selected > 0 && studentsForPasswordReset.some((s) => Number(s.id) === selected)) {
    studentPasswordStudent.value = String(selected);
  } else {
    studentPasswordStudent.value = '';
  }
}

function openCategoryModal(mode, initialValue, index, categoryId = 0) {
  categoryModalMode = mode === 'edit' ? 'edit' : 'add';
  categoryEditIndex = Number.isInteger(index) ? index : -1;
  categoryEditId = Number(categoryId || 0);

  if (catModalTitle) {
    catModalTitle.textContent = categoryModalMode === 'edit' ? 'Edit Category' : 'Add Category';
  }
  if (catModalSub) {
    catModalSub.textContent = categoryModalMode === 'edit'
      ? 'Update the selected report category.'
      : 'Create a new report category.';
  }
  if (catModalSaveBtn) {
    catModalSaveBtn.textContent = categoryModalMode === 'edit' ? 'Save Changes' : 'Save Category';
  }

  if (catModalInput) {
    catModalInput.value = String(initialValue || '').trim();
  }
  if (catModalError) {
    catModalError.textContent = '';
  }

  if (!catModalBackdrop) return;
  catModalBackdrop.classList.add('show');
  catModalBackdrop.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    catModalInput?.focus();
    catModalInput?.select();
  }, 0);
}

function closeCategoryModal() {
  if (!catModalBackdrop) return;
  catModalBackdrop.classList.remove('show');
  catModalBackdrop.setAttribute('aria-hidden', 'true');
  categoryModalMode = 'add';
  categoryEditIndex = -1;
  categoryEditId = 0;
  if (catModalError) catModalError.textContent = '';
}

function syncAllReportsCategoryFilter() {
  if (!arType) return;

  const selected = String(arType.value || '');
  const options = ['<option value="">Type</option>'];

  settingsCategories.forEach((category) => {
    const name = String(category?.name || '').trim();
    if (!name) return;
    options.push(`<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`);
  });

  arType.innerHTML = options.join('');

  if (selected && settingsCategories.some((c) => String(c?.name || '') === selected)) {
    arType.value = selected;
  }
}

async function loadCategories() {
  const json = await apiGet('api/categories_list.php');
  const rows = Array.isArray(json.categories) ? json.categories : [];
  settingsCategories = rows
    .map((row) => ({
      id: Number(row?.id || 0),
      name: String(row?.name || '').trim(),
    }))
    .filter((row) => row.id > 0 && row.name !== '');

  syncAllReportsCategoryFilter();
}

async function loadStudentsForPasswordReset() {
  const json = await apiGet('api/admin/students_list.php');
  const rows = Array.isArray(json.students) ? json.students : [];
  studentsForPasswordReset = rows
    .map((row) => ({
      id: Number(row?.id || 0),
      full_name: String(row?.full_name || '').trim(),
      school_id: String(row?.school_id || '').trim(),
      email: String(row?.email || '').trim(),
    }))
    .filter((row) => row.id > 0);

  renderStudentPasswordOptions();
}

async function deleteCategoryById(categoryId, categoryName) {
  const id = Number(categoryId || 0);
  if (!Number.isFinite(id) || id <= 0) {
    alert('Invalid category selected.');
    return;
  }

  const name = String(categoryName || '').trim() || 'this category';
  const confirmed = window.confirm(`Delete category "${name}"? This cannot be undone.`);
  if (!confirmed) {
    return;
  }

  try {
    await apiPostJson('api/admin/categories_delete.php', { id });
    await Promise.all([loadCategories(), loadReports()]);
    refresh();
  } catch (err) {
    alert(String(err?.message || 'Unable to delete category'));
  }
}

catModalCloseBtn?.addEventListener('click', closeCategoryModal);
catModalCancelBtn?.addEventListener('click', closeCategoryModal);
catModalBackdrop?.addEventListener('click', (e) => {
  if (e.target === catModalBackdrop) closeCategoryModal();
});

catModalForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = String(catModalInput?.value || '').trim();

  if (!value) {
    if (catModalError) catModalError.textContent = 'Category name is required.';
    catModalInput?.focus();
    return;
  }

  (async () => {
    try {
      if (catModalSaveBtn) {
        catModalSaveBtn.disabled = true;
        catModalSaveBtn.textContent = categoryModalMode === 'edit' ? 'Saving...' : 'Adding...';
      }

      if (categoryModalMode === 'edit') {
        if (categoryEditId <= 0) {
          throw new Error('Invalid category selected');
        }
        await apiPostJson('api/admin/categories_update.php', {
          id: categoryEditId,
          name: value,
        });
      } else {
        await apiPostJson('api/admin/categories_create.php', { name: value });
      }

      await Promise.all([loadCategories(), loadReports()]);
      refresh();
      closeCategoryModal();
    } catch (err) {
      const message = String(err?.message || 'Unable to save category');
      if (catModalError) catModalError.textContent = message;
    } finally {
      if (catModalSaveBtn) {
        catModalSaveBtn.disabled = false;
        catModalSaveBtn.textContent = categoryModalMode === 'edit' ? 'Save Changes' : 'Save Category';
      }
    }
  })();
});

if (addCategoryBtn){
  addCategoryBtn.addEventListener("click", () => {
    openCategoryModal('add', '', -1, 0);
  });
}

if (addTagBtn){
  addTagBtn.addEventListener("click", () => {
    const v = prompt("New tag name:");
    if (v && v.trim()){
      settingsTags.push(v.trim());
      renderSettings();
    }
  });
}

if (saveAllSettingsBtn){
  saveAllSettingsBtn.addEventListener("click", () => {
    const prefs = {
      email: !!npEmail?.checked,
      urgent: !!npUrgent?.checked,
      daily: !!npDaily?.checked,
      weekly: !!npWeekly?.checked
    };
    console.log("Saved settings (frontend only):", {
      settingsCategories, settingsTags, adminAssignments, prefs
    });
    alert("Saved all settings (frontend only).");
  });
}

if (studentPasswordSaveBtn) {
  studentPasswordSaveBtn.addEventListener('click', () => {
    (async () => {
      const studentId = Number(studentPasswordStudent?.value || 0);
      const newPassword = String(studentPasswordNew?.value || '');
      const confirmPassword = String(studentPasswordConfirm?.value || '');

      setStudentPasswordStatus('');

      if (studentId <= 0) {
        setStudentPasswordStatus('Please select a student.', 'error');
        return;
      }

      if (newPassword.length < 8) {
        setStudentPasswordStatus('Password must be at least 8 characters.', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        setStudentPasswordStatus('Passwords do not match.', 'error');
        return;
      }

      try {
        studentPasswordSaveBtn.disabled = true;
        studentPasswordSaveBtn.textContent = 'Updating...';

        await apiPostJson('api/admin/student_password_update.php', {
          student_id: studentId,
          new_password: newPassword,
        });

        if (studentPasswordNew) studentPasswordNew.value = '';
        if (studentPasswordConfirm) studentPasswordConfirm.value = '';
        setStudentPasswordStatus('Student password updated successfully.', 'success');
      } catch (err) {
        setStudentPasswordStatus(String(err?.message || 'Unable to update password'), 'error');
      } finally {
        studentPasswordSaveBtn.disabled = false;
        studentPasswordSaveBtn.textContent = 'Update Student Password';
      }
    })();
  });
}


// ================================
// Modal
// ================================
async function openModal(id) {
  selectedId = id;

  try {
    const json = await apiGet(`api/report_get.php?id=${encodeURIComponent(String(id))}`);
    const r = json.report;
    selectedReport = r;

    document.getElementById('rmTitle').textContent = r.title || '—';
    document.getElementById('rmId').textContent = r.id_display || toReportId(id);

    const privacy = String(r.privacy || '').toLowerCase();
    const submitLabel = privacy === 'anonymous' ? 'Anonymous' : (r.user_name || r.user_email || '—');
    document.getElementById('rmSubmitted').textContent = submitLabel;
    document.getElementById('rmStudentId').textContent = String(r.user_school_id || '—');
    document.getElementById('rmDate').textContent = r.submitted || '—';
    const rmDetailedDescription = document.getElementById('rmDetailedDescription');
    if (rmDetailedDescription) {
      rmDetailedDescription.value = r.description || '';
    }

    document.getElementById('rmPriority').value = r.priority || 'Medium';
    document.getElementById('rmStatus').value = r.status || 'Pending';
    document.getElementById('rmNotes').value = r.admin_notes || '';
    renderAdminCommentHistory(r.updates, r.admin_notes || '');
    renderRmAttachments(r.attachments || []);

    const assignEl = document.getElementById('rmAssign');
    if (assignEl) {
      const val = String(r.assigned_to || '').trim();
      if (val) {
        // If not present in options, keep current options but still show the value if possible
        const opt = Array.from(assignEl.options || []).find((o) => o.value === val);
        if (opt) assignEl.value = val;
      }
    }

    document.getElementById('rmStatusBadge').textContent = r.status || '—';
    document.getElementById('rmTypeBadge').textContent = r.category || '—';
  } catch (e) {
    console.error(e);
    alert(e?.message || 'Unable to load report');
    return;
  }

  modalBackdrop?.classList.add('show');
  modalBackdrop?.setAttribute('aria-hidden', 'false');
}


function closeModal() {
  modalBackdrop?.classList.remove('show');
  modalBackdrop?.setAttribute('aria-hidden', 'true');
  selectedId = null;
  selectedReport = null;
}

closeModalBtn?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && catModalBackdrop?.classList.contains('show')) {
    closeCategoryModal();
    return;
  }
  if (e.key === 'Escape') closeModal();
});

// ================================
// Export (PDF / XLSX) Modal
// ================================
const exportModalBackdrop = document.getElementById('exportModalBackdrop');
const exportModalCloseBtn = document.getElementById('exportModalCloseBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportXlsxBtn = document.getElementById('exportXlsxBtn');
const exportStatus = document.getElementById('exportStatus');

function openExportModal() {
  if (exportModalBackdrop) {
    exportModalBackdrop.classList.add('show');
    exportModalBackdrop.setAttribute('aria-hidden', 'false');
  }
  clearExportStatus();
}

function closeExportModal() {
  if (exportModalBackdrop) {
    exportModalBackdrop.classList.remove('show');
    exportModalBackdrop.setAttribute('aria-hidden', 'true');
  }
  clearExportStatus();
}

function setExportStatus(message, isError = false) {
  if (exportStatus) {
    exportStatus.textContent = message;
    exportStatus.classList.toggle('error', isError);
    exportStatus.classList.toggle('loading', !isError);
  }
}

function clearExportStatus() {
  if (exportStatus) {
    exportStatus.textContent = '';
    exportStatus.classList.remove('error', 'loading');
  }
}

function setExportButtonsDisabled(disabled) {
  if (exportPdfBtn) exportPdfBtn.disabled = disabled;
  if (exportXlsxBtn) exportXlsxBtn.disabled = disabled;
}

function parseDownloadFilename(contentDisposition, fallback) {
  const raw = String(contentDisposition || '');
  const m = raw.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const encoded = m?.[1] || m?.[2] || '';
  if (!encoded) return fallback;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

async function downloadExportFile(format) {
  const q = encodeURIComponent(String(arSearch?.value || '').trim());
  const status = encodeURIComponent(String(arStatus?.value || '').trim());
  const category = encodeURIComponent(String(arType?.value || '').trim());
  const assignedTo = encodeURIComponent(String(assignedToFilter || '').trim());

  const qs = [`format=${encodeURIComponent(format)}`];
  if (q) qs.push(`q=${q}`);
  if (status) qs.push(`status=${status}`);
  if (category) qs.push(`category=${category}`);
  if (assignedTo) qs.push(`assigned_to=${assignedTo}`);

  const url = `api/admin/export_reports.php?${qs.join('&')}`;
  const res = await fetch(url, { credentials: 'same-origin' });

  if (!res.ok) {
    const maybeJson = await res.json().catch(() => null);
    throw new Error(maybeJson?.error || 'Export failed');
  }

  const blob = await res.blob();
  const fallback = `spusm_ereport_export.${format}`;
  const filename = parseDownloadFilename(res.headers.get('Content-Disposition'), fallback);

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

exportBtn?.addEventListener('click', openExportModal);

exportModalCloseBtn?.addEventListener('click', closeExportModal);

exportModalBackdrop?.addEventListener('click', (e) => {
  if (e.target === exportModalBackdrop) {
    closeExportModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && exportModalBackdrop?.classList.contains('show')) {
    closeExportModal();
  }
});

exportPdfBtn?.addEventListener('click', () => {
  (async () => {
    try {
      setExportStatus('Generating PDF...');
      setExportButtonsDisabled(true);
      await downloadExportFile('pdf');
      closeExportModal();
    } catch (e) {
      console.error(e);
      setExportStatus(e?.message || 'PDF export failed', true);
      setExportButtonsDisabled(false);
    }
  })();
});

exportXlsxBtn?.addEventListener('click', () => {
  (async () => {
    try {
      setExportStatus('Generating Excel...');
      setExportButtonsDisabled(true);
      await downloadExportFile('xlsx');
      closeExportModal();
    } catch (e) {
      console.error(e);
      setExportStatus(e?.message || 'Excel export failed', true);
      setExportButtonsDisabled(false);
    }
  })();
});

// ================================
// Notifications / Logout (Demo)
// ================================
logoutBtn?.addEventListener('click', () => {
  (async () => {
    try {
      await fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore
    }
    window.location.href = 'login.php';
  })();
});

// ================================
// Filters
// ================================


// ================================
// Utils
// ================================
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function refresh() {
  renderOverview();
  renderAllReportsTable();
  renderAnalytics();
  renderSettings();
}



// ================================
// All Reports (TABLE version like screenshot)
// Requires these HTML IDs in tabAllReports:
// arSearch, arStatus, arType, applyFiltersBtn, allReportsTbody
// ================================
const arSearch = document.getElementById("arSearch");
const arStatus = document.getElementById("arStatus");
const arType = document.getElementById("arType");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const allReportsTbody = document.getElementById("allReportsTbody");

function renderAllReportsTable(){
  if (!allReportsTbody) return;

  const q = (arSearch?.value || "").toLowerCase().trim();
  const sf = arStatus?.value || "";
  const tf = arType?.value || "";

  let list = [...reports];

  // search
  if (q){
    list = list.filter((r) => {
      const normalizedTitle = (r.title || "").toLowerCase();
      const normalizedCategory = (r.category || "").toLowerCase();
      const normalizedActor = (r.actorLabel || "").toLowerCase();
      const normalizedStatus = (r.status || "").toLowerCase();
      const normalizedPriority = (r.priority || "").toLowerCase();
      const normalizedDate = (r.date || "").toLowerCase();
      const numericId = String(r.id || "").toLowerCase();
      const formattedId = (r.id_display ? String(r.id_display) : (r.id ? toReportId(r.id) : "")).toLowerCase();

      return (
        normalizedTitle.includes(q) ||
        normalizedCategory.includes(q) ||
        normalizedActor.includes(q) ||
        normalizedStatus.includes(q) ||
        normalizedPriority.includes(q) ||
        normalizedDate.includes(q) ||
        numericId.includes(q) ||
        formattedId.includes(q)
      );
    });
  }

  // filters
  if (sf) list = list.filter(r => r.status === sf);
  if (tf) list = list.filter(r => r.category === tf);

  if (assignedToFilter){
    list = list.filter(r => String(r.assigned_to || '').trim() === assignedToFilter);
  }

  allReportsTbody.innerHTML = "";

  if (list.length === 0){
    allReportsTbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding:18px; color:#6b8a7a; font-weight:800;">
          No reports found. Try changing filters.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach((r) => {
    const rid = r.id_display ? String(r.id_display) : toReportId(r.id);

    const priCls = priorityClass(r.priority);
    const stCls = statusClass(r.status);

    const isAnon = String(r.privacy || '').toLowerCase() === 'anonymous';

    const submittedBy = isAnon
      ? `<span style="font-weight:800; color:#6b8a7a;">Anonymous</span>`
      : `<span style="font-weight:800;">${escapeHtml(r.user_name || '')}</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="id-link">${escapeHtml(rid)}</span></td>
      <td><span class="title-link">${escapeHtml(r.title || "")}</span></td>
      <td><span class="badge ${priCls}">${escapeHtml(r.priority || "")}</span></td>
      <td><span class="badge ${stCls}">${escapeHtml(r.status || "")}</span></td>
      <td>${submittedBy}</td>
      <td>${escapeHtml(r.date || "")}</td>
      <td>
        <button class="table-view-btn" type="button" data-id="${r.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          View
        </button>
      </td>
    `;

    tr.querySelector('.table-view-btn').addEventListener('click', () => openModal(r.id));
    allReportsTbody.appendChild(tr);
  });
}

// hooks
if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", renderAllReportsTable);
[arSearch, arStatus, arType].forEach(el => {
  if (!el) return;
  el.addEventListener("input", renderAllReportsTable);
  el.addEventListener("change", renderAllReportsTable);
});

// Initial render happens after auth + loads

// ================================
// Notifications Dropdown
// ================================
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");
const notifNewPill = document.getElementById("notifNewPill");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const viewAllNotifBtn = document.getElementById("viewAllNotifBtn");

let notifications = [];

function notifIcon(type){
  if (type === "danger" || type === "warn") return "⚠️";
  if (type === "info") return "💬";
  if (type === "purple") return "✅";
  if (type === "ok" || type === "success") return "👤";
  return "🔔";
}

function toRelativeTime(dateTime) {
  const dt = new Date(String(dateTime || ''));
  const ts = dt.getTime();
  if (!Number.isFinite(ts)) return 'Just now';

  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

async function loadNotifications() {
  const json = await apiGet('api/notifications_list.php?limit=30');
  const rows = Array.isArray(json.notifications) ? json.notifications : [];
  notifications = rows.map((n) => ({
    id: Number(n.id),
    reportId: Number(n.report_id || 0),
    type: String(n.type || 'info'),
    title: String(n.title || ''),
    desc: String(n.message || ''),
    time: toRelativeTime(n.created_at),
    unread: !Boolean(n.is_read),
  }));
  renderNotifications();
}

function renderNotifications(){
  if (!notifList) return;
  notifList.innerHTML = "";

  notifications.forEach(n => {
    const div = document.createElement("div");
    div.className = "notif-item " + (n.unread ? "unread" : "");
    div.innerHTML = `
      <div class="notif-ico ${n.type}">${notifIcon(n.type)}</div>
      <div class="notif-body">
        <div class="notif-item-title">${escapeHtml(n.title)}</div>
        <div class="notif-item-desc">${escapeHtml(n.desc)}</div>
        <div class="notif-item-time">${escapeHtml(n.time)}</div>
      </div>
    `;
    // click item => mark read
    div.addEventListener("click", () => {
      (async () => {
        try {
          await apiPostJson('api/notifications_mark_read.php', { id: n.id });
          notifications = notifications.map(x => x.id === n.id ? { ...x, unread: false } : x);
          syncNotifBadge();
          renderNotifications();

          if (Number.isFinite(n.reportId) && n.reportId > 0) {
            closeNotif();
            await openModal(n.reportId);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    });
    notifList.appendChild(div);
  });

  syncNotifBadge();
}

function syncNotifBadge(){
  const unread = notifications.filter(n => n.unread).length;

  if (notifNewPill) notifNewPill.textContent = unread ? `${unread} new` : "All read";

  if (notifDot) {
    if (unread) {
      notifDot.style.display = "grid";
      notifDot.textContent = String(unread);
    } else {
      notifDot.style.display = "none";
    }
  }
}

function toggleNotif(){
  if (!notifDropdown) return;
  notifDropdown.classList.toggle("show");
  notifDropdown.setAttribute("aria-hidden", notifDropdown.classList.contains("show") ? "false" : "true");
}

function closeNotif(){
  if (!notifDropdown) return;
  notifDropdown.classList.remove("show");
  notifDropdown.setAttribute("aria-hidden", "true");
}

if (notifBtn) {
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotif();
  });
}

// click outside closes
document.addEventListener("click", (e) => {
  if (!notifDropdown) return;
  const inside = notifDropdown.contains(e.target) || notifBtn.contains(e.target);
  if (!inside) closeNotif();
});

// footer buttons
if (markAllReadBtn) {
  markAllReadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    (async () => {
      try {
        await apiPostJson('api/notifications_mark_all_read.php', {});
        notifications = notifications.map(n => ({ ...n, unread: false }));
        syncNotifBadge();
        renderNotifications();
      } catch (err) {
        console.error(err);
      }
    })();
  });
}

if (viewAllNotifBtn) {
  viewAllNotifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeNotif();
    document.querySelector('.tab-pill[data-tab="allReportsTab"]')?.click();
  });
}

// initial
loadNotifications().catch((err) => {
  console.error(err);
  renderNotifications();
});


document.getElementById("saveReportBtn").addEventListener("click", () => {
  if (!selectedId) return;

  (async () => {
    try {
      const p = document.getElementById('rmPriority')?.value || '';
      const s = document.getElementById('rmStatus')?.value || '';
      const notes = document.getElementById('rmNotes')?.value || '';
      const assigned_to = document.getElementById('rmAssign')?.value || '';

      await apiPostJson('api/admin/report_update.php', {
        id: selectedId,
        status: s,
        priority: p,
        assigned_to,
        admin_notes: notes,
      });

      await loadAll();
      closeModal();
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Unable to save changes');
    }
  })();
});

document.getElementById("cancelReportBtn").addEventListener("click", () => {
  closeModal();
});

/* -----------------------------
   Loaders
------------------------------ */
async function ensureAdmin() {
  const me = await apiGet('api/me.php');
  if (!me.authenticated) {
    window.location.href = 'login.php';
    return null;
  }
  const role = String(me.user?.role || '').toLowerCase();
  if (role !== 'admin') {
    window.location.href = 'user-dashboard.php';
    return null;
  }

  const adminNameEl = document.getElementById('adminName');
  if (adminNameEl) adminNameEl.textContent = me.user?.full_name || 'Admin';
  return me.user;
}

async function loadStats() {
  stats = await apiGet('api/admin/stats.php');
}

async function loadReports() {
  const q = encodeURIComponent(String(arSearch?.value || '').trim());
  const status = encodeURIComponent(String(arStatus?.value || '').trim());
  const category = encodeURIComponent(String(arType?.value || '').trim());

  const qs = [];
  if (q) qs.push(`q=${q}`);
  if (status) qs.push(`status=${status}`);
  if (category) qs.push(`category=${category}`);
  const url = `api/admin/reports_list.php?${qs.join('&')}`;

  const json = await apiGet(url);
  reports = Array.isArray(json.reports) ? json.reports : [];
}

async function loadAll() {
  await Promise.all([loadStats(), loadReports(), loadCategories(), loadStudentsForPasswordReset()]);
  refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    try {
      await ensureAdmin();
      await loadAll();
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Unable to load admin dashboard');
    }
  })();
});
