async function apiRequest(path, options={}) {
  const token = localStorage.getItem('vid_auth_token');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...options.headers }
  }).then(r => r.json());
}

