<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SPUSM E-REPORT | Admin Dashboard</title>
  <link rel="stylesheet" href="css/admin-dashboard.css" />
</head>

<body>
  <!-- Top Bar -->
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand brand-home-link" id="adminBrandHomeLink" href="admin-dashboard.php" aria-label="Go to dashboard overview">
        <div class="brand-logo" aria-hidden="true">
          <img src="assets/spusm-logo.png" alt="SPUSM Logo"
               onerror="this.style.display='none'; this.parentElement.classList.add('logo-fallback');" />
          <div class="logo-fallback-badge" title="SPUSM"></div>
        </div>

        <div class="brand-text">
          <div class="brand-title">SPUSM E-REPORT</div>
          <div class="brand-subtitle">Web-Based Service Request and Action Tracking - Administrator Portal</div>
        </div>
      </a>

      <div class="top-actions">
        <button class="icon-btn" id="notifBtn" title="Notifications" aria-label="Notifications">
          <span class="notif-dot" id="notifDot">3</span>
          <!-- bell -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button class="btn btn-soft" id="exportBtn">
          <!-- export -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Export Reports
        </button>

        <div class="admin-pill" title="Admin Account">
          <span class="admin-avatar">D</span>
          <span id="adminName">Dr. Admin</span>
        </div>

        <button class="btn btn-outline" id="logoutBtn">
          <!-- logout -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 17l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  </header>

  <main class="page">
    <!-- Tabs -->
    <section class="tabs">
      <button class="tab-pill active" data-tab="tabOverview">Overview</button>
      <button class="tab-pill" data-tab="tabAllReports">All Reports</button>
      <button class="tab-pill" data-tab="tabAnalytics">Analytics</button>
      <button class="tab-pill" data-tab="tabSettings">Settings</button>
    </section>

    <!-- Content -->
    <section class="content">
      <!-- ===================== Overview ===================== -->
      <div class="tab-content active" id="tabOverview">
        <!-- Metric Cards -->
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-icon icon-green" aria-hidden="true">
              <!-- doc -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="metric-meta">
              <div class="metric-value" id="totalReports">0</div>
              <div class="metric-label">Total Reports</div>
            </div>
          </div>

          <div class="metric-card metric-warn">
            <div class="metric-icon icon-amber" aria-hidden="true">
              <!-- clock -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="metric-meta">
              <div class="metric-value" id="pendingReview">0</div>
              <div class="metric-label warn">Pending Review</div>
            </div>
          </div>

          <div class="metric-card metric-danger">
            <div class="metric-icon icon-red" aria-hidden="true">
              <!-- alert -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="metric-meta">
              <div class="metric-value" id="highPriorityCount">0</div>
              <div class="metric-label danger">High Priority</div>
            </div>
          </div>

          <div class="metric-card metric-success">
            <div class="metric-icon icon-mint" aria-hidden="true">
              <!-- badge -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 9 6l-5 1 3 4-1 5 6-2 6 2-1-5 3-4-5-1-3-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="metric-meta">
              <div class="metric-value" id="resolutionRate">0%</div>
              <div class="metric-label success">Resolution Rate</div>
            </div>
          </div>
        </div>

        <!-- Priority Tables (replace old High Priority section) -->
        <div class="overview-tables">
          <div class="panel danger-panel overview-panel-high">
            <div class="panel-head">
              <div class="panel-title">
                <span class="panel-badge" aria-hidden="true">!</span>
                <div>
                  <div class="panel-name">High Priority Reports</div>
                  <div class="panel-sub">Top 6 open high-priority reports</div>
                </div>
              </div>
            </div>

            <div class="panel-body overview-table-body">
              <div class="table-wrap">
                <table class="reports-table overview-mini-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Submitted By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody id="overviewHighTbody">
                    <!-- rows rendered by JS -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="panel overview-panel-lowmed">
            <div class="panel-head">
              <div class="panel-title">
                <span class="panel-icon" aria-hidden="true">
                  <!-- list -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 6h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 12h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 18h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M3 6h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M3 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M3 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
                <div>
                  <div class="panel-name">Low/Medium Priority Reports</div>
                  <div class="panel-sub">Top 6 open low/medium-priority reports</div>
                </div>
              </div>
            </div>

            <div class="panel-body overview-table-body">
              <div class="table-wrap">
                <table class="reports-table overview-mini-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Submitted By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody id="overviewLowMedTbody">
                    <!-- rows rendered by JS -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Cards -->
        <div class="bottom-grid">
          <div class="panel soft-panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="panel-icon" aria-hidden="true">
                  <!-- calendar -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2v4M16 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M3 9h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                          stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                  </svg>
                </span>
                <div class="panel-name">This Week's Summary</div>
              </div>
            </div>

            <div class="panel-body">
              <div class="kv">
                <div class="kv-row">
                  <div class="kv-key">New Reports</div>
                  <div class="kv-val" id="wkNewReports">0</div>
                </div>
                <div class="kv-row">
                  <div class="kv-key">Reports Resolved</div>
                  <div class="kv-val" id="wkResolved">0</div>
                </div>
                <div class="kv-row">
                  <div class="kv-key">Average Response Time</div>
                  <div class="kv-val accent" id="wkAvgResp">0 hours</div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel mint-panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="panel-icon" aria-hidden="true">
                  <!-- users -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </span>
                <div class="panel-name">Administrator Workload</div>
              </div>
            </div>

            <div class="panel-body" id="workloadList">
              <!-- rendered by JS -->
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== All Reports ===================== -->
<div class="tab-content" id="tabAllReports">

  <!-- Filter Bar (like screenshot) -->
  <div class="filterbar">
    <div class="filterbar-inner">
      <div class="filter search">
        <span class="filter-ico" aria-hidden="true">
          <!-- search -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </span>
        <input class="filter-input" id="arSearch" placeholder="Search reports..." />
      </div>

      <div class="filter">
        <select class="filter-select" id="arStatus">
          <option value="">Status</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div class="filter">
        <select class="filter-select" id="arType">
          <option value="">Type</option>
          <option value="Bullying">Bullying</option>
          <option value="Property Damage">Property Damage</option>
          <option value="Safety">Safety</option>
          <option value="Academic">Academic</option>
          <option value="Discrimination">Discrimination</option>
          <option value="Facilities">Facilities</option>
          <option value="Technology">Technology</option>
          <option value="Theft">Theft</option>
        </select>
      </div>

      <button class="filter-btn" id="applyFiltersBtn" type="button">
        <span class="filter-ico" aria-hidden="true">
          <!-- funnel -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </span>
        Apply Filters
      </button>
    </div>
  </div>

  <!-- Table Card -->
  <div class="table-card">
    <div class="table-card-head">
      <div>
        <div class="table-title">All Reports Management</div>
        <div class="table-sub">Comprehensive view of all submitted reports</div>
      </div>
    </div>

    <div class="table-wrap">
      <table class="reports-table">
        <thead>
          <tr>
            <th class="col-id">ID</th>
            <th class="col-title">Title</th>
            <th class="col-priority">Priority</th>
            <th class="col-status">Status</th>
            <th class="col-submitted">Submitted By</th>
            <th class="col-date">Date</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="allReportsTbody">
          <!-- rows rendered by JS -->
        </tbody>
      </table>
    </div>
  </div>
