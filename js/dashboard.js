// dashboard.js

// Tabs
const tabs = document.querySelectorAll(".tab-pill");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    const el = document.getElementById(tab.dataset.tab);
    if (el) el.classList.add("active");
  });
});

// Elements
const totalEl = document.getElementById("totalReports");
const pendingEl = document.getElementById("pendingReports");
const progressEl = document.getElementById("inProgressReports");
const resolvedEl = document.getElementById("resolvedReports");
const recentList = document.getElementById("recentReports");

// Optional buttons
const logoutBtn = document.getElementById("logoutBtn");
const newReportBtn = document.getElementById("newReportBtn");
const brandHomeLink = document.getElementById("brandHomeLink");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    (async () => {
      try {
        await fetch('api/logout.php', { method: 'POST' });
      } catch {
        // ignore
      }
      window.location.href = 'login.php';
    })();
  });
}

if (newReportBtn) {
  newReportBtn.addEventListener("click", () => {
    // Switch to Submit Report tab
    const submitTabBtn = document.querySelector('.tab-pill[data-tab="submitTab"]');
    if (submitTabBtn) submitTabBtn.click();
  });
}

if (brandHomeLink) {
  brandHomeLink.addEventListener('click', (e) => {
    const dashboardTabBtn = document.querySelector('.tab-pill[data-tab="dashboardTab"]');
    if (dashboardTabBtn) {
      e.preventDefault();
      dashboardTabBtn.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

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
    body: JSON.stringify(body || {})
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiPostForm(url, formData) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.error || 'Request failed');
  return json;
}

// Helpers
function normalizeStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("pending")) return "Pending";
  if (s.includes("review")) return "Under Review";
  if (s.includes("progress")) return "In Progress";
  if (s.includes("resolved")) return "Resolved";
  return status || "Pending";
}

function chipForStatus(status) {
  const s = normalizeStatus(status);
  if (s === "Under Review") return "chip-review";
  if (s === "In Progress") return "chip-progress";
  if (s === "Resolved") return "chip-resolved";
  return "chip-progress";
}

function chipForPriority(priority) {
  const p = (priority || "").toLowerCase();
  if (p.includes("high")) return "chip-high";
  if (p.includes("medium")) return "chip-medium";
  return "chip-medium";
}

function avatarFor(report) {
  const status = normalizeStatus(report.status);
  if (status === "Resolved") return { cls: "avatar-green", text: "✓" };
  if (status === "In Progress") return { cls: "avatar-orange", text: "!" };
  return { cls: "avatar-blue", text: "i" };
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Render
function renderReports(list) {
  if (!recentList) return;

  if (!Array.isArray(list) || list.length === 0) {
    recentList.innerHTML = `
      <div class="recent-empty-state" role="status" aria-live="polite">
        <h3 class="recent-empty-title">No active reports</h3>
        <p class="recent-empty-text">You currently have no pending, in-progress, or resolved reports to show.</p>
        <button class="outline-btn" type="button" id="recentEmptySubmitBtn">Submit New Report</button>
      </div>
    `;

    document.getElementById("recentEmptySubmitBtn")?.addEventListener("click", () => {
      document.querySelector('.tab-pill[data-tab="submitTab"]')?.click();
      document.getElementById("category")?.focus();
    });
    return;
  }

  recentList.innerHTML = list.map(r => {
    const av = avatarFor(r);
    const safeTitle = escapeHtml(r.title);
    const safeCat = escapeHtml(r.category);
    const safeDate = escapeHtml(r.date);
    const safeStatus = escapeHtml(normalizeStatus(r.status));
    const safePriority = escapeHtml(r.priority);

    return `
      <article class="report-item" data-report="${escapeHtml(String(r.id || ''))}">
        <div class="report-left">
          <div class="report-avatar ${av.cls}" aria-hidden="true">${av.text}</div>
          <div class="report-info">
            <div class="report-title">${safeTitle}</div>
            <div class="report-meta">${safeCat} • ${safeDate}</div>
          </div>
        </div>
        <div class="report-right">
          <span class="chip chip-status ${chipForStatus(r.status)}">${safeStatus}</span>
          <span class="chip chip-priority ${chipForPriority(r.priority)}">${safePriority}</span>
        </div>
      </article>
    `;
  }).join("");
}

function updateStats(list) {
  const total = list.length;

  // Count statuses
  let pending = 0;
  let progress = 0;
  let resolved = 0;

  list.forEach(r => {
    const s = normalizeStatus(r.status);
    if (s === "Resolved") resolved++;
    else if (s === "In Progress") progress++;
    else pending++; // includes Under Review / Pending / others
  });

  if (totalEl) totalEl.textContent = String(total);
  if (pendingEl) pendingEl.textContent = String(pending);
  if (progressEl) progressEl.textContent = String(progress);
  if (resolvedEl) resolvedEl.textContent = String(resolved);
}

// Init (replace with fetch later)
async function ensureLoggedIn() {
  const me = await apiGet('api/me.php');
  if (!me.authenticated) {
    window.location.href = 'login.php';
    return null;
  }
  return me.user;
}

async function loadDashboard() {
  const stats = await apiGet('api/reports_stats.php?mine=1');
  if (totalEl) totalEl.textContent = String(stats.counts?.total ?? 0);
  if (pendingEl) pendingEl.textContent = String(stats.counts?.pending ?? 0);
  if (progressEl) progressEl.textContent = String(stats.counts?.in_progress ?? 0);
  if (resolvedEl) resolvedEl.textContent = String(stats.counts?.resolved ?? 0);

  const recent = await apiGet('api/reports_list.php?mine=1&limit=20');
  const mapped = (recent.reports || [])
  .filter(r => normalizeStatus(r.status) !== 'Withdrawn')
  .slice(0, 5)
  .map(r => ({
    id: String(r.id_display || ('#' + String(r.id))),
    title: r.title,
    category: r.category,
    date: r.submitted,
    status: r.status,
    priority: r.priority
  }));
  renderReports(mapped);
}

async function loadHistory() {
  const recent = await apiGet('api/reports_list.php?mine=1&limit=100');
  const list = (recent.reports || [])
  .filter(r => normalizeStatus(r.status) !== 'Withdrawn')
  .map(r => ({
    id: String(r.id_display || ('#' + String(r.id))),
    title: r.title,
    category: r.category,
    submitted: r.submitted,
    status: r.status,
    priority: r.priority + ' Priority',
    location: r.location,
    adminComment: normalizeAdminCommentSnippet(r.admin_notes || ''),
    canEdit: normalizeStatus(r.status) === 'Draft'
  }));
  renderHistory(list);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await ensureLoggedIn();
    await Promise.all([loadDashboard(), loadHistory(), loadReportCategories()]);
  } catch (e) {
    console.error(e);
  }
});


