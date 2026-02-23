import './style.css'

// App State
let dives = JSON.parse(localStorage.getItem('dives')) || [];
let currentTab = 'add';
let photoFiles = [];
let editingDiveId = null; // Track which dive is being edited
let settings = JSON.parse(localStorage.getItem('diveSettings')) || {
  tempUnit: 'celsius', // 'celsius' or 'fahrenheit'
  distanceUnit: 'meters' // 'meters' or 'feet'
};

// Unit Conversion Functions
function convertTemp(celsius, toUnit) {
  if (toUnit === 'fahrenheit') {
    return (celsius * 9/5 + 32).toFixed(1);
  }
  return celsius;
}

function convertDistance(meters, toUnit) {
  if (toUnit === 'feet') {
    return (meters * 3.28084).toFixed(1);
  }
  return meters;
}

function convertTempToMetric(value, fromUnit) {
  if (fromUnit === 'fahrenheit') {
    return ((value - 32) * 5/9).toFixed(1);
  }
  return value;
}

function convertDistanceToMetric(value, fromUnit) {
  if (fromUnit === 'feet') {
    return (value / 3.28084).toFixed(1);
  }
  return value;
}

function getTempUnit() {
  return settings.tempUnit === 'celsius' ? '°C' : '°F';
}

function getDistanceUnit() {
  return settings.distanceUnit === 'meters' ? 'm' : 'ft';
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  switchTab('log');
});