</div>


      <!-- ===================== Analytics ===================== -->
<!-- ===================== Analytics ===================== -->
<div class="tab-content" id="tabAnalytics">

  <div class="analytics-grid">

    <!-- Reports by Category -->
    <div class="panel analytics-panel">
      <div class="panel-head">
        <div class="panel-title">
          <div class="panel-name">Reports by Category</div>
        </div>
      </div>

      <div class="panel-body">
        <div class="cat-list" id="catList">
          <!-- rendered by JS -->
        </div>
      </div>
    </div>

    <!-- Resolution Metrics -->
    <div class="panel analytics-metrics">
      <div class="panel-head">
        <div class="panel-title">
          <div class="panel-name">Resolution Metrics</div>
        </div>
      </div>

      <div class="panel-body">
        <div class="metric-kv">
          <div class="kv-line"><span>Average Resolution Time</span><strong id="mAvg">0 days</strong></div>
          <div class="kv-line"><span>Fastest Resolution</span><strong class="good" id="mFast">0 days</strong></div>
          <div class="kv-line"><span>Longest Resolution</span><strong class="bad" id="mLong">0 days</strong></div>
          <div class="kv-line"><span>This Month</span><strong id="mMonth">0 Reports</strong></div>
          <div class="kv-line"><span>Resolution Rate</span><strong class="good" id="mRate">0%</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>


      <!-- ===================== Settings ===================== -->
