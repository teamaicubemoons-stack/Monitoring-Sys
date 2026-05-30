// ============================================================
// MONITORING SYSTEM - Google Apps Script Backend
// Paste this entire code in Google Apps Script Editor
// Then Deploy > New Deployment > Web App > Anyone can access
// Copy the Web App URL and paste in frontend config
// ============================================================

const SPREADSHEET_ID = '1wvPoQEHS-7LTZ2RSoyB6HvPfY2KjwS56UT9MtWhcRp0'; // <-- Your Spreadsheet ID from the URL

// Sheet names (must match exactly)
const USERS_SHEET    = 'Users';
const TASKS_SHEET    = 'Tasks';

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params   = e.parameter || {};
    const action   = params.action || '';
    const method   = params.method || 'GET'; // GET or POST override via param

    let body = {};
    if (e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch(err) {}
    }

    let result;

    // ---- ROUTING ----
    switch(action) {

      // AUTH
      case 'login':
        result = handleLogin(body.email, body.password);
        break;

      // USERS
      case 'getUsers':
        result = getUsers();
        break;
      case 'addUser':
        result = addUser(body);
        break;
      case 'updateUserRole':
        result = updateUserRole(body.id, body.role);
        break;

      // TASKS
      case 'getTasks':
        result = getTasks(params.userId, params.role);
        break;
      case 'addTask':
        result = addTask(body);
        break;
      case 'updateTaskStatus':
        result = updateTaskStatus(body.taskId, body.status);
        break;

      default:
        result = { error: 'Unknown action: ' + action };
    }

    return buildResponse(result);

  } catch(err) {
    return buildResponse({ error: err.message });
  }
}

// ============================================================
// HELPER: Build JSON Response with CORS headers
// ============================================================
function buildResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================
// HELPER: Get active spreadsheet (bound or fallback to ID)
// ============================================================
function getActiveSS() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  
  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      throw new Error("Could not access Spreadsheet. Please ensure your Spreadsheet ID is correct: " + e.message);
    }
  }
  return ss;
}

// ============================================================
// HELPER: Get Sheet by name
// ============================================================
function getSheet(name) {
  const ss = getActiveSS();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}


// ============================================================
// AUTH: Login
// ============================================================
function handleLogin(email, password) {
  if (!email || !password) return { success: false, message: 'Email and password required' };

  const sheet = getSheet(USERS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0]; // ['id','email','hashed_password','full_name','role']

  const idIdx   = headers.indexOf('id');
  const emailIdx = headers.indexOf('email');
  const passIdx  = headers.indexOf('hashed_password');
  const nameIdx  = headers.indexOf('full_name');
  const roleIdx  = headers.indexOf('role');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[emailIdx]) continue;
    if (row[emailIdx].toString().toLowerCase() === email.toLowerCase()) {
      // Plain text password comparison (hashed_password column stores plaintext in this setup)
      if (row[passIdx].toString() === password) {
        return {
          success: true,
          user: {
            id: row[idIdx].toString(),
            email: row[emailIdx].toString(),
            full_name: row[nameIdx].toString(),
            role: row[roleIdx].toString().toLowerCase()
          }
        };
      } else {
        return { success: false, message: 'Incorrect password' };
      }
    }
  }
  return { success: false, message: 'User not found' };
}

// ============================================================
// USERS: Get all users
// ============================================================
function getUsers() {
  const sheet = getSheet(USERS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx   = headers.indexOf('id');
  const emailIdx = headers.indexOf('email');
  const nameIdx  = headers.indexOf('full_name');
  const roleIdx  = headers.indexOf('role');

  const users = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[idIdx]) continue;
    users.push({
      id:        row[idIdx].toString(),
      email:     row[emailIdx].toString(),
      full_name: row[nameIdx].toString(),
      role:      row[roleIdx].toString().toLowerCase(),
      status:    'offline',
      last_active: null
    });
  }
  return users;
}

// ============================================================
// USERS: Add new user/employee
// ============================================================
function addUser(body) {
  const { full_name, email, password, role } = body;
  if (!full_name || !email || !password) return { error: 'Missing required fields' };

  const sheet = getSheet(USERS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf('email');
  const idIdx    = headers.indexOf('id');

  // Check duplicate email
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIdx] && data[i][emailIdx].toString().toLowerCase() === email.toLowerCase()) {
      return { error: 'Email already exists' };
    }
  }

  // Generate new ID
  const existingIds = data.slice(1).map(r => r[idIdx].toString()).filter(Boolean);
  const newNum = existingIds.length + 1;
  const newId  = 'EMP' + String(newNum).padStart(3, '0');

  sheet.appendRow([newId, email, password, full_name, role || 'employee']);
  return { success: true, id: newId };
}

