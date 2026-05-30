// ============================================================
// API SERVICE — connects to Google Apps Script Web App
// Replace APPS_SCRIPT_URL with your actual deployed Web App URL
// ============================================================

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzyBSeE4vgNXNGLkMalKHIsyHSkXgN4llTUskFEbxAlOU-KGMM-nNGfhHMf0KSqqAGYlg/exec';

/**
 * Make a GET request to the Apps Script Web App
 */
async function appsGet(action, params = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/**
 * Make a POST request to the Apps Script Web App
 */
async function appsPost(action, body = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action', action);

  const res = await fetch(url.toString(), {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ---- AUTH ----
export const loginUser = (email, password) =>
  appsPost('login', { email, password });

// ---- USERS ----
export const fetchUsers = () => appsGet('getUsers');

export const addEmployee = (body) => appsPost('addUser', body);

export const updateUserRole = (id, role) =>
  appsPost('updateUserRole', { id, role });

// ---- TASKS ----
export const fetchTasks = (userId, role) =>
  appsGet('getTasks', { userId, role });

export const addTask = (body) => appsPost('addTask', body);

export const updateTaskStatus = (taskId, status) =>
  appsPost('updateTaskStatus', { taskId, status });

// ---- ATTENDANCE ----
export const fetchAttendance = (userId) =>
  appsGet('getAttendance', { userId });

export const saveAttendance = (body) =>
  appsPost('saveAttendance', body);
