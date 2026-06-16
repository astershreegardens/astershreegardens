// ===== ASTER SHREE GARDENS - MAIN APP JS =====
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

// ===== PIN MANAGEMENT =====
let adminVerified = false;
let currentAdminName = '';

function initAdminBar(pageKey) {
  const bar = document.getElementById('adminBar');
  if (!bar) return;
  if (adminVerified) {
    showPostButton(pageKey);
  }
}

function verifyPin() {
  const pin = document.getElementById('adminPin').value.trim();
  if (!pin) return;
  fetch(APPS_SCRIPT_URL + '?action=verifyPin&pin=' + encodeURIComponent(pin))
    .then(r => r.json())
    .then(data => {
      if (data.valid) {
        adminVerified = true;
        currentAdminName = data.name;
        document.getElementById('pinArea').style.display = 'none';
        document.getElementById('adminStatus').innerHTML =
          '<span style="color:#138808;font-weight:600;">✅ Welcome, ' + data.name + '!</span>';
        document.getElementById('postBtn').style.display = 'inline-block';
      } else {
        document.getElementById('pinError').textContent = '❌ Invalid PIN. Try again.';
      }
    })
    .catch(() => {
      document.getElementById('pinError').textContent = '⚠️ Connection error. Try again.';
    });
}

function showPostButton(pageKey) {
  const bar = document.getElementById('adminBar');
  if (bar) {
    bar.innerHTML = '<span style="color:#138808;font-weight:600;">✅ Admin: ' + currentAdminName + '</span>' +
      '<button class="btn-post" onclick="togglePostPanel()">+ Post New ' + pageKey + '</button>' +
      '<button class="btn-cancel" style="margin-left:8px;" onclick="adminLogout()">Logout</button>';
  }
}

function adminLogout() {
  adminVerified = false;
  currentAdminName = '';
  location.reload();
}

function togglePostPanel() {
  const panel = document.getElementById('postPanel');
  if (!panel) return;
  panel.classList.toggle('open');
}

function cancelPost() {
  const panel = document.getElementById('postPanel');
  if (panel) panel.classList.remove('open');
}

// ===== LOADING STATE =====
function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
}

function showEmpty(containerId, msg) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>' + msg + '</p></div>';
}

// ===== NOTICES =====
function loadNotices() {
  showLoading('noticesContainer');
  fetch(APPS_SCRIPT_URL + '?action=getNotices')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('noticesContainer');
      if (!data.length) { showEmpty('noticesContainer', 'No notices posted yet.'); return; }
      el.innerHTML = data.map((n, i) => `
        <div class="notice-card">
          <div class="notice-header">
            <span class="notice-num">NOTICE #${String(data.length - i).padStart(3,'0')}</span>
            <span class="badge badge-${(n.category||'general').toLowerCase()}">${n.category||'General'}</span>
            <span class="notice-date">${n.date}</span>
          </div>
          <div class="notice-subject">${n.subject}</div>
          <div class="notice-body">${(n.body||'').replace(/\n/g,'<br>')}</div>
          <div class="notice-footer">Posted by: ${n.postedBy||'Committee'}</div>
        </div>`).join('');
    })
    .catch(() => showEmpty('noticesContainer', 'Could not load notices. Please try again later.'));
}

function submitNotice() {
  const subject = document.getElementById('nSubject').value.trim();
  const category = document.getElementById('nCategory').value;
  const body = document.getElementById('nBody').value.trim();
  if (!subject || !body) { alert('Please fill Subject and Body.'); return; }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Posting...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addNotice', subject, category, body, postedBy: currentAdminName }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      cancelPost();
      loadNotices();
      document.getElementById('nSubject').value = '';
      document.getElementById('nBody').value = '';
    } else { alert('Error: ' + data.error); }
    btn.disabled = false; btn.textContent = 'Post Notice';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Post Notice'; });
}

