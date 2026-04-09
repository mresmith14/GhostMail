document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    emailDisplay: document.getElementById('email-display'),
    noEmail: document.getElementById('no-email'),
    currentEmail: document.getElementById('current-email'),
    copyBtn: document.getElementById('copy-btn'),
    createdTime: document.getElementById('created-time'),
    messageCount: document.getElementById('message-count'),
    generateBtn: document.getElementById('generate-btn'),
    refreshEmail: document.getElementById('refresh-email'),
    checkInbox: document.getElementById('check-inbox'),
    inboxModal: document.getElementById('inbox-modal'),
    closeInbox: document.getElementById('close-inbox'),
    messagesList: document.getElementById('messages-list'),
    refreshInbox: document.getElementById('refresh-inbox')
  };

  let currentToken = null;
  let currentEmailData = null;
  let autoRefreshInterval = null;
  let messages = [];

  // Load current email
  const data = await chrome.storage.local.get('currentEmail');
  updateUI(data.currentEmail);
  
  if (data.currentEmail) {
    currentEmailData = data.currentEmail;
    startAutoRefresh(data.currentEmail.token);
  }

  // Generate new email
  async function generateEmail() {
    elements.generateBtn.disabled = true;
    elements.generateBtn.textContent = 'Generating...';
    
    try {
      const response = await fetch('https://api.mail.tm/domains');
      const domains = await response.json();
      const domain = domains['hydra:member'][0].domain;
      const username = Math.random().toString(36).substring(2, 15);
      const password = Math.random().toString(36).substring(2, 15);
      const email = `${username}@${domain}`;
      
      await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email, password: password })
      });
      
      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email, password: password })
      });
      const tokenData = await tokenRes.json();
      
      const emailData = {
        email: email,
        password: password,
        token: tokenData.token,
        createdAt: Date.now()
      };
      
      await chrome.storage.local.set({ currentEmail: emailData });
      currentEmailData = emailData;
      updateUI(emailData);
      startAutoRefresh(tokenData.token);
      
    } catch (error) {
      alert('Failed to generate email. Please try again.');
      console.error(error);
    } finally {
      elements.generateBtn.disabled = false;
      elements.generateBtn.textContent = 'Generate Email';
    }
  }

  function updateUI(emailData) {
    if (emailData) {
      elements.emailDisplay.classList.remove('hidden');
      elements.noEmail.classList.add('hidden');
      elements.currentEmail.textContent = emailData.email;
      currentToken = emailData.token;
      
      const date = new Date(emailData.createdAt);
      elements.createdTime.textContent = date.toLocaleTimeString();
      
      checkMessages(emailData.token);
    } else {
      elements.emailDisplay.classList.add('hidden');
      elements.noEmail.classList.remove('hidden');
      stopAutoRefresh();
    }
  }

  async function checkMessages(token, showLoading = false) {
    try {
      if (showLoading) {
        elements.messagesList.innerHTML = '<div class="loading">Checking for new messages...</div>';
      }
      
      const response = await fetch('https://api.mail.tm/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      messages = data['hydra:member'] || [];
      
      elements.messageCount.textContent = messages.length;
      
      // If inbox modal is open, refresh it
      if (!elements.inboxModal.classList.contains('hidden')) {
        displayMessages(messages);
      }
      
      return messages;
    } catch (error) {
      console.error('Error checking messages:', error);
      return [];
    }
  }

  function displayMessages(msgs) {
    if (msgs.length === 0) {
      elements.messagesList.innerHTML = `
        <div class="empty">
          <div class="empty-icon">📭</div>
          <p>No messages yet</p>
          <p class="empty-hint">Waiting for verification email...</p>
        </div>
      `;
    } else {
      elements.messagesList.innerHTML = msgs.map((msg, index) => `
        <div class="message-item" data-index="${index}">
          <div class="message-header">
            <div class="message-from">${escapeHtml(msg.from.name || msg.from.address)}</div>
            <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
          <div class="message-subject">${escapeHtml(msg.subject)}</div>
          <div class="message-preview">${escapeHtml(msg.intro || 'No preview available')}</div>
          <button class="view-message-btn" data-index="${index}">View Full Message</button>
        </div>
      `).join('');

      // Attach click handlers to view buttons
      document.querySelectorAll('.view-message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          viewMessage(index);
        });
      });
    }
  }

  async function viewMessage(index) {
    const msg = messages[index];
    if (!msg || !currentToken) return;
    
    try {
      elements.messagesList.innerHTML = '<div class="loading">Loading message...</div>';
      
      const response = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const message = await response.json();
      
      // Display full message
      const messageHtml = `
        <div class="full-message">
          <div class="full-message-header">
            <h3>${escapeHtml(message.subject)}</h3>
            <div class="meta">From: ${escapeHtml(message.from.address)}</div>
            <div class="meta">Date: ${new Date(message.createdAt).toLocaleString()}</div>
            ${message.to ? `<div class="meta">To: ${escapeHtml(message.to[0]?.address || '')}</div>` : ''}
          </div>
          <div class="message-body">
            ${message.html || formatTextBody(message.text) || '<p>No content</p>'}
          </div>
          <button class="btn btn-secondary back-btn">← Back to Inbox</button>
        </div>
      `;
      
      elements.messagesList.innerHTML = messageHtml;
      
      // Attach back button handler
      document.querySelector('.back-btn').addEventListener('click', () => {
        displayMessages(messages);
      });
      
    } catch (error) {
      console.error('Error fetching message:', error);
      elements.messagesList.innerHTML = `
        <div class="empty">
          <p>Error loading message</p>
          <button class="btn btn-secondary" onclick="displayMessages(messages)">← Back</button>
        </div>
      `;
    }
  }

  function formatTextBody(text) {
    if (!text) return '';
    // Convert plain text to HTML with line breaks
    return '<pre style="white-space: pre-wrap; font-family: inherit;">' + 
           escapeHtml(text) + 
           '</pre>';
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function startAutoRefresh(token) {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(() => {
      checkMessages(token);
    }, 10000); // Check every 10 seconds
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }

  // Copy email to clipboard
  elements.copyBtn.addEventListener('click', () => {
    const email = elements.currentEmail.textContent;
    navigator.clipboard.writeText(email);
    elements.copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      elements.copyBtn.textContent = '📋 Copy';
    }, 1500);
  });

  // Event listeners
  elements.generateBtn.addEventListener('click', generateEmail);
  elements.refreshEmail.addEventListener('click', generateEmail);
  
  elements.checkInbox.addEventListener('click', async () => {
    if (!currentEmailData) return;
    
    elements.inboxModal.classList.remove('hidden');
    await checkMessages(currentEmailData.token, true);
    displayMessages(messages);
  });

  elements.closeInbox.addEventListener('click', () => {
    elements.inboxModal.classList.add('hidden');
  });

  // Refresh inbox button
  if (elements.refreshInbox) {
    elements.refreshInbox.addEventListener('click', async () => {
      if (currentEmailData) {
        await checkMessages(currentEmailData.token, true);
        displayMessages(messages);
      }
    });
  }

  // Cleanup on popup close
  window.addEventListener('unload', stopAutoRefresh);
});
