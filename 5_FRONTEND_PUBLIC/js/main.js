const API_BASE = '/api';
function checkAuth() {
  const token = localStorage.getItem('vid_auth_token');
  if (!token && !['login.html','register.html','index.html','pricing.html'].includes(location.pathname.split('/').pop())) {
    location.href = 'login.html';
  }
}
document.addEventListener('DOMContentLoaded', checkAuth);
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('vid_auth_token');
  location.href = 'login.html';
});

