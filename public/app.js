const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const API = "";

function token(){ return localStorage.getItem("biogate_token"); }
function setToken(value){ localStorage.setItem("biogate_token", value); }
function clearToken(){ localStorage.removeItem("biogate_token"); localStorage.removeItem("biogate_user"); }
function saveUser(user){ localStorage.setItem("biogate_user", JSON.stringify(user)); }
function getUser(){ try { return JSON.parse(localStorage.getItem("biogate_user") || "null"); } catch { return null; } }

function showToast(text, isError = false){
  const toast = $("#toast");
  if(!toast){ alert(text); return; }
  toast.textContent = text;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function setMessage(selector, text = "", isError = false){
  const el = $(selector);
  if(!el) return;
  el.textContent = text;
  el.classList.toggle("error", isError);
  el.classList.toggle("visible", Boolean(text));
}

function validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function api(path, options = {}){
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if(token()) headers.Authorization = `Bearer ${token()}`;

  const response = await fetch(API + path, { ...options, headers });
  let data = {};
  try { data = await response.json(); }
  catch { data = { message: "Sunucudan geçerli yanıt alınamadı." }; }

  if(!response.ok) throw new Error(data.message || "İşlem başarısız.");
  return data;
}

function renderAuth(){
  const user = getUser();
  const guestActions = $("#guestActions");
  const userActions = $("#userActions");
  const userName = $("#userName");

  if(!guestActions || !userActions) return;

  if(user && token()){
    guestActions.style.display = "none";
    userActions.style.display = "flex";
    if(userName) userName.textContent = user.companyName || user.email;
  } else {
    guestActions.style.display = "flex";
    userActions.style.display = "none";
    if(userName) userName.textContent = "";
  }
}

async function checkSession(){
  if(!token()){ renderAuth(); return; }

  try{
    const data = await api("/api/auth/me");
    saveUser(data.user);
  }catch{
    clearToken();
  }

  renderAuth();
}

function setupModals(){
  $$("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = $("#" + btn.dataset.open);
      if(modal) modal.classList.add("show");
    });
  });

  $$("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if(modal) modal.classList.remove("show");
    });
  });

  $$(".modal").forEach(modal => {
    modal.addEventListener("click", event => {
      if(event.target === modal) modal.classList.remove("show");
    });
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape") $$(".modal.show").forEach(modal => modal.classList.remove("show"));
  });
}

function setupRegister(){
  const btn = $("#registerSubmit");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    const type = $("#regType")?.value || "";
    const companyName = $("#regCompany")?.value.trim() || "";
    const email = $("#regEmail")?.value.trim() || "";
    const password = $("#regPassword")?.value || "";

    setMessage("#regError", "");
    setMessage("#registerMessage", "");

    if(!companyName || !email || !password){
      setMessage("#regError", "Lütfen tüm alanları doldurun.", true);
      setMessage("#registerMessage", "Lütfen tüm alanları doldurun.", true);
      return;
    }

    if(!validEmail(email)){
      setMessage("#regError", "Geçerli bir e-posta adresi girin.", true);
      setMessage("#registerMessage", "Geçerli bir e-posta adresi girin.", true);
      return;
    }

    if(password.length < 6){
      setMessage("#regError", "Şifre en az 6 karakter olmalıdır.", true);
      setMessage("#registerMessage", "Şifre en az 6 karakter olmalıdır.", true);
      return;
    }

    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Kayıt oluşturuluyor...";

    try{
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ type, companyName, email, password })
      });

      showToast(data.message || "Kayıt başarılı. Giriş yapabilirsiniz.");
      setMessage("#registerMessage", data.message || "Kayıt başarılı. Giriş yapabilirsiniz.");

      $("#regCompany").value = "";
      $("#regEmail").value = "";
      $("#regPassword").value = "";
    }catch(error){
      setMessage("#regError", error.message, true);
      setMessage("#registerMessage", error.message, true);
      showToast(error.message, true);
    }finally{
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}

