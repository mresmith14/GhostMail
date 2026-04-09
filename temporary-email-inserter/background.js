// Temporary email API configuration
const EMAIL_APIS = {
  mailtm: {
    name: 'Mail.tm',
    baseUrl: 'https://api.mail.tm',
    createAccount: async () => {
      try {
        // Get available domains
        const domainsRes = await fetch('https://api.mail.tm/domains');
        const domains = await domainsRes.json();
        const domain = domains['hydra:member'][0].domain;
        
        // Generate random username
        const username = Math.random().toString(36).substring(2, 15);
        const password = Math.random().toString(36).substring(2, 15);
        const email = `${username}@${domain}`;
        
        // Create account
        const createRes = await fetch('https://api.mail.tm/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: email,
            password: password
          })
        });
        
        if (createRes.ok) {
          // Get token
          const tokenRes = await fetch('https://api.mail.tm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: email,
              password: password
            })
          });
          const tokenData = await tokenRes.json();
          
          return {
            email: email,
            password: password,
            token: tokenData.token,
            createdAt: Date.now()
          };
        }
        throw new Error('Failed to create account');
      } catch (error) {
        console.error('Mail.tm error:', error);
        throw error;
      }
    }
  }
};

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'insertTempEmail',
    title: 'Insert Temporary Email',
    contexts: ['editable']
  });
  
  chrome.contextMenus.create({
    id: 'generateNewEmail',
    title: '🔄 Generate New Email',
    contexts: ['editable'],
    parentId: 'insertTempEmail'
  });
  
  chrome.contextMenus.create({
    id: 'useExistingEmail',
    title: '📋 Use Existing Email',
    contexts: ['editable'],
    parentId: 'insertTempEmail'
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'generateNewEmail') {
    try {
      const emailData = await EMAIL_APIS.mailtm.createAccount();
      
      // Store the email data
      await chrome.storage.local.set({
        currentEmail: emailData,
        emailHistory: [emailData]
      });
      
      // Insert into page
      await insertEmailIntoField(tab, emailData.email);
      
      // Show notification
      chrome.action.setBadgeText({ text: '✓' });
      setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
      
    } catch (error) {
      console.error('Error generating email:', error);
      // Show error badge
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
    }
  }
  
  if (info.menuItemId === 'useExistingEmail') {
    const data = await chrome.storage.local.get('currentEmail');
    if (data.currentEmail) {
      await insertEmailIntoField(tab, data.currentEmail.email);
    } else {
      // No existing email, generate one
      chrome.contextMenus.update('useExistingEmail', { 
        title: 'No email found - Generate new instead' 
      });
    }
  }
});

// Function to insert email into focused input field
async function insertEmailIntoField(tab, email) {
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (emailToInsert) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // Insert at cursor position or replace selection
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;
        
        activeElement.value = value.substring(0, start) + emailToInsert + value.substring(end);
        
        // Trigger input events for React/Vue/Angular forms
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Visual feedback
        activeElement.style.backgroundColor = '#e8f5e9';
        setTimeout(() => {
          activeElement.style.backgroundColor = '';
        }, 500);
        
        return true;
      }
      return false;
    },
    args: [email]
  });
}

// Update context menu based on stored email
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentEmail) {
    const email = changes.currentEmail.newValue?.email || 'No email';
    chrome.contextMenus.update('useExistingEmail', {
      title: `📋 ${email}`
    });
  }
});