/* -----------------------------
   Submit Report interactions
------------------------------ */
const uploadBox = document.getElementById("uploadBox");
const attachmentsInput = document.getElementById("attachments");
const chooseFilesBtn = document.getElementById("chooseFilesBtn");
const uploadPreview = document.getElementById("uploadPreview");
const categorySelect = document.getElementById("category");
const otherTitleField = document.getElementById("otherTitleField");
const reportTitleInput = document.getElementById("reportTitle");
let reportCategories = [];

function hasCategoryOption(name) {
  const value = String(name || '').trim();
  if (!value || !categorySelect) return false;
  return Array.from(categorySelect.options).some((opt) => (opt.value || '').trim() === value);
}

function ensureCategoryOption(name) {
  const value = String(name || '').trim();
  if (!value || !categorySelect || hasCategoryOption(value)) return;
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = value;
  categorySelect.appendChild(opt);
}

function renderCategoryOptions(selectedValue = '') {
  if (!categorySelect) return;

  const selected = String(selectedValue || categorySelect.value || '').trim();
  categorySelect.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.textContent = 'Select category';
  categorySelect.appendChild(placeholder);

  reportCategories.forEach((category) => {
    const name = String(category?.name || '').trim();
    if (!name) return;

    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    categorySelect.appendChild(opt);
  });

  if (selected && hasCategoryOption(selected)) {
    categorySelect.value = selected;
  } else {
    categorySelect.value = '';
  }

  syncOtherTitleVisibility();
}

async function loadReportCategories(selectedValue = '') {
  try {
    const json = await apiGet('api/categories_list.php');
    const rows = Array.isArray(json.categories) ? json.categories : [];
    reportCategories = rows
      .map((row) => ({
        id: Number(row?.id || 0),
        name: String(row?.name || '').trim(),
      }))
      .filter((row) => row.id > 0 && row.name !== '');

    renderCategoryOptions(selectedValue);
  } catch (err) {
    console.error(err);
    if (selectedValue) {
      ensureCategoryOption(selectedValue);
      categorySelect.value = String(selectedValue);
      syncOtherTitleVisibility();
    }
  }
}

function syncOtherTitleVisibility() {
  const isOther = (categorySelect?.value || "") === "Other";
  if (otherTitleField) {
    otherTitleField.style.display = isOther ? "flex" : "none";
  }
  if (reportTitleInput) {
    reportTitleInput.required = isOther;
    if (!isOther) reportTitleInput.value = "";
  }
}

categorySelect?.addEventListener("change", syncOtherTitleVisibility);
syncOtherTitleVisibility();

if (chooseFilesBtn && attachmentsInput) {
  chooseFilesBtn.addEventListener("click", () => attachmentsInput.click());
}

function renderFilePreview(files) {
  if (!uploadPreview) return;
  if (!files || files.length === 0) {
    uploadPreview.innerHTML = "";
    return;
  }

  const pills = Array.from(files).slice(0, 8).map(f => {
    const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
    return `<span class="preview-pill">${escapeHtml(f.name)} • ${sizeMB}MB</span>`;
  });

  const extra = files.length > 8
    ? `<span class="preview-pill">+${files.length - 8} more</span>`
    : "";

  uploadPreview.innerHTML = pills.join("") + extra;
}

if (attachmentsInput) {
  attachmentsInput.addEventListener("change", (e) => {
    renderFilePreview(e.target.files);
  });
}

if (uploadBox && attachmentsInput) {
  ["dragenter", "dragover"].forEach(evt => {
    uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBox.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    uploadBox.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBox.classList.remove("dragover");
    });
  });

  uploadBox.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files) return;

    // Put dropped files into the input (supported in modern browsers)
    attachmentsInput.files = dt.files;
    renderFilePreview(dt.files);
  });
}

/* Privacy option highlight */
const privacyOptions = document.querySelectorAll(".privacy-option");
privacyOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    privacyOptions.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");

    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

/* Submit + Draft (demo behavior) */
const reportForm = document.getElementById("reportForm");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const submitSuccessOverlay = document.getElementById("submitSuccessOverlay");
const submitSuccessModal = submitSuccessOverlay?.querySelector(".submit-success-modal");
const submitSuccessX = document.getElementById("submitSuccessX");
const submitSuccessId = document.getElementById("submitSuccessId");
const submitSuccessAnotherBtn = document.getElementById("submitSuccessAnotherBtn");
const submitSuccessViewBtn = document.getElementById("submitSuccessViewBtn");
const saveDraftOverlay = document.getElementById("saveDraftOverlay");
const saveDraftModal = saveDraftOverlay?.querySelector(".save-draft-modal");
const saveDraftX = document.getElementById("saveDraftX");
const saveDraftCancelBtn = document.getElementById("saveDraftCancelBtn");
const saveDraftConfirmBtn = document.getElementById("saveDraftConfirmBtn");
const incidentDateInput = document.getElementById('incidentDate');
const incidentTimeInput = document.getElementById('incidentTime');
const incidentDateTimeError = document.getElementById('incidentDateTimeError');
let currentDraftId = 0;

function showIncidentDateTimeError(message) {
  if (incidentDateTimeError) {
    incidentDateTimeError.textContent = message;
    incidentDateTimeError.style.display = 'block';
  }
  incidentDateInput?.classList.add('input-invalid');
  incidentTimeInput?.classList.add('input-invalid');
}