function setupLogin(){
  const btn = $("#loginSubmit");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    const email = $("#loginEmail")?.value.trim() || "";
    const password = $("#loginPassword")?.value || "";

    setMessage("#loginError", "");
    setMessage("#loginMessage", "");

    if(!email || !password){
      setMessage("#loginError", "Lütfen e-posta ve şifrenizi girin.", true);
      setMessage("#loginMessage", "Lütfen e-posta ve şifrenizi girin.", true);
      return;
    }

    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Giriş yapılıyor...";

    try{
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      setToken(data.token);
      saveUser(data.user);
      renderAuth();
      loadAdminPanel();
      loadNotifications();

      const modal = $("#login");
      if(modal) modal.classList.remove("show");

      showToast("Giriş başarılı.");
    }catch(error){
      setMessage("#loginError", error.message, true);
      setMessage("#loginMessage", error.message, true);
      showToast(error.message, true);
    }finally{
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}

function setupLogout(){
  const btn = $("#logoutBtn");
  if(!btn) return;
  btn.addEventListener("click", () => {
    clearToken();
    renderAuth();
    loadAdminPanel();
    loadNotifications();
    showToast("Çıkış yapıldı.");
  });
}

function setupHeatRequest(){
  const btn = $("#heatSubmit");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    if(!token()){
      const heatModal = $("#heatBuy");
      if(heatModal) heatModal.classList.remove("show");
      const loginModal = $("#login");
      if(loginModal) loginModal.classList.add("show");
      showToast("Isı talebi oluşturmak için giriş yapın.", true);
      return;
    }

    const temperature = $("#heatTemp")?.value || "";
    const purpose = $("#heatPurpose")?.value || "";
    const city = $("#heatCity")?.value || "";

    if(!city){
      showToast("Lütfen şehir seçin.", true);
      return;
    }

    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Talep gönderiliyor...";

    try{
      const data = await api("/api/heat/request", {
        method: "POST",
        body: JSON.stringify({ temperature, purpose, city })
      });

      showToast(data.message || "Isı talebiniz alındı.");
      const heatModal = $("#heatBuy");
      if(heatModal) heatModal.classList.remove("show");
      $("#heatCity").value = "";
      loadAdminPanel();
    }catch(error){
      showToast(error.message, true);
    }finally{
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}

async function loadAdminPanel(){
  const adminSection = $("#admin");
  const adminNavLink = $("#adminNavLink");

  if(!token()){
    if(adminSection) adminSection.classList.add("hidden");
    if(adminNavLink) adminNavLink.classList.add("hidden");
    return;
  }

  try{
    const data = await api("/api/admin/overview");

    if(adminSection) adminSection.classList.remove("hidden");
    if(adminNavLink) adminNavLink.classList.remove("hidden");

    renderAdminFactorySources(data.factorySources || []);
    renderAdminRequests(data.heatRequests || []);
    renderAdminMatches(data.matches || [], data.heatRequests || []);
  }catch{
    if(adminSection) adminSection.classList.add("hidden");
    if(adminNavLink) adminNavLink.classList.add("hidden");
  }
}


function renderAdminFactorySources(sources){
  const list = $("#adminFactorySources");
  if(!list) return;

  list.innerHTML = `
    <div class="market-row header">
      <span>Fabrika/Kaynak</span><span>Şehir</span><span>Sıcaklık</span><span>Durum</span>
    </div>
  `;

  if(!sources.length){
    list.insertAdjacentHTML("beforeend", `<div class="market-row"><strong>Kaynak yok</strong><span>-</span><span>-</span><span class="pill">Bekleniyor</span></div>`);
    return;
  }

  sources.forEach(source => {
    list.insertAdjacentHTML("beforeend", `
      <div class="market-row">
        <strong>${source.factoryName || "-"}</strong>
        <span>${source.city || "-"}</span>
        <span>${source.temperature || "-"}</span>
        <span class="pill">${source.status || "Aktif"}</span>
      </div>
    `);
  });
}


function renderAdminRequests(requests){
  const list = $("#adminRequests");
  const select = $("#matchRequest");
  if(!list || !select) return;

  list.innerHTML = `
    <div class="market-row header">
      <span>Şehir</span><span>Sıcaklık</span><span>Kullanım</span><span>Durum</span>
    </div>
  `;

  select.innerHTML = "";

  if(!requests.length){
    list.insertAdjacentHTML("beforeend", `<div class="market-row"><strong>Talep yok</strong><span>-</span><span>-</span><span class="pill">Bekleniyor</span></div>`);
    select.innerHTML = `<option value="">Henüz talep yok</option>`;
    return;
  }

  requests.slice().reverse().forEach(request => {
    const city = request.city || "Belirtilmedi";
    const temperature = request.temperature || "-";
    const purpose = request.purpose || "-";
    const status = request.status || "Yeni";

    list.insertAdjacentHTML("beforeend", `
      <div class="market-row">
        <strong>${city}</strong>
        <span>${temperature}</span>
        <span>${purpose}</span>
        <span class="pill">${status}</span>
      </div>
    `);

    select.insertAdjacentHTML("beforeend", `
      <option value="${request.id}">${city} • ${temperature} • ${purpose}</option>
    `);
  });
}

function renderAdminMatches(matches, requests){
  const list = $("#adminMatches");
  if(!list) return;

  list.innerHTML = `
    <div class="market-row header">
      <span>Talep</span><span>Kaynak</span><span>Durum</span><span>Tarih</span>
    </div>
  `;

  if(!matches.length){
    list.insertAdjacentHTML("beforeend", `<div class="market-row"><strong>Eşleşme yok</strong><span>-</span><span>-</span><span>-</span></div>`);
    return;
  }

  matches.slice().reverse().forEach(match => {
    const request = requests.find(item => item.id === match.requestId);
    const requestLabel = request ? `${request.city || "-"} • ${request.temperature || "-"}` : "Talep";
    const date = match.createdAt ? new Date(match.createdAt).toLocaleDateString("tr-TR") : "-";

    list.insertAdjacentHTML("beforeend", `
      <div class="market-row">
        <strong>${requestLabel}</strong>
        <span>${match.factoryName || "-"}</span>
        <span class="pill">${match.status || "-"}</span>
        <span>${date}</span>
      </div>
    `);
  });
}

function setupAdminMatch(){
  const btn = $("#createMatchBtn");
  if(!btn) return;

  btn.addEventListener("click", async () => {
    const requestId = $("#matchRequest")?.value || "";
    const factoryName = $("#matchFactory")?.value.trim() || "";
    const status = $("#matchStatus")?.value || "";
    const note = $("#matchNote")?.value.trim() || "";

    setMessage("#matchMessage", "");

    if(!requestId || !factoryName){
      setMessage("#matchMessage", "Talep ve fabrika/kaynak alanları zorunludur.", true);
      return;
    }

    const oldText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Kaydediliyor...";

    try{
      const data = await api("/api/admin/match", {
        method: "POST",
        body: JSON.stringify({ requestId, factoryName, status, note })
      });

      setMessage("#matchMessage", data.message || "Bildirim gönderildi.");
      showToast("Isı alıcısına bildirim gönderildi.");
      $("#matchFactory").value = "";
      $("#matchNote").value = "";
      loadAdminPanel();
    }catch(error){
      setMessage("#matchMessage", error.message, true);
      showToast(error.message, true);
    }finally{
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
}


async function loadNotifications(){
  const countEl = $("#notificationCount");
  const list = $("#notificationList");

  if(!token()){
    if(countEl) countEl.classList.add("hidden");
    if(list) list.innerHTML = `<div class="contact-info-item"><span>Giriş yaptıktan sonra bildirimleriniz görünür.</span></div>`;
    return;
  }

  try{
    const data = await api("/api/notifications");
    const notifications = data.notifications || [];
    const unread = notifications.filter(item => !item.read).length;

    if(countEl){
      countEl.textContent = unread;
      countEl.classList.toggle("hidden", unread === 0);
    }

    if(list){
      if(!notifications.length){
        list.innerHTML = `<div class="contact-info-item"><span>Henüz bildiriminiz yok.</span></div>`;
      }else{
        list.innerHTML = notifications.map(item => `
          <div class="notification-card">
            <strong>${item.title}</strong>
            <span>${item.message}</span>
            <small>${new Date(item.createdAt).toLocaleString("tr-TR")}</small>
          </div>
        `).join("");
      }
    }
  }catch{
    if(countEl) countEl.classList.add("hidden");
  }
}


function setupContactForm(){
  const form = $("#contactForm");
  if(!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if(!payload.name || !payload.email){
      showToast("Lütfen ad ve e-posta alanlarını doldurun.", true);
      return;
    }

    try{
      const data = await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showToast(data.message || "Mesajınız alındı.");
      form.reset();
    }catch(error){
      showToast(error.message, true);
    }
  });
}

function setupPaybackCalculator(){
  const investment = $("#investment");
  const income = $("#income");
  const maintenance = $("#maintenance");
  const payback = $("#payback");
  const bar = $("#paybackBar");
  const comment = $("#paybackComment");

  if(!investment || !income || !maintenance || !payback || !bar || !comment) return;

  function update(){
    const investmentValue = Number(investment.value || 0);
    const incomeValue = Number(income.value || 0);
    const maintenanceValue = Number(maintenance.value || 0);
    const net = Math.max(incomeValue - maintenanceValue, 1);
    const years = investmentValue / net;

    payback.textContent = years.toFixed(1);
    bar.style.width = Math.max(12, Math.min(100, 100 - years * 9)) + "%";

    let text = "Detaylı fizibilite gerekir.";
    if(years <= 3) text = "Yüksek uygunluk: pilot için güçlü aday.";
    else if(years <= 5) text = "Uygulanabilir: teknik keşif ve sözleşme gerekir.";
    else if(years <= 7) text = "Dikkatli fizibilite: büyük müşteri veya teşvik gerekir.";
    else text = "Düşük öncelik: ekonomik görünmüyor.";
    comment.textContent = text;
  }

  [investment, income, maintenance].forEach(input => input.addEventListener("input", update));
  update();
}

function setupFaq(){
  $$(".faq-q").forEach(question => {
    question.addEventListener("click", () => {
      question.closest(".faq-item")?.classList.toggle("active");
    });
  });
}

function init(){
  setupModals();
  setupRegister();
  setupLogin();
  setupLogout();
  setupHeatRequest();
  setupAdminMatch();
  setupContactForm();
  setupPaybackCalculator();
  setupFaq();
  checkSession();
  loadAdminPanel();
  loadNotifications();
}

document.addEventListener("DOMContentLoaded", init);