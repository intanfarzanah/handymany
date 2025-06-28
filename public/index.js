const tableBody = document.querySelector('#providersTable tbody');
const messageDiv = document.getElementById('message');
const searchInput = document.getElementById('searchInput');
const stateSelect = document.getElementById('stateSelect');
const priceSortSelect = document.getElementById('priceSort');
const studentCheckbox = document.getElementById('studentCheckbox');
const verifiedCheckbox = document.getElementById('verifiedCheckbox');
const femaleOnlyCheckbox = document.getElementById('femaleOnlyCheckbox');

const notificationBtn = document.getElementById('notificationBtn');
const notificationMenu = document.getElementById('notificationMenu');
const notificationList = document.getElementById('notificationList');
const notificationCount = document.getElementById('notificationCount');

let allProviders = [];
let selectedProvider = null;
let notifications = [];

async function loadProviders() {
  messageDiv.textContent = '';
  try {
    const res = await fetch('/api/providers');
    if (!res.ok) throw new Error('Failed to fetch providers');
    allProviders = await res.json();

    populateStateFilter(allProviders);
    renderProviders(allProviders);
  } catch (err) {
    messageDiv.textContent = 'Error loading providers: ' + err.message;
  }
}

function populateStateFilter(providers) {
  const states = [...new Set(providers.map(p => p.location))].sort();
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

function renderProviders(providers) {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedState = stateSelect.value;

  const filtered = providers.filter(provider => {
    if (selectedState && provider.location !== selectedState) return false;

    // Search filter
    const nameMatch = provider.name.toLowerCase().includes(searchTerm);
    const specializationMatch = (provider.specializations || [])
      .some(spec => spec.toLowerCase().includes(searchTerm));
    if (searchTerm && !(nameMatch || specializationMatch)) return false;

    // Student filter
    if (studentCheckbox.checked && !provider.isStudentPartner) return false;

    // Verified (Professional) filter
    if (verifiedCheckbox.checked && !provider.verified) return false;

    // Women only
    if (femaleOnlyCheckbox.checked && provider.gender !== 'Female') return false;

    return true;
  });

  const sortValue = priceSortSelect.value;
  if (sortValue === 'lowToHigh') {
    filtered.sort((a, b) => a.price_rate_per_hour - b.price_rate_per_hour);
  } else if (sortValue === 'highToLow') {
    filtered.sort((a, b) => b.price_rate_per_hour - a.price_rate_per_hour);
  }

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#a67fb0;">No providers found.</td></tr>`;
    return;
  }

  filtered.forEach(provider => {
    const verifiedBadge = provider.verified ? '✅' : '';
    const studentBadge = provider.isStudentPartner ? '🎓' : '';
    const genderEmoji = provider.gender === 'Male' ? '👨' : '👩';
    const profileLink = `<a href="profile.html?id=${provider._id}" class="profile-link" target="_blank">View</a>`;
    const distanceText = provider.distance !== undefined && provider.distance !== Infinity
      ? `${provider.distance.toFixed(1)} km`
      : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${provider.name} ${verifiedBadge} ${studentBadge}</td>
      <td>${(provider.specializations || []).join(', ')}</td>
      <td>${genderEmoji}</td>
      <td>${provider.price_rate_per_hour ? `RM ${provider.price_rate_per_hour}` : 'N/A'}</td>
      <td>${provider.location}</td>
      <td>${provider.contact}</td>
      <td>${distanceText}</td>
      <td>
      <div class="button-container">
      <a href="calendar.html?providerId=${provider._id}" class="book-btn ${provider.booked ? 'disabled' : ''}" ${provider.booked ? 'aria-disabled="true"' : ''}>Book</a>
      <a href="profile.html?id=${provider._id}" class="profile-link" target="_blank">View</a>
      </div>
      </td>

    `;
    tableBody.appendChild(tr);
  });
}

async function getCoordinates(locationName) {
  const encodedLocation = encodeURIComponent(locationName);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      throw new Error('Location not found.');
    }
  } catch (err) {
    throw new Error('Failed to fetch location coordinates.');
  }
}

function calculateDistance(coord1, coord2) {
  const toRad = degrees => degrees * Math.PI / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

document.getElementById('locateBtn').addEventListener('click', async () => {
  const userLocInput = document.getElementById('userLocation').value.trim();

  if (!userLocInput) {
    messageDiv.textContent = 'Please enter your location.';
    return;
  }

  try {
    const userCoords = await getCoordinates(userLocInput);

    const updatedProviders = await Promise.all(allProviders.map(async provider => {
      let providerCoords;

      if (provider.lat && provider.lng) {
        providerCoords = { lat: provider.lat, lng: provider.lng };
      } else {
        try {
          const coords = await getCoordinates(provider.location);
          providerCoords = coords;
          provider.lat = coords.lat;
          provider.lng = coords.lng;
        } catch {
          providerCoords = null;
        }
      }

      provider.distance = providerCoords
        ? calculateDistance(userCoords, providerCoords)
        : Infinity;

      return provider;
    }));

    const sorted = updatedProviders.sort((a, b) => a.distance - b.distance);
    renderProviders(sorted);

    messageDiv.textContent = `Sorted by distance from "${userLocInput}".`;
  } catch (err) {
    messageDiv.textContent = 'Error: ' + err.message;
  }
});

async function fetchNotifications() {
  // Use logged-in user's email from localStorage token if available
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

// Redirect to bookings page when clicking Service Status link
const serviceStatusLink = document.querySelector('a[href="bookings.html"]');
if (serviceStatusLink) {
  serviceStatusLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'bookings.html';
  });
}

searchInput.addEventListener('input', () => renderProviders(allProviders));
stateSelect.addEventListener('change', () => renderProviders(allProviders));
studentCheckbox.addEventListener('change', () => renderProviders(allProviders));
verifiedCheckbox.addEventListener('change', () => renderProviders(allProviders));
femaleOnlyCheckbox.addEventListener('change', () => renderProviders(allProviders));
priceSortSelect.addEventListener('change', () => renderProviders(allProviders));

loadProviders();
fetchNotifications();

document.getElementById('locateBtn').addEventListener('click', async () => {
  const userLocInput = document.getElementById('userLocation').value.trim();

  if (!userLocInput) {
    messageDiv.textContent = 'Please enter your location.';
    return;
  }

  try {
    const userCoords = await getCoordinates(userLocInput);

    const updatedProviders = await Promise.all(allProviders.map(async provider => {
      let providerCoords;

      if (provider.lat && provider.lng) {
        providerCoords = { lat: provider.lat, lng: provider.lng };
      } else {
        try {
          const coords = await getCoordinates(provider.location);
          providerCoords = coords;
          provider.lat = coords.lat;
          provider.lng = coords.lng;
        } catch {
          providerCoords = null;
        }
      }

      provider.distance = providerCoords
        ? calculateDistance(userCoords, providerCoords)
        : Infinity;

      return provider;
    }));

    const sorted = updatedProviders.sort((a, b) => a.distance - b.distance);
    renderProviders(sorted);

    messageDiv.textContent = `Sorted by distance from "${userLocInput}".`;
  } catch (err) {
    messageDiv.textContent = 'Error: ' + err.message;
  }
});