function clearIncidentDateTimeError() {
  if (incidentDateTimeError) {
    incidentDateTimeError.textContent = '';
    incidentDateTimeError.style.display = 'none';
  }
  incidentDateInput?.classList.remove('input-invalid');
  incidentTimeInput?.classList.remove('input-invalid');
}

incidentDateInput?.addEventListener('input', clearIncidentDateTimeError);
incidentTimeInput?.addEventListener('input', clearIncidentDateTimeError);

function setDraftContext(reportId) {
  currentDraftId = Number(reportId) || 0;
  if (saveDraftBtn) {
    saveDraftBtn.textContent = currentDraftId > 0 ? 'Update Draft' : 'Save as Draft';
  }
}

function setPrivacySelection(value) {
  const selected = (value || 'public').toLowerCase();
  privacyOptions.forEach(opt => {
    const radio = opt.querySelector('input[type="radio"]');
    const isMatch = (radio?.value || '').toLowerCase() === selected;
    if (radio) radio.checked = isMatch;
    opt.classList.toggle('active', isMatch);
  });
}

setDraftContext(0);

function openSubmitSuccess(idDisplay) {
  if (!submitSuccessOverlay) return;
  if (submitSuccessId) submitSuccessId.textContent = idDisplay || "—";
  submitSuccessOverlay.classList.add("open");
  submitSuccessOverlay.setAttribute("aria-hidden", "false");
  submitSuccessModal?.focus();
}

function formatReportReference(payload) {
  const provided = String(payload?.id_display || '').trim();
  if (provided) return provided;

  const rawId = Number(payload?.report_id || 0);
  if (!Number.isFinite(rawId) || rawId <= 0) return '—';

  const modulus = 2147483646;
  const multiplier = 214013;
  const offset = 2531011;
  const encoded = ((multiplier * (rawId - 1)) + offset) % modulus;
  return `#${encoded + 1}`;
}

function closeSubmitSuccess() {
  if (!submitSuccessOverlay) return;
  submitSuccessOverlay.classList.remove("open");
  submitSuccessOverlay.setAttribute("aria-hidden", "true");
}

function openSaveDraftConfirm() {
  if (!saveDraftOverlay) return;
  saveDraftOverlay.classList.add("open");
  saveDraftOverlay.setAttribute("aria-hidden", "false");
  saveDraftModal?.focus();
}

function closeSaveDraftConfirm() {
  if (!saveDraftOverlay) return;
  saveDraftOverlay.classList.remove("open");
  saveDraftOverlay.setAttribute("aria-hidden", "true");
  if (saveDraftConfirmBtn) {
    saveDraftConfirmBtn.disabled = false;
    saveDraftConfirmBtn.textContent = "Confirm Save";
  }
}

saveDraftX?.addEventListener("click", closeSaveDraftConfirm);
saveDraftCancelBtn?.addEventListener("click", closeSaveDraftConfirm);
saveDraftOverlay?.addEventListener("click", (e) => {
  if (e.target === saveDraftOverlay) closeSaveDraftConfirm();
});

submitSuccessX?.addEventListener("click", closeSubmitSuccess);
submitSuccessOverlay?.addEventListener("click", (e) => {
  if (e.target === submitSuccessOverlay) closeSubmitSuccess();
});

submitSuccessAnotherBtn?.addEventListener("click", () => {
  closeSubmitSuccess();
  setDraftContext(0);
  reportForm?.reset();
  clearIncidentDateTimeError();
  setPrivacySelection('public');
  syncOtherTitleVisibility();
  renderFilePreview([]);
  document.querySelector('.tab-pill[data-tab="submitTab"]')?.click();
  document.getElementById("category")?.focus();
});

submitSuccessViewBtn?.addEventListener("click", () => {
  closeSubmitSuccess();
  document.querySelector('.tab-pill[data-tab="myReportsTab"]')?.click();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && submitSuccessOverlay?.classList.contains("open")) {
    closeSubmitSuccess();
  }
  if (e.key === "Escape" && saveDraftOverlay?.classList.contains("open")) {
    closeSaveDraftConfirm();
  }
});

if (reportForm) {
  reportForm.addEventListener("submit", (e) => {
    e.preventDefault();
    (async () => {
      try {
        clearIncidentDateTimeError();
        const fd = new FormData(reportForm);
        // Ensure privacy value included (radio)
        if (!fd.get('privacy')) {
          const checked = document.querySelector('input[name="privacy"]:checked');
          if (checked) fd.set('privacy', checked.value);
        }
        if (currentDraftId > 0) {
          fd.set('draft_id', String(currentDraftId));
        }
        const json = await apiPostForm('api/report_create.php', fd);
        let refId = formatReportReference(json);
        if (refId === '—') {
          try {
            const latest = await apiGet('api/reports_list.php?mine=1&limit=1');
            const latestReport = Array.isArray(latest?.reports) ? latest.reports[0] : null;
            const fallback = String(latestReport?.id_display || '').trim();
            if (fallback) {
              refId = fallback;
            }
          } catch {
            // keep default dash fallback
          }
        }

        addNotificationLocal({
          id: 0,
          type: 'ok',
          title: 'Report Submitted',
          message: `Your report ${refId === '—' ? '' : refId} has been submitted successfully.`.trim(),
          time: 'Just now',
          unread: true,
        });

        reportForm.reset();
        setDraftContext(0);
        setPrivacySelection('public');
        syncOtherTitleVisibility();
        renderFilePreview([]);
        await Promise.all([loadDashboard(), loadHistory()]);
        openSubmitSuccess(refId);
      } catch (err) {
        console.error(err);
        const message = String(err?.message || 'Submit failed');
        if (message.toLowerCase().includes('incident date/time cannot be in the future')) {
          showIncidentDateTimeError('Incident date/time cannot be in the future. Please use current or past server time.');
          incidentDateInput?.focus();
          return;
        }
        alert(message);
      }
    })();
  });
}

