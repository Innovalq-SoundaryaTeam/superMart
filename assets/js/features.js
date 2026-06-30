/* ============================================
   SUPERMART ENHANCED — FEATURES JS
   Cart, Wishlist, Toast, Auth utilities
============================================ */

/* ---- STORAGE HELPERS ---- */
function getCart(){return JSON.parse(localStorage.getItem('smCart')||'[]');}
function getWishlist(){return JSON.parse(localStorage.getItem('smWishlist')||'[]');}

/* ---- CART ---- */
function addToCart(item){
  const cart=getCart();
  const idx=cart.findIndex(i=>i.name===item.name);
  if(idx>-1){cart[idx].qty=(cart[idx].qty||1)+1;}
  else{cart.push({...item,qty:1});}
  localStorage.setItem('smCart',JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const cart=getCart();
  const total=cart.reduce((s,i)=>s+(i.qty||1),0);
  document.querySelectorAll('#cartCountNav').forEach(el=>{el.textContent=total;});
}

/* ---- WISHLIST ---- */
function toggleWishlist(item, btn){
  let wl=getWishlist();
  const idx=wl.findIndex(i=>i.name===item.name);
  if(idx>-1){
    wl.splice(idx,1);
    if(btn){btn.classList.remove('active');}
    showToast(item.name+' removed from wishlist','info');
  } else {
    wl.push(item);
    if(btn){btn.classList.add('active');}
    showToast(item.name+' added to wishlist ❤️','success');
  }
  localStorage.setItem('smWishlist',JSON.stringify(wl));
}

function isWishlisted(name){
  return getWishlist().some(i=>i.name===name);
}

/* ---- TOAST ---- */
let toastTimer;
function showToast(msg, type='success'){
  const toast=document.getElementById('smToast');
  if(!toast)return;
  const icon=type==='success'?'✓':type==='error'?'✗':'ℹ';
  toast.innerHTML=`<span>${icon}</span> ${msg}`;
  toast.className=`sm-toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.classList.remove('show');},3000);
}

/* ---- INIT ON EVERY PAGE ---- */
document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();

  // Sync navbar auth state
  const user=JSON.parse(localStorage.getItem('smUser')||'{}');
  const authArea=document.getElementById('authArea');
  if(authArea && user.name){
    authArea.innerHTML=`
      <a href="profile.html" class="nav-icon-btn" title="${user.name}"><i class="fa-solid fa-user"></i></a>
    `;
  }

  // Attach add-to-cart buttons already in DOM
  document.querySelectorAll('[data-add-cart]').forEach(btn=>{
    btn.addEventListener('click',function(){
      const card=this.closest('.product-card,[data-product]');
      if(!card)return;
      const item={
        name:card.dataset.name||card.querySelector('h5,h6')?.textContent||'Product',
        price:parseInt(card.dataset.price)||0,
        img:card.dataset.img||card.querySelector('img')?.src||'',
        cat:card.dataset.cat||'',
        badge:card.dataset.badge||'SALE',
        original:card.dataset.original||0,
      };
      addToCart(item);
      showToast(item.name+' added to cart 🛒','success');
    });
  });

  // Attach buy-now buttons
  document.querySelectorAll('[data-buy-now]').forEach(btn=>{
    btn.addEventListener('click',function(){
      const card=this.closest('.product-card,[data-product]');
      if(!card)return;
      const item={
        name:card.dataset.name||card.querySelector('h5,h6')?.textContent||'Product',
        price:parseInt(card.dataset.price)||0,
        img:card.dataset.img||card.querySelector('img')?.src||'',
        qty:1,
      };
      localStorage.setItem('smCart',JSON.stringify([item]));
      updateCartCount();
      window.location.href='payment.html';
    });
  });

  // Attach wishlist buttons
  document.querySelectorAll('[data-wishlist]').forEach(btn=>{
    const card=btn.closest('.product-card,[data-product]');
    if(!card)return;
    const name=card.dataset.name||card.querySelector('h5,h6')?.textContent||'Product';
    if(isWishlisted(name)){btn.classList.add('active');}
    btn.addEventListener('click',function(){
      const item={
        name:card.dataset.name||card.querySelector('h5,h6')?.textContent||'Product',
        price:parseInt(card.dataset.price)||0,
        img:card.dataset.img||card.querySelector('img')?.src||'',
        cat:card.dataset.cat||'',
        badge:card.dataset.badge||'SALE',
        original:card.dataset.original||0,
      };
      toggleWishlist(item,this);
    });
  });
});
