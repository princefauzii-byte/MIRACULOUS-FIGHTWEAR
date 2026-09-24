const products = [
  {id:1,name:"MIRACULOUS BOXING TRUNKS",category:"Boxing",price:349000,badge:"NEW",desc:"Lightweight fight trunks with a flexible cut designed for fast footwork and full movement.",visual:"BOXING",image:"images/products/boxing-trunks.jpg"},
  {id:2,name:"MIRACULOUS FIGHT SHORTS",category:"MMA",price:299000,badge:"BEST",desc:"Training and fight shorts with a clean athletic silhouette and durable construction.",visual:"FIGHT",image:"images/products/fight-shorts.jpg"},
  {id:3,name:"MIRACULOUS BOXING GLOVES",category:"Boxing",price:799000,badge:"",desc:"Premium training gloves built for pad work, bag work, and technical sessions.",visual:"GLOVES",image:"images/products/boxing-gloves.jpg"},
  {id:4,name:"MIRACULOUS MUAY THAI SHORTS",category:"Muay Thai",price:329000,badge:"NEW",desc:"Classic-inspired Muay Thai shorts with a modern MIRACULOUS identity.",visual:"MUAY THAI",image:"images/products/muay-thai-shorts.jpg"},
  {id:5,name:"MIRACULOUS RASHGUARD",category:"MMA",price:399000,badge:"",desc:"Compression rashguard designed to stay comfortable during grappling and striking sessions.",visual:"RASHGUARD",image:"images/products/rashguard.jpg"},
  {id:6,name:"MIRACULOUS TRAINING TEE",category:"Apparel",price:229000,badge:"",desc:"Everyday training tee with a relaxed fit and the MIRACULOUS statement mark.",visual:"TRAIN",image:"images/products/training-tee.jpg"},
  {id:7,name:"MIRACULOUS HAND WRAPS",category:"Boxing",price:89000,badge:"",desc:"Reliable hand wraps for everyday boxing and striking practice.",visual:"WRAPS",image:"images/products/hand-wraps.jpg"},
  {id:8,name:"MIRACULOUS FIGHT HOODIE",category:"Apparel",price:449000,badge:"DROP",desc:"Heavyweight hoodie for warm-ups, travel, and everyday fightwear style.",visual:"HOODIE",image:"images/products/fight-hoodie.jpg"}
];

let currentFilter = "All";
let currentProducts = [...products];
let cart = JSON.parse(localStorage.getItem("miraculousCart") || "[]");
let modalProduct = null;
let modalQty = 1;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const formatIDR = (n) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);

function renderProducts(list = currentProducts){
  const grid = $("#productGrid");
  const empty = $("#emptyState");
  grid.innerHTML = "";
  if(!list.length){ empty.classList.add("show"); return; }
  empty.classList.remove("show");
  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">
        ${p.badge ? `<span class="product-tag">${p.badge}</span>` : ""}
        <div class="product-actions">
          <button class="quick-btn wishlist" aria-label="Wishlist" data-id="${p.id}">♡</button>
          <button class="quick-btn detail" aria-label="View product" data-id="${p.id}">↗</button>
        </div>
        <img class="product-photo" src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <p class="product-category">${p.category.toUpperCase()}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">${formatIDR(p.price)}</p>
        <button class="add-btn add-product" data-id="${p.id}">ADD TO CART</button>
      </div>`;
    grid.appendChild(card);
  });
  $$(".add-product").forEach(btn => btn.addEventListener("click", () => addToCart(Number(btn.dataset.id))));
  $$(".detail").forEach(btn => btn.addEventListener("click", () => openModal(Number(btn.dataset.id))));
  $$(".wishlist").forEach(btn => btn.addEventListener("click", () => {
    btn.textContent = btn.textContent === "♡" ? "♥" : "♡";
    showToast(btn.textContent === "♥" ? "Added to wishlist" : "Removed from wishlist");
  }));
}

function applyFilters(){
  let list = products.filter(p => currentFilter === "All" || p.category === currentFilter);
  const search = $("#searchInput").value.trim().toLowerCase();
  if(search) list = list.filter(p => `${p.name} ${p.category} ${p.visual}`.toLowerCase().includes(search));
  const sort = $("#sortSelect").value;
  if(sort === "low") list.sort((a,b)=>a.price-b.price);
  if(sort === "high") list.sort((a,b)=>b.price-a.price);
  currentProducts = list;
  renderProducts(list);
}

function addToCart(id, qty=1){
  const item = cart.find(x => x.id === id);
  if(item) item.qty += qty;
  else cart.push({id,qty});
  saveCart();
  updateCart();
  showToast("Added to cart");
}

function saveCart(){ localStorage.setItem("miraculousCart", JSON.stringify(cart)); }

function updateCart(){
  const items = $("#cartItems");
  const empty = $("#cartEmpty");
  const totalEl = $("#cartTotal");
  const countEl = $("#cartCount");
  items.innerHTML = "";
  let total = 0, count = 0;
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if(!p) return;
    total += p.price * item.qty;
    count += item.qty;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-thumb"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div>
        <h4>${p.name}</h4>
        <p>${formatIDR(p.price)}</p>
        <div class="cart-controls">
          <button class="qty-minus" data-id="${p.id}">−</button>
          <span>${item.qty}</span>
          <button class="qty-plus" data-id="${p.id}">+</button>
        </div>
      </div>
      <button class="cart-remove" data-id="${p.id}" aria-label="Remove">×</button>`;
    items.appendChild(row);
  });
  countEl.textContent = count;
  totalEl.textContent = formatIDR(total);
  empty.style.display = cart.length ? "none" : "block";

  $$(".qty-minus").forEach(b => b.addEventListener("click",()=>changeCart(Number(b.dataset.id),-1)));
  $$(".qty-plus").forEach(b => b.addEventListener("click",()=>changeCart(Number(b.dataset.id),1)));
  $$(".cart-remove").forEach(b => b.addEventListener("click",()=>removeFromCart(Number(b.dataset.id))));
}