async function saveDraftNow() {
  const data = {
    id: currentDraftId || 0,
    category: document.getElementById('category')?.value || '',
    title: document.getElementById('reportTitle')?.value || '',
    description: document.getElementById('description')?.value || '',
    location: document.getElementById('location')?.value || '',
    incidentDate: document.getElementById('incidentDate')?.value || '',
    incidentTime: document.getElementById('incidentTime')?.value || '',
    privacy: document.querySelector('input[name="privacy"]:checked')?.value || 'public',
  };
  const json = await apiPostJson('api/report_save_draft.php', data);
  setDraftContext(json.report_id);
  await Promise.all([loadDashboard(), loadHistory()]);
  document.querySelector('.tab-pill[data-tab="myReportsTab"]')?.click();
  return json;
}

if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", () => {
    openSaveDraftConfirm();
  });
}

saveDraftConfirmBtn?.addEventListener("click", () => {
  (async () => {
    try {
      saveDraftConfirmBtn.disabled = true;
      saveDraftConfirmBtn.textContent = 'Saving...';
      const json = await saveDraftNow();
      closeSaveDraftConfirm();
      showDraftSuccessToast(`Draft ${json.id_display || ''} saved successfully.`.trim());
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Draft save failed');
      if (saveDraftConfirmBtn) {
        saveDraftConfirmBtn.disabled = false;
        saveDraftConfirmBtn.textContent = 'Confirm Save';
      }
    }
  })();
});
/* ========== End of File ========== */


/* -----------------------------
   My Reports (History) UI
------------------------------ */
const historyList = document.getElementById('historyList') || document.querySelector('.myreports-list');

function chipForStatusMyReports(status) {
  const s = normalizeStatus(status);
  if (s === "Under Review") return "chip-review";
  if (s === "In Progress") return "chip-progress";
  if (s === "Resolved") return "chip-resolved";
  if (s === "Pending") return "chip-pending";
  return "chip-pending";
}

function avatarForHistory(r) {
  const s = normalizeStatus(r.status);
  if (s === "Resolved") return { cls: "avatar-green", text: "✓" };
  if (s === "In Progress") return { cls: "avatar-orange", text: "!" };
  if (s === "Pending") return { cls: "avatar-orange", text: "o" };
  return { cls: "avatar-blue", text: "i" };
}
function normalizeAdminCommentSnippet(v) {
  const raw = String(v || '').replace(/^Admin Comment:\s*/i, '').trim();
  if (!raw) return '';
  if (raw.length <= 140) return raw;
  return `${raw.slice(0, 140).trim()}…`;
}

function isFinalReportStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized === "Resolved" || String(status || "").toLowerCase().includes("withdraw");
}

function renderHistory(list) {
  if (!historyList) return;

  historyList.innerHTML = list.map(r => {
    const av = avatarForHistory(r);
    const safeTitle = escapeHtml(r.title);
    const safeId = escapeHtml(r.id);
    const safeCat = escapeHtml(r.category);
    const safeStatus = escapeHtml(normalizeStatus(r.status));
    const safePriority = escapeHtml(r.priority);
    const safeDate = escapeHtml(r.submitted);
    const isFinal = isFinalReportStatus(r.status);
    const safeAdminComment = escapeHtml(r.adminComment || '');

    const editBtn = r.canEdit
      ? `<button class="btn-sm btn-muted" type="button" data-action="edit" data-id="${safeId}">
          ✎ Edit Report
        </button>`
      : "";

    const updateBtn = isFinal
      ? ""
      : `<button class="btn-sm" type="button" data-action="update" data-id="${safeId}">
          Add Update
        </button>`;

    const withdrawBtn = isFinal
      ? ""
      : `<button class="btn-sm btn-danger" type="button" data-action="withdraw" data-id="${safeId}">
          Withdraw
        </button>`;

    return `
      <article class="history-card" data-report="${safeId}">
        <div class="h-left">
          <div class="h-avatar ${av.cls}" aria-hidden="true">${av.text}</div>

          <div class="h-main">
            <h3 class="h-title">${safeTitle}</h3>
            <div class="h-sub">Report ID: #${safeId}</div>

            <div class="h-cat">Category: ${safeCat}</div>
            ${safeAdminComment ? `<div class="h-admin-note"><strong>Admin Comment:</strong> ${safeAdminComment}</div>` : ''}

            <div class="h-actions">
              <button class="btn-sm" type="button" data-action="view" data-id="${safeId}">
                View Details
              </button>
              ${editBtn}
              ${updateBtn}
              ${withdrawBtn}
            </div>
          </div>
        </div>

        <div class="h-right">
          <div class="h-badges">
            <span class="chip chip-status ${chipForStatusMyReports(r.status)}">${safeStatus}</span>
            <span class="chip chip-priority ${chipForPriority(r.priority)} chip-priority-text">${safePriority}</span>
          </div>
          <div class="h-date">Submitted: ${safeDate}</div>
        </div>
      </article>
    `;
  }).join("");
}





// Open tab from URL hash (e.g. user-dashboard.php#myReportsTab)
(function () {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;

  const tabBtn = document.querySelector(`.tab-pill[data-tab="${hash}"]`);
  if (tabBtn) tabBtn.click();
})();

const addUpdateOverlay = document.getElementById("addUpdateOverlay");
const addUpdateModal = addUpdateOverlay?.querySelector(".add-update-modal");
const addUpdateX = document.getElementById("addUpdateX");
const addUpdateCancel = document.getElementById("addUpdateCancel");
const addUpdateForm = document.getElementById("addUpdateForm");
const addUpdateReportId = document.getElementById("addUpdateReportId");
const addUpdateText = document.getElementById("addUpdateText");
const addUpdateAttachment = document.getElementById("addUpdateAttachment");
const addUpdateChooseFileBtn = document.getElementById("addUpdateChooseFileBtn");
const addUpdateFileName = document.getElementById("addUpdateFileName");
const withdrawOverlay = document.getElementById("withdrawOverlay");
const withdrawModal = withdrawOverlay?.querySelector(".withdraw-modal");
const withdrawX = document.getElementById("withdrawX");
const withdrawCancel = document.getElementById("withdrawCancel");
const withdrawConfirmBtn = document.getElementById("withdrawConfirmBtn");
const withdrawReportId = document.getElementById("withdrawReportId");
const withdrawSuccessToast = document.getElementById("withdrawSuccessToast");
const draftSuccessToast = document.getElementById("draftSuccessToast");

