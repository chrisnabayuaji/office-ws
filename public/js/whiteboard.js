// Meeting Room Collaborative Whiteboard

class Whiteboard {
  constructor(canvas, stickyLayer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stickyLayer = stickyLayer;

    this.isDrawing = false;
    this.currentColor = '#1e293b';
    this.brushSize = 3;
    this.mode = 'pen'; // 'pen' or 'eraser'

    this.lastX = 0;
    this.lastY = 0;

    this.initCanvasSize();
    this.bindEvents();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDraw());
    this.canvas.addEventListener('mouseleave', () => this.stopDraw());

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
      }
    });

    this.canvas.addEventListener('touchend', () => this.stopDraw());
  }

  startDraw(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const strokeData = {
      x0: this.lastX / this.canvas.width,
      y0: this.lastY / this.canvas.height,
      x1: currentX / this.canvas.width,
      y1: currentY / this.canvas.height,
      color: this.mode === 'eraser' ? '#f8fafc' : this.currentColor,
      size: this.mode === 'eraser' ? 24 : this.brushSize
    };

    this.renderStroke(strokeData);

    // Broadcast stroke to other coworkers
    if (window.appNetwork) {
      window.appNetwork.sendWhiteboardStroke(strokeData);
    }

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDraw() {
    this.isDrawing = false;
  }

  renderStroke(s) {
    this.ctx.strokeStyle = s.color;
    this.ctx.lineWidth = s.size;
    this.ctx.beginPath();
    this.ctx.moveTo(s.x0 * this.canvas.width, s.y0 * this.canvas.height);
    this.ctx.lineTo(s.x1 * this.canvas.width, s.y1 * this.canvas.height);
    this.ctx.stroke();
  }

  addStickyNote(data) {
    const card = document.createElement('div');
    card.className = 'sticky-note-card';
    card.style.left = (data.x * 100) + '%';
    card.style.top = (data.y * 100) + '%';
    card.style.backgroundColor = data.color || '#fef08a';

    card.innerHTML = `
      <div class="sticky-text">${data.text}</div>
      <div class="sticky-author">— ${data.author || 'Anonymous'}</div>
    `;

    this.stickyLayer.appendChild(card);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stickyLayer.innerHTML = '';
  }

  loadState(elements) {
    this.clear();
    if (!elements) return;

    elements.forEach(item => {
      if (item.type === 'stroke') {
        this.renderStroke(item.data);
      } else if (item.type === 'sticky') {
        this.addStickyNote({
          ...item.data,
          author: item.author
        });
      }
    });
  }
}

window.Whiteboard = Whiteboard;
