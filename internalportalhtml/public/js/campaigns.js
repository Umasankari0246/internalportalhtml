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
        const map = { sent: 'success', sending: 'warning', failed: 'danger', draft: 'muted', scheduled: 'info' };
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
                    <td>${(c.templateId && c.templateId.name) || '<span class="text-muted">—</span>'}</td>
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
      `<option value="${t._id}" ${(c && c.templateId && c.templateId._id === t._id) || (c && c.templateId === t._id) ? 'selected' : ''}>${this.esc(t.name)}</option>`
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
        <input type="text" id="cf_name" value="${this.esc((c && c.name) || '')}" placeholder="Summer Gala 2024">
      </div>
      <div class="form-group">
        <label>Subject Line *</label>
        <input type="text" id="cf_subject" value="${this.esc((c && c.subject) || '')}" placeholder="You're Invited — SHOWBAY Summer Gala">
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
      name: (document.getElementById('cf_name') && document.getElementById('cf_name').value.trim()) || '',
      subject: (document.getElementById('cf_subject') && document.getElementById('cf_subject').value.trim()) || '',
      templateId: (document.getElementById('cf_template') && document.getElementById('cf_template').value) || '',
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
          <div><strong>Template:</strong> ${(c.templateId && c.templateId.name) || 'N/A'}</div>
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

      <div class="form-group">
        <label>CC (Carbon Copy) - Optional</label>
        <input type="text" id="ccInput" placeholder="email1@example.com, email2@example.com" style="width:100%;">
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Comma-separated email addresses that will receive a copy.</div>
      </div>

      <div class="form-group">
        <label>BCC (Blind Carbon Copy) - Optional</label>
        <input type="text" id="bccInput" placeholder="email1@example.com, email2@example.com" style="width:100%;">
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Comma-separated email addresses that will receive a hidden copy.</div>
      </div>

      <div class="form-group">
        <label>Send Options</label>
        <div style="display:flex;align-items:center;gap:15px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="radio" name="sendOption" value="now" checked onchange="CampaignsPage.toggleScheduleOptions()"> Send Immediately
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="radio" name="sendOption" value="schedule" onchange="CampaignsPage.toggleScheduleOptions()"> Schedule for Later
          </label>
        </div>
        <div id="scheduleOptions" style="display:none;margin-top:10px;">
          <input type="datetime-local" id="scheduleTime" style="width:100%;">
          <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">Choose date and time to send campaign.</div>
        </div>
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

    // Set minimum datetime to current time
    const scheduleInput = document.getElementById('scheduleTime');
    if (scheduleInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      scheduleInput.min = now.toISOString().slice(0, 16);
    }
  },

  toggleScheduleOptions() {
    const scheduleOption = document.querySelector('input[name="sendOption"]:checked').value;
    const scheduleOptions = document.getElementById('scheduleOptions');
    const sendBtn = document.getElementById('sendBulkBtn');
    
    if (scheduleOption === 'schedule') {
      scheduleOptions.style.display = 'block';
      sendBtn.textContent = '⏰ Schedule Campaign';
    } else {
      scheduleOptions.style.display = 'none';
      const c = document.querySelector('[onclick*="sendBulk"]');
      const totalContacts = c ? ((c.getAttribute('onclick').match(/All (\d+)/) || [])[1] || '0') : '0';
      sendBtn.textContent = `🚀 Send to All ${totalContacts} Contact${totalContacts !== '1' ? 's' : ''}`;
    }
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
    const scheduleOption = document.querySelector('input[name="sendOption"]:checked').value;
    const isSchedule = scheduleOption === 'schedule';
    const confirmMessage = isSchedule 
      ? 'Schedule this campaign for the selected time?' 
      : 'Send emails to ALL selected contacts? This cannot be undone.';
    
    if (!confirm(confirmMessage)) return;
    
    const btn = document.getElementById('sendBulkBtn');
    const resultEl = document.getElementById('sendResult');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> ' + (isSchedule ? 'Scheduling...' : 'Sending...');
    resultEl.style.display = 'none';

    try {
      // Get CC/BCC values
      const cc = (document.getElementById('ccInput') && document.getElementById('ccInput').value.trim()) || '';
      const bcc = (document.getElementById('bccInput') && document.getElementById('bccInput').value.trim()) || '';
      
      // Get schedule time if scheduling
      let scheduleTime = null;
      if (isSchedule) {
        scheduleTime = (document.getElementById('scheduleTime') && document.getElementById('scheduleTime').value) || null;
        if (!scheduleTime) {
          throw new Error('Please select a schedule time');
        }
      }
      
      const res = await API.post(`/api/campaigns/${id}/send`, { cc, bcc, scheduleTime });
      resultEl.style.display = 'block';
      
      if (isSchedule) {
        resultEl.innerHTML = `
          <div class="card" style="background:rgba(52,152,219,0.08);border-color:rgba(52,152,219,0.2);margin:0;">
            <div style="font-weight:700;color:var(--info);margin-bottom:8px;">⏰ Campaign Scheduled!</div>
            <div style="font-size:13px;">
              Campaign scheduled for: <strong>${new Date(scheduleTime).toLocaleString()}</strong>
              ${cc ? `<br><span class="text-info">📋 CC: ${cc}</span>` : ''}
              ${bcc ? `<br><span class="text-info">👁 BCC: ${bcc}</span>` : ''}
            </div>
          </div>`;
        btn.textContent = '✅ Scheduled';
      } else {
        resultEl.innerHTML = `
          <div class="card" style="background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);margin:0;">
            <div style="font-weight:700;color:var(--success);margin-bottom:8px;">✅ Campaign Sent!</div>
            <div style="font-size:13px;">
              <span class="text-success">✓ ${res.sent} delivered</span>
              ${res.failed > 0 ? `&nbsp; <span class="text-danger">✗ ${res.failed} failed</span>` : ''}
              ${cc ? `<br><span class="text-info">📋 CC: ${cc}</span>` : ''}
              ${bcc ? `<br><span class="text-info">👁 BCC: ${bcc}</span>` : ''}
            </div>
            ${(res.errors && res.errors.length) ? `<div style="font-size:11px;color:var(--danger);margin-top:8px;">${res.errors.slice(0,3).join('<br>')}</div>` : ''}
          </div>`;
        btn.textContent = '✅ Sent';
      }
      
      this.loadCampaigns();
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div style="color:var(--danger);font-size:13px;">❌ ${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = isSchedule ? '⏰ Retry Schedule' : '🚀 Retry Send';
    }
  },

  async showDetailsModal(id) {
    try {
      const c = await API.get(`/api/campaigns/${id}`);
      const statusBadge = s => {
        const map = { sent: 'success', failed: 'danger', sending: 'warning', draft: 'muted', scheduled: 'info' };
        return `<span class="badge badge-${map[s] || 'muted'}">${s}</span>`;
      };
      App.showModal(`Campaign Details: ${c.name}`, `
        <div style="font-size:13px;line-height:2.2;">
          <div><strong>Name:</strong> ${this.esc(c.name)}</div>
          <div><strong>Subject:</strong> ${this.esc(c.subject)}</div>
          <div><strong>Template:</strong> ${(c.templateId && c.templateId.name) || 'N/A'}</div>
          <div><strong>Status:</strong> ${statusBadge(c.status)}</div>
          <div><strong>Total Contacts:</strong> ${c.totalContacts}</div>
          <div><strong>Sent:</strong> <span class="text-success">${c.sentCount}</span></div>
          <div><strong>Failed:</strong> <span class="text-danger">${c.failedCount}</span></div>
          ${c.cc ? `<div><strong>CC:</strong> <span class="text-info">${this.esc(c.cc)}</span></div>` : ''}
          ${c.bcc ? `<div><strong>BCC:</strong> <span class="text-info">${this.esc(c.bcc)}</span></div>` : ''}
          ${c.scheduledAt ? `<div><strong>Scheduled For:</strong> <span class="text-info">${new Date(c.scheduledAt).toLocaleString()}</span></div>` : ''}
          ${c.sentAt ? `<div><strong>Sent At:</strong> ${new Date(c.sentAt).toLocaleString()}</div>` : ''}
          <div><strong>Created:</strong> ${new Date(c.createdAt).toLocaleString()}</div>
        </div>
        ${(c.errors && c.errors.length) ? `
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
