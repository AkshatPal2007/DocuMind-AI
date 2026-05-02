import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { 'Authorization': `Bearer ${session.access_token}` } : {};
}

export const api = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...headers },
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async agentChat(question, k = 6, model = null, fileName = null, temperature = null) {
    const body = { question, k };
    if (model) body.model = model;
    if (fileName) body.file_name = fileName;
    if (typeof temperature === 'number') body.temperature = temperature;
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/agent-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Query failed');
    }
    return res.json();
  },

  async directChat(question, k = 6, model = null, temperature = null) {
    const body = { question, k };
    if (model) body.model = model;
    if (typeof temperature === 'number') body.temperature = temperature;
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat?stream=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Query failed');
    }
    return res.json();
  },

  async getModels() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/models`, {
      headers: { ...headers }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models || [];
  },

  async getFiles() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/files`, {
      headers: { ...headers }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  },

  async deleteFile(fileName) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/files/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: { ...headers }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Delete failed');
    }
    return res.json();
  }
};

// Workspace localStorage persistence
const WS_KEY = 'documind_workspace_docs';

export const workspace = {
  getDocs() {
    try { return JSON.parse(localStorage.getItem(WS_KEY) || '[]'); }
    catch { return []; }
  },
  addDoc(doc) {
    const docs = this.getDocs();
    const idx = docs.findIndex(d => d.name === doc.name);
    if (idx !== -1) docs[idx] = doc;
    else docs.push(doc);
    localStorage.setItem(WS_KEY, JSON.stringify(docs));
  },
  getCount() { return this.getDocs().length; },
};