let activeUpdateReportId = "";
let activeWithdrawReportId = "";
let withdrawToastTimer = null;
let draftToastTimer = null;

function openAddUpdateModal(idDisplay) {
  activeUpdateReportId = String(idDisplay || "").trim() || "#—";
  if (addUpdateReportId) addUpdateReportId.textContent = activeUpdateReportId;
  if (addUpdateText) addUpdateText.value = "";
  if (addUpdateAttachment) addUpdateAttachment.value = "";
  if (addUpdateFileName) addUpdateFileName.textContent = "No file chosen";
  if (!addUpdateOverlay) return;
  addUpdateOverlay.classList.add("open");
  addUpdateOverlay.setAttribute("aria-hidden", "false");
  addUpdateModal?.focus();
  addUpdateText?.focus();
}

function closeAddUpdateModal() {
  if (!addUpdateOverlay) return;
  addUpdateOverlay.classList.remove("open");
  addUpdateOverlay.setAttribute("aria-hidden", "true");
}

function openWithdrawModal(idDisplay) {
  activeWithdrawReportId = String(idDisplay || "").trim() || "#—";
  if (withdrawReportId) withdrawReportId.textContent = activeWithdrawReportId;
  if (!withdrawOverlay) return;
  withdrawOverlay.classList.add("open");
  withdrawOverlay.setAttribute("aria-hidden", "false");
  withdrawModal?.focus();
}

function closeWithdrawModal() {
  if (!withdrawOverlay) return;
  withdrawOverlay.classList.remove("open");
  withdrawOverlay.setAttribute("aria-hidden", "true");
  activeWithdrawReportId = "";
  if (withdrawConfirmBtn) {
    withdrawConfirmBtn.disabled = false;
    withdrawConfirmBtn.textContent = "Confirm Withdraw";
  }
}

function reportIdKey(value) {
  return String(value || '').replace('#', '').replace(/^0+/, '') || '0';
}

function removeHistoryCardByReportId(idDisplay) {
  const target = reportIdKey(idDisplay);
  if (!target) return;

  document.querySelectorAll('.history-card').forEach((card) => {
    const fromDataId = card.getAttribute('data-id');
    const fromDataReport = card.getAttribute('data-report');
    const sub = card.querySelector('.h-sub')?.textContent || '';
    const matched = sub.match(/#\d+/);
    const candidate = fromDataId || fromDataReport || (matched ? matched[0] : '');
    if (reportIdKey(candidate) === target) {
      card.remove();
    }
  });
}

function removeRecentCardByReportId(idDisplay) {
  const target = reportIdKey(idDisplay);
  if (!target) return;

  document.querySelectorAll('#recentReports .report-item').forEach((card) => {
    const candidate = card.getAttribute('data-report') || '';
    if (reportIdKey(candidate) === target) {
      card.remove();
    }
  });
}

function showWithdrawSuccessToast(message) {
  if (!withdrawSuccessToast) return;
  const textEl = withdrawSuccessToast.querySelector('.withdraw-success-toast-text');
  if (textEl) textEl.textContent = message || 'Report withdrawn successfully.';
  withdrawSuccessToast.classList.add('show');
  if (withdrawToastTimer) clearTimeout(withdrawToastTimer);
  withdrawToastTimer = setTimeout(() => {
    withdrawSuccessToast.classList.remove('show');
  }, 2500);
}

function showDraftSuccessToast(message) {
  if (!draftSuccessToast) return;
  const textEl = draftSuccessToast.querySelector('.withdraw-success-toast-text');
  if (textEl) textEl.textContent = message || 'Draft saved successfully.';
  draftSuccessToast.classList.add('show');
  if (draftToastTimer) clearTimeout(draftToastTimer);
  draftToastTimer = setTimeout(() => {
    draftSuccessToast.classList.remove('show');
  }, 2500);
}

function findReportIdFromButton(btn) {
  if (!btn) return "#—";
  if (btn.dataset?.id) return btn.dataset.id;
  const card = btn.closest(".history-card");
  const fromData = card?.getAttribute("data-id");
  if (fromData) return fromData;
  const sub = card?.querySelector(".h-sub")?.textContent || "";
  const matched = sub.match(/#\d+/);
  return matched ? matched[0] : "#—";
}

addUpdateX?.addEventListener("click", closeAddUpdateModal);
addUpdateCancel?.addEventListener("click", closeAddUpdateModal);
addUpdateOverlay?.addEventListener("click", (e) => {
  if (e.target === addUpdateOverlay) closeAddUpdateModal();
});

addUpdateForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  (async () => {
    const updateText = (addUpdateText?.value || "").trim();
    if (!updateText) {
      addUpdateText?.focus();
      return;
    }

    try {
      const numericId = Number(String(activeUpdateReportId).replace('#', '').replace(/^0+/, ''));
      if (!Number.isFinite(numericId) || numericId <= 0) {
        throw new Error('Invalid report id');
      }

      const fd = new FormData();
      fd.set('id', String(numericId));
      fd.set('message', updateText);
      const file = addUpdateAttachment?.files?.[0];
      if (file) fd.set('attachment', file);

      await apiPostForm('api/report_add_update.php', fd);

      try {
        await loadNotifications();
      } catch {
        // no-op when notifications API is unavailable
      }

      closeAddUpdateModal();
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Failed to save update');
    }
  })();
});

addUpdateChooseFileBtn?.addEventListener("click", () => {
  addUpdateAttachment?.click();
});