function changeCart(id, delta){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(x=>x.id!==id);
  saveCart(); updateCart();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id);
  saveCart(); updateCart(); showToast("Removed from cart");
}

function openCart(){
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
  if(!$("#productModal").classList.contains("open")) document.body.classList.remove("no-scroll");
}

function openModal(id){
  modalProduct = products.find(p=>p.id===id);
  if(!modalProduct) return;
  modalQty = 1;
  $("#modalCategory").textContent = modalProduct.category;
  $("#modalName").textContent = modalProduct.name;
  $("#modalPrice").textContent = formatIDR(modalProduct.price);
  $("#modalDescription").textContent = modalProduct.desc;
  $("#modalQty").textContent = modalQty;
  $("#modalVisual").innerHTML = `<img class="modal-photo" src="${modalProduct.image}" alt="${modalProduct.name}">`;
  $("#productModal").classList.add("open");
  $("#overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeModal(){
  $("#productModal").classList.remove("open");
  $("#overlay").classList.remove("open");
  if(!$("#cartDrawer").classList.contains("open")) document.body.classList.remove("no-scroll");
}

function showToast(message){
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"),1800);
}

$("#filters").addEventListener("click",e=>{
  const btn = e.target.closest(".filter");
  if(!btn) return;
  $$(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  applyFilters();
});

$("#sortSelect").addEventListener("change", applyFilters);
$("#searchInput").addEventListener("input", applyFilters);

$("#searchToggle").addEventListener("click",()=>{
  $("#searchPanel").classList.toggle("open");
  if($("#searchPanel").classList.contains("open")) $("#searchInput").focus();
});
$("#searchClose").addEventListener("click",()=>$("#searchPanel").classList.remove("open"));

$("#cartToggle").addEventListener("click",openCart);
$("#cartClose").addEventListener("click",closeCart);
$("#overlay").addEventListener("click",()=>{closeCart();closeModal()});
$("#modalClose").addEventListener("click",closeModal);

$("#modalMinus").addEventListener("click",()=>{modalQty=Math.max(1,modalQty-1);$("#modalQty").textContent=modalQty});
$("#modalPlus").addEventListener("click",()=>{modalQty++;$("#modalQty").textContent=modalQty});
$("#modalAdd").addEventListener("click",()=>{if(modalProduct){addToCart(modalProduct.id,modalQty);closeModal();openCart()}});

$$(".size-options button").forEach(b=>b.addEventListener("click",()=>{
  $$(".size-options button").forEach(x=>x.classList.remove("selected")); b.classList.add("selected");
}));

$("#checkoutBtn").addEventListener("click",()=>showToast("Demo only — checkout is not connected."));
$("#browseProducts").addEventListener("click",closeCart);

$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$$(".nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));

$$(".category-card").forEach(card=>card.addEventListener("click",()=>{
  const category = card.dataset.category;
  currentFilter = category;
  $$(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===category));
  document.querySelector("#shop").scrollIntoView({behavior:"smooth"});
  applyFilters();
}));

$("#newsletterForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email = $("#email").value.trim();
  $("#formMessage").textContent = `Thanks — ${email} is on the list.`;
  e.target.reset();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeCart();closeModal();$("#searchPanel").classList.remove("open")}
});

renderProducts(products);
updateCart();
