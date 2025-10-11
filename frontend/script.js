const AppState = {
  isLoggedIn: false,
  currentUser: null,
  theme: 'light',
  chats: [],
  currentChatId: null,
  currentQuery: null,
  researchHistory: [],
  sidebarCollapsed: false
};

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  const savedUser = localStorage.getItem('aryaUser');
  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
    AppState.isLoggedIn = true;
    showMainApp();
  } else {
    showLoginModal();
  }
  
  const savedTheme = localStorage.getItem('aryaTheme') || 'light';
  setTheme(savedTheme);
  
  loadChatHistory();
  restoreSidebarState();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  document.getElementById('queryInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
  document.getElementById('newChatBtn').addEventListener('click', createNewChat);
  
  document.querySelector('.close').addEventListener('click', function() {
    if (AppState.isLoggedIn) {
      document.getElementById('loginModal').classList.add('hidden');
    }
  });
  
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

function showLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showSignup() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
  const password = formData.get('password') || e.target.querySelector('input[type="password"]').value;
  
  if (email && password) {
    const user = {
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase()
    };
    
    AppState.currentUser = user;
    AppState.isLoggedIn = true;
    localStorage.setItem('aryaUser', JSON.stringify(user));
    
    showMainApp();
    showToast('Welcome back!', 'success');
  } else {
    showToast('Please fill in all fields', 'error');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const name = inputs[0].value;
  const email = inputs[1].value;
  const password = inputs[2].value;
  
  if (name && email && password) {
    const user = {
      name: name,
      email: email,
      avatar: name.charAt(0).toUpperCase()
    };
    
    AppState.currentUser = user;
    AppState.isLoggedIn = true;
    localStorage.setItem('aryaUser', JSON.stringify(user));
    
    showMainApp();
    showToast('Account created successfully!', 'success');
  } else {
    showToast('Please fill in all fields', 'error');
  }
}

function logout() {
  AppState.isLoggedIn = false;
  AppState.currentUser = null;
  AppState.chats = [];
  AppState.currentChatId = null;
  AppState.sidebarCollapsed = false;
  localStorage.removeItem('aryaUser');
  
  const sidebar = document.getElementById('chatSidebar');
  const toggleBtn = document.getElementById('toggleSidebar');
  const floatingToggle = document.getElementById('floatingToggle');
  sidebar.classList.remove('collapsed');
  toggleBtn.textContent = '←';
  floatingToggle.classList.add('hidden');
  
  showLoginModal();
  showToast('Logged out successfully', 'success');
}

function showLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  
  if (AppState.currentUser) {
    document.getElementById('userName').textContent = AppState.currentUser.name;
    document.getElementById('userEmail').textContent = AppState.currentUser.email;
    document.querySelector('.avatar').textContent = AppState.currentUser.avatar;
  }
}

