const profileDiv = document.getElementById('profile');
const errorDiv = document.getElementById('error');

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

if (!id || !isValidObjectId(id)) {
  errorDiv.textContent = 'Invalid provider ID.';
} else {
  fetch(`/api/providers/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Provider not found');
      return res.json();
    })
    .then(provider => {
      console.log('Provider data:', provider); // DEBUG - confirm rating & history are present

      const badges = [
        provider.verified ? '✅ Verified' : '',
        provider.isStudentPartner ? '🎓 Student Partner' : ''
      ].filter(Boolean).join(' | ');

      const rating = parseFloat(provider.rating) || 0;
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
      let starsDisplay = '★'.repeat(fullStars);
      if (halfStar) starsDisplay += '½';
      starsDisplay = starsDisplay.padEnd(5, '☆');

      // Generate work history list items
      const historyItems = (provider.history || []).map(item => `<li>${item}</li>`).join('');

      profileDiv.innerHTML = `
        <div class="profile-top">
          <div class="photo" aria-label="Profile photo placeholder" title="Profile photo placeholder">
            👤
            <div class="stars" aria-label="Rating">${starsDisplay}</div>
          </div>
          <div class="details">
            <div class="details-grid">
              <div><strong>Name:</strong> ${provider.name}</div>
              <div><strong>Location:</strong> ${provider.location}</div>
              <div><strong>Contact:</strong> ${provider.contact}</div>
              <div><strong>Address:</strong> ${provider.address || 'N/A'}</div>
              <div><strong>Specializations:</strong> ${(provider.specializations || []).join(', ')}</div>
              <div><strong>Latitude:</strong> ${provider.lat !== undefined ? provider.lat : 'N/A'}</div>
              <div class="badges"><strong>Badges:</strong> ${badges || 'None'}</div>
              <div><strong>Longitude:</strong> ${provider.lng !== undefined ? provider.lng : 'N/A'}</div>
              <div><strong>Status:</strong> ${provider.status || 'N/A'}</div>
            </div>
          </div>
        </div>
        <section class="history-section">
          <h3>Work History</h3>
          <ul>
            ${historyItems || '<li>No previous work history found.</li>'}
          </ul>
        </section>
      `;
    })
    .catch(err => {
      errorDiv.textContent = err.message;
    });
}

document.getElementById('backToProviderList').addEventListener('click', () => {
  window.close();
});
