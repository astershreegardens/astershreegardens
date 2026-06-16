// ============================================================
// GOOGLE APPS SCRIPT — Aster Shree Gardens Backend
// Deploy as Web App: Execute as Me, Anyone can access
// ============================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace after creating sheet

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function formatDate(d) {
  return Utilities.formatDate(d || new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy');
}

// ===== GET REQUESTS =====
function doGet(e) {
  const action = e.parameter.action;
  let result;
  try {
    if (action === 'verifyPin') {
      result = verifyPin(e.parameter.pin);
    } else if (action === 'getNotices') {
      result = getRows('Notices');
    } else if (action === 'getMeetings') {
      result = getRows('Meetings');
    } else if (action === 'getResolutions') {
      result = getRows('Resolutions');
    } else if (action === 'getIssues') {
      result = getRows('Issues');
    } else if (action === 'getEvents') {
      result = getRows('Events');
    } else if (action === 'getWall') {
      result = getRows('Community');
    } else {
      result = { error: 'Unknown action' };
    }
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== POST REQUESTS =====
function doPost(e) {
  let data, result;
  try {
    data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'addNotice') result = addNotice(data);
    else if (action === 'addMeeting') result = addMeeting(data);
    else if (action === 'addResolution') result = addResolution(data);
    else if (action === 'addIssue') result = addIssue(data);
    else if (action === 'addEvent') result = addEvent(data);
    else if (action === 'addWall') result = addWall(data);
    else result = { error: 'Unknown action' };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== HELPER: Get rows reversed (latest first) =====
function getRows(sheetName) {
  const sh = getSheet(sheetName);
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1).reverse().map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  return rows;
}

// ===== PIN VERIFICATION =====
function verifyPin(pin) {
  const sh = getSheet('Admins');
  if (!sh) return { valid: false };
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(pin) && data[i][2] !== 'Inactive') {
      return { valid: true, name: data[i][0] };
    }
  }
  return { valid: false };
}

// ===== ADD FUNCTIONS =====
function addNotice(d) {
  const sh = getSheet('Notices');
  sh.appendRow([formatDate(), d.subject, d.category || 'General', d.body, d.postedBy || 'Admin']);
  return { success: true };
}

function addMeeting(d) {
  const sh = getSheet('Meetings');
  sh.appendRow([d.date, d.title, d.venue || '', d.summary || '', d.driveLink || '', d.postedBy || 'Admin']);
  return { success: true };
}

function addResolution(d) {
  const sh = getSheet('Resolutions');
  sh.appendRow([d.date, d.topic, d.status || 'Pending', d.details || '', d.postedBy || 'Admin']);
  return { success: true };
}

function addIssue(d) {
  const sh = getSheet('Issues');
  sh.appendRow([formatDate(), d.category || 'Other', d.description, d.status || 'Open', d.resolvedDate || '', d.postedBy || 'Admin']);
  return { success: true };
}

function addEvent(d) {
  const sh = getSheet('Events');
  sh.appendRow([d.date, d.title, d.time || '', d.venue || '', d.description || '', d.postedBy || 'Admin']);
  return { success: true };
}

function addWall(d) {
  const sh = getSheet('Community');
  sh.appendRow([formatDate(), d.name, d.flat, d.message]);
  return { success: true };
}

// ===== SETUP FUNCTION — Run once to create all sheets =====
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheets = {
    'Admins': ['Name','PIN','Status'],
    'Notices': ['date','subject','category','body','postedBy'],
    'Meetings': ['date','title','venue','summary','driveLink','postedBy'],
    'Resolutions': ['date','topic','status','details','postedBy'],
    'Issues': ['date','category','description','status','resolvedDate','postedBy'],
    'Events': ['date','title','time','venue','description','postedBy'],
    'Community': ['date','name','flat','message']
  };
  Object.entries(sheets).forEach(([name, headers]) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(headers);
  });
  // Add 5 default admin PINs
  const adminSh = ss.getSheetByName('Admins');
  if (adminSh.getLastRow() === 1) {
    adminSh.appendRow(['Secretary', '1001', 'Active']);
    adminSh.appendRow(['Admin2', '1002', 'Active']);
    adminSh.appendRow(['Admin3', '1003', 'Active']);
    adminSh.appendRow(['Admin4', '1004', 'Active']);
    adminSh.appendRow(['Admin5', '1005', 'Active']);
  }
  return 'Setup complete!';
}