<div class="tab-content" id="tabSettings">

  <div class="settings-wrap">

    <!-- Hero header (like screenshot) -->
    <div class="settings-hero">
      <div class="settings-hero-ico" aria-hidden="true">
        <!-- gear -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="2"/>
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.56-.64l-.06-.06a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.08 1.64V21a2.2 2.2 0 0 1-4.4 0v-.08a1.8 1.8 0 0 0-1.08-1.64 1.8 1.8 0 0 0-1.98.36l-.06.06a2.2 2.2 0 0 1-3.12 0 2.2 2.2 0 0 1 0-3.12l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.64-1.08H2.88a2.2 2.2 0 0 1 0-4.4h.08A1.8 1.8 0 0 0 4.6 8.44a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2.2 2.2 0 1 1 3.12-3.12l.06.06a1.8 1.8 0 0 0 1.98.36A1.8 1.8 0 0 0 10.42 2.1V2a2.2 2.2 0 0 1 4.4 0v.08a1.8 1.8 0 0 0 1.08 1.64 1.8 1.8 0 0 0 1.98-.36l.06-.06a2.2 2.2 0 0 1 3.12 0 2.2 2.2 0 0 1 0 3.12l-.06.06a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.64 1.08H22a2.2 2.2 0 0 1 0 4.4h-.08A1.8 1.8 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <div class="settings-hero-title">System Configuration</div>
        <div class="settings-hero-sub">Manage system settings and administrative preferences for the E-Report system</div>
      </div>
    </div>

    <!-- Two cards (like screenshot) -->
    <div class="settings-grid settings-grid-screenshot">

      <!-- Report Categories -->
      <div class="panel settings-card">
        <div class="settings-card-head">
          <div class="settings-card-title">
            <span class="settings-card-ico notif-ico info" aria-hidden="true">
              <!-- file -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <div>
              <div class="settings-card-name">Report Categories</div>
              <div class="settings-card-sub">Manage available report types</div>
            </div>
          </div>
        </div>

        <div class="panel-body settings-card-body">
          <div class="settings-scroll set-list" id="catSettingsList"></div>
          <button class="settings-action-btn" id="addCategoryBtn" type="button">
            <span class="settings-action-ico" aria-hidden="true">＋</span>
            Add New Category
          </button>
        </div>
      </div>

      <!-- Administrator Management -->
      <div class="panel settings-card">
        <div class="settings-card-head">
          <div class="settings-card-title">
            <span class="settings-card-ico notif-ico purple" aria-hidden="true">
              <!-- user -->
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </span>
            <div>
              <div class="settings-card-name">Administrator Management</div>
              <div class="settings-card-sub">Current administrator assignments</div>
            </div>
          </div>
        </div>

        <div class="panel-body settings-card-body">
          <div class="settings-scroll" id="adminAssignList"></div>
        </div>
      </div>

      <!-- Student Password Reset -->
      <div class="panel settings-card">
        <div class="settings-card-head">
          <div class="settings-card-title">
            <span class="settings-card-ico notif-ico ok" aria-hidden="true">✓</span>
            <div>
              <div class="settings-card-name">Student Password Reset</div>
              <div class="settings-card-sub">Only admins can update student passwords.</div>
            </div>
          </div>
        </div>

        <div class="panel-body settings-card-body">
          <div class="student-password-section">
            <label class="student-password-label" for="studentPasswordStudent">Student</label>
            <select class="student-password-input" id="studentPasswordStudent">
              <option value="">Select student</option>
            </select>

            <label class="student-password-label" for="studentPasswordNew">New Password</label>
            <input class="student-password-input" id="studentPasswordNew" type="password" minlength="8" placeholder="Enter new password" autocomplete="new-password" />

            <label class="student-password-label" for="studentPasswordConfirm">Confirm New Password</label>
            <input class="student-password-input" id="studentPasswordConfirm" type="password" minlength="8" placeholder="Confirm new password" autocomplete="new-password" />

            <button class="settings-action-btn" id="studentPasswordSaveBtn" type="button">Update Student Password</button>
            <div class="student-password-status" id="studentPasswordStatus" aria-live="polite"></div>
          </div>
        </div>
      </div>

    </div>

  </div>

</div>


    </section>
  </main>

  <!-- Category Modal -->
<div class="cat-modal-backdrop" id="catModalBackdrop" aria-hidden="true">
  <div class="cat-modal" role="dialog" aria-modal="true" aria-labelledby="catModalTitle">
    <div class="cat-modal-head">
      <div>
        <h3 class="cat-modal-title" id="catModalTitle">Add Category</h3>
        <p class="cat-modal-sub" id="catModalSub">Create a new report category.</p>
      </div>
      <button class="cat-modal-close" id="catModalCloseBtn" type="button" aria-label="Close">✕</button>
    </div>

    <form class="cat-modal-body" id="catModalForm">
      <label class="cat-modal-label" for="catModalInput">Category Name</label>
      <input class="cat-modal-input" id="catModalInput" type="text" maxlength="80" autocomplete="off" />
      <div class="cat-modal-error" id="catModalError" aria-live="polite"></div>

      <div class="cat-modal-actions">
        <button class="btn btn-outline" id="catModalCancelBtn" type="button">Cancel</button>
        <button class="btn btn-solid" id="catModalSaveBtn" type="submit">Save Category</button>
      </div>
    </form>
  </div>
</div>

  <!-- Modal -->
