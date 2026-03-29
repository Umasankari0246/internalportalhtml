// ===== SETTINGS PAGE =====
const SettingsPage = {
  async render() {
    document.getElementById('appContent').innerHTML = `<div class="loading"><div class="spinner"></div> Loading settings...</div>`;
    try {
      const settings = await API.get('/api/settings');
      document.getElementById('appContent').innerHTML = `
        <div class="page-header">
          <div>
            <h2>Settings</h2>
            <p>Configure SMTP email delivery and account settings</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 380px;gap:24px;">
          <div>
            <div class="card">
              <div class="card-title">SMTP Configuration</div>

              <div class="form-row">
                <div class="form-group">
                  <label>SMTP Host *</label>
                  <input type="text" id="st_host" value="${this.esc(settings.smtpHost || '')}" placeholder="smtp.gmail.com">
                </div>
                <div class="form-group">
                  <label>SMTP Port *</label>
                  <input type="number" id="st_port" value="${settings.smtpPort || 587}" placeholder="587">
                </div>
              </div>

              <div class="form-group">
                <label>Sender Name</label>
                <input type="text" id="st_senderName" value="${this.esc(settings.senderName || 'SHOWBAY Events')}" placeholder="SHOWBAY Events">
              </div>

              <div class="form-group">
                <label>Sender Email *</label>
                <input type="email" id="st_senderEmail" value="${this.esc(settings.senderEmail || '')}" placeholder="marketing@showbay.com">
              </div>

              <div class="form-group">
                <label>App Password *</label>
                <input type="password" id="st_password" value="${this.esc(settings.appPassword || '')}" placeholder="Enter 16-character app password">
                <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">
                  For Gmail: use an <strong>App Password</strong> (16 characters).
                  <a href="https://support.google.com/accounts/answer/185833" target="_blank" style="color:var(--primary-blue);">How to create →</a>
                </div>
              </div>

              <div style="display:flex;gap:10px;margin-top:8px;">
                <button class="btn btn-primary" onclick="SettingsPage.saveSettings()">💾 Save Settings</button>
                <button class="btn btn-outline" onclick="SettingsPage.testConnection()">🔌 Test Connection</button>
              </div>

              <div id="settingsResult" style="margin-top:16px;display:none;"></div>
            </div>

            <div class="card" style="margin-top:24px;">
              <div class="card-title">Password Management</div>
              
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="currentPassword" placeholder="Enter current password">
              </div>

              <div class="form-group">
                <label>New Password</label>
                <input type="password" id="newPassword" placeholder="Enter new password (min 6 characters)">
              </div>

              <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm new password">
              </div>

              <button class="btn btn-primary" onclick="SettingsPage.changePassword()">🔐 Change Password</button>
              <div id="passwordResult" style="margin-top:16px;display:none;"></div>
            </div>
          </div>

          <div>
            <div class="card">
              <div class="card-title">Quick Setup Guide</div>
              <div style="font-size:13px;line-height:1.9;color:var(--text-muted);">
                <div style="color:var(--primary-blue);font-weight:700;margin-bottom:10px;">📧 Gmail Setup</div>
                <ol style="padding-left:18px;line-height:2.2;">
                  <li>Host: <code style="background:rgba(79, 195, 247, 0.1);padding:1px 5px;">smtp.gmail.com</code></li>
                  <li>Port: <code style="background:rgba(79, 195, 247, 0.1);padding:1px 5px;">587</code></li>
                  <li>Enable 2-Step Verification</li>
                  <li>Create an App Password (16 characters)</li>
                  <li>Use App Password (not your Gmail password)</li>
                </ol>
                <hr>
                <div style="color:var(--primary-blue);font-weight:700;margin:10px 0;">📧 Outlook/Hotmail</div>
                <ol style="padding-left:18px;line-height:2.2;">
                  <li>Host: <code style="background:rgba(79, 195, 247, 0.1);padding:1px 5px;">smtp-mail.outlook.com</code></li>
                  <li>Port: <code style="background:rgba(79, 195, 247, 0.1);padding:1px 5px;">587</code></li>
                  <li>Use your Outlook password</li>
                </ol>
                <hr>
                <div style="color:var(--primary-blue);font-weight:700;margin:10px 0;">📧 Custom SMTP</div>
                <div>Use any SMTP server by entering its host and port. Check with your email provider for details.</div>
              </div>
            </div>

            <div class="card" style="margin-top:0;">
              <div class="card-title">Personalization Tags</div>
              <div style="font-size:12px;color:var(--text-muted);line-height:2;">
                Use these in your templates:
                <div style="margin-top:8px;">
                  <code style="background:rgba(79, 195, 247, 0.1);padding:2px 8px;display:block;margin-bottom:6px;color:var(--primary-blue);">{{name}}</code>
                  <code style="background:rgba(79, 195, 247, 0.1);padding:2px 8px;display:block;margin-bottom:6px;color:var(--primary-blue);">{{email}}</code>
                  <code style="background:rgba(79, 195, 247, 0.1);padding:2px 8px;display:block;color:var(--primary-blue);">{{company}}</code>
                </div>
                <div style="margin-top:10px;">These are automatically replaced with each contact's info during bulk send.</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      document.getElementById('appContent').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div>${err.message}</div></div>`;
    }
  },

  async saveSettings() {
    const data = {
      smtpHost: document.getElementById('st_host').value.trim(),
      smtpPort: document.getElementById('st_port').value,
      senderName: document.getElementById('st_senderName').value.trim(),
      senderEmail: document.getElementById('st_senderEmail').value.trim(),
      appPassword: document.getElementById('st_password').value
    };
    if (!data.smtpHost) return App.toast('SMTP Host is required', 'error');
    if (!data.senderEmail) return App.toast('Sender Email is required', 'error');

    // Only include password if it's not masked (user has changed it)
    if (data.appPassword && data.appPassword.includes('•')) {
      delete data.appPassword; // Don't send masked password
    }

    try {
      await API.post('/api/settings', data);
      App.toast('Settings saved!', 'success');
      // Reload settings to get updated state
      this.render();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resultEl = document.getElementById('passwordResult');

    if (!currentPassword || !newPassword || !confirmPassword) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="card" style="background:rgba(231,76,60,0.08);border-color:rgba(231,76,60,0.2);margin:0;padding:14px 18px;"><span style="color:var(--danger);font-weight:700;">❌ All password fields are required</span></div>`;
      return;
    }

    if (newPassword.length < 6) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="card" style="background:rgba(231,76,60,0.08);border-color:rgba(231,76,60,0.2);margin:0;padding:14px 18px;"><span style="color:var(--danger);font-weight:700;">❌ Password must be at least 6 characters</span></div>`;
      return;
    }

    if (newPassword !== confirmPassword) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="card" style="background:rgba(231,76,60,0.08);border-color:rgba(231,76,60,0.2);margin:0;padding:14px 18px;"><span style="color:var(--danger);font-weight:700;">❌ New passwords do not match</span></div>`;
      return;
    }

    try {
      await API.post('/api/settings/change-password', {
        currentPassword,
        newPassword
      });
      
      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="card" style="background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);margin:0;padding:14px 18px;"><span style="color:var(--success);font-weight:700;">✅ Password changed successfully</span></div>`;
      App.toast('Password changed successfully!', 'success');
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="card" style="background:rgba(231,76,60,0.08);border-color:rgba(231,76,60,0.2);margin:0;padding:14px 18px;"><span style="color:var(--danger);font-weight:700;">❌ ${err.message}</span></div>`;
    }
  },

  async testConnection() {
    const resultEl = document.getElementById('settingsResult');
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<div class="loading" style="padding:10px 0;"><div class="spinner"></div> Testing SMTP connection...</div>`;

    try {
      const res = await API.post('/api/settings/test', {});
      resultEl.innerHTML = `
        <div class="card" style="background:rgba(46,204,113,0.08);border-color:rgba(46,204,113,0.2);margin:0;padding:14px 18px;">
          <span style="color:var(--success);font-weight:700;">✅ ${res.message}</span>
        </div>`;
    } catch (err) {
      resultEl.innerHTML = `
        <div class="card" style="background:rgba(231,76,60,0.08);border-color:rgba(231,76,60,0.2);margin:0;padding:14px 18px;">
          <span style="color:var(--danger);font-weight:700;">❌ ${err.message}</span>
        </div>`;
    }
  },

  esc(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
};