// Main App Render
function renderApp() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <header class="app-header">
      <h1>🤿 Dive Logbook</h1>
      <p>Track your underwater adventures</p>
    </header>

    <nav class="nav-tabs">
      <button class="nav-tab" data-tab="add">${editingDiveId ? 'Edit Dive' : 'Add Dive'}</button>
      <button class="nav-tab active" data-tab="log">Dive Log</button>
      <button class="nav-tab" data-tab="stats">Statistics</button>
      <button class="nav-tab" data-tab="settings">Settings</button>
    </nav>

    <div id="add" class="tab-content">
      ${renderAddDiveForm()}
    </div>

    <div id="log" class="tab-content active">
      ${renderDiveLog()}
    </div>

    <div id="stats" class="tab-content">
      ${renderStatistics()}
    </div>

    <div id="settings" class="tab-content">
      ${renderSettings()}
    </div>

    <div id="modal" class="modal">
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div id="modal-body"></div>
      </div>
    </div>
  `;

  attachEventListeners();
}

// Render Add Dive Form
function renderAddDiveForm() {
  const isEditing = editingDiveId !== null;
  const dive = isEditing ? dives.find(d => d.id === editingDiveId) : null;

  return `
    <div class="dive-form-container">
      <h2>${isEditing ? '✏️ Edit Dive' : 'Log a New Dive'}</h2>
      ${isEditing ? '<p style="color: var(--text-light); margin-bottom: 20px;">Update the details below and save your changes.</p>' : ''}
      <form id="dive-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="date">Date *</label>
            <input type="date" id="date" value="${dive ? dive.date : ''}" required>
          </div>

          <div class="form-group">
            <label for="time">Time</label>
            <input type="time" id="time" value="${dive ? dive.time : ''}">
          </div>

          <div class="form-group">
            <label for="location">Location *</label>
            <input type="text" id="location" placeholder="e.g., Great Barrier Reef" value="${dive ? dive.location : ''}" required>
          </div>

          <div class="form-group">
            <label for="diveSite">Dive Site *</label>
            <input type="text" id="diveSite" placeholder="e.g., Blue Corner" value="${dive ? dive.diveSite : ''}" required>
          </div>

          <div class="form-group">
            <label for="maxDepth">Max Depth (${getDistanceUnit()}) *</label>
            <input type="number" id="maxDepth" placeholder="${settings.distanceUnit === 'meters' ? '30' : '98'}" value="${dive ? convertDistance(dive.maxDepth, settings.distanceUnit) : ''}" step="0.1" required>
          </div>

          <div class="form-group">
            <label for="duration">Duration (minutes) *</label>
            <input type="number" id="duration" placeholder="45" value="${dive ? dive.duration : ''}" required>
          </div>

          <div class="form-group">
            <label for="waterTemp">Water Temp (${getTempUnit()})</label>
            <input type="number" id="waterTemp" placeholder="${settings.tempUnit === 'celsius' ? '24' : '75'}" value="${dive && dive.waterTemp ? convertTemp(dive.waterTemp, settings.tempUnit) : ''}" step="0.1">
          </div>

          <div class="form-group">
            <label for="visibility">Visibility (${getDistanceUnit()})</label>
            <input type="number" id="visibility" placeholder="${settings.distanceUnit === 'meters' ? '20' : '66'}" value="${dive && dive.visibility ? convertDistance(dive.visibility, settings.distanceUnit) : ''}" step="0.1">
          </div>

          <div class="form-group">
            <label for="buddy">Dive Buddy</label>
            <input type="text" id="buddy" placeholder="John Doe" value="${dive ? dive.buddy : ''}">
          </div>

          <div class="form-group">
            <label for="diveType">Dive Type</label>
            <select id="diveType">
              <option value="Recreational" ${dive && dive.diveType === 'Recreational' ? 'selected' : ''}>Recreational</option>
              <option value="Training" ${dive && dive.diveType === 'Training' ? 'selected' : ''}>Training</option>
              <option value="Deep" ${dive && dive.diveType === 'Deep' ? 'selected' : ''}>Deep</option>
              <option value="Wreck" ${dive && dive.diveType === 'Wreck' ? 'selected' : ''}>Wreck</option>
              <option value="Night" ${dive && dive.diveType === 'Night' ? 'selected' : ''}>Night</option>
              <option value="Drift" ${dive && dive.diveType === 'Drift' ? 'selected' : ''}>Drift</option>
            </select>
          </div>

          <div class="form-group form-group-full">
            <label for="notes">Notes</label>
            <textarea id="notes" placeholder="Describe your dive experience...">${dive ? dive.notes : ''}</textarea>
          </div>

          <div class="form-group form-group-full">
            <label>Photos</label>
            <div class="photo-upload" id="photoUpload">
              <input type="file" id="photoInput" accept="image/*" multiple>
              <p>📸 Click to upload ${isEditing ? 'more' : ''} photos</p>
              <div id="photoPreview" class="photo-preview">
                ${dive && dive.photos ? dive.photos.map(photo => `<img src="${photo}" alt="Dive photo">`).join('') : ''}
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 15px; align-items: center;">
          <button type="submit" class="btn btn-primary">${isEditing ? 'Update Dive' : 'Save Dive'}</button>
          ${isEditing ? '<button type="button" class="btn" style="background: var(--text-light); color: white;" onclick="cancelEdit()">Cancel</button>' : ''}
        </div>
      </form>
    </div>
  `;
}

// Render Dive Log
function renderDiveLog() {
  if (dives.length === 0) {
    return `
      <div class="dive-log-container">
        <h2>Your Dive Log</h2>
        <div class="empty-state">
          <div class="empty-state-icon">🤿</div>
          <h3>No dives logged yet</h3>
          <p>Start by adding your first dive!</p>
        </div>
      </div>
    `;
  }

  const sortedDives = [...dives].sort((a, b) => new Date(b.date) - new Date(a.date));

  return `
    <div class="dive-log-container">
      <h2>Your Dive Log (${dives.length} dives)</h2>

      <div class="search-sort">
        <input type="text" id="searchInput" placeholder="Search by location or dive site...">
        <select id="sortSelect">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="depth-desc">Deepest First</option>
          <option value="depth-asc">Shallowest First</option>
        </select>
      </div>

      <div class="dive-cards" id="diveCards">
        ${sortedDives.map((dive, index) => renderDiveCard(dive, dives.length - index)).join('')}
      </div>
    </div>
  `;
}

// Render Single Dive Card
function renderDiveCard(dive, diveNumber) {
  const date = new Date(dive.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const photos = dive.photos && dive.photos.length > 0
    ? `<div class="dive-photos">
        ${dive.photos.map(photo => `<img src="${photo}" alt="Dive photo">`).join('')}
       </div>`
    : '';

  return `
    <div class="dive-card" data-id="${dive.id}">
      <div class="dive-card-header">
        <div class="dive-number">Dive #${diveNumber}</div>
      </div>

      <h3>${dive.diveSite}</h3>
      <div class="dive-date">${formattedDate}</div>

      <div class="dive-stats">
        <div class="dive-stat">
          <div class="dive-stat-label">Max Depth</div>
          <div class="dive-stat-value">${convertDistance(dive.maxDepth, settings.distanceUnit)}${getDistanceUnit()}</div>
        </div>
        <div class="dive-stat">
          <div class="dive-stat-label">Duration</div>
          <div class="dive-stat-value">${dive.duration} min</div>
        </div>
        <div class="dive-stat">
          <div class="dive-stat-label">Location</div>
          <div class="dive-stat-value">${dive.location}</div>
        </div>
        <div class="dive-stat">
          <div class="dive-stat-label">Type</div>
          <div class="dive-stat-value">${dive.diveType}</div>
        </div>
      </div>

      ${dive.notes ? `<p style="margin-top: 10px; color: var(--text-light); font-size: 0.9em;">${dive.notes.substring(0, 100)}${dive.notes.length > 100 ? '...' : ''}</p>` : ''}

      ${photos}

      <div class="dive-card-actions">
        <button class="btn" style="background: var(--ocean-green); color: white; margin-right: 10px;" onclick="editDive('${dive.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteDive('${dive.id}')">Delete</button>
      </div>
    </div>
  `;
}

// Render Statistics
function renderStatistics() {
  if (dives.length === 0) {
    return `
      <div class="stats-container">
        <h2>Statistics</h2>
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3>No statistics yet</h3>
          <p>Add some dives to see your stats!</p>
        </div>
      </div>
    `;
  }

  const stats = calculateStats();
  const monthlyStats = calculateMonthlyStats();

  return `
    <div class="stats-container">
      <h2>Your Diving Statistics</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Dives</div>
          <div class="stat-value">${stats.totalDives}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Max Depth</div>
          <div class="stat-value">${convertDistance(stats.maxDepth, settings.distanceUnit)}</div>
          <div class="stat-unit">${getDistanceUnit()}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Total Time</div>
          <div class="stat-value">${stats.totalTime}</div>
          <div class="stat-unit">minutes</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Avg Depth</div>
          <div class="stat-value">${convertDistance(stats.avgDepth, settings.distanceUnit)}</div>
          <div class="stat-unit">${getDistanceUnit()}</div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">Dives per Month (Last 6 Months)</div>
        <div class="chart-bars">
          ${monthlyStats.map(month => {
            const maxDives = Math.max(...monthlyStats.map(m => m.count), 1);
            const height = (month.count / maxDives) * 100;
            return `
              <div class="chart-bar" style="height: ${height}%">
                <div class="chart-bar-value">${month.count}</div>
                <div class="chart-bar-label">${month.month}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// Calculate Statistics
function calculateStats() {
  const totalDives = dives.length;
  const maxDepth = Math.max(...dives.map(d => parseFloat(d.maxDepth) || 0)).toFixed(1);
  const totalTime = dives.reduce((sum, d) => sum + (parseInt(d.duration) || 0), 0);
  const avgDepth = (dives.reduce((sum, d) => sum + (parseFloat(d.maxDepth) || 0), 0) / totalDives).toFixed(1);

  return { totalDives, maxDepth, totalTime, avgDepth };
}

// Calculate Monthly Statistics
function calculateMonthlyStats() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const count = dives.filter(dive => {
      const diveMonth = dive.date.substring(0, 7);
      return diveMonth === monthYear;
    }).length;

    months.push({ month: monthName, count });
  }

  return months;
}

// Render Settings
function renderSettings() {
  return `
    <div class="dive-form-container">
      <h2>⚙️ Settings</h2>
      <p style="color: var(--text-light); margin-bottom: 30px;">Choose your preferred units for measurements</p>

      <div class="settings-section">
        <h3 style="color: var(--primary-blue); margin-bottom: 20px;">Temperature Unit</h3>
        <div class="settings-options">
          <label class="settings-option ${settings.tempUnit === 'celsius' ? 'active' : ''}">
            <input type="radio" name="tempUnit" value="celsius" ${settings.tempUnit === 'celsius' ? 'checked' : ''}>
            <div class="settings-option-content">
              <div class="settings-option-title">Celsius (°C)</div>
              <div class="settings-option-desc">Metric system</div>
            </div>
          </label>
          <label class="settings-option ${settings.tempUnit === 'fahrenheit' ? 'active' : ''}">
            <input type="radio" name="tempUnit" value="fahrenheit" ${settings.tempUnit === 'fahrenheit' ? 'checked' : ''}>
            <div class="settings-option-content">
              <div class="settings-option-title">Fahrenheit (°F)</div>
              <div class="settings-option-desc">Imperial system</div>
            </div>
          </label>
        </div>
      </div>

      <div class="settings-section" style="margin-top: 40px;">
        <h3 style="color: var(--primary-blue); margin-bottom: 20px;">Distance Unit</h3>
        <div class="settings-options">
          <label class="settings-option ${settings.distanceUnit === 'meters' ? 'active' : ''}">
            <input type="radio" name="distanceUnit" value="meters" ${settings.distanceUnit === 'meters' ? 'checked' : ''}>
            <div class="settings-option-content">
              <div class="settings-option-title">Meters (m)</div>
              <div class="settings-option-desc">For depth and visibility</div>
            </div>
          </label>
          <label class="settings-option ${settings.distanceUnit === 'feet' ? 'active' : ''}">
            <input type="radio" name="distanceUnit" value="feet" ${settings.distanceUnit === 'feet' ? 'checked' : ''}>
            <div class="settings-option-content">
              <div class="settings-option-title">Feet (ft)</div>
              <div class="settings-option-desc">For depth and visibility</div>
            </div>
          </label>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: var(--light-blue); border-radius: 12px;">
        <p style="color: var(--text-dark); font-size: 0.95em;">
          <strong>Note:</strong> All data is stored in metric units. These settings only change how measurements are displayed to you.
        </p>
      </div>
    </div>
  `;
}

// Attach Event Listeners
function attachEventListeners() {
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // Form submission
  const form = document.getElementById('dive-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Photo upload
  const photoUpload = document.getElementById('photoUpload');
  const photoInput = document.getElementById('photoInput');

  if (photoUpload && photoInput) {
    photoUpload.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoUpload);
  }

  // Search and sort
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Modal close
  const modal = document.getElementById('modal');
  const modalClose = document.querySelector('.modal-close');

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Dive card clicks for photo view
  document.querySelectorAll('.dive-photos img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      showPhotoModal(e.target.src);
    });
  });

  // Set default date to today (only if not editing and no value set)
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value && !editingDiveId) {
    dateInput.valueAsDate = new Date();
  }

  // Settings listeners
  document.querySelectorAll('input[name="tempUnit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settings.tempUnit = e.target.value;
      saveSettings();
      renderApp();
      switchTab('settings');
    });
  });

  document.querySelectorAll('input[name="distanceUnit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settings.distanceUnit = e.target.value;
      saveSettings();
      renderApp();
      switchTab('settings');
    });
  });
}

// Switch Tab
function switchTab(tabName) {
  currentTab = tabName;

  // Update active tab button
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update active content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabName);
  });
}

// Handle Form Submit
function handleFormSubmit(e) {
  e.preventDefault();

  // Get form values and convert to metric for storage
  const maxDepthValue = document.getElementById('maxDepth').value;
  const waterTempValue = document.getElementById('waterTemp').value;
  const visibilityValue = document.getElementById('visibility').value;

  const diveData = {
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    location: document.getElementById('location').value,
    diveSite: document.getElementById('diveSite').value,
    maxDepth: convertDistanceToMetric(maxDepthValue, settings.distanceUnit),
    duration: document.getElementById('duration').value,
    waterTemp: waterTempValue ? convertTempToMetric(waterTempValue, settings.tempUnit) : '',
    visibility: visibilityValue ? convertDistanceToMetric(visibilityValue, settings.distanceUnit) : '',
    buddy: document.getElementById('buddy').value,
    diveType: document.getElementById('diveType').value,
    notes: document.getElementById('notes').value,
  };

  if (editingDiveId) {
    // Update existing dive
    const diveIndex = dives.findIndex(d => d.id === editingDiveId);
    if (diveIndex !== -1) {
      const existingDive = dives[diveIndex];
      // Keep existing photos and add new ones
      dives[diveIndex] = {
        ...diveData,
        id: editingDiveId,
        photos: photoFiles.length > 0 ? [...(existingDive.photos || []), ...photoFiles] : existingDive.photos
      };
    }
    editingDiveId = null;
    alert('Dive updated successfully! ✨');
  } else {
    // Create new dive
    const newDive = {
      ...diveData,
      id: Date.now().toString(),
      photos: photoFiles
    };
    dives.push(newDive);
    alert('Dive logged successfully! 🎉');
  }

  saveDives();

  // Reset form
  e.target.reset();
  photoFiles = [];
  document.getElementById('photoPreview').innerHTML = '';
  if (!editingDiveId) {
    document.getElementById('date').valueAsDate = new Date();
  }

  // Switch to log tab
  switchTab('log');
  renderApp();
}

// Handle Photo Upload
function handlePhotoUpload(e) {
  const files = Array.from(e.target.files);
  const preview = document.getElementById('photoPreview');

  files.forEach(file => {
    const reader = new FileReader();

    reader.onload = (event) => {
      photoFiles.push(event.target.result);

      const img = document.createElement('img');
      img.src = event.target.result;
      preview.appendChild(img);
    };

    reader.readAsDataURL(file);
  });
}

// Handle Search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.dive-card');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchTerm) ? 'block' : 'none';
  });
}

// Handle Sort
function handleSort(e) {
  const sortType = e.target.value;
  let sortedDives = [...dives];

  switch(sortType) {
    case 'date-desc':
      sortedDives.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      sortedDives.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'depth-desc':
      sortedDives.sort((a, b) => parseFloat(b.maxDepth) - parseFloat(a.maxDepth));
      break;
    case 'depth-asc':
      sortedDives.sort((a, b) => parseFloat(a.maxDepth) - parseFloat(b.maxDepth));
      break;
  }

  const diveCards = document.getElementById('diveCards');
  diveCards.innerHTML = sortedDives.map((dive, index) =>
    renderDiveCard(dive, dives.length - index)
  ).join('');

  // Re-attach photo click listeners
  document.querySelectorAll('.dive-photos img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      showPhotoModal(e.target.src);
    });
  });
}

// Edit Dive
window.editDive = function(id) {
  editingDiveId = id;
  const dive = dives.find(d => d.id === id);
  if (dive) {
    // Clear photoFiles - existing photos will be shown in preview but not in photoFiles
    photoFiles = [];
    renderApp();
    switchTab('add');
  }
}

// Cancel Edit
window.cancelEdit = function() {
  editingDiveId = null;
  photoFiles = [];
  renderApp();
  switchTab('log');
}

// Delete Dive
window.deleteDive = function(id) {
  if (confirm('Are you sure you want to delete this dive?')) {
    dives = dives.filter(dive => dive.id !== id);
    saveDives();
    renderApp();
  }
}

// Show Photo Modal
function showPhotoModal(src) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `<img src="${src}" alt="Dive photo">`;
  modal.classList.add('active');
}

// Save to localStorage
function saveDives() {
  localStorage.setItem('dives', JSON.stringify(dives));
}

function saveSettings() {
  localStorage.setItem('diveSettings', JSON.stringify(settings));
}
