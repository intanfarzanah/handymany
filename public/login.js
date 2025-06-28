// public/login.js

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessages = document.getElementById('error-messages');

  if (!errorMessages) {
    console.error('No error message container found in login page.');
    return;
  }

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  errorMessages.innerHTML = '';

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMessages.innerHTML = `<li>${data.message || 'Login failed'}</li>`;
      return;
    }

    // Save JWT token to localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    // Redirect to index page after login
    setTimeout(() => {
      window.location.href = '/index_backup.html';
    }, 1000);

  } catch (err) {
    errorMessages.innerHTML = '<li>Network error. Please try again later.</li>';
    console.error('Login error:', err);
  }
});
