// ===== CAMPAIGNS PAGE =====
const CampaignsPage = {
  templates: [],
  contacts: [],
  selectedContacts: new Set(),

  async render() {
    document.getElementById('appContent').innerHTML = `
      <div class="page-header">
        <div>
          <h2>Campaigns</h2>
          <p>Create and send email campaigns</p>
        </div>
        <button class="btn btn-primary" onclick="CampaignsPage.showCreateModal()">➕ New Campaign</button>
      </div>
      <div id="campaignList"><div class="loading"><div class="spinner"></div> Loading...</div></div>
    `;
    await this.loadCampaigns();
  },

  async loadCampaigns() {
    try {
      const campaigns = await API.get('/api/campaigns');
      const wrap = document.getElementById('campaignList');

      if (!campaigns.length) {
        wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">📢</div><div>No campaigns yet</div><p>Click "New Campaign" to create your first email campaign.</p></div>`;
        return;
      }

      const statusBadge = s => {
        const map = { sent: 'success', sending: 'warning', failed: 'danger', draft: 'muted' };
        return `<span class="badge badge-${map[s] || 'muted'}">${s}</span>`;
      };

      wrap.innerHTML = `
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Subject</th>
                  <th>Template</th>
                  <th>Contacts</th>
                  <th>Status</th>
                  <th>Sent / Failed</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${campaigns.map(c => `
                  <tr>
                    <td><strong>${this.esc(c.name)}</strong></td>
                    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this.esc(c.subject)}</td>
                    <td>${c.templateId?.name || '<span class="text-muted">—</span>'}</td>
                    <td>${c.totalContacts}</td>
                    <td>${statusBadge(c.status)}</td>
                    <td>
                      <span class="text-success">${c.sentCount}</span>
                      ${c.failedCount > 0 ? `<span class="text-muted"> / </span><span class="text-danger">${c.failedCount}</span>` : ''}
                    </td>
                    <td class="text-muted">${new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${c.status === 'draft' ? `
                          <button class="btn btn-outline btn-sm" onclick="CampaignsPage.showSendModal('${c._id}')">✉ Send</button>
                          <button class="btn btn-outline btn-sm" onclick="CampaignsPage.showEditModal('${c._id}')">Edit</button>
                        ` : `
                          <button class="btn btn-outline btn-sm" onclick="CampaignsPage.showDetailsModal('${c._id}')">Details</button>
                        `}
                        <button class="btn btn-danger btn-sm" onclick="CampaignsPage.deleteCampaign('${c._id}', '${this.esc(c.name)}')">🗑</button>
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    } catch (err) {
      document.getElementById('campaignList').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div>${err.message}</div></div>`;
    }
  },

  async loadFormData() {
    [this.templates, this.contacts] = await Promise.all([
      API.get('/api/templates'),
      API.get('/api/contacts?limit=1000').then(r => r.contacts)
    ]);
  },

  async showCreateModal() {
    try {
      await this.loadFormData();
      this.selectedContacts = new Set();
      App.modal('New Campaign', this.campaignForm(null), async () => {
        const data = this.getFormData();
        if (!data.name) return App.toast('Campaign name is required', 'error');
        if (!data.subject) return App.toast('Subject is required', 'error');
        if (!data.templateId) return App.toast('Please select a template', 'error');
        try {
          await API.post('/api/campaigns', data);
          App.closeModal();
          App.toast('Campaign created!', 'success');
          this.loadCampaigns();
        } catch (err) {
          App.toast(err.message, 'error');
        }
      }, 'Create Campaign');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async showEditModal(id) {
    try {
      await this.loadFormData();
      const c = await API.get(`/api/campaigns/${id}`);
      this.selectedContacts = new Set((c.contacts || []).map(x => x._id || x));
      App.modal('Edit Campaign', this.campaignForm(c), async () => {
        const data = this.getFormData();
        try {
          await API.put(`/api/campaigns/${id}`, data);
          App.closeModal();
          App.toast('Campaign updated!', 'success');
          this.loadCampaigns();
        } catch (err) {
          App.toast(err.message, 'error');
        }
      }, 'Save Changes');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  campaignForm(c) {
    const templateOptions = this.templates.map(t =>
      `<option value="${t._id}" ${c?.templateId?._id === t._id || c?.templateId === t._id ? 'selected' : ''}>${this.esc(t.name)}</option>`
    ).join('');

    const contactList = this.contacts.map(ct => {
      const checked = this.selectedContacts.has(ct._id);
      return `
        <div class="contact-select-item">
          <input type="checkbox" class="camp-contact-check" value="${ct._id}" ${checked ? 'checked' : ''} 
            onchange="CampaignsPage.toggleContact('${ct._id}', this.checked)">
          <div>
            <div style="font-size:13px;font-weight:700;">${this.esc(ct.name)}</div>
            <div style="font-size:11px;color:var(--text-muted);">${this.esc(ct.email)}${ct.company ? ' · ' + this.esc(ct.company) : ''}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="form-group">
        <label>Campaign Name *</label>
        <input type="text" id="cf_name" value="${this.esc(c?.name || '')}" placeholder="Summer Gala 2024">
      </div>
      <div class="form-group">
        <label>Subject Line *</label>
        <input type="text" id="cf_subject" value="${this.esc(c?.subject || '')}" placeholder="You're Invited — SHOWBAY Summer Gala">
      </div>
      <div class="form-group">
        <label>Email Template *</label>
        <select id="cf_template">
          <option value="">— Select a template —</option>
          ${templateOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Select Contacts</label>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;text-transform:none;letter-spacing:0;font-size:12px;">
            <input type="checkbox" onchange="CampaignsPage.toggleAllContacts(this)"> Select All (${this.contacts.length})
          </label>
          <span class="text-muted" style="font-size:12px;" id="selectedCount">${this.selectedContacts.size} selected</span>
        </div>
        ${this.contacts.length === 0 
          ? `<div class="empty-state" style="padding:20px;"><div>No contacts found.</div><p>Add contacts first.</p></div>`
          : `<div class="contact-select-list">${contactList}</div>`}
      </div>`;
  },

  getFormData() {
    return {
      name: document.getElementById('cf_name')?.value.trim(),
      subject: document.getElementById('cf_subject')?.value.trim(),
      templateId: document.getElementById('cf_template')?.value,
      contactIds: [...this.selectedContacts]
    };
  },

  toggleContact(id, checked) {
    if (checked) this.selectedContacts.add(id);
    else this.selectedContacts.delete(id);
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = `${this.selectedContacts.size} selected`;
  },

  toggleAllContacts(el) {
    document.querySelectorAll('.camp-contact-check').forEach(c => {
      c.checked = el.checked;
      this.toggleContact(c.value, el.checked);
    });
  },

  async showSendModal(id) {
    const c = await API.get(`/api/campaigns/${id}`);
    App.showModal(`Send Campaign: ${c.name}`, `
      <div class="card" style="background:rgba(232,197,71,0.05);border-color:rgba(232,197,71,0.15);margin:0 0 20px;">
        <div style="font-size:13px;line-height:2;">
          <div><strong>Subject:</strong> ${this.esc(c.subject)}</div>
          <div><strong>Template:</strong> ${c.templateId?.name || 'N/A'}</div>
          <div><strong>Recipients:</strong> ${c.totalContacts} contacts</div>
        </div>
      </div>

      <div class="form-group">
        <label>Test Email (optional)</label>
        <div style="display:flex;gap:8px;">
          <input type="email" id="testEmailInput" placeholder="you@example.com">
          <button class="btn btn-outline" style="white-space:nowrap;" onclick="CampaignsPage.sendTest('${id}')">Send Test</button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Send a test email to verify before bulk sending.</div>
      </div>

      <hr>

      <div id="sendResult" style="margin-bottom:16px;display:none;"></div>

      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" id="sendBulkBtn" onclick="CampaignsPage.sendBulk('${id}')">
          🚀 Send to All ${c.totalContacts} Contact${c.totalContacts !== 1 ? 's' : ''}
        </button>
        <button class="btn btn-outline" onclick="App.closeModal()">Cancel</button>
      </div>
    `);
  },

  async sendTest(id) {
    const email = document.getElementById('testEmailInput').value.trim();
    if (!email) return App.toast('Enter a test email address', 'error');
    try {
      const res = await API.post(`/api/campaigns/${id}/test`, { testEmail: email });
      App.toast(res.message || 'Test email sent!', 'success');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async sendBulk(id) {
    if (!confirm('Send emails to ALL selected contacts? This cannot be undone.')) return;
    const btn = document.getElementById('sendBulkBtn');
    const resultEl = document.getElementById('sendResult');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> Sending...';
    resultEl.style.display = 'none';

    try {
      const res = await API.post(`/api/campaigns/${id}/send`, {});
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="card" style="background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);margin:0;">
          <div style="font-weight:700;color:var(--success);margin-bottom:8px;">✅ Campaign Sent!</div>
          <div style="font-size:13px;">
            <span class="text-success">✓ ${res.sent} delivered</span>
            ${res.failed > 0 ? `&nbsp; <span class="text-danger">✗ ${res.failed} failed</span>` : ''}
          </div>
          ${res.errors?.length ? `<div style="font-size:11px;color:var(--danger);margin-top:8px;">${res.errors.slice(0,3).join('<br>')}</div>` : ''}
        </div>`;
      btn.textContent = '✅ Sent';
      this.loadCampaigns();
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div style="color:var(--danger);font-size:13px;">❌ ${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = '🚀 Retry Send';
    }
  },

  async showDetailsModal(id) {
    try {
      const c = await API.get(`/api/campaigns/${id}`);
      const statusBadge = s => {
        const map = { sent: 'success', failed: 'danger', sending: 'warning', draft: 'muted' };
        return `<span class="badge badge-${map[s] || 'muted'}">${s}</span>`;
      };
      App.showModal(`Campaign Details: ${c.name}`, `
        <div style="font-size:13px;line-height:2.2;">
          <div><strong>Name:</strong> ${this.esc(c.name)}</div>
          <div><strong>Subject:</strong> ${this.esc(c.subject)}</div>
          <div><strong>Template:</strong> ${c.templateId?.name || 'N/A'}</div>
          <div><strong>Status:</strong> ${statusBadge(c.status)}</div>
          <div><strong>Total Contacts:</strong> ${c.totalContacts}</div>
          <div><strong>Sent:</strong> <span class="text-success">${c.sentCount}</span></div>
          <div><strong>Failed:</strong> <span class="text-danger">${c.failedCount}</span></div>
          ${c.sentAt ? `<div><strong>Sent At:</strong> ${new Date(c.sentAt).toLocaleString()}</div>` : ''}
          <div><strong>Created:</strong> ${new Date(c.createdAt).toLocaleString()}</div>
        </div>
        ${c.errors?.length ? `
          <hr>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Failed Deliveries</div>
          <div style="font-size:12px;color:var(--danger);max-height:120px;overflow-y:auto;">${c.errors.join('<br>')}</div>` : ''}
      `);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async deleteCampaign(id, name) {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await API.delete(`/api/campaigns/${id}`);
      App.toast('Campaign deleted', 'success');
      this.loadCampaigns();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  esc(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
};
