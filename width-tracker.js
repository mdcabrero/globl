class WidthTracker extends HTMLElement {
    constructor() {
        super();
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.widget = null;
    }

    connectedCallback() {
        // Get options from attributes
        const position = this.getAttribute('position') || 'top-right';
        const showHeight = this.getAttribute('show-height') !== 'false';
        
        this.createWidget(position, showHeight);
        this.updateWidth();
        this.setupEventListeners();
    }

    createWidget(position, showHeight) {
        this.widget = document.createElement('div');
        this.widget.className = 'width-tracker';
        this.widget.innerHTML = `
            <div class="screen-size">0px</div>
            ${showHeight ? '<div class="viewport-info">viewport</div>' : ''}
        `;

        // Add styles
        this.addStyles();
        
        // Position widget
        this.setPosition(position);
        
        // Add to this element
        this.appendChild(this.widget);
        
        // Store element references
        this.screenWidthElement = this.widget.querySelector('.screen-size');
        this.viewportInfoElement = this.widget.querySelector('.viewport-info');
    }

    addStyles() {
        // Check if styles already exist
        if (document.getElementById('width-tracker-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'width-tracker-styles';
        style.textContent = `
            width-tracker {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
            }

            .width-tracker {
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 2px solid #4CAF50;
                min-width: 120px;
                text-align: center;
                cursor: move;
                user-select: none;
                transition: all 0.2s ease;
                pointer-events: auto;
            }

            .width-tracker:hover {
                background: rgba(0, 0, 0, 0.95);
                transform: scale(1.05);
            }

            .width-tracker.dragging {
                opacity: 0.8;
                transform: rotate(2deg);
            }

            .width-tracker .screen-size {
                color: #4CAF50;
                font-size: 18px;
            }

            .width-tracker .viewport-info {
                font-size: 12px;
                color: #ccc;
                margin-top: 4px;
            }

            @media (max-width: 480px) {
                .width-tracker {
                    padding: 8px 12px;
                    font-size: 14px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setPosition(position) {
        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' }
        };

        const pos = positions[position] || positions['top-right'];
        Object.assign(this.style, pos);
    }

    updateWidth() {
        if (!this.screenWidthElement) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.screenWidthElement.textContent = `${width}px`;
        
        if (this.viewportInfoElement) {
            this.viewportInfoElement.textContent = `${width} × ${height}`;
        }
    }

    setupEventListeners() {
        // Update width on resize
        this.resizeHandler = () => this.updateWidth();
        window.addEventListener('resize', this.resizeHandler);

        // Dragging functionality
        this.mouseDownHandler = (e) => this.startDrag(e);
        this.touchStartHandler = (e) => this.startDrag(e.touches[0]);
        this.mouseMoveHandler = (e) => this.drag(e);
        this.touchMoveHandler = (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.drag(e.touches[0]);
            }
        };
        this.mouseUpHandler = () => this.stopDrag();
        this.touchEndHandler = () => this.stopDrag();

        this.widget.addEventListener('mousedown', this.mouseDownHandler);
        this.widget.addEventListener('touchstart', this.touchStartHandler, { passive: false });
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        document.addEventListener('mouseup', this.mouseUpHandler);
        document.addEventListener('touchend', this.touchEndHandler);
    }

    startDrag(event) {
        this.isDragging = true;
        this.widget.classList.add('dragging');
        
        const rect = this.widget.getBoundingClientRect();
        this.dragOffset.x = event.clientX - rect.left;
        this.dragOffset.y = event.clientY - rect.top;
    }

    drag(event) {
        if (!this.isDragging) return;

        const x = event.clientX - this.dragOffset.x;
        const y = event.clientY - this.dragOffset.y;

        // Keep widget within viewport bounds
        const maxX = window.innerWidth - this.widget.offsetWidth;
        const maxY = window.innerHeight - this.widget.offsetHeight;

        const boundedX = Math.min(Math.max(0, x), maxX);
        const boundedY = Math.min(Math.max(0, y), maxY);

        this.style.left = `${boundedX}px`;
        this.style.top = `${boundedY}px`;
        this.style.right = 'auto';
        this.style.bottom = 'auto';
    }

    stopDrag() {
        this.isDragging = false;
        this.widget.classList.remove('dragging');
    }

    // Public methods
    hide() {
        this.style.display = 'none';
    }

    show() {
        this.style.display = 'block';
    }

    // Cleanup when element is removed
    disconnectedCallback() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.widget) {
            this.widget.removeEventListener('mousedown', this.mouseDownHandler);
            this.widget.removeEventListener('touchstart', this.touchStartHandler);
        }
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('touchmove', this.touchMoveHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
        document.removeEventListener('touchend', this.touchEndHandler);
    }
}

// Register the custom element
customElements.define('width-tracker', WidthTracker);

// Debug: Log when the component is loaded
console.log('Width Tracker component loaded successfully');