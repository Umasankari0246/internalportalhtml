// ===== CONTACTS PAGE =====
const ContactsPage = {
  currentPage: 1,
  searchTerm: '',
  selectedIds: new Set(),

  async render() {
    document.getElementById('appContent').innerHTML = `
      <div class="page-header">
        <div>
          <h2>Contacts</h2>
          <p>Manage your email list</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="ContactsPage.showUploadModal()">📤 Import CSV/Excel</button>
          <button class="btn btn-primary" onclick="ContactsPage.showAddModal()">➕ Add Contact</button>
        </div>
      </div>

      <div class="card">
        <div class="search-bar">
          <input type="text" id="contactSearch" placeholder="Search by name, email, or company..." value="${this.searchTerm}">
          <button class="btn btn-outline btn-sm" onclick="ContactsPage.search()">Search</button>
          <button class="btn btn-danger btn-sm" id="bulkDeleteBtn" style="display:none" onclick="ContactsPage.bulkDelete()">🗑 Delete Selected</button>
        </div>
        <div id="contactsTable"><div class="loading"><div class="spinner"></div> Loading...</div></div>
        <div id="contactsPagination"></div>
      </div>
    `;

    document.getElementById('contactSearch').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.search();
    });

    await this.loadContacts();
  },

  search() {
    this.searchTerm = document.getElementById('contactSearch').value;
    this.currentPage = 1;
    this.loadContacts();
  },

  async loadContacts() {
    try {
      const data = await API.get(`/api/contacts?search=${encodeURIComponent(this.searchTerm)}&page=${this.currentPage}&limit=20`);
      this.renderTable(data);
    } catch (err) {
      document.getElementById('contactsTable').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div>${err.message}</div></div>`;
    }
  },

  renderTable(data) {
    const { contacts, total, page, pages } = data;
    const wrap = document.getElementById('contactsTable');

    if (contacts.length === 0) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><div>No contacts found</div><p>Add contacts manually or import a CSV/Excel file.</p></div>`;
      document.getElementById('contactsPagination').innerHTML = '';
      return;
    }

    wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;text-transform:none;letter-spacing:0;font-size:12px;">
          <input type="checkbox" id="selectAll" onchange="ContactsPage.toggleSelectAll(this)"> 
          Select All
        </label>
        <span class="text-muted" style="font-size:12px;">${total} contact${total !== 1 ? 's' : ''} total</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th width="40"></th>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${contacts.map(c => `
              <tr>
                <td><input type="checkbox" class="row-check" value="${c._id}" ${this.selectedIds.has(c._id) ? 'checked' : ''} onchange="ContactsPage.toggleSelect('${c._id}', this.checked)"></td>
                <td><strong>${this.esc(c.name)}</strong></td>
                <td>${this.esc(c.email)}</td>
                <td>${this.esc(c.company) || '<span class="text-muted">—</span>'}</td>
                <td>${this.esc(c.phone) || '<span class="text-muted">—</span>'}</td>
                <td class="text-muted">${new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm" onclick="ContactsPage.showEditModal('${c._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="ContactsPage.deleteContact('${c._id}', '${this.esc(c.name)}')">Delete</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Pagination
    const pag = document.getElementById('contactsPagination');
    if (pages > 1) {
      let btns = '';
      for (let i = 1; i <= pages; i++) {
        btns += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="ContactsPage.goPage(${i})">${i}</button>`;
      }
      pag.innerHTML = `<div class="pagination">${btns}</div>`;
    } else {
      pag.innerHTML = '';
    }
  },

  goPage(p) { this.currentPage = p; this.loadContacts(); },

  toggleSelect(id, checked) {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.updateBulkBtn();
  },

  toggleSelectAll(el) {
    const checks = document.querySelectorAll('.row-check');
    checks.forEach(c => {
      c.checked = el.checked;
      if (el.checked) this.selectedIds.add(c.value);
      else this.selectedIds.delete(c.value);
    });
    this.updateBulkBtn();
  },

  updateBulkBtn() {
    const btn = document.getElementById('bulkDeleteBtn');
    if (btn) btn.style.display = this.selectedIds.size > 0 ? 'inline-flex' : 'none';
  },

  async bulkDelete() {
    if (!confirm(`Delete ${this.selectedIds.size} selected contact(s)?`)) return;
    try {
      await API.post('/api/contacts/delete-many', { ids: [...this.selectedIds] });
      this.selectedIds.clear();
      App.toast('Contacts deleted', 'success');
      this.loadContacts();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  showAddModal() {
    App.modal('Add Contact', this.contactForm(null), async () => {
      const data = this.getFormData();
      try {
        await API.post('/api/contacts', data);
        App.closeModal();
        App.toast('Contact added!', 'success');
        this.loadContacts();
      } catch (err) {
        App.toast(err.message, 'error');
      }
    }, 'Save Contact');
  },

  async showEditModal(id) {
    try {
      const c = await API.get(`/api/contacts/${id}`);
      App.modal('Edit Contact', this.contactForm(c), async () => {
        const data = this.getFormData();
        try {
          await API.put(`/api/contacts/${id}`, data);
          App.closeModal();
          App.toast('Contact updated!', 'success');
          this.loadContacts();
        } catch (err) {
          App.toast(err.message, 'error');
        }
      }, 'Save Changes');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  contactForm(c) {
    return `
      <div class="form-row">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="cf_name" value="${c ? this.esc(c.name) : ''}" placeholder="John Doe" required>
        </div>
        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="cf_email" value="${c ? this.esc(c.email) : ''}" placeholder="john@example.com" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Company</label>
          <input type="text" id="cf_company" value="${c ? this.esc(c.company) : ''}" placeholder="ACME Corp">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="cf_phone" value="${c ? this.esc(c.phone) : ''}" placeholder="+1 555 000 0000">
        </div>
      </div>`;
  },

  getFormData() {
    return {
      name: document.getElementById('cf_name').value.trim(),
      email: document.getElementById('cf_email').value.trim(),
      company: document.getElementById('cf_company').value.trim(),
      phone: document.getElementById('cf_phone').value.trim()
    };
  },

  async deleteContact(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/api/contacts/${id}`);
      App.toast('Contact deleted', 'success');
      this.loadContacts();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  showUploadModal() {
    App.showModal('Import Contacts', `
      <p class="text-muted" style="font-size:13px;margin-bottom:20px;">
        Upload a <strong>CSV</strong> or <strong>Excel (.xlsx)</strong> file. 
        Required columns: <strong>name</strong>, <strong>email</strong>. Optional: company, phone.
      </p>
      <div class="upload-zone" id="uploadZone" onclick="document.getElementById('csvFile').click()">
        <div style="font-size:32px;margin-bottom:10px;">📂</div>
        <div style="font-weight:700;margin-bottom:6px;">Click to choose file</div>
        <div style="font-size:12px;">CSV or Excel files only</div>
        <input type="file" id="csvFile" accept=".csv,.xlsx,.xls" onchange="ContactsPage.handleFileSelect(this)">
      </div>
      <div id="uploadStatus" style="margin-top:16px;display:none;"></div>
      <div style="margin-top:16px;">
        <a href="#" onclick="ContactsPage.downloadTemplate();return false;" style="color:var(--gold);font-size:12px;">⬇️ Download CSV Template</a>
      </div>
    `);
    // Drag and drop
    const zone = document.getElementById('uploadZone');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.uploadFile(file);
    });
  },

  handleFileSelect(input) {
    if (input.files[0]) this.uploadFile(input.files[0]);
  },

  async uploadFile(file) {
    const status = document.getElementById('uploadStatus');
    status.style.display = 'block';
    status.innerHTML = `<div class="loading"><div class="spinner"></div> Uploading ${file.name}...</div>`;

    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await API.postForm('/api/contacts/upload', fd);
      status.innerHTML = `
        <div class="card" style="background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);margin:0;">
          <div style="color:var(--success);font-weight:700;margin-bottom:8px;">✅ Import Complete</div>
          <div style="font-size:13px;">
            <span class="text-success">✓ ${res.imported} imported</span> &nbsp;
            <span class="text-muted">/ ${res.skipped} skipped</span>
          </div>
          ${res.errors.length ? `<div style="font-size:11px;margin-top:8px;color:var(--danger)">Issues: ${res.errors.slice(0,5).join(', ')}</div>` : ''}
        </div>`;
      this.loadContacts();
    } catch (err) {
      status.innerHTML = `<div style="color:var(--danger)">❌ ${err.message}</div>`;
    }
  },

  downloadTemplate() {
    const csv = 'name,email,company,phone\nJohn Doe,john@example.com,ACME Corp,+1555000000\nJane Smith,jane@example.com,Tech Ltd,+1555111111';
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contacts_template.csv';
    a.click();
  },

  esc(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
};