<!-- Report Management Modal -->
<div class="rm-backdrop" id="modalBackdrop" aria-hidden="true">

  <div class="rm-modal">

    <!-- Header -->
    <div class="rm-head">
      <div>
        <h3 class="rm-title">Report Management</h3>
        <p class="rm-sub">Review, assign priority, add tags, and manage report details</p>
      </div>
      <button class="rm-close" id="closeModalBtn">✕</button>
    </div>

    <!-- Body -->
    <div class="rm-body">

      <!-- Summary Card -->
      <div class="rm-card">
        <h4 id="rmTitle">Cyberbullying Incident</h4>

        <div class="rm-badges">
          <span class="badge st-review" id="rmStatusBadge">Under Review</span>
          <span class="badge" id="rmTypeBadge">Bullying</span>
        </div>

        <div class="rm-meta">
          <div>Report ID: <strong id="rmId">#000001</strong></div>
          <div>Submitted By: <strong id="rmSubmitted"></strong></div>
          <div>Student ID: <strong id="rmStudentId"></strong></div>
          <div>Date: <strong id="rmDate"></strong></div>
        </div>

      </div>

      <div class="rm-section">
        <label>Detailed Description</label>
        <textarea id="rmDetailedDescription" readonly></textarea>
      </div>

      <div class="rm-section rm-attachments-section">
        <label>Student Attachments</label>
        <div class="rm-attachment-grid" id="rmAttachmentGrid"></div>
        <div class="rm-attachment-empty" id="rmAttachmentEmpty">No attachments were uploaded with this report.</div>
      </div>

      <!-- Priority & Status -->
      <div class="rm-grid2">
        <div>
          <label>Assign Priority Level</label>
          <select id="rmPriority">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label>Update Status</label>
          <select id="rmStatus">
            <option>Pending</option>
            <option>Under Review</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      <!-- Assign Admin -->
      <div class="rm-section">
        <label>Assign to Administrator</label>
        <select id="rmAssign">
          <option>Dr. J. Smith</option>
          <option>Prof. M. Johnson</option>
          <option>Dr. K. Davis</option>
        </select>
      </div>

      <!-- Notes -->
      <div class="rm-section">
        <label>Administrative Notes</label>
        <textarea id="rmNotes" placeholder="Add internal notes, actions taken, or follow-up items..."></textarea>
      </div>

      <div class="rm-section">
        <label>Comment History</label>
        <div id="rmHistory" class="rm-history-empty">No comments yet.</div>
      </div>

    </div>

    <!-- Footer -->
    <div class="rm-footer">
      <button class="btn btn-solid" id="saveReportBtn">Save Changes</button>
      <button class="btn btn-outline" id="cancelReportBtn">Cancel</button>
    </div>

  </div>
</div>

  <!-- Export Format Modal -->
<div class="export-modal-backdrop" id="exportModalBackdrop" aria-hidden="true">
  <div class="export-modal-card" role="dialog" aria-modal="true" aria-labelledby="exportModalTitle">
    <div class="export-modal-head">
      <div>
        <h3 id="exportModalTitle" class="export-modal-title">Choose Export Format</h3>
        <p class="export-modal-subtitle">Select the format for your report cards. Analytics will be included in both.</p>
      </div>
      <button class="export-modal-close" id="exportModalCloseBtn" type="button" aria-label="Close modal">✕</button>
    </div>

    <div class="export-modal-body">
      <button class="format-option-btn" id="exportPdfBtn" type="button" aria-label="Export as PDF format">
        <div class="format-icon">📄</div>
        <div class="format-label">Export as PDF</div>
        <div class="format-desc">Portable report cards with best formatting</div>
      </button>

      <button class="format-option-btn" id="exportXlsxBtn" type="button" aria-label="Export as Excel format">
        <div class="format-icon">📊</div>
        <div class="format-label">Export as Excel</div>
        <div class="format-desc">Styled spreadsheet with analytics tables</div>
      </button>
    </div>

    <div class="export-modal-footer">
      <div class="export-status" id="exportStatus" aria-live="polite" aria-atomic="true"></div>
    </div>
  </div>
</div>

  <!-- Notifications Dropdown -->
<div class="notif-dropdown" id="notifDropdown" aria-hidden="true">
  <div class="notif-head">
    <div class="notif-head-left">
      <span class="notif-bell" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <div class="notif-title">Notifications</div>
    </div>
    <span class="notif-new-pill" id="notifNewPill">3 new</span>
  </div>

  <div class="notif-list" id="notifList"></div>

  <div class="notif-footer">
    <button class="notif-footer-btn" id="markAllReadBtn">Mark all as read</button>
    <button class="notif-footer-btn solid" id="viewAllNotifBtn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      View all
    </button>
  </div>
</div>


  <script src="js/admin-dashboard.js"></script>
</body>
</html>

