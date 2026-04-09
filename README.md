# 🔒 Temporary Email Inserter

A Chrome extension that instantly generates disposable email addresses and inserts them into sign-up forms with a simple right-click. Protect your real email from spam, tracking, and data breaches.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![API: Mail.tm](https://img.shields.io/badge/API-Mail.tm-orange)](https://mail.tm)

![Extension Preview](screenshots/preview.png)

## ✨ Features

- **⚡ Instant Generation** - Right-click any email field to insert a temporary address
- **🛡️ Privacy First** - Keep your real email hidden from websites
- **📬 Built-in Inbox** - Read verification emails without leaving the page
- **🔄 Auto-Refresh** - Inbox checks for new messages every 10 seconds
- **📱 Popup Dashboard** - Manage emails, view messages, copy addresses
- **🎯 Verification Support** - Click verification links and copy codes easily
- **💾 Email History** - Reuse existing emails across multiple sites
- **🆓 Completely Free** - Uses free Mail.tm API (no API key needed)

## 🚀 Installation

### From Source (Developer Mode)

1. Download or clone this repository
   ```bash
   git clone https://github.com/yourusername/temporary-email-inserter.git
2. Open Chrome and navigate to chrome://extensions/
3. Enable Developer mode (toggle in top-right corner)
4. Click Load unpacked
5. Select the temporary-email-inserter folder
6. The extension icon will appear in your toolbar 🎉
Chrome Web Store (Coming Soon)
   Pending review - link will be added here
📖 How to Use
Method 1: Right-Click (Fastest)
1. Click on any email input field on a website
2. Right-click → Insert Temporary Email
3. Choose Generate New Email or Use Existing Email
4. Done! Email is inserted and ready
Method 2: Extension Popup
1. Click the 🛡️ icon in your Chrome toolbar
2. Click Generate Email
3. Copy the address with one click
4. Paste manually or use auto-insert
Reading Verification Emails
1. Click the extension icon
2. Click 📬 Check Inbox
3. Wait for emails (auto-refreshes every 10s)
4. Click View Full Message to see verification codes or links
5. Click links directly or copy codes
   Here's a complete README.md and GitHub repository description for your Temporary Email Inserter extension:
README.md
Markdown
Copy
Code
Preview
# 🔒 Temporary Email Inserter

A Chrome extension that instantly generates disposable email addresses and inserts them into sign-up forms with a simple right-click. Protect your real email from spam, tracking, and data breaches.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![API: Mail.tm](https://img.shields.io/badge/API-Mail.tm-orange)](https://mail.tm)

![Extension Preview](screenshots/preview.png)

## ✨ Features

- **⚡ Instant Generation** - Right-click any email field to insert a temporary address
- **🛡️ Privacy First** - Keep your real email hidden from websites
- **📬 Built-in Inbox** - Read verification emails without leaving the page
- **🔄 Auto-Refresh** - Inbox checks for new messages every 10 seconds
- **📱 Popup Dashboard** - Manage emails, view messages, copy addresses
- **🎯 Verification Support** - Click verification links and copy codes easily
- **💾 Email History** - Reuse existing emails across multiple sites
- **🆓 Completely Free** - Uses free Mail.tm API (no API key needed)

## 🚀 Installation

### From Source (Developer Mode)

1. Download or clone this repository
   ```bash
   git clone https://github.com/yourusername/temporary-email-inserter.git
2. Open Chrome and navigate to chrome://extensions/
3. Enable Developer mode (toggle in top-right corner)
4. Click Load unpacked
5. Select the temporary-email-inserter folder
The extension icon will appear in your toolbar 🎉

Chrome Web Store (Coming Soon)
Pending review - link will be added here

📖 How to Use
Method 1: Right-Click (Fastest)
Click on any email input field on a website
Right-click → Insert Temporary Email
Choose Generate New Email or Use Existing Email
Done! Email is inserted and ready

Method 2: Extension Popup
Click the 🛡️ icon in your Chrome toolbar
Click Generate Email
Copy the address with one click
Paste manually or use auto-insert

Reading Verification Emails
Click the extension icon
Click 📬 Check Inbox
Wait for emails (auto-refreshes every 10s)
Click View Full Message to see verification codes or links
Click links directly or copy codes

🏗️ Project Structure
temporary-email-inserter/
├── manifest.json          # Extension configuration
├── background.js          # Service worker & context menus
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic & API calls
├── popup.css             # Styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md

🔧 Technical Details
APIs Used
Mail.tm - Free temporary email service
Real email addresses (not fake)
24-hour lifespan
RESTful JSON API
No authentication required for signup

Permissions
| Permission     | Purpose                        |
| -------------- | ------------------------------ |
| `contextMenus` | Right-click menu integration   |
| `activeTab`    | Insert email into current page |
| `scripting`    | Modify input field values      |
| `storage`      | Save email history locally     |

Privacy
✅ No data collection - All emails stored locally in your browser
✅ No tracking - No analytics or telemetry
✅ Open source - Full transparency
✅ Temporary by design - Emails auto-delete after 24 hours

🛠️ Development
Local Setup
# Clone the repository
git clone https://github.com/yourusername/temporary-email-inserter.git

# Navigate to directory
cd temporary-email-inserter

# Load in Chrome (see Installation section)

Making Changes
1. Edit files in your code editor
2. Changes reflect immediately in Chrome (reload extension if needed)
3. Test on various websites with email forms

Building for Production
# Zip the extension for Chrome Web Store
zip -r temporary-email-inserter.zip temporary-email-inserter/ -x "*.git*" "*.DS_Store"

🤝 Contributing
Contributions welcome! Here's how:
1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

Ideas for Contributions
[ ] Add more temp email providers (Guerrilla Mail, TempMail, etc.)
[ ] Custom domain selection
[ ] Email forwarding notifications
[ ] Dark mode for popup
[ ] Keyboard shortcuts
[ ] Firefox/Edge support

📝 License
MIT License - see LICENSE file for details.

🙏 Acknowledgments
Mail.tm for providing the free API
Chrome Extensions documentation and community

⚠️ Disclaimer
Temporary emails are for privacy protection and testing only. Do not use for:
1. Banking or financial services
2. Government or legal communications
3. Important personal accounts you need to keep
4. Any service requiring long-term access
Use responsibly. The extension and Mail.tm are not responsible for lost access to accounts created with temporary emails.

Made with 🔒 for privacy-conscious internet users
