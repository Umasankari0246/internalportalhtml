// ===== API UTILITY =====
const API = {
  async request(method, url, data = null, isFormData = false) {
    const opts = {
      method,
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    };
    if (data) opts.body = isFormData ? data : JSON.stringify(data);
    const res = await fetch(url, opts);
    if (res.status === 401) { window.location.href = '/login'; return; }
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  },
  get: (url) => API.request('GET', url),
  post: (url, data) => API.request('POST', url, data),
  put: (url, data) => API.request('PUT', url, data),
  delete: (url) => API.request('DELETE', url),
  postForm: (url, formData) => API.request('POST', url, formData, true)
};
