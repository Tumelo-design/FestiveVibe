/*
  Basic interactive JS: handles mobile nav toggle, product storage (localStorage)
  and rendering product cards with 'Buy Now' buttons.

  Notes:
  - This is a demo client-side implementation. Replace with server-side or e-commerce
    integration for production.
  - Affiliate links should be added to the 'url' field when adding products.
*/

document.addEventListener('DOMContentLoaded', ()=>{
  initYear();
  setupNavToggle();
  createChristmasLights();
  createSnowflakes();
  // Initialize product lists for any element with id starting `product-list-`
  document.querySelectorAll('[id^="product-list-"]').forEach(el=>{
    const id = el.id; // product-list-<pageKey>
    const pageKey = id.replace('product-list-','');
    const items = loadProducts(pageKey);
    renderProducts(el, items);
  });
  // Hook any add-product forms present
  document.querySelectorAll('.add-product-form').forEach(form=>bindForm(form));
});function initYear(){
	const y = new Date().getFullYear();
	document.getElementById('year')?.textContent = y;
}

function setupNavToggle(){
  const btns = document.querySelectorAll('.nav-toggle');
  btns.forEach(btn=>btn.addEventListener('click', ()=>{
    const nav = document.getElementById('main-nav');
    if(!nav) return;
    if(nav.style.display === 'flex' || nav.style.display === '') nav.style.display = 'none';
    else nav.style.display = 'flex';
  }));
}

function createChristmasLights(){
  const lightsHtml = `<div class="light">💡</div><div class="light">💡</div><div class="light">💡</div><div class="light">💡</div><div class="light">💡</div><div class="light">💡</div><div class="light">💡</div><div class="light">💡</div>`;
  const lightsDiv = document.createElement('div');
  lightsDiv.className = 'lights';
  lightsDiv.innerHTML = lightsHtml;
  document.body.insertBefore(lightsDiv, document.body.firstChild);
}

function createSnowflakes(){
  const snowflakeChars = ['❄️', '⛄', '❅', '❆'];
  for(let i = 0; i < 12; i++){
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDelay = Math.random() * 2 + 's';
    snowflake.style.animationDuration = (Math.random() * 5 + 8) + 's';
    document.body.appendChild(snowflake);
  }
}function pageKeyFromId(id){
	// map id like 'product-list-christmas' to key 'christmas'
	if(!id) return null;
	const parts = id.split('-');
	return parts.slice(-1)[0];
}

function storageKeyFor(pageKey){
	return `festive_products_${pageKey}`;
}

function loadProducts(pageKey){
	const raw = localStorage.getItem(storageKeyFor(pageKey));
	if(!raw) return [];
	try{ return JSON.parse(raw) }catch(e){return []}
}

function saveProducts(pageKey, items){
	localStorage.setItem(storageKeyFor(pageKey), JSON.stringify(items));
}

function renderProducts(container, items){
	container.innerHTML = '';
	if(!items.length) container.innerHTML = '<p class="muted">No products yet. Use the form to add a product (demo).</p>';
	items.forEach(prod=>{
		const card = document.createElement('article');
		card.className = 'card';
		card.innerHTML = `
			${prod.image?`<img src="${escapeHtml(prod.image)}" alt="${escapeHtml(prod.title)}">`:''}
			<h4>${escapeHtml(prod.title)}</h4>
			<p class="muted">${escapeHtml(prod.desc||'')}</p>
			<div class="meta">
				<div class="price">${escapeHtml(prod.price||'')}</div>
				<a class="buy-btn" href="${escapeHtml(prod.url||'#')}" target="_blank" rel="noopener">Buy Now</a>
			</div>
		`;
		container.appendChild(card);
	});
}

function loadAndRender(prefix){
	// prefix can be 'home' or 'christmas' etc. Look for product-list-${prefix}
	const el = document.getElementById(`product-list-${prefix}`);
	if(!el) return;
	const key = prefix.replace(/-/g,'');
	const items = loadProducts(key);
	renderProducts(el, items);
}

function bindForm(form){
	form.addEventListener('submit', e=>{
		e.preventDefault();
		const data = new FormData(form);
		const obj = {
			title: data.get('title')||'Untitled',
			image: data.get('image')||'',
			url: data.get('url')||'#',
			price: data.get('price')||'',
			desc: data.get('desc')||'',
			digital: data.get('digital')?true:false,
			created: Date.now()
		};
		// determine page key from form id, which follows add-product-form-<key>
		const id = form.id || '';
		const parts = id.split('-');
		const pageKey = parts.slice(3).join('-') || 'home';
		const items = loadProducts(pageKey);
		items.unshift(obj);
		saveProducts(pageKey, items);
		// re-render target list
		const listEl = document.getElementById(`product-list-${pageKey}`) || document.getElementById('product-list-home');
		if(listEl) renderProducts(listEl, items);
		form.reset();
	});
}

function escapeHtml(str){
	return String(str||'').replace(/[&"'<>]/g, s=>({
		'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'
	})[s]);
}

// Expose some helpers to window for debugging/testing
window.festive = {loadProducts, saveProducts, renderProducts};
