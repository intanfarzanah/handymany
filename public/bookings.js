const API_BASE = 'http://localhost:5000/api';
const bookingsContainer = document.getElementById('bookingsContainer');

function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card';

  const statusColors = {
    'Pending': '#f0ad4e',
    'In Progress': '#5bc0de',
    'Completed': '#5cb85c',
    'Cancelled': '#d9534f'
  };

  const statusColor = statusColors[booking.status] || '#777';

  card.innerHTML = `
    <h2>${booking.serviceType}</h2>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
    <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${booking.status}</span></p>
    <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
  `;

  return card;
}

function showError(message) {
  bookingsContainer.innerHTML = `<p class="error">${message}</p>`;
}

async function fetchBookings(email) {
  try {
    const res = await fetch(`${API_BASE}/bookings/user?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to fetch bookings');
    }
    const data = await res.json();
    return data.bookings || [];
  } catch (err) {
    throw err;
  }
}

function getUserEmailFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

function openBookingDetail(booking) {
  currentBookingId = booking._id;
  console.log('Booking object in openBookingDetail:', booking);
  const bookingDetailsDiv = document.getElementById('bookingDetails');
  const providerDetailsDiv = document.getElementById('providerDetails');
  const viewProfileBtn = document.getElementById('viewProfileBtn');
  const bookingDetailModal = document.getElementById('bookingDetailModal');

  // Clear previous content
  bookingDetailsDiv.innerHTML = '';
  providerDetailsDiv.innerHTML = '';

  // Define status colors
  const statusColors = {
    'Pending': '#f0ad4e',
    'Accepted': '#5bc0de',
    'Provider Arriving': '#5bc0de',
    'In Progress': '#5bc0de',
    'Completed': '#5cb85c',
    'Cancelled': '#d9534f'
  };

  // Populate booking details in requested order and format
  const bookingOrder = ['serviceType', 'status', 'date', 'time', 'address', 'notes'];
  bookingOrder.forEach(key => {
    if (booking[key] !== undefined) {
      const p = document.createElement('p');
      if(key === 'serviceType') {
        p.innerHTML = `<strong>Service Type:</strong> <span style="color: var(--plum); font-weight: bold;">${booking[key]}</span>`;
      } else if (key === 'status') {
        const color = statusColors[booking.status] || '#777';
        p.innerHTML = `<strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${booking.status}</span>`;
      } else {
        p.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${booking[key]}`;
      }
      bookingDetailsDiv.appendChild(p);
    }
  });

  // Populate provider details in rectangle box
  if (booking.provider) {
    const { name, contact, location, _id } = booking.provider;
    const pName = document.createElement('p');
    pName.innerHTML = `<strong>Name:</strong> ${name}`;
    const pContact = document.createElement('p');
    pContact.innerHTML = `<strong>Contact:</strong> ${contact}`;
    const pLocation = document.createElement('p');
    pLocation.innerHTML = `<strong>Location:</strong> ${location}`;
    providerDetailsDiv.appendChild(pName);
    providerDetailsDiv.appendChild(pContact);
    providerDetailsDiv.appendChild(pLocation);

    // Set profile button link
    viewProfileBtn.onclick = () => {
      window.open(`profile.html?id=${_id}`, '_blank');
    };
  } else {
    viewProfileBtn.onclick = null;
  }

  bookingDetailModal.style.display = 'block';
}

// Close modal handlers
const bookingDetailModal = document.getElementById('bookingDetailModal');
const closeModalBtn = document.getElementById('closeModal');

closeModalBtn.addEventListener('click', () => {
  bookingDetailModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === bookingDetailModal) {
    bookingDetailModal.style.display = 'none';
  }
});

// Cancel booking modal elements
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const cancelConfirmModal = document.getElementById('cancelConfirmModal');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const cancelCancelBtn = document.getElementById('cancelCancelBtn');

let currentBookingId = null;

// Show confirmation modal on cancel button click
cancelBookingBtn.addEventListener('click', () => {
  cancelConfirmModal.style.display = 'block';
});

// Hide confirmation modal on cancelCancelBtn click
cancelCancelBtn.addEventListener('click', () => {
  cancelConfirmModal.style.display = 'none';
});

// Confirm cancellation
confirmCancelBtn.addEventListener('click', async () => {
  if (!currentBookingId) return;

  try {
    const res = await fetch(`${API_BASE}/bookings/${currentBookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to cancel booking');
    }
    // Update local booking status and UI
    const booking = allBookings.find(b => b._id === currentBookingId);
    if (booking) {
      booking.status = 'Cancelled';
    }
    // Refresh modal with updated booking
    openBookingDetail(booking);
    cancelConfirmModal.style.display = 'none';

    // Refresh notifications after status update
    await fetchNotifications();
  } catch (err) {
    alert('Error cancelling booking: ' + err.message);
  }
});

function addBookingCardListeners() {
  const cards = document.querySelectorAll('.booking-card');
  cards.forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      openBookingDetail(allBookings[index]);
    });
  });
}

let allBookings = [];

async function init() {
  const email = getUserEmailFromToken();
  console.log('Extracted email from token:', email);
  if (!email) {
    showError('You must be logged in to view your bookings.');
    return;
  }

  bookingsContainer.innerHTML = '<p>Loading your bookings...</p>';

  try {
    console.log(`Fetching bookings for email: ${email}`);
    const bookings = await fetchBookings(email);
    console.log('Fetched bookings:', bookings);
    allBookings = bookings;
    if (bookings.length === 0) {
      bookingsContainer.innerHTML = '<p>No bookings found.</p>';
      return;
    }

    bookingsContainer.innerHTML = '';
    bookings.forEach(booking => {
      const card = createBookingCard(booking);
      bookingsContainer.appendChild(card);
    });

    addBookingCardListeners();

    // Fetch and display notifications
    await fetchNotifications();
  } catch (err) {
    console.error('Error fetching bookings:', err);
    showError(err.message);
  }
}

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
  const notificationCount = document.getElementById('notificationCount');
  const notificationList = document.getElementById('notificationList');
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

document.addEventListener('DOMContentLoaded', () => {
  init();

  const notificationBtn = document.getElementById('notificationBtn');
  const notificationMenu = document.getElementById('notificationMenu');

  notificationBtn.addEventListener('click', () => {
    const expanded = notificationBtn.getAttribute('aria-expanded') === 'true';
    notificationBtn.setAttribute('aria-expanded', !expanded);
    if (notificationMenu) {
      notificationMenu.style.display = expanded ? 'none' : 'block';
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
  });
});
