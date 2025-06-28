// Notification elements
const notificationBtn = document.getElementById('notificationBtn');
const notificationMenu = document.getElementById('notificationMenu');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.getElementById('notificationCount');

let notifications = [];

async function fetchNotifications() {
  let email = "user@example.com"; // fallback email
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.email) {
        email = payload.email;
      }
    } catch (err) {
      console.error('Failed to decode token for email:', err);
    }
  }
  try {
    const res = await fetch(`/api/notifications?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    notifications = data.notifications || [];
    updateNotificationUI();
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

function updateNotificationUI() {
  if (notificationCount) {
    if (notifications.length > 0) {
      notificationCount.style.display = 'inline-block';
      notificationCount.textContent = notifications.length;
    } else {
      notificationCount.style.display = 'none';
    }
  }

  if (notificationList) {
    notificationList.innerHTML = '';
    if (notifications.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No new notifications';
      notificationList.appendChild(li);
    } else {
      notifications.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n.message;
        notificationList.appendChild(li);
      });
    }
  }
}

notificationBtn.addEventListener('click', () => {
  const expanded = notificationBtn.getAttribute('aria-expanded') === 'true';
  notificationBtn.setAttribute('aria-expanded', !expanded);
  if (notificationMenu) {
    if (expanded) {
      notificationMenu.style.display = 'none';
    } else {
      notificationMenu.style.display = 'block';
      notificationMenu.style.position = 'absolute';
      notificationMenu.style.backgroundColor = '#fff';
      notificationMenu.style.border = '1px solid #ccc';
      notificationMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      notificationMenu.style.padding = '10px';
      notificationMenu.style.zIndex = '1000';
      notificationMenu.style.width = '300px';
      notificationMenu.style.maxHeight = '400px';
      notificationMenu.style.overflowY = 'auto';
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
});
