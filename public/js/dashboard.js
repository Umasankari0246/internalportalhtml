// ===== DASHBOARD PAGE =====
const DashboardPage = {
  async render() {
    document.getElementById('appContent').innerHTML = `<div class="loading"><div class="spinner"></div> Loading dashboard...</div>`;
    try {
      const data = await API.get('/api/dashboard');
      const { stats, recentCampaigns } = data;

      const statusBadge = (s) => {
        const map = { sent: 'success', sending: 'warning', failed: 'danger', draft: 'muted', scheduled: 'info' };
        return `<span class="badge badge-${map[s] || 'muted'}">${s}</span>`;
      };

      document.getElementById('appContent').innerHTML = `
        <div class="page-header">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back — here's your marketing overview</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Contacts</div>
            <div class="stat-value">${stats.contacts.toLocaleString()}</div>
            <div class="stat-icon">👥</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Templates</div>
            <div class="stat-value">${stats.templates}</div>
            <div class="stat-icon">🎨</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Campaigns</div>
            <div class="stat-value">${stats.campaigns}</div>
            <div class="stat-icon">📢</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Emails Sent</div>
            <div class="stat-value">${stats.emailsSent.toLocaleString()}</div>
            <div class="stat-icon">✉️</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Recent Campaigns
            <button class="btn btn-outline btn-sm" onclick="App.navigate('campaigns')">View All</button>
          </div>
          ${recentCampaigns.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📢</div>
              <div>No campaigns yet</div>
              <p>Create your first campaign to start sending emails.</p>
            </div>` : `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${recentCampaigns.map(c => `
                  <tr>
                    <td><strong>${c.name}</strong><br><span class="text-muted" style="font-size:11px">${c.subject || 'No subject'}</span></td>
                    <td>${c.templateId?.name || '<span class="text-muted">N/A</span>'}</td>
                    <td>${statusBadge(c.status)}</td>
                    <td class="text-success">${c.sentCount}</td>
                    <td class="${c.failedCount > 0 ? 'text-danger' : 'text-muted'}">${c.failedCount}</td>
                    <td class="text-muted">
                      ${c.scheduledAt && c.status === 'scheduled' 
                        ? `Scheduled: ${new Date(c.scheduledAt).toLocaleDateString()}` 
                        : new Date(c.createdAt).toLocaleDateString()
                      }
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`}
        </div>

        <div class="card">
          <div class="card-title">Quick Actions</div>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="App.navigate('contacts')">➕ Add Contacts</button>
            <button class="btn btn-outline" onclick="App.navigate('templates')">🎨 Create Template</button>
            <button class="btn btn-outline" onclick="App.navigate('campaigns')">📢 New Campaign</button>
            <button class="btn btn-outline" onclick="App.navigate('settings')">⚙️ Configure SMTP</button>
          </div>
        </div>
      `;
    } catch (err) {
      document.getElementById('appContent').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div>${err.message}</div></div>`;
    }
  }
};