function toggleTheme() {
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

function setTheme(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aryaTheme', theme);
  
  const themeIcon = document.querySelector('.theme-icon');
  if (theme === 'dark') {
    themeIcon.innerHTML = '<path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>';
  } else {
    themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
  }
}

async function performSearch() {
  const query = document.getElementById('queryInput').value.trim();
  
  if (!query) {
    showToast('Please enter a search query', 'error');
    return;
  }
  
  if (!AppState.currentChatId) {
    createNewChat();
  }
  
  AppState.currentQuery = query;
  
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('resultsContainer').classList.remove('hidden');
  document.getElementById('loadingAnimation').classList.remove('hidden');
  
  hideResultSections();
  
  try {
    const response = await fetch(`https://a-r-y-a.onrender.com/research?query=${encodeURIComponent(query)}`);

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    document.getElementById('loadingAnimation').classList.add('hidden');
    
    setTimeout(() => displaySummary(data), 100);
    setTimeout(() => displaySources(data.results || []), 300);
    setTimeout(() => displaySuggestions(data.suggestions || []), 500);
    
    addToCurrentChat(query, data);
    document.getElementById('queryInput').value = '';
    
  } catch (error) {
    document.getElementById('loadingAnimation').classList.add('hidden');
    showToast(`Error: ${error.message}`, 'error');
    console.error('Search error:', error);
  }
}

function hideResultSections() {
  document.getElementById('summarySection').style.display = 'none';
  document.getElementById('sourcesSection').style.display = 'none';
  document.getElementById('suggestionsSection').style.display = 'none';
  
  updateResearchHistoryForCurrentChat();
}

function displaySummary(data) {
  const summarySection = document.getElementById('summarySection');
  const summaryContent = document.getElementById('summaryContent');
  
  const summary = data.summary?.summary || data.summary || 'No summary available';
  const isReliable = data.reliable !== false;
  
  summaryContent.innerHTML = `
    <div class="summary-header">
      <span class="reliability-badge ${isReliable ? 'verified' : 'unverified'}">
        ${isReliable ? '✓ Verified' : '⚠ Unverified'}
      </span>
      <span class="confidence-badge">AI Confidence: High</span>
    </div>
    <p class="summary-text">${summary}</p>
  `;
  
  summarySection.style.display = 'block';
}

function displaySources(sources) {
  const sourcesSection = document.getElementById('sourcesSection');
  const sourcesContent = document.getElementById('sourcesContent');
  
  if (!sources || sources.length === 0) {
    sourcesContent.innerHTML = '<p class="no-results">No sources found</p>';
  } else {
    sourcesContent.innerHTML = sources.map(source => `
      <div class="source-card">
        <h3 class="source-title">${source.title || 'Untitled'}</h3>
        <p class="source-snippet">${source.snippet || 'No description available'}</p>
        <a href="${source.link}" target="_blank" class="source-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          ${new URL(source.link).hostname}
        </a>
      </div>
    `).join('');
  }
  
  sourcesSection.style.display = 'block';
}

function displaySuggestions(suggestions) {
  const suggestionsSection = document.getElementById('suggestionsSection');
  const suggestionsContent = document.getElementById('suggestionsContent');
  
  if (!suggestions || suggestions.length === 0) {
    suggestionsContent.innerHTML = '<p class="no-results">No suggestions available</p>';
  } else {
    suggestionsContent.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item" onclick="searchSuggestion('${suggestion.replace(/'/g, "\\'")}')">
        ${suggestion}
      </div>
    `).join('');
  }
  
  suggestionsSection.style.display = 'block';
}

function searchSuggestion(suggestion) {
  document.getElementById('queryInput').value = suggestion;
  performSearch();
}

function createNewChat() {
  const chatId = Date.now().toString();
  const newChat = {
    id: chatId,
    title: 'New Chat',
    timestamp: new Date().toISOString(),
    messages: []
  };
  
  AppState.chats.unshift(newChat);
  AppState.currentChatId = chatId;
  
  document.getElementById('welcomeScreen').classList.remove('hidden');
  document.getElementById('resultsContainer').classList.add('hidden');
  
  saveChatHistory();
  updateChatDisplay();
}

function addToCurrentChat(query, results) {
  const currentChat = AppState.chats.find(chat => chat.id === AppState.currentChatId);
  if (!currentChat) return;
  
  const message = {
    id: Date.now(),
    query: query,
    timestamp: new Date().toISOString(),
    summary: results.summary?.summary || results.summary || '',
    sources: results.results || [],
    suggestions: results.suggestions || [],
    verified: results.verified,
    reliable: results.reliable
  };
  
  currentChat.messages.push(message);
  
  if (currentChat.messages.length === 1) {
    currentChat.title = query.length > 30 ? query.substring(0, 30) + '...' : query;
  }
  
  saveChatHistory();
  updateChatDisplay();
  updateResearchHistoryForCurrentChat();
}

function loadChatHistory() {
  if (!AppState.currentUser) return;
  const saved = localStorage.getItem(`aryaChats_${AppState.currentUser.email}`);
  if (saved) {
    AppState.chats = JSON.parse(saved);
    updateChatDisplay();
  }
}

function saveChatHistory() {
  if (!AppState.currentUser) return;
  localStorage.setItem(`aryaChats_${AppState.currentUser.email}`, JSON.stringify(AppState.chats));
}

function updateChatDisplay() {
  const chatList = document.getElementById('chatList');
  
  if (AppState.chats.length === 0) {
    chatList.innerHTML = '<p class="no-results" style="padding: 1rem; text-align: center;">No chats yet</p>';
    return;
  }
  
  chatList.innerHTML = AppState.chats.map(chat => `
    <div class="chat-item ${chat.id === AppState.currentChatId ? 'active' : ''}" onclick="loadChat('${chat.id}')">
      <div class="chat-title">${chat.title}</div>
      <div class="chat-date">${formatDate(chat.timestamp)}</div>
      <button class="chat-delete" onclick="event.stopPropagation(); deleteChat('${chat.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function loadChat(chatId) {
  const chat = AppState.chats.find(c => c.id === chatId);
  if (!chat) return;
  
  AppState.currentChatId = chatId;
  
  if (chat.messages.length === 0) {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('researchHistorySection').classList.add('hidden');
  } else {
    const lastMessage = chat.messages[chat.messages.length - 1];
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
    
    displaySummary({ summary: lastMessage.summary, reliable: lastMessage.reliable, verified: lastMessage.verified });
    displaySources(lastMessage.sources);
    displaySuggestions(lastMessage.suggestions);
    
    updateResearchHistoryForCurrentChat();
  }
  
  updateChatDisplay();
}

function deleteChat(chatId) {
  AppState.chats = AppState.chats.filter(chat => chat.id !== chatId);
  
  if (AppState.currentChatId === chatId) {
    AppState.currentChatId = null;
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('researchHistorySection').classList.add('hidden');
  }
  
  saveChatHistory();
  updateChatDisplay();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

function toggleSidebar() {
  const sidebar = document.getElementById('chatSidebar');
  const toggleBtn = document.getElementById('toggleSidebar');
  const floatingToggle = document.getElementById('floatingToggle');
  
  sidebar.classList.toggle('collapsed');
  AppState.sidebarCollapsed = sidebar.classList.contains('collapsed');
  toggleBtn.textContent = AppState.sidebarCollapsed ? '→' : '←';
  
  if (AppState.sidebarCollapsed) {
    floatingToggle.classList.remove('hidden');
  } else {
    floatingToggle.classList.add('hidden');
  }
  
  saveSidebarState();
}

function saveSidebarState() {
  if (!AppState.currentUser) return;
  localStorage.setItem(`aryaSidebarState_${AppState.currentUser.email}`, JSON.stringify(AppState.sidebarCollapsed));
}

function restoreSidebarState() {
  if (!AppState.currentUser) return;
  const saved = localStorage.getItem(`aryaSidebarState_${AppState.currentUser.email}`);
  if (saved !== null) {
    AppState.sidebarCollapsed = JSON.parse(saved);
    const sidebar = document.getElementById('chatSidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const floatingToggle = document.getElementById('floatingToggle');
    
    if (AppState.sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      toggleBtn.textContent = '→';
      floatingToggle.classList.remove('hidden');
    } else {
      sidebar.classList.remove('collapsed');
      toggleBtn.textContent = '←';
      floatingToggle.classList.add('hidden');
    }
  }
}

function toggleUserMenu() {
  const userMenu = document.querySelector('.user-menu');
  userMenu.classList.toggle('hidden');
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 1rem;">&times;</button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

function updateResearchHistoryForCurrentChat() {
  const currentChat = AppState.chats.find(chat => chat.id === AppState.currentChatId);
  if (!currentChat || currentChat.messages.length === 0) {
    document.getElementById('researchHistorySection').classList.add('hidden');
    return;
  }
  
  updateResearchHistoryDisplay(currentChat.messages);
}

function updateResearchHistoryDisplay(messages = []) {
  const historyContainer = document.getElementById('researchHistory');
  
  if (messages.length === 0) {
    document.getElementById('researchHistorySection').classList.add('hidden');
    return;
  }
  
  document.getElementById('researchHistorySection').classList.remove('hidden');
  
  historyContainer.innerHTML = messages.map(item => `
    <div class="history-card">
      <div class="history-header" onclick="toggleHistoryCard('${item.id}')">
        <div class="history-query">${item.query}</div>
        <div class="history-timestamp">Searched on: ${formatTimestamp(item.timestamp)}</div>
        <svg class="expand-icon" id="icon-${item.id}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <div class="history-content" id="content-${item.id}">
        ${item.summary ? `
          <div class="history-summary">
            <div class="summary-header">
              ${item.verified ? `<span class="reliability-badge verified">${item.verified}</span>` : ''}
              <span class="confidence-badge">${item.reliable ? 'High Confidence' : 'Low Confidence'}</span>
            </div>
            <p>${item.summary}</p>
          </div>
        ` : ''}
        ${item.sources.length > 0 ? `
          <div class="history-sources">
            <h4>Sources (${item.sources.length})</h4>
            ${item.sources.slice(0, 3).map(source => `
              <div class="history-source-item">
                <strong>${source.title || 'Untitled'}</strong><br>
                <small>${new URL(source.link).hostname}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${item.suggestions.length > 0 ? `
          <div class="history-suggestions">
            ${item.suggestions.map(suggestion => `
              <span class="history-suggestion" onclick="searchSuggestion('${suggestion.replace(/'/g, "\\'")}')">
                ${suggestion}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function toggleHistoryCard(itemId) {
  const content = document.getElementById(`content-${itemId}`);
  const icon = document.getElementById(`icon-${itemId}`);
  
  content.classList.toggle('expanded');
  icon.classList.toggle('rotated');
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function toggleResearchHistory() {
  const historyContent = document.getElementById('researchHistory');
  const minimizeBtn = document.getElementById('minimizeHistory');
  const icon = minimizeBtn.querySelector('svg path');
  
  historyContent.classList.toggle('minimized');
  
  if (historyContent.classList.contains('minimized')) {
    icon.setAttribute('d', 'M5 15l7-7 7 7');
  } else {
    icon.setAttribute('d', 'M19 9l-7 7-7-7');
  }
}

document.addEventListener('click', function(e) {
  const userProfile = document.querySelector('.user-profile');
  const userMenu = document.querySelector('.user-menu');
  
  if (!userProfile.contains(e.target)) {
    userMenu.classList.add('hidden');
  }
});

const additionalStyles = `
.summary-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.reliability-badge, .confidence-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.reliability-badge.verified {
  background: #f3e8ff;
  color: #6b46c1;
}

.reliability-badge.unverified {
  background: #fef3c7;
  color: #92400e;
}

.confidence-badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.summary-text {
  line-height: 1.7;
  font-size: 1rem;
}

.no-results {
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
  padding: 2rem;
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

[data-theme="dark"] .reliability-badge.verified {
  background: #4c1d95;
  color: #c4b5fd;
}

[data-theme="dark"] .reliability-badge.unverified {
  background: #451a03;
  color: #fbbf24;
}

.research-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  cursor: pointer;
}

.history-query {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
  flex: 1;
}

.history-timestamp {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 1rem;
}

.history-content {
  display: none;
  margin-top: 1rem;
}

.history-content.expanded {
  display: block;
}

.history-summary {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 16px;
  border-left: 3px solid var(--accent-color);
}

.history-sources {
  margin-bottom: 1rem;
}

.history-sources h4 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.history-source-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 0.875rem;
}

.history-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-suggestion {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.history-suggestion:hover {
  background: var(--accent-color);
  color: white;
}

.expand-icon {
  transition: transform 0.2s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.minimize-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
}

.minimize-btn:hover {
  background: var(--hover-color);
}

.research-history.minimized {
  display: none;
}

.floating-toggle {
  position: fixed;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: 200;
  transition: var(--transition);
}

.floating-toggle:hover {
  opacity: 0.9;
  transform: translateY(-50%) scale(1.1);
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
