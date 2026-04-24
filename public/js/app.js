// Global redirect function for SHOWBAY website
function redirectToShowbay() {
  console.log('Redirecting to https://showbay.io/');
  // Try the main URL first, if it redirects incorrectly, we can try alternatives
  window.open('https://showbay.io/', '_blank');
}

// Alternative redirect function with different URLs to try
function redirectToShowbayAlternative() {
  console.log('Trying alternative SHOWBAY URLs...');
  const urls = [
    'https://showbay.io/',
    'https://www.showbay.io/',
    'https://showbay.io/',
    'https://www.showbay.io/'
  ];
  
  // Try the first URL
  window.open(urls[0], '_blank');
}

// Make it globally accessible
window.redirectToShowbay = redirectToShowbay;

// ===== MAIN APP CONTROLLER =====
const App = {
  currentPage: 'dashboard',

  pages: {
    dashboard: { title: 'Dashboard', module: () => DashboardPage.render() },
    contacts:  { title: 'Contacts',  module: () => ContactsPage.render() },
    templates: { title: 'Templates', module: () => TemplatesPage.render() },
    campaigns: { title: 'Campaigns', module: () => CampaignsPage.render() },
    settings:  { title: 'Settings',  module: () => SettingsPage.render() }
  },

  async init() {
    // Load user info
    try {
      const me = await fetch('/auth/me').then(r => r.json());
      if (!me.loggedIn) { window.location.href = '/login'; return; }
      document.getElementById('userName').textContent = me.name;
      document.getElementById('userAvatar').textContent = me.name.charAt(0).toUpperCase();
    } catch {}

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.page);
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await fetch('/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    });

    // Add click handlers for buttons that should redirect to SHOWBAY
    function addShowbayRedirects() {
      // Add redirect to any buttons with specific classes or IDs
      const redirectButtons = document.querySelectorAll('[data-redirect="showbay"]');
      console.log('Found redirect buttons:', redirectButtons.length);
      redirectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          console.log('Button clicked, redirecting to showbay.io');
          e.preventDefault();
          e.stopPropagation();
          window.redirectToShowbay();
        });
      });
    }

    addShowbayRedirects();

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalOverlay')) this.closeModal();
    });

    // Route from hash
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(this.pages[hash] ? hash : 'dashboard');

    window.addEventListener('hashchange', () => {
      const page = window.location.hash.replace('#', '');
      if (this.pages[page] && page !== this.currentPage) this.navigate(page, false);
    });
  },

  navigate(page, updateHash = true) {
    if (!this.pages[page]) return;
    this.currentPage = page;

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update topbar
    document.getElementById('pageTitle').textContent = this.pages[page].title;

    // Update hash
    if (updateHash) window.location.hash = page;

    // Render page
    this.pages[page].module();
  },

  // ===== MODAL SYSTEM =====
  modal(title, body, onConfirm, confirmText = 'Confirm') {
    this.showModal(title, body + `
      <div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end;">
        <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="modalConfirmBtn" onclick="App.runModalConfirm()">${confirmText}</button>
      </div>`);
    this._modalConfirm = onConfirm;
  },

  runModalConfirm() {
    if (this._modalConfirm) this._modalConfirm();
  },

  showModal(title, body) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalOverlay').style.display = 'flex';
    this._modalConfirm = null;
  },

  closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
    this._modalConfirm = null;
  },

  // ===== TOAST SYSTEM =====
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `${icons[type] || ''} ${message}`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());