// ===== MEETING SUMMARIES =====
function loadMeetings() {
  showLoading('meetingsContainer');
  fetch(APPS_SCRIPT_URL + '?action=getMeetings')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('meetingsContainer');
      if (!data.length) { showEmpty('meetingsContainer', 'No meeting summaries yet.'); return; }
      el.innerHTML = data.map(m => `
        <div class="meeting-card">
          <div class="meeting-title">${m.title}</div>
          <div class="meeting-meta">📅 ${m.date} ${m.venue ? '&nbsp;|&nbsp; 📍 ' + m.venue : ''}</div>
          <div class="meeting-summary">${(m.summary||'').replace(/\n/g,'<br>')}</div>
          ${m.driveLink ? '<a class="btn-link" href="' + m.driveLink + '" target="_blank">📄 View Full Minutes →</a>' : ''}
        </div>`).join('');
    })
    .catch(() => showEmpty('meetingsContainer', 'Could not load data.'));
}

function submitMeeting() {
  const title = document.getElementById('mTitle').value.trim();
  const date = document.getElementById('mDate').value;
  const venue = document.getElementById('mVenue').value.trim();
  const summary = document.getElementById('mSummary').value.trim();
  const driveLink = document.getElementById('mDriveLink').value.trim();
  if (!title || !date) { alert('Please fill Title and Date.'); return; }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addMeeting', title, date, venue, summary, driveLink, postedBy: currentAdminName }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) { cancelPost(); loadMeetings(); }
    else alert('Error: ' + data.error);
    btn.disabled = false; btn.textContent = 'Save Summary';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Save Summary'; });
}

// ===== RESOLUTIONS =====
function loadResolutions() {
  showLoading('resolutionsContainer');
  fetch(APPS_SCRIPT_URL + '?action=getResolutions')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('resolutionsContainer');
      if (!data.length) { showEmpty('resolutionsContainer', 'No resolutions yet.'); return; }
      el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Topic</th><th>Status</th><th>Details</th></tr></thead><tbody>' +
        data.map((r,i) => `<tr>
          <td>${data.length - i}</td>
          <td>${r.date}</td>
          <td style="font-weight:600;">${r.topic}</td>
          <td><span class="status-${(r.status||'pending').toLowerCase()}">${r.status||'Pending'}</span></td>
          <td>${r.details||''}</td>
        </tr>`).join('') + '</tbody></table></div>';
    })
    .catch(() => showEmpty('resolutionsContainer', 'Could not load data.'));
}

function submitResolution() {
  const topic = document.getElementById('rTopic').value.trim();
  const date = document.getElementById('rDate').value;
  const status = document.getElementById('rStatus').value;
  const details = document.getElementById('rDetails').value.trim();
  if (!topic || !date) { alert('Please fill Topic and Date.'); return; }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addResolution', topic, date, status, details, postedBy: currentAdminName }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) { cancelPost(); loadResolutions(); }
    else alert('Error: ' + data.error);
    btn.disabled = false; btn.textContent = 'Save Resolution';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Save Resolution'; });
}

// ===== ISSUES TRACKER =====
function loadIssues() {
  showLoading('issuesContainer');
  fetch(APPS_SCRIPT_URL + '?action=getIssues')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('issuesContainer');
      if (!data.length) { showEmpty('issuesContainer', 'No issues reported yet.'); return; }
      el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Category</th><th>Description</th><th>Status</th><th>Resolved</th></tr></thead><tbody>' +
        data.map((iss,i) => `<tr>
          <td>${data.length - i}</td>
          <td>${iss.date}</td>
          <td>${iss.category||''}</td>
          <td>${iss.description}</td>
          <td><span class="status-${(iss.status||'open').toLowerCase().replace(' ','-')}">${iss.status||'Open'}</span></td>
          <td>${iss.resolvedDate||'-'}</td>
        </tr>`).join('') + '</tbody></table></div>';
    })
    .catch(() => showEmpty('issuesContainer', 'Could not load data.'));
}

