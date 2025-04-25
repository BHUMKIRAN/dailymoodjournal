const API_URL = 'http://localhost:3000/api';

const authForm = document.getElementById('authForm');
const moodForm = document.getElementById('moodForm');
const toggleAuth = document.getElementById('toggleAuth');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const journalSection = document.getElementById('journalSection');
const authSection = document.getElementById('authSection');
const logoutBtn = document.getElementById('logoutBtn');
const clearBtn = document.getElementById('clearHistory');
const entriesList = document.getElementById('entriesList');

// Toggle Login/Register
let isLogin = true;
toggleAuth.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  authForm.querySelector('button').textContent = isLogin ? 'Login' : 'Register';
  toggleAuth.textContent = isLogin ? 'Register' : 'Login';
});

// Handle Auth Submit
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  const endpoint = isLogin ? '/auth/login' : '/auth/register';

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      showJournal();
    } else {
      alert(data.message || 'Something went wrong');
    }
  } catch (err) {
    alert('Server error');
  }
});

// Show journal if logged in
function showJournal() {
  authSection.style.display = 'none';
  journalSection.style.display = 'block';
  fetchEntries();
}

// Handle Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  journalSection.style.display = 'none';
  authSection.style.display = 'block';
  authForm.reset();
});

// Handle Mood Submit
moodForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const entry = {
    mood: document.getElementById('mood').value,
    note: document.getElementById('note').value,
    date: new Date().toLocaleString()
  };

  const res = await fetch(`${API_URL}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(entry)
  });

  const saved = await res.json();
  addEntryToDOM(saved);
  moodForm.reset();
});

// Clear Mood History
clearBtn.addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete all mood entries?")) {
    await fetch(`${API_URL}/entries`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    entriesList.innerHTML = '';
  }
});

// Fetch and show entries
async function fetchEntries() {
  const res = await fetch(`${API_URL}/entries`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const entries = await res.json();
  entriesList.innerHTML = '';
  entries.reverse().forEach(addEntryToDOM);
}

// Render single entry
function addEntryToDOM(entry) {
  const div = document.createElement('div');
  div.className = 'entry';
  div.innerHTML = `
    <strong>${entry.mood}</strong> – <em>${entry.date}</em><br/>
    <p>${entry.note || '<i>No note</i>'}</p>
  `;
  entriesList.appendChild(div);
}

// Auto-login if token exists
if (localStorage.getItem('token')) {
  showJournal();
}
