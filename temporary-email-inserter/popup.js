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
  let autoRefreshInterval = null;

  // Load current email
  const data = await chrome.storage.local.get('currentEmail');
  updateUI(data.currentEmail);
  
  if (data.currentEmail) {
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
      const messages = data['hydra:member'] || [];
      
      elements.messageCount.textContent = messages.length;
      
      // If inbox modal is open, refresh it
      if (!elements.inboxModal.classList.contains('hidden')) {
        displayMessages(messages, token);
      }
      
      return messages;
    } catch (error) {
      console.error('Error checking messages:', error);
      return [];
    }
  }

  function displayMessages(messages, token) {
    if (messages.length === 0) {
      elements.messagesList.innerHTML = `
        <div class="empty">
          <div class="empty-icon">📭</div>
          <p>No messages yet</p>
          <p class="empty-hint">Waiting for verification email...</p>
        </div>
      `;
    } else {
      elements.messagesList.innerHTML = messages.map(msg => `
        <div class="message-item" data-id="${msg.id}">
          <div class="message-header">
            <div class="message-from">${msg.from.name || msg.from.address}</div>
            <div class="message-time">${new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
          <div class="message-subject">${msg.subject}</div>
          <div class="message-preview">${msg.intro || 'No preview available'}</div>
          <button class="view-message-btn" onclick="viewMessage('${msg.id}', '${token}')">View Full Message</button>
        </div>
      `).join('');
    }
  }

  // Make viewMessage globally accessible
  window.viewMessage = async function(messageId, token) {
    try {
      const response = await fetch(`https://api.mail.tm/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const message = await response.json();
      
      // Display full message in a modal or expanded view
      const messageHtml = `
        <div class="full-message">
          <div class="full-message-header">
            <h3>${message.subject}</h3>
            <div class="meta">From: ${message.from.address}</div>
            <div class="meta">Date: ${new Date(message.createdAt).toLocaleString()}</div>
          </div>
          <div class="message-body">
            ${message.html || message.text || 'No content'}
          </div>
          <button class="btn btn-secondary" onclick="backToInbox()">← Back to Inbox</button>
        </div>
      `;
      
      elements.messagesList.innerHTML = messageHtml;
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  window.backToInbox = function() {
    checkMessages(currentToken, true);
  };

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
    const data = await chrome.storage.local.get('currentEmail');
    if (!data.currentEmail) return;
    
    elements.inboxModal.classList.remove('hidden');
    const messages = await checkMessages(data.currentEmail.token, true);
    displayMessages(messages, data.currentEmail.token);
  });

  elements.closeInbox.addEventListener('click', () => {
    elements.inboxModal.classList.add('hidden');
  });

  // Refresh inbox button
  if (elements.refreshInbox) {
    elements.refreshInbox.addEventListener('click', () => {
      if (currentToken) {
        checkMessages(currentToken, true);
      }
    });
  }

  // Cleanup on popup close
  window.addEventListener('unload', stopAutoRefresh);
});