// ============================================================
// USERS: Update user role
// ============================================================
function updateUserRole(userId, newRole) {
  if (!userId || !newRole) return { error: 'Missing userId or role' };

  const sheet = getSheet(USERS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx   = headers.indexOf('id');
  const roleIdx = headers.indexOf('role');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx].toString() === userId.toString()) {
      sheet.getRange(i + 1, roleIdx + 1).setValue(newRole);
      return { success: true };
    }
  }
  return { error: 'User not found' };
}

// ============================================================
// TASKS: Get tasks (filtered by userId + role if provided)
// ============================================================
function getTasks(userId, role) {
  const sheet = getSheet(TASKS_SHEET);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  // Expected headers: Task ID | Task Title | Description | Priority | Status | Deadline Date | Assigned By | Completed Date
  const taskIdIdx   = headers.indexOf('Task ID');
  const titleIdx    = headers.indexOf('Task Title');
  const descIdx     = headers.indexOf('Description');
  const prioIdx     = headers.indexOf('Priority');
  const statusIdx   = headers.indexOf('Status');
  const deadlineIdx = headers.indexOf('Deadline Date');
  const assigneeIdx = headers.indexOf('Assigned By');
  const completedIdx= headers.indexOf('Completed Date');
  const createdIdx  = headers.indexOf('Created Date'); // optional

  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[taskIdIdx]) continue;

    const task = {
      id:          row[taskIdIdx].toString(),
      title:       row[titleIdx].toString(),
      description: descIdx >= 0 ? row[descIdx].toString() : '',
      priority:    prioIdx >= 0 ? row[prioIdx].toString() : 'Medium',
      status:      statusIdx >= 0 ? row[statusIdx].toString() : 'Pending',
      deadline:    deadlineIdx >= 0 ? formatDate(row[deadlineIdx]) : '',
      assignee_id: assigneeIdx >= 0 ? row[assigneeIdx].toString() : '',
      completed_date: completedIdx >= 0 ? formatDate(row[completedIdx]) : '',
      created_at:  createdIdx >= 0 ? row[createdIdx].toString() : new Date().toISOString()
    };

    // Filter for employee: only show tasks assigned to them
    if (role === 'employee' && userId) {
      if (task.assignee_id !== userId.toString()) continue;
    }

    tasks.push(task);
  }
  return tasks;
}

// ============================================================
// TASKS: Add new task
// ============================================================
function addTask(body) {
  const { title, description, priority, status, deadline, assignee_id } = body;
  if (!title || !assignee_id) return { error: 'Title and assignee_id required' };

  const sheet = getSheet(TASKS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  // Generate new Task ID
  const taskIdIdx = headers.indexOf('Task ID');
  const existingIds = data.slice(1).map(r => r[taskIdIdx]).filter(Boolean);
  const newNum = existingIds.length + 1;
  const newId  = 'TASK' + String(newNum).padStart(3, '0');

  // Map to sheet columns: Task ID | Task Title | Description | Priority | Status | Deadline Date | Assigned By | Completed Date
  const row = new Array(headers.length).fill('');
  if (taskIdIdx >= 0) row[taskIdIdx] = newId;
  const tIdx = headers.indexOf('Task Title');
  if (tIdx >= 0) row[tIdx] = title;
  const dIdx = headers.indexOf('Description');
  if (dIdx >= 0) row[dIdx] = description || '';
  const pIdx = headers.indexOf('Priority');
  if (pIdx >= 0) row[pIdx] = priority || 'Medium';
  const sIdx = headers.indexOf('Status');
  if (sIdx >= 0) row[sIdx] = status || 'Pending';
  const dlIdx = headers.indexOf('Deadline Date');
  if (dlIdx >= 0) row[dlIdx] = deadline || '';
  const aIdx = headers.indexOf('Assigned By');
  if (aIdx >= 0) row[aIdx] = assignee_id;
  const cdIdx = headers.indexOf('Created Date');
  if (cdIdx >= 0) row[cdIdx] = new Date().toISOString();

  sheet.appendRow(row);
  return { success: true, id: newId };
}

// ============================================================
// TASKS: Update task status
// ============================================================
function updateTaskStatus(taskId, newStatus) {
  if (!taskId || !newStatus) return { error: 'Missing taskId or status' };

  const sheet = getSheet(TASKS_SHEET);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  const taskIdIdx = headers.indexOf('Task ID');
  const statusIdx = headers.indexOf('Status');
  const completedIdx = headers.indexOf('Completed Date');

  for (let i = 1; i < data.length; i++) {
    if (data[i][taskIdIdx].toString() === taskId.toString()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (completedIdx >= 0 && newStatus === 'Completed') {
        sheet.getRange(i + 1, completedIdx + 1).setValue(new Date().toISOString().split('T')[0]);
      }
      return { success: true };
    }
  }
  return { error: 'Task not found' };
}


// ============================================================
// UTILITY: Format date to YYYY-MM-DD string
// ============================================================
function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const str = val.toString().trim();
  if (!str) return '';
  // Try parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return str;
}
