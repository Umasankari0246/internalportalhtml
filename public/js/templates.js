// ===== TEMPLATES PAGE =====
const TemplatesPage = {
  activeTab: 'list',

  async render() {
    document.getElementById('appContent').innerHTML = `
      <div class="page-header">
        <div>
          <h2>Templates</h2>
          <p>Create and manage your email templates</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="TemplatesPage.showTab('upload')">📤 Upload HTML</button>
          <button class="btn btn-outline" onclick="TemplatesPage.showTab('builder')">✏️ Template Builder</button>
          <button class="btn btn-primary" onclick="TemplatesPage.showTab('visual')">🎨 Visual Editor</button>
        </div>
      </div>

      <div class="tabs">
        <div class="tab active" id="tab-list" onclick="TemplatesPage.showTab('list')">All Templates</div>
        <div class="tab" id="tab-builder" onclick="TemplatesPage.showTab('builder')">Builder</div>
        <div class="tab" id="tab-visual" onclick="TemplatesPage.showTab('visual')">Visual Editor</div>
        <div class="tab" id="tab-upload" onclick="TemplatesPage.showTab('upload')">Upload HTML</div>
      </div>

      <div id="templateContent"></div>
    `;
    this.showTab('list');
  },

  showTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.classList.add('active');

    if (tab === 'list') this.renderList();
    else if (tab === 'builder') this.renderBuilder(null);
    else if (tab === 'visual') this.renderVisualEditor();
    else if (tab === 'upload') this.renderUpload();
  },

  async renderList() {
    const wrap = document.getElementById('templateContent');
    wrap.innerHTML = `<div class="loading"><div class="spinner"></div> Loading templates...</div>`;
    try {
      const templates = await API.get('/api/templates');
      if (!templates.length) {
        wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">🎨</div><div>No templates yet</div><p>Use the Builder or Upload tab to create your first template.</p></div>`;
        return;
      }
      wrap.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
          ${templates.map(t => `
            <div class="card" style="margin:0;cursor:default;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
                <div>
                  <div style="font-weight:700;font-size:14px;color:var(--text);">${this.esc(t.name)}</div>
                  <div style="font-size:10px;letter-spacing:1px;color:var(--text-muted);margin-top:4px;text-transform:uppercase;">${t.type === 'builder' ? '✏️ Builder' : '📤 Uploaded'}</div>
                </div>
                <span class="badge ${t.type === 'builder' ? 'badge-info' : 'badge-warning'}">${t.type}</span>
              </div>
              ${t.title ? `<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">${this.esc(t.title)}</div>` : ''}
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:16px;">Created ${new Date(t.createdAt).toLocaleDateString()}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-outline btn-sm" onclick="TemplatesPage.previewTemplate('${t._id}')">👁 Preview</button>
                ${t.type === 'builder' ? `<button class="btn btn-outline btn-sm" onclick="TemplatesPage.editBuilder('${t._id}')">✏️ Edit</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="TemplatesPage.deleteTemplate('${t._id}', '${this.esc(t.name)}')">🗑</button>
              </div>
            </div>`).join('')}
        </div>`;
    } catch (err) {
      wrap.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div>${err.message}</div></div>`;
    }
  },

  renderBuilder(existing) {
    const wrap = document.getElementById('templateContent');
    const e = existing || {};
    wrap.innerHTML = `
      <div class="card">
        <div class="card-title">${existing ? 'Edit Template' : 'Create Template'}</div>
        <div class="form-row">
          <div class="form-group">
            <label>Template Name *</label>
            <input type="text" id="tb_name" value="${this.esc(e.name || '')}" placeholder="e.g. Event Announcement">
          </div>
          <div class="form-group">
            <label>Email Title / Heading</label>
            <input type="text" id="tb_title" value="${this.esc(e.title || '')}" placeholder="You're Invited to SHOWBAY 2024">
          </div>
        </div>

        <div class="form-group">
          <label>Body Content (HTML supported)</label>
          <textarea id="tb_body" rows="8" placeholder="Write your email body here. You can use HTML tags like &lt;strong&gt;, &lt;br&gt;, &lt;p&gt; etc.">${this.escText(e.bodyContent || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Image URL</label>
            <input type="url" id="tb_imageUrl" value="${this.esc(e.imageUrl || '')}" placeholder="https://example.com/banner.jpg">
          </div>
          <div class="form-group">
            <label>Or Upload Image</label>
            <input type="file" id="tb_imageFile" accept="image/*" onchange="TemplatesPage.uploadImage(this)">
            <div id="imageUploadStatus" style="font-size:11px;color:var(--text-muted);margin-top:4px;"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Button Text</label>
            <input type="text" id="tb_btnText" value="${this.esc(e.buttonText || '')}" placeholder="Register Now">
          </div>
          <div class="form-group">
            <label>Button Link</label>
            <input type="url" id="tb_btnLink" value="${this.esc(e.buttonLink || '')}" placeholder="https://showbay.com/event">
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:8px;">
          <button class="btn btn-outline" onclick="TemplatesPage.livePreview()">👁 Preview</button>
          <button class="btn btn-primary" onclick="TemplatesPage.saveBuilder('${e._id || ''}')">💾 Save Template</button>
        </div>
      </div>

      <div id="builderPreviewWrap" style="display:none;margin-top:16px;">
        <div class="card">
          <div class="card-title">Preview</div>
          <iframe id="builderPreviewFrame" class="preview-frame"></iframe>
        </div>
      </div>`;
  },

  livePreview() {
    const html = this.buildPreviewHtml();
    const wrap = document.getElementById('builderPreviewWrap');
    const frame = document.getElementById('builderPreviewFrame');
    wrap.style.display = 'block';
    frame.srcdoc = html;
  },

  buildPreviewHtml() {
    const title = document.getElementById('tb_title')?.value || '';
    const body = document.getElementById('tb_body')?.value || '';
    const imageUrl = document.getElementById('tb_imageUrl')?.value || '';
    const btnText = document.getElementById('tb_btnText')?.value || '';
    const btnLink = document.getElementById('tb_btnLink')?.value || '#';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      body{margin:0;padding:0;font-family:Georgia,serif;background:#f4f4f4;}
      .wrapper{max-width:620px;margin:0 auto;background:#fff;}
      .header{background:#1a1a2e;padding:30px 40px;text-align:center;}
      .header h1{color:#e8c547;margin:0;font-size:28px;letter-spacing:3px;}
      .header p{color:#999;margin:5px 0 0;font-size:12px;letter-spacing:2px;}
      .banner img{width:100%;display:block;}
      .content{padding:40px;}
      .content h2{color:#1a1a2e;font-size:24px;margin:0 0 20px;}
      .content p{color:#555;line-height:1.8;font-size:16px;}
      .btn-wrap{text-align:center;margin:30px 0;}
      .btn{display:inline-block;background:#e8c547;color:#1a1a2e;padding:14px 36px;text-decoration:none;font-weight:bold;letter-spacing:1px;font-size:14px;}
      .footer{background:#1a1a2e;padding:25px 40px;text-align:center;}
      .footer p{color:#666;font-size:12px;margin:0;}
    </style></head><body>
    <div class="wrapper">
      <div class="header"><h1>SHOWBAY</h1><p>Event Management</p></div>
      ${imageUrl ? `<div class="banner"><img src="${imageUrl}" alt="Banner"></div>` : ''}
      <div class="content">
        ${title ? `<h2>${title}</h2>` : ''}
        <div>${body}</div>
        ${btnText ? `<div class="btn-wrap"><a href="${btnLink}" class="btn">${btnText}</a></div>` : ''}
      </div>
      <div class="footer"><p>&copy; ${new Date().getFullYear()} SHOWBAY Events. All rights reserved.</p></div>
    </div></body></html>`;
  },

  async saveBuilder(existingId) {
    const data = {
      name: document.getElementById('tb_name').value.trim(),
      title: document.getElementById('tb_title').value.trim(),
      bodyContent: document.getElementById('tb_body').value.trim(),
      imageUrl: document.getElementById('tb_imageUrl').value.trim(),
      buttonText: document.getElementById('tb_btnText').value.trim(),
      buttonLink: document.getElementById('tb_btnLink').value.trim()
    };
    if (!data.name) return App.toast('Template name is required', 'error');
    try {
      if (existingId) {
        await API.put(`/api/templates/builder/${existingId}`, data);
        App.toast('Template updated!', 'success');
      } else {
        await API.post('/api/templates/builder', data);
        App.toast('Template saved!', 'success');
      }
      this.showTab('list');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async editBuilder(id) {
    try {
      const t = await API.get(`/api/templates/${id}`);
      // Switch to builder tab, then render with data
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-builder').classList.add('active');
      this.renderBuilder(t);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  renderUpload() {
    const wrap = document.getElementById('templateContent');
    wrap.innerHTML = `
      <div class="card">
        <div class="card-title">Upload HTML Template</div>
        <p class="text-muted" style="font-size:13px;margin-bottom:20px;">
          Upload a pre-built <strong>.html</strong> file. Optionally upload an image to embed inside it.
          Use <code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:2px;">{{IMAGE_URL}}</code> placeholder in your HTML to reference the uploaded image.
        </p>
        <div class="form-group">
          <label>Template Name *</label>
          <input type="text" id="up_name" placeholder="e.g. Grand Gala Invite">
        </div>

        <div class="form-group">
          <label>HTML File *</label>
          <div class="upload-zone" onclick="document.getElementById('htmlFile').click()">
            <div style="font-size:28px;margin-bottom:8px;">📄</div>
            <div id="htmlFileName" style="font-weight:700;">Click to select .html file</div>
            <input type="file" id="htmlFile" accept=".html" onchange="TemplatesPage.setFileName('htmlFile','htmlFileName')">
          </div>
        </div>

        <div class="form-group">
          <label>Image File (Optional — JPG or PNG)</label>
          <div class="upload-zone" onclick="document.getElementById('imgFile').click()">
            <div style="font-size:28px;margin-bottom:8px;">🖼</div>
            <div id="imgFileName" style="font-weight:700;">Click to select image</div>
            <input type="file" id="imgFile" accept=".jpg,.jpeg,.png" onchange="TemplatesPage.setFileName('imgFile','imgFileName');TemplatesPage.previewImage()">
          </div>
          <div id="imgPreviewWrap" style="margin-top:10px;display:none;">
            <img id="imgPreview" style="max-height:120px;border:1px solid var(--navy-border);">
          </div>
        </div>

        <div id="htmlPreviewWrap" style="display:none;margin-top:12px;">
          <div class="card-title" style="font-size:11px;margin-bottom:12px;">HTML Preview</div>
          <iframe id="htmlPreviewFrame" class="preview-frame"></iframe>
        </div>

        <div style="display:flex;gap:10px;margin-top:16px;">
          <button class="btn btn-outline" onclick="TemplatesPage.previewUpload()">👁 Preview HTML</button>
          <button class="btn btn-primary" onclick="TemplatesPage.saveUpload()">💾 Save Template</button>
        </div>
      </div>`;
  },

  async uploadImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    const statusEl = document.getElementById('imageUploadStatus');
    statusEl.textContent = 'Uploading...';
    statusEl.style.color = 'var(--primary-blue)';
    
    const fd = new FormData();
    fd.append('image', file);
    
    try {
      const res = await API.postForm('/api/templates/upload-image', fd);
      if (res.success) {
        document.getElementById('tb_imageUrl').value = res.imageUrl;
        statusEl.textContent = '✓ Image uploaded successfully';
        statusEl.style.color = 'var(--success)';
        setTimeout(() => {
          statusEl.textContent = '';
        }, 3000);
      }
    } catch (err) {
      statusEl.textContent = '✗ Upload failed: ' + err.message;
      statusEl.style.color = 'var(--danger)';
    }
  },

  setFileName(inputId, labelId) {
    const f = document.getElementById(inputId).files[0];
    if (f) document.getElementById(labelId).textContent = f.name;
  },

  previewImage() {
    const file = document.getElementById('imgFile').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('imgPreviewWrap').style.display = 'block';
      document.getElementById('imgPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  previewUpload() {
    const file = document.getElementById('htmlFile').files[0];
    if (!file) return App.toast('Please select an HTML file first', 'error');
    const reader = new FileReader();
    reader.onload = e => {
      const wrap = document.getElementById('htmlPreviewWrap');
      wrap.style.display = 'block';
      document.getElementById('htmlPreviewFrame').srcdoc = e.target.result;
    };
    reader.readAsText(file);
  },

  async saveUpload() {
    const name = document.getElementById('up_name').value.trim();
    const htmlFile = document.getElementById('htmlFile').files[0];
    if (!name) return App.toast('Template name is required', 'error');
    if (!htmlFile) return App.toast('HTML file is required', 'error');

    const fd = new FormData();
    fd.append('name', name);
    fd.append('htmlFile', htmlFile);
    const imgFile = document.getElementById('imgFile').files[0];
    if (imgFile) fd.append('imageFile', imgFile);

    try {
      await API.postForm('/api/templates/upload', fd);
      App.toast('Template uploaded!', 'success');
      this.showTab('list');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async previewTemplate(id) {
    try {
      const t = await API.get(`/api/templates/${id}`);
      App.showModal(`Preview: ${t.name}`, `<iframe srcdoc="${this.esc(t.html)}" class="preview-frame" style="height:500px;"></iframe>`);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  renderVisualEditor() {
    const wrap = document.getElementById('templateContent');
    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:280px 1fr 320px;gap:16px;height:650px;">
        <!-- Left Sidebar - Tools -->
        <div class="card" style="margin:0;height:fit-content;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <div class="card-title" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);color:white;border-radius:8px 8px 0 0;">🎨 Design Tools</div>
          <div style="display:flex;flex-direction:column;gap:8px;padding:16px;">
            <button class="btn btn-primary btn-sm" onclick="TemplatesPage.addTextElement()" style="background:linear-gradient(135deg,#4fc3f7,#29b6f6);border:none;">📝 Add Text</button>
            <button class="btn btn-primary btn-sm" onclick="TemplatesPage.addImageElement()" style="background:linear-gradient(135deg,#66bb6a,#4caf50);border:none;">🖼 Add Image</button>
            <button class="btn btn-primary btn-sm" onclick="TemplatesPage.addButtonElement()" style="background:linear-gradient(135deg,#ff7043,#ff5722);border:none;">🔘 Add Button</button>
            <button class="btn btn-outline btn-sm" onclick="TemplatesPage.addShapeElement('rectangle')">⬜ Rectangle</button>
            <button class="btn btn-outline btn-sm" onclick="TemplatesPage.addShapeElement('circle')">⭕ Circle</button>
            <button class="btn btn-outline btn-sm" onclick="TemplatesPage.addShapeElement('line')">➖ Line</button>
            <hr style="border-color:var(--border);margin:12px 0;">
            <div class="form-group">
              <label style="font-size:12px;color:var(--text-muted);">Canvas Background</label>
              <input type="color" id="canvasBackground" value="#ffffff" onchange="TemplatesPage.changeCanvasBackground(this.value)" style="width:100%;height:35px;border-radius:6px;border:1px solid var(--border);cursor:pointer;">
            </div>
            <button class="btn btn-danger btn-sm" onclick="TemplatesPage.clearCanvas()">🗑 Clear All</button>
          </div>
        </div>

        <!-- Center - Canvas -->
        <div class="card" style="margin:0;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <div class="card-title" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);color:white;border-radius:8px 8px 0 0;">📧 Email Canvas (600x400)</div>
          <div id="visualCanvas" style="width:600px;height:400px;border:2px dashed var(--border);position:relative;background:#fff;margin:16px auto;overflow:hidden;border-radius:8px;box-shadow:inset 0 2px 8px rgba(0,0,0,0.05);">
            <!-- Canvas elements will be added here -->
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;justify-content:center;padding-bottom:16px;">
            <button class="btn btn-outline" onclick="TemplatesPage.previewVisualTemplate()" style="border:2px solid var(--primary-blue);color:var(--primary-blue);">👁 Preview</button>
            <button class="btn btn-primary" onclick="TemplatesPage.saveVisualTemplate()" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);border:none;">💾 Save Template</button>
          </div>
        </div>

        <!-- Right Sidebar - Properties & Templates -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card" style="margin:0;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div class="card-title" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);color:white;border-radius:8px 8px 0 0;">⚙️ Properties</div>
            <div id="propertiesPanel" style="padding:16px;">
              <p style="color:var(--text-muted);font-size:12px;">Select an element to edit its properties</p>
            </div>
          </div>

          <div class="card" style="margin:0;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div class="card-title" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);color:white;border-radius:8px 8px 0 0;">📋 Quick Templates</div>
            <div style="padding:16px;">
              <button class="btn btn-outline btn-sm" onclick="TemplatesPage.loadTemplate('newsletter')" style="width:100%;margin-bottom:8px;">📰 Newsletter</button>
              <button class="btn btn-outline btn-sm" onclick="TemplatesPage.loadTemplate('promotion')" style="width:100%;margin-bottom:8px;">🎉 Promotion</button>
              <button class="btn btn-outline btn-sm" onclick="TemplatesPage.loadTemplate('invitation')" style="width:100%;margin-bottom:8px;">🎫 Invitation</button>
              <button class="btn btn-outline btn-sm" onclick="TemplatesPage.loadTemplate('announcement')" style="width:100%;">📢 Announcement</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Template Name Modal -->
      <div id="templateNameModal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;justify-content:center;align-items:center;backdrop-filter:blur(4px);">
        <div class="card" style="width:450px;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
          <div class="card-title" style="background:linear-gradient(135deg,var(--primary-blue),#2196f3);color:white;">💾 Save Template</div>
          <div style="padding:24px;">
            <div class="form-group">
              <label>Template Name *</label>
              <input type="text" id="visualTemplateName" placeholder="e.g. My Custom Template" style="width:100%;padding:12px;border:2px solid var(--border);border-radius:8px;">
            </div>
            <div style="display:flex;gap:12px;">
              <button class="btn btn-outline" onclick="TemplatesPage.closeTemplateNameModal()" style="flex:1;">Cancel</button>
              <button class="btn btn-primary" onclick="TemplatesPage.confirmSaveVisualTemplate()" style="flex:1;background:linear-gradient(135deg,var(--primary-blue),#2196f3);border:none;">Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.initVisualEditor();
  },

  initVisualEditor() {
    this.canvasElements = [];
    this.selectedElement = null;
    this.elementIdCounter = 0;
    this.canvasBackground = '#ffffff';
    
    // Add click handler to canvas
    const canvas = document.getElementById('visualCanvas');
    canvas.addEventListener('click', (e) => {
      if (e.target.id && e.target.id.startsWith('element-')) {
        this.selectElement(e.target.id);
      } else if (e.target === canvas) {
        this.deselectAll();
      }
    });
  },

  changeCanvasBackground(color) {
    this.canvasBackground = color;
    const canvas = document.getElementById('visualCanvas');
    canvas.style.background = color;
  },

  addTextElement() {
    const id = `element-${this.elementIdCounter++}`;
    const element = {
      id: id,
      type: 'text',
      content: 'Click to edit text',
      x: 50,
      y: 50,
      width: 200,
      height: 30,
      fontSize: 16,
      fontFamily: 'Inter',
      color: '#0a0e27',
      fontWeight: 'normal',
      textAlign: 'left'
    };
    
    this.canvasElements.push(element);
    this.renderCanvasElement(element);
    this.selectElement(id);
  },

  addImageElement() {
    const id = `element-${this.elementIdCounter++}`;
    const element = {
      id: id,
      type: 'image',
      src: '/images/templates/welcome-banner.jpg',
      x: 50,
      y: 50,
      width: 200,
      height: 100
    };
    
    this.canvasElements.push(element);
    this.renderCanvasElement(element);
    this.selectElement(id);
  },

  uploadImageForElement(elementId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const fd = new FormData();
      fd.append('image', file);
      
      try {
        const res = await API.postForm('/api/templates/upload-image', fd);
        if (res.success) {
          const element = this.canvasElements.find(el => el.id === elementId);
          if (element) {
            element.src = res.imageUrl;
            const domElement = document.getElementById(elementId);
            domElement.src = res.imageUrl;
            App.toast('Image uploaded successfully!', 'success');
          }
        }
      } catch (err) {
        App.toast('Failed to upload image: ' + err.message, 'error');
      }
    };
    input.click();
  },

  addButtonElement() {
    const id = `element-${this.elementIdCounter++}`;
    const element = {
      id: id,
      type: 'button',
      text: 'Click Me',
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      backgroundColor: '#4fc3f7',
      color: '#0a0e27',
      fontSize: 14,
      fontWeight: '600',
      borderRadius: 8,
      link: '#'
    };
    
    this.canvasElements.push(element);
    this.renderCanvasElement(element);
    this.selectElement(id);
  },

  addShapeElement(shape) {
    const id = `element-${this.elementIdCounter++}`;
    const element = {
      id: id,
      type: 'shape',
      shape: shape,
      x: 50,
      y: 50,
      width: shape === 'line' ? 200 : 100,
      height: shape === 'line' ? 2 : 100,
      backgroundColor: '#4fc3f7',
      borderColor: '#0a0e27',
      borderWidth: 2
    };
    
    this.canvasElements.push(element);
    this.renderCanvasElement(element);
    this.selectElement(id);
  },

  renderCanvasElement(element) {
    const canvas = document.getElementById('visualCanvas');
    let html = '';
    
    switch(element.type) {
      case 'text':
        html = `<div id="${element.id}" contenteditable="true" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;font-size:${element.fontSize}px;font-family:${element.fontFamily};color:${element.color};font-weight:${element.fontWeight};text-align:${element.textAlign};border:2px solid transparent;cursor:move;padding:4px;">${element.content}</div>`;
        break;
      case 'image':
        html = `<img id="${element.id}" src="${element.src}" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;border:2px solid transparent;cursor:move;object-fit:cover;">`;
        break;
      case 'button':
        html = `<button id="${element.id}" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.backgroundColor};color:${element.color};font-size:${element.fontSize}px;font-weight:${element.fontWeight};border-radius:${element.borderRadius}px;border:2px solid transparent;cursor:move;">${element.text}</button>`;
        break;
      case 'shape':
        if (element.shape === 'circle') {
          html = `<div id="${element.id}" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.backgroundColor};border:${element.borderWidth}px solid ${element.borderColor};border-radius:50%;cursor:move;"></div>`;
        } else if (element.shape === 'line') {
          html = `<div id="${element.id}" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.backgroundColor};cursor:move;"></div>`;
        } else {
          html = `<div id="${element.id}" style="position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.backgroundColor};border:${element.borderWidth}px solid ${element.borderColor};cursor:move;"></div>`;
        }
        break;
    }
    
    canvas.insertAdjacentHTML('beforeend', html);
    
    // Add drag functionality
    this.makeElementDraggable(element.id);
  },

  makeElementDraggable(elementId) {
    const element = document.getElementById(elementId);
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      element.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      element.style.left = (initialX + dx) + 'px';
      element.style.top = (initialY + dy) + 'px';
      
      // Update element data
      const elementData = this.canvasElements.find(el => el.id === elementId);
      if (elementData) {
        elementData.x = initialX + dx;
        elementData.y = initialY + dy;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      element.style.cursor = 'move';
    });
  },

  selectElement(elementId) {
    this.deselectAll();
    this.selectedElement = elementId;
    const element = document.getElementById(elementId);
    element.style.border = '2px solid #4fc3f7';
    
    // Show properties panel
    this.showPropertiesPanel(elementId);
  },

  deselectAll() {
    document.querySelectorAll('#visualCanvas > *').forEach(el => {
      el.style.border = '2px solid transparent';
    });
    this.selectedElement = null;
    document.getElementById('propertiesPanel').innerHTML = '<p style="color:var(--text-muted);font-size:12px;">Select an element to edit its properties</p>';
  },

  showPropertiesPanel(elementId) {
    const element = this.canvasElements.find(el => el.id === elementId);
    const panel = document.getElementById('propertiesPanel');
    
    let html = '';
    
    switch(element.type) {
      case 'text':
        html = `
          <div class="form-group">
            <label>Font Size</label>
            <input type="number" id="prop-fontSize" value="${element.fontSize}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'fontSize', this.value)" class="property-input">
          </div>
          <div class="form-group">
            <label>Color</label>
            <input type="color" id="prop-color" value="${element.color}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'color', this.value)" class="color-input">
          </div>
          <div class="form-group">
            <label>Font Weight</label>
            <select id="prop-fontWeight" onchange="TemplatesPage.updateElementProperty('${elementId}', 'fontWeight', this.value)" class="property-input">
              <option value="normal" ${element.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="bold" ${element.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
            </select>
          </div>
        `;
        break;
      case 'image':
        html = `
          <div class="form-group">
            <label>Current Image</label>
            <img src="${element.src}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px;">
          </div>
          <div class="form-group">
            <label>Upload New Image</label>
            <button class="btn btn-outline btn-sm" onclick="TemplatesPage.uploadImageForElement('${elementId}')" style="width:100%;">📁 Choose Image</button>
          </div>
          <div class="form-group">
            <label>Width</label>
            <input type="number" id="prop-width" value="${element.width}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'width', this.value)" class="property-input">
          </div>
          <div class="form-group">
            <label>Height</label>
            <input type="number" id="prop-height" value="${element.height}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'height', this.value)" class="property-input">
          </div>
        `;
        break;
      case 'button':
        html = `
          <div class="form-group">
            <label>Button Text</label>
            <input type="text" id="prop-text" value="${element.text}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'text', this.value)" class="property-input">
          </div>
          <div class="form-group">
            <label>Background Color</label>
            <input type="color" id="prop-backgroundColor" value="${element.backgroundColor}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'backgroundColor', this.value)" class="color-input">
          </div>
          <div class="form-group">
            <label>Text Color</label>
            <input type="color" id="prop-color" value="${element.color}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'color', this.value)" class="color-input">
          </div>
        `;
        break;
      case 'shape':
        html = `
          <div class="form-group">
            <label>Background Color</label>
            <input type="color" id="prop-backgroundColor" value="${element.backgroundColor}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'backgroundColor', this.value)" class="color-input">
          </div>
          <div class="form-group">
            <label>Border Color</label>
            <input type="color" id="prop-borderColor" value="${element.borderColor}" onchange="TemplatesPage.updateElementProperty('${elementId}', 'borderColor', this.value)" class="color-input">
          </div>
        `;
        break;
    }
    
    panel.innerHTML = html;
  },

  loadTemplate(templateType) {
    this.clearCanvas();
    
    const templates = {
      newsletter: {
        background: '#f8f9fa',
        elements: [
          { type: 'text', content: 'Monthly Newsletter', x: 50, y: 30, width: 300, height: 40, fontSize: 28, color: '#0a0e27', fontWeight: 'bold' },
          { type: 'image', src: '/images/templates/newsletter-header.jpg', x: 50, y: 80, width: 500, height: 120 },
          { type: 'text', content: 'This month we have exciting updates for you...', x: 50, y: 220, width: 500, height: 60, fontSize: 16, color: '#333' },
          { type: 'button', text: 'Read More', x: 50, y: 300, width: 120, height: 40, backgroundColor: '#4fc3f7', color: '#0a0e27' }
        ]
      },
      promotion: {
        background: '#fff3e0',
        elements: [
          { type: 'text', content: '🎉 Special Offer!', x: 50, y: 40, width: 300, height: 50, fontSize: 32, color: '#ff6f00', fontWeight: 'bold' },
          { type: 'text', content: '50% OFF Everything', x: 50, y: 100, width: 400, height: 40, fontSize: 24, color: '#ff6f00' },
          { type: 'text', content: 'Limited time only. Don\'t miss out!', x: 50, y: 150, width: 400, height: 30, fontSize: 16, color: '#666' },
          { type: 'button', text: 'Shop Now', x: 50, y: 200, width: 150, height: 50, backgroundColor: '#ff6f00', color: '#fff', fontSize: 18 }
        ]
      },
      invitation: {
        background: '#e8f5e8',
        elements: [
          { type: 'text', content: '🎫 You\'re Invited!', x: 50, y: 40, width: 300, height: 50, fontSize: 28, color: '#2e7d32', fontWeight: 'bold' },
          { type: 'text', content: 'Join us for an amazing event', x: 50, y: 100, width: 400, height: 30, fontSize: 18, color: '#333' },
          { type: 'text', content: 'Date: March 30, 2024', x: 50, y: 150, width: 200, height: 25, fontSize: 16, color: '#666' },
          { type: 'text', content: 'Time: 6:00 PM', x: 50, y: 180, width: 200, height: 25, fontSize: 16, color: '#666' },
          { type: 'button', text: 'RSVP Now', x: 50, y: 230, width: 120, height: 40, backgroundColor: '#4caf50', color: '#fff' }
        ]
      },
      announcement: {
        background: '#e3f2fd',
        elements: [
          { type: 'text', content: '📢 Important Announcement', x: 50, y: 40, width: 400, height: 40, fontSize: 24, color: '#1565c0', fontWeight: 'bold' },
          { type: 'text', content: 'We have something exciting to share with you!', x: 50, y: 90, width: 500, height: 30, fontSize: 18, color: '#333' },
          { type: 'text', content: 'Stay tuned for more details coming soon...', x: 50, y: 130, width: 500, height: 60, fontSize: 16, color: '#666' },
          { type: 'button', text: 'Learn More', x: 50, y: 200, width: 120, height: 40, backgroundColor: '#1976d2', color: '#fff' }
        ]
      }
    };
    
    const template = templates[templateType];
    if (template) {
      this.changeCanvasBackground(template.background);
      document.getElementById('canvasBackground').value = template.background;
      
      template.elements.forEach(elementData => {
        const id = `element-${this.elementIdCounter++}`;
        const element = { ...elementData, id };
        this.canvasElements.push(element);
        this.renderCanvasElement(element);
      });
      
      App.toast(`${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template loaded!`, 'success');
    }
  },

  updateElementProperty(elementId, property, value) {
    const element = this.canvasElements.find(el => el.id === elementId);
    if (element) {
      element[property] = value;
      
      // Update DOM element
      const domElement = document.getElementById(elementId);
      switch(property) {
        case 'fontSize':
        case 'color':
        case 'fontWeight':
          domElement.style[property] = value;
          break;
        case 'width':
        case 'height':
          domElement.style[property] = value + 'px';
          break;
        case 'backgroundColor':
        case 'borderColor':
          domElement.style[property] = value;
          break;
        case 'text':
          domElement.textContent = value;
          break;
      }
    }
  },

  clearCanvas() {
    if (!confirm('Clear all elements from the canvas?')) return;
    
    document.getElementById('visualCanvas').innerHTML = '';
    this.canvasElements = [];
    this.selectedElement = null;
    this.elementIdCounter = 0;
    document.getElementById('propertiesPanel').innerHTML = '<p style="color:var(--text-muted);font-size:12px;">Select an element to edit its properties</p>';
  },

  previewVisualTemplate() {
    const html = this.generateVisualHTML();
    const preview = window.open('', '_blank', 'width=700,height=500');
    preview.document.write(html);
    preview.document.close();
  },

  generateVisualHTML() {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Visual Template</title>
<style>
  body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; background: #f4f4f4; }
  .email-container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: ${this.canvasBackground}; 
    padding: 40px; 
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .element { position: relative; }
</style>
</head>
<body>
<div class="email-container">`;
    
    this.canvasElements.forEach(element => {
      let elementHtml = '';
      const styles = `position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;`;
      
      switch(element.type) {
        case 'text':
          elementHtml = `<div class="element" style="${styles}font-size:${element.fontSize}px;font-family:${element.fontFamily};color:${element.color};font-weight:${element.fontWeight};text-align:${element.textAlign};padding:4px;">${element.content}</div>`;
          break;
        case 'image':
          elementHtml = `<img class="element" src="${element.src}" style="${styles}object-fit:cover;">`;
          break;
        case 'button':
          elementHtml = `<button class="element" style="${styles}background:${element.backgroundColor};color:${element.color};font-size:${element.fontSize}px;font-weight:${element.fontWeight};border-radius:${element.borderRadius}px;border:none;cursor:pointer;">${element.text}</button>`;
          break;
        case 'shape':
          let shapeStyle = styles;
          if (element.shape === 'circle') {
            shapeStyle += 'border-radius:50%;';
          }
          elementHtml = `<div class="element" style="${shapeStyle}background:${element.backgroundColor};border:${element.borderWidth}px solid ${element.borderColor};"></div>`;
          break;
      }
      
      html += elementHtml;
    });
    
    html += `</div>
</body>
</html>`;
    
    return html;
  },

  saveVisualTemplate() {
    document.getElementById('templateNameModal').style.display = 'flex';
  },

  closeTemplateNameModal() {
    document.getElementById('templateNameModal').style.display = 'none';
    document.getElementById('visualTemplateName').value = '';
  },

  async confirmSaveVisualTemplate() {
    const name = document.getElementById('visualTemplateName').value.trim();
    if (!name) return App.toast('Template name is required', 'error');
    
    try {
      const html = this.generateVisualHTML();
      const templateData = {
        name: name,
        type: 'visual',
        html: html,
        canvasElements: this.canvasElements,
        createdAt: new Date()
      };
      
      await API.post('/api/templates/builder', templateData);
      App.toast('Visual template saved!', 'success');
      this.closeTemplateNameModal();
      this.showTab('list');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async deleteTemplate(id, name) {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      await API.delete(`/api/templates/${id}`);
      App.toast('Template deleted', 'success');
      this.renderList();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  esc(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; },
  escText(str) { return str ? String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }
};
