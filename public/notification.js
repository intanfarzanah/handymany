// public/notification.js

const notificationBtn = document.getElementById('notificationBtn');
const notificationMenu = document.getElementById('notificationMenu');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.getElementById('notificationCount');

let notifications = [];

/**
 * Fetch notifications for the given email and update UI.
 * @param {string} email - User email to fetch notifications for.
 */
async function fetchNotifications(email) {
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

/**
 * Update the notification UI elements based on current notifications.
 */
function updateNotificationUI() {
  if (notifications.length > 0) {
    notificationCount.style.display = 'inline-block';
    notificationCount.textContent = notifications.length;
  } else {
    notificationCount.style.display = 'none';
  }

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

/**
 * Initialize notification button event listener.
 */
function initNotification() {
  notificationBtn.addEventListener('click', () => {
    const expanded = notificationBtn.getAttribute('aria-expanded') === 'true';
    notificationBtn.setAttribute('aria-expanded', !expanded);
    notificationMenu.style.display = expanded ? 'none' : 'block';
  });
}

// Export functions for use in other scripts
export { fetchNotifications, updateNotificationUI, initNotification };