addUpdateAttachment?.addEventListener("change", () => {
  const file = addUpdateAttachment.files?.[0];
  if (addUpdateFileName) addUpdateFileName.textContent = file ? file.name : "No file chosen";
});

withdrawX?.addEventListener("click", closeWithdrawModal);
withdrawCancel?.addEventListener("click", closeWithdrawModal);
withdrawOverlay?.addEventListener("click", (e) => {
  if (e.target === withdrawOverlay) closeWithdrawModal();
});

withdrawConfirmBtn?.addEventListener("click", () => {
  (async () => {
    try {
      const numericId = Number(String(activeWithdrawReportId).replace('#', '').replace(/^0+/, ''));
      if (!Number.isFinite(numericId) || numericId <= 0) {
        throw new Error('Invalid report id');
      }

      withdrawConfirmBtn.disabled = true;
      withdrawConfirmBtn.textContent = 'Withdrawing...';

      await apiPostJson('api/report_withdraw.php', { id: numericId });
      removeHistoryCardByReportId(activeWithdrawReportId);
      removeRecentCardByReportId(activeWithdrawReportId);
      closeWithdrawModal();
      showWithdrawSuccessToast(`Report ${activeWithdrawReportId} withdrawn successfully.`);
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Withdraw failed');
      if (withdrawConfirmBtn) {
        withdrawConfirmBtn.disabled = false;
        withdrawConfirmBtn.textContent = 'Confirm Withdraw';
      }
    }
  })();
});

document.addEventListener("click", (e) => {
  const staticWithdrawBtn = e.target.closest(".h-actions .btn-sm.btn-danger");
  if (!staticWithdrawBtn) return;
  if (staticWithdrawBtn.dataset?.action) return;
  openWithdrawModal(findReportIdFromButton(staticWithdrawBtn));
});

document.addEventListener("click", (e) => {
  const staticAddBtn = e.target.closest(".h-actions .btn-sm");
  if (!staticAddBtn) return;
  if (staticAddBtn.dataset?.action) return;
  if (staticAddBtn.classList.contains("btn-muted") || staticAddBtn.classList.contains("btn-danger")) return;
  if (staticAddBtn.textContent.trim().toLowerCase() !== "add update") return;

  openAddUpdateModal(findReportIdFromButton(staticAddBtn));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && addUpdateOverlay?.classList.contains("open")) {
    closeAddUpdateModal();
  }
  if (e.key === "Escape" && withdrawOverlay?.classList.contains("open")) {
    closeWithdrawModal();
  }
});






/* Click handling for buttons */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "view") {
    (async () => {
      try {
        const numericId = String(id || '').replace('#', '').replace(/^0+/, '');
        const json = await apiGet(`api/report_get.php?id=${encodeURIComponent(numericId)}`);
        const r = json.report;
        const payload = {
          id: r.id_display,
          title: r.title,
          category: r.category,
          submitted: r.submitted,
          status: r.status,
          priority: `${r.priority} Priority`,
          location: r.location,
          description: r.description,
          attachments: r.attachments || []
        };
        localStorage.setItem('spusm_selected_report', JSON.stringify(payload));
        window.location.href = 'report-details.php';
      } catch (err) {
        console.error(err);
        alert(err?.message || 'Unable to load report');
      }
    })();
}


  if (action === "edit") {
    (async () => {
      try {
        const numericId = String(id || '').replace('#', '').replace(/^0+/, '');
        const json = await apiGet(`api/report_get.php?id=${encodeURIComponent(numericId)}`);
        const r = json.report;

        if (normalizeStatus(r.status) !== 'Draft') {
          throw new Error('Only Draft reports can be edited.');
        }

        await loadReportCategories(r.category || '');
        ensureCategoryOption(r.category || '');
        document.getElementById('category').value = r.category || '';
        syncOtherTitleVisibility();
        if ((r.category || '') === 'Other') {
          document.getElementById('reportTitle').value = r.title || '';
        }
        document.getElementById('description').value = (r.description && r.description !== '—') ? r.description : '';
        document.getElementById('location').value = (r.location && r.location !== '—') ? r.location : '';
        document.getElementById('incidentDate').value = r.incident_date || '';
        document.getElementById('incidentTime').value = r.incident_time || '';
        setPrivacySelection(r.privacy || 'public');
        if (attachmentsInput) attachmentsInput.value = '';
        renderFilePreview([]);
        setDraftContext(r.id);

        document.querySelector('.tab-pill[data-tab="submitTab"]')?.click();
        document.getElementById('description')?.focus();
      } catch (err) {
        console.error(err);
        alert(err?.message || 'Unable to load draft');
      }
    })();
  }

  if (action === "update") {
    openAddUpdateModal(id);
  }

  if (action === "withdraw") {
    openWithdrawModal(id);
  }
});

/* Initialize My Reports rendering happens via loadHistory() */

/* ========== End of File ========== */



/* -----------------------------
   Notifications Dropdown
------------------------------ */
const notifBtn = document.getElementById("notifBtn");
const notifMenu = document.getElementById("notifMenu");
const notifList = document.getElementById("notifList");
const notifCount = document.getElementById("notifCount");
const notifNewBadge = document.getElementById("notifNewBadge");
const markAllBtn = document.getElementById("markAllBtn");
const viewAllBtn = document.getElementById("viewAllBtn");
let notifications = [];

function addNotificationLocal(notification) {
  if (!notification) return;

  const incomingId = Number(notification.id || 0);
  if (incomingId > 0 && notifications.some(n => Number(n.id) === incomingId)) {
    return;
  }

  notifications = [notification, ...notifications];
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }

  renderNotifications(notifications);
}

function notifIcon(type){
  if (type === "ok" || type === "success") return "✓";
  if (type === "warn" || type === "danger") return "!";
  if (type === "info") return "↗";
  return "✦";
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
  const json = await apiGet('api/notifications_list.php?limit=25');
  const rows = Array.isArray(json.notifications) ? json.notifications : [];
  notifications = rows.map((n) => ({
    id: Number(n.id),
    reportId: Number(n.report_id || 0),
    type: String(n.type || 'info'),
    title: String(n.title || ''),
    message: String(n.message || ''),
    time: toRelativeTime(n.created_at),
    unread: !Boolean(n.is_read),
  }));
  renderNotifications(notifications);
}

