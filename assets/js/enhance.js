/* ============================================
   SUPERMART — ENHANCEMENTS JS
   Hero Slider, Counters, Scroll Reveal, Search,
   Filters/Sort, Star Ratings, Product Details
============================================ */

/* ---- STAR RATING RENDER ---- */
function starsHtml(rating, count){
  rating = rating || 4.0;
  let html = '<div class="product-rating"><span class="stars">';
  for(let i=1;i<=5;i++){
    if(i<=Math.floor(rating)) html+='<i class="fa-solid fa-star"></i>';
    else if(i-rating<1 && i-rating>0) html+='<i class="fa-solid fa-star-half-stroke"></i>';
    else html+='<i class="fa-regular fa-star"></i>';
  }
  html+='</span><span class="rcount">'+rating.toFixed(1)+(count?' ('+count+')':'')+'</span></div>';
  return html;
}

document.addEventListener('DOMContentLoaded', function(){

  /* ---- RENDER RATINGS on cards with data-rating ---- */
  document.querySelectorAll('[data-rating]').forEach(function(card){
    const slot = card.querySelector('.rating-slot');
    if(slot){
      slot.innerHTML = starsHtml(parseFloat(card.dataset.rating), parseInt(card.dataset.reviews)||0);
    }
  });

  /* ---- PRODUCT CARD → DETAILS NAVIGATION ----
     Makes the product image clickable (it wasn't before) and guarantees the
     details page always shows the SAME product that was clicked — by handing
     the exact card data (name/price/image/category/etc) to product-details.html
     via sessionStorage instead of relying only on the small shared catalog. */
  function slugifyProductName(name){
    return (name||'').trim().replace(/\s+/g,'-');
  }
  function goToProductDetails(card){
    if(!card || !card.dataset) return;
    const data = {
      name: card.dataset.name || '',
      price: parseFloat(card.dataset.price) || 0,
      original: card.dataset.original ? parseFloat(card.dataset.original) : null,
      img: card.dataset.img || '',
      cat: card.dataset.cat || 'General',
      brand: card.dataset.brand || 'SuperMart Choice',
      rating: card.dataset.rating ? parseFloat(card.dataset.rating) : 4.3,
      reviews: card.dataset.reviews ? parseInt(card.dataset.reviews) : 50,
      pack: (card.querySelector('.card-pack-size') ? card.querySelector('.card-pack-size').textContent.trim() : '')
    };
    if(!data.name || !data.img) return;
    try{ sessionStorage.setItem('sm_clicked_product', JSON.stringify(data)); }catch(e){}
    window.location.href = 'product-details.html?id='+encodeURIComponent(slugifyProductName(data.name));
  }
  document.querySelectorAll('[data-product] > img').forEach(function(img){
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(){ goToProductDetails(this.closest('[data-product]')); });
  });
  document.querySelectorAll('[data-product] h5 a[href*="product-details.html"]').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      goToProductDetails(this.closest('[data-product]'));
    });
  });

  /* ---- HERO SLIDER ---- */
  const slides = document.querySelectorAll('.hero-slide');
  if(slides.length){
    let current = 0;
    const dotsWrap = document.querySelector('.hero-dots');
    if(dotsWrap){
      slides.forEach((s,i)=>{
        const d=document.createElement('button');
        d.className='hero-dot'+(i===0?' active':'');
        d.setAttribute('aria-label','Go to slide '+(i+1));
        d.addEventListener('click',()=>goToSlide(i));
        dotsWrap.appendChild(d);
      });
    }
    function goToSlide(i){
      slides[current].classList.remove('active');
      dotsWrap && dotsWrap.children[current].classList.remove('active');
      current = (i+slides.length)%slides.length;
      slides[current].classList.add('active');
      dotsWrap && dotsWrap.children[current].classList.add('active');
    }
    document.querySelector('.hero-arrow.next')?.addEventListener('click',()=>goToSlide(current+1));
    document.querySelector('.hero-arrow.prev')?.addEventListener('click',()=>goToSlide(current-1));
    setInterval(()=>goToSlide(current+1), 5500);
  }

  /* ---- ANIMATED COUNTERS ---- */
  const counters = document.querySelectorAll('.counter-num');
  if(counters.length){
    const animateCounter = (el)=>{
      const target = parseInt(el.dataset.target,10)||0;
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        const progress = Math.min((now-start)/duration,1);
        el.textContent = Math.floor(progress*target).toLocaleString()+(el.dataset.suffix||'');
        if(progress<1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString()+(el.dataset.suffix||'');
      }
      requestAnimationFrame(tick);
    };
    const counterObs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    },{threshold:.4});
    counters.forEach(c=>counterObs.observe(c));
  }

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    const revealObs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    },{threshold:.15});
    revealEls.forEach(el=>revealObs.observe(el));
  }

  /* ---- SEARCH ---- */
  const searchInputs = document.querySelectorAll('.nav-search-input');
  searchInputs.forEach(function(input){
    const suggestBox = input.closest('.nav-search-wrap')?.querySelector('.search-suggest');
    input.addEventListener('input', function(){
      const q = this.value.trim().toLowerCase();
      if(!suggestBox) return;
      if(!q){ suggestBox.classList.remove('show'); suggestBox.innerHTML=''; return; }
      const matches = (window.SM_PRODUCTS||[]).filter(p=>p.name.toLowerCase().includes(q)).slice(0,6);
      if(matches.length){
        suggestBox.innerHTML = matches.map(p=>
          `<a href="product-details.html?id=${p.id}"><img src="${p.img}" alt=""> <span>${p.name} <small class="text-muted">— ₹${p.price}</small></span></a>`
        ).join('');
      } else {
        suggestBox.innerHTML = '<div class="none">No products found for "'+q+'"</div>';
      }
      suggestBox.classList.add('show');
    });
    document.addEventListener('click', function(e){
      if(suggestBox && !input.closest('.nav-search-wrap').contains(e.target)) suggestBox.classList.remove('show');
    });
    const form = input.closest('form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const q = input.value.trim();
        if(q) window.location.href = 'offers.html?q='+encodeURIComponent(q);
      });
    }
  });

  /* ---- APPLY ?q= SEARCH FILTER ON OFFERS PAGE ---- */
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  if(qParam && document.querySelector('.offer-item')){
    const qLower = qParam.toLowerCase();
    document.querySelectorAll('.offer-item').forEach(item=>{
      const name = item.querySelector('[data-name]')?.dataset.name?.toLowerCase()||'';
      item.style.display = name.includes(qLower) ? '' : 'none';
    });
    const hdr = document.getElementById('offersHeading');
    if(hdr) hdr.textContent = 'Search results for "'+qParam+'"';
  }

  /* ---- APPLY ?cat= CATEGORY FILTER ON OFFERS PAGE (from categories.html) ---- */
  const catParam = params.get('cat');
  if(catParam && document.querySelector('.filter-btn')){
    const matchBtn = document.querySelector('.filter-btn[data-filter="'+catParam.toLowerCase()+'"]');
    if(matchBtn){
      document.querySelectorAll('.filter-btn').forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      matchBtn.classList.add('active');
      matchBtn.setAttribute('aria-pressed','true');
      setTimeout(()=>{ if(typeof applyAllFilters==='function') applyAllFilters(); }, 0);
    } else {
      // category not in quick filters (e.g. Frozen, Household) — filter offer-items directly by data-cat text match
      const catLower = catParam.toLowerCase();
      document.querySelectorAll('.offer-item').forEach(item=>{
        const cardCat = item.querySelector('[data-cat]')?.dataset.cat?.toLowerCase()||'';
        item.dataset.filteredOut = cardCat.includes(catLower) ? '0' : '1';
      });
      const hdr = document.getElementById('offersHeading');
      if(hdr) hdr.textContent = catParam.charAt(0).toUpperCase()+catParam.slice(1)+' Products';
    }
  }


  const priceRange = document.getElementById('priceRange');
  if(priceRange){
    const priceOut = document.getElementById('priceRangeVal');
    priceRange.addEventListener('input', function(){
      if(priceOut) priceOut.textContent = '₹0 – ₹'+this.value;
      applyAllFilters();
    });
  }

  /* ---- RATING FILTER & BRAND FILTER & CATEGORY (offers page) ---- */
  document.querySelectorAll('.rating-filter, .brand-filter').forEach(cb=>{
    cb.addEventListener('change', applyAllFilters);
  });

  function applyAllFilters(){
    const items = document.querySelectorAll('.offer-item');
    if(!items.length) return;
    const maxPrice = priceRange ? parseInt(priceRange.value) : Infinity;
    const checkedRatings = Array.from(document.querySelectorAll('.rating-filter:checked')).map(cb=>parseFloat(cb.value));
    const checkedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb=>cb.value);
    const activeCat = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    items.forEach(item=>{
      const card = item.querySelector('[data-price]');
      if(!card){ item.dataset.filteredOut='1'; return; }
      const price = parseInt(card.dataset.price)||0;
      const rating = parseFloat(card.dataset.rating)||0;
      const brand = card.dataset.brand||'';
      let visible = true;
      if(activeCat!=='all' && !item.classList.contains(activeCat)) visible=false;
      if(price>maxPrice) visible=false;
      if(checkedRatings.length && !checkedRatings.some(r=>rating>=r)) visible=false;
      if(checkedBrands.length && !checkedBrands.includes(brand)) visible=false;
      item.dataset.filteredOut = visible ? '0' : '1';
    });
    updateResultCount();
    currentPage = 1;
    if(typeof paginate === 'function') paginate();
  }
  function updateResultCount(){
    const visible = document.querySelectorAll('.offer-item[data-filtered-out="0"], .offer-item:not([data-filtered-out])').length;
    const rc = document.getElementById('resultCount');
    if(rc) rc.textContent = visible+' products found';
  }
  if(document.querySelector('.offer-item')) updateResultCount();
  document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',function(){
    document.querySelectorAll('.filter-btn').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
    this.classList.add('active');
    this.setAttribute('aria-pressed','true');
    setTimeout(applyAllFilters,10);
  }));

  const clearBtn = document.getElementById('clearFiltersBtn');
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      document.querySelectorAll('.rating-filter,.brand-filter').forEach(cb=>cb.checked=false);
      if(priceRange){ priceRange.value = priceRange.max; document.getElementById('priceRangeVal').textContent='₹0 – ₹'+priceRange.max; }
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');
      applyAllFilters();
    });
  }

  /* ---- SORT (extended: price, new, best-selling, popularity, discount) ---- */
  const sortSelect = document.getElementById('sortSelect');
  if(sortSelect){
    sortSelect.addEventListener('change', function(){
      const wrapper = document.querySelector('.offers-grid') || document.querySelector('.offer-item')?.parentElement;
      if(!wrapper) return;
      const items = Array.from(wrapper.querySelectorAll('.offer-item'));
      const val = this.value;
      items.sort((a,b)=>{
        const ca=a.querySelector('[data-price]'), cb=b.querySelector('[data-price]');
        if(!ca||!cb) return 0;
        switch(val){
          case 'price-asc': return (parseInt(ca.dataset.price)||0)-(parseInt(cb.dataset.price)||0);
          case 'price-desc': return (parseInt(cb.dataset.price)||0)-(parseInt(ca.dataset.price)||0);
          case 'discount': return (parseInt(cb.dataset.discount)||0)-(parseInt(ca.dataset.discount)||0);
          case 'rating': return (parseFloat(cb.dataset.rating)||0)-(parseFloat(ca.dataset.rating)||0);
          case 'new': return (parseInt(cb.dataset.new)||0)-(parseInt(ca.dataset.new)||0);
          default: return 0;
        }
      });
      items.forEach(it=>wrapper.appendChild(it));
    });
  }

  /* ---- REAL PAGINATION FOR OFFERS GRID ---- */
  const PAGE_SIZE = 9;
  let currentPage = 1;
  const paginationEl = document.getElementById('offersPagination');

  function visibleItemsList(){
    return Array.from(document.querySelectorAll('.offer-item')).filter(it=>it.dataset.filteredOut !== '1');
  }

  function paginate(){
    if(!paginationEl) return;
    const visible = visibleItemsList();
    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    if(currentPage > totalPages) currentPage = totalPages;

    visible.forEach((item, idx)=>{
      const page = Math.floor(idx / PAGE_SIZE) + 1;
      item.style.display = (page === currentPage) ? '' : 'none';
    });

    let html = '';
    html += `<li class="page-item${currentPage===1?' disabled':''}"><a class="page-link" href="#" data-page="prev">Prev</a></li>`;
    for(let p=1; p<=totalPages; p++){
      html += `<li class="page-item${p===currentPage?' active':''}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
    }
    html += `<li class="page-item"><a class="page-link" href="#" data-page="next">Next</a></li>`;
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('.page-link').forEach(link=>{
      link.addEventListener('click', function(e){
        e.preventDefault();
        const p = this.dataset.page;
        if(p==='prev') currentPage = Math.max(1, currentPage-1);
        else if(p==='next'){
          if(currentPage >= totalPages){
            // No more products yet — send shoppers to the Coming Soon page
            window.location.href = 'coming-soon.html';
            return;
          }
          currentPage = currentPage+1;
        }
        else currentPage = parseInt(p);
        paginate();
        document.getElementById('offersGrid')?.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }
  if(paginationEl) paginate();

  /* ---- PRODUCT DETAILS QTY CONTROL ---- */
  const pdQtyInput = document.getElementById('pdQty');
  if(pdQtyInput){
    document.getElementById('pdQtyMinus')?.addEventListener('click',()=>{
      pdQtyInput.value = Math.max(1, (parseInt(pdQtyInput.value)||1)-1);
    });
    document.getElementById('pdQtyPlus')?.addEventListener('click',()=>{
      pdQtyInput.value = (parseInt(pdQtyInput.value)||1)+1;
    });
  }

  /* ---- PRODUCT DETAILS THUMBNAILS ---- */
  document.querySelectorAll('.pd-thumbs img').forEach(thumb=>{
    thumb.addEventListener('click', function(){
      document.querySelectorAll('.pd-thumbs img').forEach(t=>t.classList.remove('active'));
      this.classList.add('active');
      const main = document.getElementById('pdMainImg');
      if(main) main.src = this.src;
    });
  });

});