function submitIssue() {
  const description = document.getElementById('iDescription').value.trim();
  const category = document.getElementById('iCategory').value;
  const status = document.getElementById('iStatus').value;
  const resolvedDate = document.getElementById('iResolvedDate').value;
  if (!description) { alert('Please fill Description.'); return; }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addIssue', description, category, status, resolvedDate, postedBy: currentAdminName }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) { cancelPost(); loadIssues(); }
    else alert('Error: ' + data.error);
    btn.disabled = false; btn.textContent = 'Add Issue';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Add Issue'; });
}

// ===== EVENTS =====
function loadEvents() {
  showLoading('eventsContainer');
  fetch(APPS_SCRIPT_URL + '?action=getEvents')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('eventsContainer');
      if (!data.length) { showEmpty('eventsContainer', 'No upcoming events.'); return; }
      el.innerHTML = data.map(ev => {
        const d = new Date(ev.date);
        const day = isNaN(d) ? '?' : d.getDate();
        const month = isNaN(d) ? '' : d.toLocaleString('default',{month:'short'});
        return `<div class="event-card">
          <div class="event-date-box"><div class="event-day">${day}</div><div class="event-month">${month}</div></div>
          <div class="event-info">
            <div class="event-title">${ev.title}</div>
            <div class="event-meta">⏰ ${ev.time||'TBD'} &nbsp;|&nbsp; 📍 ${ev.venue||'TBD'}</div>
            <div style="margin-top:8px;font-size:0.9rem;color:#555;">${(ev.description||'').replace(/\n/g,'<br>')}</div>
          </div>
        </div>`;
      }).join('');
    })
    .catch(() => showEmpty('eventsContainer', 'Could not load data.'));
}

function submitEvent() {
  const title = document.getElementById('evTitle').value.trim();
  const date = document.getElementById('evDate').value;
  const time = document.getElementById('evTime').value;
  const venue = document.getElementById('evVenue').value.trim();
  const description = document.getElementById('evDescription').value.trim();
  if (!title || !date) { alert('Please fill Title and Date.'); return; }
  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Saving...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addEvent', title, date, time, venue, description, postedBy: currentAdminName }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) { cancelPost(); loadEvents(); }
    else alert('Error: ' + data.error);
    btn.disabled = false; btn.textContent = 'Add Event';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Add Event'; });
}

// ===== COMMUNITY WALL =====
function loadWall() {
  showLoading('wallContainer');
  fetch(APPS_SCRIPT_URL + '?action=getWall')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('wallContainer');
      if (!data.length) { showEmpty('wallContainer', 'No posts yet. Be the first to share!'); return; }
      el.innerHTML = data.map(w => `
        <div class="wall-card">
          <div class="wall-poster">${w.name}</div>
          <div class="wall-flat">Flat: ${w.flat}</div>
          <div class="wall-msg">${(w.message||'').replace(/\n/g,'<br>')}</div>
          <div class="wall-date">${w.date}</div>
        </div>`).join('');
    })
    .catch(() => showEmpty('wallContainer', 'Could not load posts.'));
}

function submitWallPost() {
  const name = document.getElementById('wName').value.trim();
  const flat = document.getElementById('wFlat').value.trim();
  const message = document.getElementById('wMessage').value.trim();
  if (!name || !flat || !message) { alert('Please fill all fields.'); return; }
  const btn = document.getElementById('wallSubmitBtn');
  btn.disabled = true; btn.textContent = 'Posting...';
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addWall', name, flat, message }),
    headers: { 'Content-Type': 'text/plain' }
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      document.getElementById('wName').value = '';
      document.getElementById('wFlat').value = '';
      document.getElementById('wMessage').value = '';
      document.getElementById('wallPostPanel').classList.remove('open');
      loadWall();
    } else alert('Error: ' + data.error);
    btn.disabled = false; btn.textContent = 'Post Message';
  })
  .catch(() => { alert('Connection error.'); btn.disabled = false; btn.textContent = 'Post Message'; });
}