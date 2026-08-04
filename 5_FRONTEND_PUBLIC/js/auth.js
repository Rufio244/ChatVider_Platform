document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const res = await fetch('/api/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value })
  });
  const data = await res.json();
  if (data.token) { localStorage.setItem('vid_auth_token', data.token); location.href = 'dashboard.html'; }
  else alert(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
});

