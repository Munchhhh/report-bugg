// report-details.js
(function () {
  const $ = (id) => document.getElementById(id);

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

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value ?? "";
  }

  function escapeHtml(v) {
    return String(v ?? "")
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function chipHTML(type, label) {
    // reuses your existing chip classes from dashboard.css
    // type can be: review, pending, progress, resolved, high, medium, low
    const map = {
      review:  { cls: "chip chip-status chip-review",  text: label || "Under Review" },
      pending: { cls: "chip chip-status chip-pending", text: label || "Pending" },
      progress:{ cls: "chip chip-status chip-progress",text: label || "In Progress" },
      resolved:{ cls: "chip chip-status chip-resolved",text: label || "Resolved" },

      high:    { cls: "chip chip-priority chip-high",   text: label || "High Priority" },
      medium:  { cls: "chip chip-priority chip-medium", text: label || "Medium Priority" },
      low:     { cls: "chip chip-priority chip-low",    text: label || "Low Priority" },
    };

    const c = map[type] || { cls: "chip", text: label || "—" };
    return `<span class="${c.cls}">${c.text}</span>`;
  }

  function normalizeStatus(s) {
    const v = String(s || "").toLowerCase();
    if (v.includes("review")) return "review";
    if (v.includes("pending")) return "pending";
    if (v.includes("progress")) return "progress";
    if (v.includes("resolved")) return "resolved";
    if (v.includes("withdraw")) return "withdrawn";
    return "review";
  }

  function normalizePriority(p) {
    const v = String(p || "").toLowerCase();
    if (v.includes("high")) return "high";
    if (v.includes("medium")) return "medium";
    if (v.includes("low")) return "low";
    return "high";
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

  function roleBadge(role) {
    return String(role || '').toLowerCase() === 'admin' ? 'Admin' : 'Student';
  }

  function isAdminCommentMessage(message) {
    return /^admin comment:\s*/i.test(String(message || '').trim());
  }

  function normalizeTimelineMessage(message) {
    const raw = String(message || '').trim();
    if (isAdminCommentMessage(raw)) {
      return raw.replace(/^admin comment:\s*/i, '').trim();
    }
    return raw;
  }

  function renderUpdateHistory(updates, status, submittedAt) {
    const wrap = $("updateTimeline");
    if (!wrap) return;

    const rows = Array.isArray(updates) ? [...updates] : [];
    rows.sort((a, b) => {
      const at = new Date(a?.created_at || 0).getTime();
      const bt = new Date(b?.created_at || 0).getTime();
      return bt - at;
    });

    if (!rows.length) {
      const fallbackStatus = normalizeStatus(status) === 'review' ? 'Under Review' : (status || 'Pending');
      wrap.innerHTML = `
        <div class="u-item">
          <div class="u-dot" aria-hidden="true"></div>
          <div class="u-head">
            <div class="u-meta">
              <span class="u-role-badge">Student</span>
              <span class="u-time">${escapeHtml(formatDateTime(submittedAt))}</span>
            </div>
            <span class="u-status">Status: ${escapeHtml(fallbackStatus)}</span>
          </div>
          <p class="u-message">Report submitted</p>
        </div>
      `;
      return;
    }

    wrap.innerHTML = rows.map((item) => {
      const role = roleBadge(item.author_role);
      const isAdmin = role === 'Admin';
      const itemStatus = isAdmin ? (status || 'Under Review') : 'Pending';
      const cls = isAdmin ? 'u-item is-admin' : 'u-item';
      const isComment = isAdminCommentMessage(item.message || '');
      const badgeHtml = isComment
        ? `<span class="u-status u-status-comment">Comment</span>`
        : `<span class="u-status">Status: ${escapeHtml(itemStatus)}</span>`;
      return `
        <div class="${cls}">
          <div class="u-dot" aria-hidden="true"></div>
          <div class="u-head">
            <div class="u-meta">
              <span class="u-role-badge">${escapeHtml(role)}</span>
              <span class="u-time">${escapeHtml(formatDateTime(item.created_at))}</span>
            </div>
            ${badgeHtml}
          </div>
          <p class="u-message">${escapeHtml(normalizeTimelineMessage(item.message || ''))}</p>
        </div>
      `;
    }).join('');
  }

  function renderAttachments(list) {
    const grid = $("attachGrid");
    const empty = $("attachEmpty");
    const count = $("dAttachCount");

    const items = Array.isArray(list) ? list : [];

    safeText(count, `(${items.length})`);

    if (!items.length) {
      if (grid) grid.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }

    if (empty) empty.style.display = "none";

    grid.innerHTML = items.map((src, i) => {
      return `
        <div class="attach-item" data-src="${src}">
          <span class="attach-badge">${i + 1}</span>
          <img src="${src}" alt="Attachment ${i + 1}" loading="lazy" />
        </div>
      `;
    }).join("");

    // preview
    grid.querySelectorAll(".attach-item").forEach(card => {
      card.addEventListener("click", () => {
        const src = card.getAttribute("data-src");
        openPreview(src);
      });
    });
  }

  function openPreview(src) {
    const overlay = $("imgOverlay");
    const img = $("imgPreview");
    if (!overlay || !img) return;
    img.src = src;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
  }

  function closePreview() {
    const overlay = $("imgOverlay");
    const img = $("imgPreview");
    if (!overlay || !img) return;
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    img.src = "";
  }

  // Demo fallback if user opens report-details directly
  const fallback = {
    id: "#000001",
    title: "Cyberbullying Incident",
    submitted: "2024-01-15",
    category: "Bullying",
    location: "Main Building - Room 203",
    description:
      "The electric fan in Room 203 is not functioning properly. The fan blades are not rotating even when switched on. This has been causing discomfort during afternoon classes due to inadequate ventilation. The issue has been present for the past week and affects approximately 35 students during class hours.",
    status: "Under Review",
    priority: "High Priority",
    assignedTo: "Unassigned",
    updates: [
      {
        message: "Report submitted",
        created_at: "2024-01-15T08:00:00",
        author_role: "user"
      }
    ],
    attachments: [
      "assets/sample-attach-1.jpg",
      "assets/sample-attach-2.jpg"
    ]
  };

  const stored = localStorage.getItem("spusm_selected_report");
  const report = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
  let data = report || fallback;

  function numericIdFromDisplay(idDisplay) {
    const raw = String(idDisplay || '').replace('#', '');
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }

  async function refreshFromServer() {
    const numericId = numericIdFromDisplay(data.id);
    if (!numericId) return;

    const json = await apiGet(`api/report_get.php?id=${encodeURIComponent(String(numericId))}`);
    const r = json.report;
    data = {
      id: r.id_display,
      title: r.title,
      submitted: r.submitted,
      category: r.category,
      location: r.location,
      description: r.description,
      status: r.status,
      priority: `${r.priority} Priority`,
      assignedTo: String(r.assigned_to || '').trim() || 'Unassigned',
      updates: r.updates || [],
      attachments: r.attachments || []
    };
    localStorage.setItem('spusm_selected_report', JSON.stringify(data));
  }

  function renderAll() {
    // Fill fields
    safeText($("dReportId"), data.id || "#—");
    safeText($("dTitle"), data.title || "—");
    safeText($("dSubmitted"), data.submitted || "—");
    safeText($("dCategory"), data.category || "—");
    safeText($("dAssignedTo"), String(data.assignedTo || '').trim() || "Unassigned");
    safeText($("dLocation"), data.location || "—");
    safeText($("dDescription"), data.description || "—");

    // Chips
    const chips = $("detailsChips");
    if (chips) {
      const sKey = normalizeStatus(data.status);
      const pKey = normalizePriority(data.priority);
      chips.innerHTML = chipHTML(sKey, data.status) + chipHTML(pKey, data.priority);
    }

    // Attachments
    renderAttachments(data.attachments);

    renderUpdateHistory(data.updates, data.status, data.submitted);
    applyActionLockState();
  }

  const addUpdateBtn = $("addUpdateBtn");
  const addUpdateOverlay = $("addUpdateOverlay");
  const addUpdateModal = addUpdateOverlay?.querySelector(".add-update-modal");
  const addUpdateX = $("addUpdateX");
  const addUpdateCancel = $("addUpdateCancel");
  const addUpdateForm = $("addUpdateForm");
  const addUpdateReportId = $("addUpdateReportId");
  const addUpdateText = $("addUpdateText");
  const addUpdateAttachment = $("addUpdateAttachment");
  const addUpdateChooseFileBtn = $("addUpdateChooseFileBtn");
  const addUpdateFileName = $("addUpdateFileName");
  const actionLockNote = $("actionLockNote");

  function isFinalizedReport() {
    const statusText = String(data?.status || '').toLowerCase();
    return statusText.includes('resolved') || statusText.includes('withdraw');
  }

  function applyActionLockState() {
    const locked = isFinalizedReport();
    if (addUpdateBtn) {
      addUpdateBtn.disabled = locked;
      addUpdateBtn.setAttribute('aria-disabled', locked ? 'true' : 'false');
      addUpdateBtn.title = locked ? 'Finalized reports cannot be updated.' : '';
    }
    const withdrawBtn = $("withdrawBtn");
    if (withdrawBtn) {
      withdrawBtn.disabled = locked;
      withdrawBtn.setAttribute('aria-disabled', locked ? 'true' : 'false');
      withdrawBtn.title = locked ? 'Finalized reports cannot be withdrawn.' : '';
    }
    if (actionLockNote) {
      actionLockNote.style.display = locked ? 'block' : 'none';
    }
    if (locked && addUpdateOverlay?.classList.contains('open')) {
      closeAddUpdateModal();
    }
  }

  function openAddUpdateModal() {
    if (isFinalizedReport()) {
      alert('Resolved or withdrawn reports cannot be updated.');
      return;
    }
    if (!addUpdateOverlay) return;
    if (addUpdateReportId) addUpdateReportId.textContent = data.id || '#—';
    if (addUpdateText) addUpdateText.value = '';
    if (addUpdateAttachment) addUpdateAttachment.value = '';
    if (addUpdateFileName) addUpdateFileName.textContent = 'No file chosen';
    addUpdateOverlay.classList.add('open');
    addUpdateOverlay.setAttribute('aria-hidden', 'false');
    addUpdateModal?.focus();
    addUpdateText?.focus();
  }

  function closeAddUpdateModal() {
    if (!addUpdateOverlay) return;
    addUpdateOverlay.classList.remove('open');
    addUpdateOverlay.setAttribute('aria-hidden', 'true');
  }

  addUpdateBtn?.addEventListener('click', openAddUpdateModal);
  addUpdateX?.addEventListener('click', closeAddUpdateModal);
  addUpdateCancel?.addEventListener('click', closeAddUpdateModal);
  addUpdateOverlay?.addEventListener('click', (e) => {
    if (e.target === addUpdateOverlay) closeAddUpdateModal();
  });

  addUpdateChooseFileBtn?.addEventListener('click', () => addUpdateAttachment?.click());
  addUpdateAttachment?.addEventListener('change', () => {
    const name = addUpdateAttachment.files?.[0]?.name || 'No file chosen';
    if (addUpdateFileName) addUpdateFileName.textContent = name;
  });

  addUpdateForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    (async () => {
      try {
        const message = (addUpdateText?.value || '').trim();
        if (!message) {
          addUpdateText?.focus();
          return;
        }

        if (isFinalizedReport()) {
          throw new Error('Resolved or withdrawn reports cannot be updated');
        }

        const numericId = numericIdFromDisplay(data.id);
        if (!numericId) throw new Error('Invalid report id');

        const fd = new FormData();
        fd.set('id', String(numericId));
        fd.set('message', message);
        const file = addUpdateAttachment?.files?.[0];
        if (file) fd.set('attachment', file);

        const btn = addUpdateForm.querySelector('button[type="submit"]');
        const old = btn?.textContent || 'Save Update';
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Saving...';
        }

        const res = await fetch('api/report_add_update.php', {
          method: 'POST',
          credentials: 'same-origin',
          body: fd,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) {
          throw new Error(json.error || 'Failed to save update');
        }

        await refreshFromServer();
        renderAll();
        closeAddUpdateModal();

        if (btn) {
          btn.disabled = false;
          btn.textContent = old;
        }
      } catch (err) {
        console.error(err);
        alert(err?.message || 'Failed to save update');
        const btn = addUpdateForm.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Save Update';
        }
      }
    })();
  });

  // Withdraw button (demo)
  const withdrawBtn = $("withdrawBtn");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      (async () => {
        if (isFinalizedReport()) {
          alert('Resolved or withdrawn reports cannot be withdrawn.');
          return;
        }
        const ok = confirm("Are you sure you want to withdraw this report?");
        if (!ok) return;
        try {
          const numericId = numericIdFromDisplay(data.id);
          await apiPostJson('api/report_withdraw.php', { id: numericId });
          alert('Report withdrawn.');
          window.location.href = 'report-details.php?backTab=myReportsTab';
        } catch (e) {
          console.error(e);
          alert(e?.message || 'Withdraw failed');
        }
      })();
    });
  }

  renderAll();

  // Try to fetch the latest from the backend (if logged in)
  (async () => {
    try {
      await refreshFromServer();
      renderAll();
    } catch (e) {
      // Keep fallback/localStorage rendering if API is unavailable
      console.warn(e);
    }
  })();

  // Preview close

  applyActionLockState();
  const imgX = $("imgX");
  const overlay = $("imgOverlay");
  if (imgX) imgX.addEventListener("click", closePreview);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePreview();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePreview();
  });
})();