function renderNotifications(list){
  if (!notifList) return;

  const unreadCount = list.filter(n => n.unread).length;

  if (notifCount) notifCount.textContent = String(unreadCount);
  if (notifNewBadge) notifNewBadge.textContent = `${unreadCount} new`;

  notifList.innerHTML = list.map((n) => `
    <div class="notif-item" data-id="${n.id}" data-report-id="${Number(n.reportId || 0)}">
      <div class="notif-ico ${n.type}" aria-hidden="true">${notifIcon(n.type)}</div>
      <div class="notif-text">
        <p class="notif-title">${escapeHtml(n.title)}</p>
        <p class="notif-msg">${escapeHtml(n.message)}</p>
        <div class="notif-time">${escapeHtml(n.time)}</div>
      </div>
      <button class="notif-delete-btn" type="button" data-notif-id="${n.id}" aria-label="Delete notification">Delete</button>
      ${n.unread ? `<span class="notif-dot-small" title="Unread"></span>` : ""}
    </div>
  `).join("");
}

function toggleNotifMenu(force){
  if (!notifMenu || !notifBtn) return;

  const open = typeof force === "boolean" ? force : !notifMenu.classList.contains("open");
  notifMenu.classList.toggle("open", open);

  notifBtn.setAttribute("aria-expanded", open ? "true" : "false");
  notifMenu.setAttribute("aria-hidden", open ? "false" : "true");
}

if (notifBtn) {
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotifMenu();
  });
}

document.addEventListener("click", (e) => {
  // close when clicking outside
  if (!notifMenu || !notifBtn) return;
  if (!notifMenu.classList.contains("open")) return;

  const inside = notifMenu.contains(e.target) || notifBtn.contains(e.target);
  if (!inside) toggleNotifMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleNotifMenu(false);
});

if (markAllBtn) {
  markAllBtn.addEventListener("click", () => {
    (async () => {
      try {
        await apiPostJson('api/notifications_mark_all_read.php', {});
        notifications = notifications.map(n => ({ ...n, unread: false }));
        renderNotifications(notifications);
      } catch (err) {
        console.error(err);
      }
    })();
  });
}

if (viewAllBtn) {
  viewAllBtn.addEventListener("click", () => {
    document.querySelector('.tab-pill[data-tab="myReportsTab"]')?.click();
  });
}

// Optional: clicking a notification marks it read
if (notifList) {
  notifList.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".notif-delete-btn");
    if (deleteBtn) {
      e.stopPropagation();

      const notifId = Number(deleteBtn.dataset.notifId || 0);
      if (!Number.isFinite(notifId) || notifId <= 0) return;

      const confirmed = window.confirm('Delete this notification?');
      if (!confirmed) return;

      (async () => {
        try {
          await apiPostJson('api/notifications_delete.php', { id: notifId });
          notifications = notifications.filter(n => n.id !== notifId);
          renderNotifications(notifications);
        } catch (err) {
          console.error(err);
          alert(err?.message || 'Unable to delete notification.');
        }
      })();
      return;
    }

    const item = e.target.closest(".notif-item");
    if (!item) return;

    const notifId = Number(item.dataset.id);
    const reportId = Number(item.dataset.reportId || 0);
    if (!Number.isFinite(notifId) || notifId <= 0) return;

    (async () => {
      try {
        await apiPostJson('api/notifications_mark_read.php', { id: notifId });
        notifications = notifications.map(n => n.id === notifId ? { ...n, unread: false } : n);
        renderNotifications(notifications);

        if (Number.isFinite(reportId) && reportId > 0) {
          const json = await apiGet(`api/report_get.php?id=${encodeURIComponent(String(reportId))}`);
          const r = json.report;
          if (r) {
            const payload = {
              id: r.id_display,
              title: r.title,
              category: r.category,
              submitted: r.submitted,
              status: r.status,
              priority: `${r.priority} Priority`,
              location: r.location,
              description: r.description,
              attachments: r.attachments || []
            };
            localStorage.setItem('spusm_selected_report', JSON.stringify(payload));
            window.location.href = 'report-details.php';
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    try {
      await loadNotifications();
    } catch (err) {
      console.error(err);
      renderNotifications([]);
    }
  })();
});


/* ========== End of File ========== */



/* -----------------------------
   Settings Modal
------------------------------ */
const settingsBtn = document.getElementById("settingsBtn");
const settingsOverlay = document.getElementById("settingsOverlay");
const settingsClose = document.getElementById("settingsClose");
const settingsX = document.getElementById("settingsX");

const prefNotif = document.getElementById("prefNotif");

function openSettings(open) {
  if (!settingsOverlay) return;
  settingsOverlay.classList.toggle("open", open);
  settingsOverlay.setAttribute("aria-hidden", open ? "false" : "true");
}

if (settingsBtn) {
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openSettings(true);
  });
}

if (settingsClose) settingsClose.addEventListener("click", () => openSettings(false));
if (settingsX) settingsX.addEventListener("click", () => openSettings(false));

