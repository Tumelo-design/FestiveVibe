// Blog Management System
class BlogManager {
  constructor() {
    this.articles = [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.loadArticles();
    this.setupEventListeners();
    setTimeout(() => this.renderBlog(), 100); // Small delay to ensure DOM is ready
  }

  loadArticles() {
    // Load from localStorage
    const stored = localStorage.getItem('festiveBlogs');
    if (stored) {
      this.articles = JSON.parse(stored);
    }
  }

  saveArticles() {
    localStorage.setItem('festiveBlogs', JSON.stringify(this.articles));
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderBlog();
      });
    });

    // Admin toggle
    const adminToggle = document.getElementById('admin-toggle');
    if (adminToggle) {
      adminToggle.addEventListener('click', () => {
        const adminPanel = document.getElementById('admin-panel');
        adminPanel.classList.toggle('hidden');
      });
    }

    // Form submission
    const form = document.getElementById('add-blog-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    const modal = document.getElementById('article-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const article = {
      id: Date.now(),
      title: formData.get('title'),
      date: formData.get('date'),
      category: formData.get('category'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      author: formData.get('author'),
      readTime: formData.get('readTime')
    };

    // Validation
    if (article.excerpt.split(' ').length < 50) {
      this.showMessage('Excerpt should be at least 50 words', 'error');
      return;
    }

    if (article.content.split(' ').length < 400) {
      this.showMessage('Article content should be at least 400 words', 'error');
      return;
    }

    this.articles.unshift(article);
    this.saveArticles();
    this.showMessage('Article published successfully!', 'success');
    e.target.reset();
    document.getElementById('admin-panel').classList.add('hidden');
    this.renderBlog();
  }

  showMessage(text, type) {
    const msg = document.getElementById('form-message');
    msg.textContent = text;
    msg.className = `form-message ${type}`;
    setTimeout(() => {
      msg.classList.add('hidden');
    }, 3000);
  }

  getFilteredArticles() {
    if (this.currentFilter === 'all') {
      return this.articles;
    }
    return this.articles.filter(a => a.category === this.currentFilter);
  }

  renderBlog() {
    const grid = document.getElementById('blog-grid');
    if (!grid) {
      console.error('blog-grid element not found');
      return;
    }

    const filtered = this.getFilteredArticles();

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="loading">No articles found in this category.</div>';
      return;
    }

    grid.innerHTML = filtered.map(article => this.createCard(article)).join('');

    // Add click listeners
    document.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => this.openArticle(card.dataset.id));
    });
  }

  createCard(article) {
    const date = new Date(article.date);
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    const categoryLabel = {
      stress: 'Stress Management',
      finance: 'Financial Planning',
      time: 'Time Management'
    }[article.category];

    return `
      <div class="blog-card ${article.category}" data-id="${article.id}">
        <div class="blog-card-header">
          <span class="blog-card-category category-${article.category}">${categoryLabel}</span>
          <h3>${article.title}</h3>
        </div>
        <div class="blog-card-content">
          <p class="blog-excerpt">${article.excerpt}</p>
          <div class="blog-meta">
            <span class="blog-date">📅 ${dateStr}</span>
            <span class="blog-read-time">⏱️ ${article.readTime}</span>
          </div>
        </div>
      </div>
    `;
  }

  openArticle(id) {
    const article = this.articles.find(a => a.id == id);
    if (!article) return;

    const categoryLabel = {
      stress: 'Stress Management',
      finance: 'Financial Planning',
      time: 'Time Management'
    }[article.category];

    const date = new Date(article.date);
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    document.getElementById('modal-title').textContent = article.title;
    document.getElementById('modal-meta').innerHTML = `
      <span>By ${article.author}</span>
      <span>📅 ${dateStr}</span>
      <span>⏱️ ${article.readTime}</span>
      <span class="blog-card-category category-${article.category}">${categoryLabel}</span>
    `;

    // Format content with paragraphs
    const formattedContent = this.formatContent(article.content);
    document.getElementById('modal-body').innerHTML = formattedContent;

    document.getElementById('article-modal').classList.remove('hidden');
  }

  formatContent(content) {
    // Split by double line breaks to create paragraphs
    return content.split('\n\n')
      .filter(p => p.trim())
      .map(p => {
        // Check if it's a heading (starts with numbers or titles)
        if (p.match(/^\d+\./)) {
          const parts = p.split(':');
          const heading = parts[0];
          const text = parts.slice(1).join(':').trim();
          return `<h3>${heading}</h3><p>${text}</p>`;
        }
        return `<p>${p.trim()}</p>`;
      })
      .join('');
  }

  closeModal() {
    document.getElementById('article-modal').classList.add('hidden');
  }
}

// Initialize blog system when DOM is ready
function initBlogSystem() {
  // Check if required elements exist
  const grid = document.getElementById('blog-grid');
  if (!grid) {
    console.error('Blog grid element not found');
    return;
  }

  const blogManager = new BlogManager();
  
  // Set year in footer (if not already set)
  const yearEl = document.getElementById('year');
  if (yearEl && !yearEl.textContent) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Try to initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogSystem);
} else {
  // DOM is already ready
  initBlogSystem();
}
