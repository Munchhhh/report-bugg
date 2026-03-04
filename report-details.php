<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SPUSM E-REPORT | Report Details</title>

  <!-- reuse your dashboard styles -->
  <link rel="stylesheet" href="css/dashboard.css" />
  <!-- new styles for this page -->
  <link rel="stylesheet" href="css/report-details.css" />
</head>

<body>
  <!-- Top Header (simple header for details page) -->
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <div class="brand-logo" aria-hidden="true">
          <img src="assets/spusm-logo.png" alt="SPUSM Logo"
               onerror="this.style.display='none'; this.parentElement.classList.add('logo-fallback');"/>
          <div class="logo-fallback-badge" title="SPUSM"></div>
        </div>

        <div class="brand-text">
          <div class="brand-title">SPUSM E-REPORT</div>
          <div class="brand-subtitle">Web-Based Service Request and Action Tracking</div>
        </div>
      </div>

      <div class="top-actions">
        <a class="outline-btn" id="backToDashboardLink" href="user-dashboard.php" style="text-decoration:none;">← Back to Dashboard</a>
      </div>
    </div>
  </header>

  <main class="page">
    <div class="container details-wrap">

      <!-- Page Title Card -->
      <section class="details-hero">
        <div class="details-hero-left">
          <h1 class="details-title">Report Details</h1>
          <p class="details-sub">Complete information about your submitted report</p>
        </div>

        <div class="details-hero-right" id="detailsChips">
          <!-- chips inserted by JS -->
        </div>
      </section>

      <!-- Report Information Card -->
      <section class="details-card">
        <div class="details-card-head">
          <div class="details-card-head-left">
            <span class="details-ico" aria-hidden="true">📄</span>
            <span class="details-card-title">Report Information</span>
          </div>
        </div>

        <div class="details-card-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Report ID</div>
              <div class="info-value" id="dReportId">#000001</div>
            </div>

            <div class="info-item">
              <div class="info-label">Date Submitted</div>
              <div class="info-value">
                <span class="mini-ico" aria-hidden="true">📅</span>
                <span id="dSubmitted">2024-01-15</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">Title</div>
              <div class="info-value" id="dTitle">Cyberbullying Incident</div>
            </div>

            <div class="info-item">
              <div class="info-label">Category</div>
              <div class="info-value">
                <span class="pill" id="dCategory">Bullying</span>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">Assigned Admin</div>
              <div class="info-value" id="dAssignedTo">Unassigned</div>
            </div>

            <div class="info-item info-span-2">
              <div class="info-label">Location</div>
              <div class="info-value" id="dLocation">Main Building - Room 203</div>
            </div>
          </div>

          <div class="desc-box">
            <div class="info-label">Description</div>
            <div class="desc-card" id="dDescription">
              The electric fan in Room 203 is not functioning properly...
            </div>
          </div>
        </div>
      </section>

      <!-- Attachments -->
      <section class="details-card">
        <div class="details-card-head">
          <div class="details-card-head-left">
            <span class="details-ico" aria-hidden="true">🖼️</span>
            <span class="details-card-title">Attachments <span class="muted" id="dAttachCount">(0)</span></span>
          </div>
        </div>

        <div class="details-card-body">
          <div class="attach-grid" id="attachGrid">
            <!-- thumbnails injected by JS -->
          </div>
          <div class="muted small" id="attachEmpty" style="display:none;">No attachments were uploaded.</div>
        </div>
      </section>

      <!-- Update History -->
      <section class="details-card">
        <div class="details-card-head">
          <div class="details-card-head-left">
            <span class="details-ico" aria-hidden="true">🕒</span>
            <span class="details-card-title">Update History</span>
          </div>
          <button class="add-update-inline-btn" id="addUpdateBtn" type="button">
            <span aria-hidden="true">＋</span>
            Add Update
          </button>
        </div>

        <div class="details-card-body">
          <div class="update-timeline" id="updateTimeline">
            <!-- inserted by JS -->
          </div>
        </div>
      </section>

      <!-- Footer Buttons -->
      <section class="details-actions">
        <div class="action-lock-note" id="actionLockNote" style="display:none;">
          This report is resolved or withdrawn. Updates and withdrawal are disabled.
        </div>
        <button class="danger-wide" id="withdrawBtn" type="button">
          <span aria-hidden="true">⚠</span> Withdraw Report
        </button>
      </section>

    </div>
  </main>

  <!-- Image preview modal (simple) -->
  <div class="img-overlay" id="imgOverlay" aria-hidden="true">
    <button class="img-x" id="imgX" type="button" aria-label="Close">×</button>
    <img id="imgPreview" alt="Attachment preview" />
  </div>

  <div class="modal-overlay" id="addUpdateOverlay" aria-hidden="true">
    <div class="add-update-modal" role="dialog" aria-modal="true" aria-label="Add update" tabindex="-1">
      <button class="modal-x" type="button" id="addUpdateX" aria-label="Close">×</button>

      <div class="add-update-head">
        <div class="add-update-title-row">
          <span class="add-update-ico" aria-hidden="true">📝</span>
          <div>
            <h2 class="add-update-title">Add Report Update</h2>
            <p class="add-update-sub">Share follow-up details for this report.</p>
          </div>
        </div>
      </div>

      <form id="addUpdateForm" class="add-update-body">
        <div class="add-update-report-id-wrap">
          <span class="add-update-report-id-label">Report ID</span>
          <span class="add-update-report-id" id="addUpdateReportId">—</span>
        </div>

        <div class="field">
          <label class="label" for="addUpdateText">Update Details</label>
          <div class="control">
            <textarea id="addUpdateText" rows="5" maxlength="1000" placeholder="Write your update here..." required></textarea>
          </div>
        </div>

        <div class="field">
          <label class="label" for="addUpdateAttachment">Attachment (Optional)</label>
          <div class="add-update-upload-row">
            <input
              id="addUpdateAttachment"
              name="attachment"
              type="file"
              accept="image/*"
              class="add-update-file-input"
            />
            <button class="outline-btn" type="button" id="addUpdateChooseFileBtn">Choose File</button>
            <span class="add-update-file-name" id="addUpdateFileName">No file chosen</span>
          </div>
        </div>

        <div class="add-update-actions">
          <button class="outline-btn" type="button" id="addUpdateCancel">Cancel</button>
          <button class="submit-wide" type="submit">Save Update</button>
        </div>
      </form>
    </div>
  </div>

  <script src="js/report-details.js"></script>
</body>
</html>