if (settingsOverlay) {
  settingsOverlay.addEventListener("click", (e) => {
    // close when clicking outside the modal box
    if (e.target === settingsOverlay) openSettings(false);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") openSettings(false);
});

/* Preferences (demo) */
if (prefNotif) {
  prefNotif.addEventListener("change", () => {
    // Example: hide notification badge when turned off
    if (notifCount) {
      notifCount.style.display = prefNotif.checked ? "grid" : "none";
    }
  });
}

/* ========== End of File ========== */

// Go to profile page
const topProfileBtn = document.getElementById("topProfileBtn");
topProfileBtn?.addEventListener("click", () => {
  window.location.href = "profile.php";
});

// Settings -> Edit Profile goes to profile page
const editProfileBtn = document.getElementById("editProfileBtn");
editProfileBtn?.addEventListener("click", () => {
  // optional: close settings if you have a close function
  window.location.href = "profile.php";
});

/*========= End of File ========== */

// ===== Report Guidelines Modal =====
const guidelinesBtn = document.getElementById("guidelinesBtn");
const guidelinesOverlay = document.getElementById("guidelinesOverlay");
const guidelinesModal = guidelinesOverlay?.querySelector(".guidelines-modal");
const guidelinesX = document.getElementById("guidelinesX");
const viewStepsBtn = document.getElementById("viewStepsBtn");

function openGuidelines() {
  if (!guidelinesOverlay) return;
  guidelinesOverlay.classList.add("open");
  guidelinesOverlay.setAttribute("aria-hidden", "false");

  // focus modal for accessibility
  if (guidelinesModal) guidelinesModal.focus();
}

function closeGuidelines() {
  if (!guidelinesOverlay) return;
  guidelinesOverlay.classList.remove("open");
  guidelinesOverlay.setAttribute("aria-hidden", "true");
}

// open
guidelinesBtn?.addEventListener("click", openGuidelines);

// close button
guidelinesX?.addEventListener("click", closeGuidelines);

// click outside to close
guidelinesOverlay?.addEventListener("click", (e) => {
  if (e.target === guidelinesOverlay) closeGuidelines();
});

// ESC to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && guidelinesOverlay?.classList.contains("open")) {
    closeGuidelines();
  }
});

// optional: View Reporting Steps button (you can change what it does)
viewStepsBtn?.addEventListener("click", () => {
  closeGuidelines();

  // Example: switch to Submit Report tab automatically
  const submitTabBtn = document.querySelector('.tab-pill[data-tab="submitTab"]');
  submitTabBtn?.click();

  // optional: scroll to form
  document.getElementById("reportForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* ===== End of File ===== */

// ===== Counseling Services Modal =====
const counselingBtn = document.getElementById("counselingBtn");
const counselingOverlay = document.getElementById("counselingOverlay");
const counselingModal = counselingOverlay?.querySelector(".counseling-modal");
const counselingX = document.getElementById("counselingX");
const requestCounselingBtn = document.getElementById("requestCounselingBtn");

function openCounseling() {
  if (!counselingOverlay) return;
  counselingOverlay.classList.add("open");
  counselingOverlay.setAttribute("aria-hidden", "false");
  counselingModal?.focus();
}

function closeCounseling() {
  if (!counselingOverlay) return;
  counselingOverlay.classList.remove("open");
  counselingOverlay.setAttribute("aria-hidden", "true");
}

counselingBtn?.addEventListener("click", openCounseling);
counselingX?.addEventListener("click", closeCounseling);

// click outside closes
counselingOverlay?.addEventListener("click", (e) => {
  if (e.target === counselingOverlay) closeCounseling();
});

// ESC closes
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && counselingOverlay?.classList.contains("open")) {
    closeCounseling();
  }
});

// Optional button action (customize)
requestCounselingBtn?.addEventListener("click", () => {
  // Example: close modal
  closeCounseling();

  // You can redirect, open a form, switch tab, etc.
  // document.querySelector('.tab-pill[data-tab="submitTab"]')?.click();
  // alert("Counseling request feature coming soon!");
});

// ===== Emergency Contacts Modal =====
const emergencyBtn = document.getElementById("emergencyBtn");
const emergencyOverlayModal = document.getElementById("emergencyOverlayModal");
const emergencyModal = emergencyOverlayModal?.querySelector(".emergency-modal");
const emergencyX = document.getElementById("emergencyX");

function openEmergency() {
  if (!emergencyOverlayModal) return;
  emergencyOverlayModal.classList.add("open");
  emergencyOverlayModal.setAttribute("aria-hidden", "false");
  emergencyModal?.focus();
}

function closeEmergency() {
  if (!emergencyOverlayModal) return;
  emergencyOverlayModal.classList.remove("open");
  emergencyOverlayModal.setAttribute("aria-hidden", "true");
}

emergencyBtn?.addEventListener("click", openEmergency);
emergencyX?.addEventListener("click", closeEmergency);

emergencyOverlayModal?.addEventListener("click", (e) => {
  if (e.target === emergencyOverlayModal) closeEmergency();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && emergencyOverlayModal?.classList.contains("open")) {
    closeEmergency();
  }
});

// Copy buttons inside the modal
emergencyOverlayModal?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".e-icon-btn");
  if (!btn) return;

  const text = btn.getAttribute("data-copy") || "";
  try {
    await navigator.clipboard.writeText(text);

    // quick UI feedback
    const old = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => (btn.textContent = old), 900);
  } catch (err) {
    // fallback
    prompt("Copy this number:", text);
  }
});
/* ===== End of File ===== */


// ==============================
// View Details -> report-details.php (no backend needed)
// ==============================
(function () {
  // Use event delegation so it works even if cards are added later.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-sm.btn-muted");
    if (!btn) return;

    // If the card uses the newer [data-action] buttons, let the handler above manage it.
    if (btn.dataset?.action) return;

    // only handle the "View Details" button
    if (btn.textContent.trim().toLowerCase() !== "view details") return;

    const card = btn.closest(".history-card");
    if (!card) return;

    const get = (name, fallback = "") => card.getAttribute(name) || fallback;

    const attachmentsRaw = get("data-attachments", "");
    const attachments = attachmentsRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      id: get("data-id", "#—"),
      title: get("data-title", "—"),
      category: get("data-category", "—"),
      submitted: get("data-submitted", "—"),
      location: get("data-location", "—"),
      description: get("data-description", "—"),
      status: get("data-status", card.querySelector(".chip-status")?.textContent?.trim() || "Under Review"),
      priority: get("data-priority", card.querySelector(".chip-priority")?.textContent?.trim() || "High Priority"),
      attachments
    };

    localStorage.setItem("spusm_selected_report", JSON.stringify(payload));
    window.location.href = "report-details.php";
  });
})();


