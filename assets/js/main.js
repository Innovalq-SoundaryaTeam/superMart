/* =====================================
   IMAGE FORMAT FALLBACK (.jpg ↔ .png)
   If a .jpg is missing, tries .png and
   vice versa — so both formats work.
===================================== */
(function initImageFallback(){
  document.addEventListener('error', function(e){
    var img = e.target;
    if (img.tagName !== 'IMG') return;
    // Step 1: try JPG → PNG or PNG → JPG for local assets
    if (img.src.includes('assets/images/')) {
      if (img.src.endsWith('.jpg') && !img.dataset.triedPng) {
        img.dataset.triedPng = '1';
        img.src = img.src.replace('.jpg', '.png');
        return;
      }
      if (img.src.endsWith('.png') && !img.dataset.triedJpg) {
        img.dataset.triedJpg = '1';
        img.src = img.src.replace('.png', '.jpg');
        return;
      }
    }
    // Step 2: if local image not found, fall back to data-fallback URL
    if (img.dataset.fallback && !img.dataset.usedFallback) {
      img.dataset.usedFallback = '1';
      img.src = img.dataset.fallback;
    }
  }, true);
})();

/* =====================================
   THEME TOGGLE (DARK / LIGHT)
   Persists choice in localStorage.
   Respects prefers-color-scheme on first
   visit if no stored choice exists yet.
===================================== */

(function initTheme(){

    const stored = localStorage.getItem("theme");

    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const useDark = stored === "dark" || (!stored && prefersDark);

    if (useDark) {
        document.documentElement.classList.add("dark-mode-pending");
    }

})();

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");

    const stored = localStorage.getItem("theme");

    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const useDark = stored === "dark" || (!stored && prefersDark);

    if (useDark) {
        document.body.classList.add("dark-mode");
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            themeToggle.setAttribute("aria-pressed", "true");
        }
    }

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            document.body.classList.toggle("dark-mode");

            const darkMode = document.body.classList.contains("dark-mode");

            localStorage.setItem("theme", darkMode ? "dark" : "light");

            themeToggle.innerHTML = darkMode
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';

            themeToggle.setAttribute("aria-pressed", String(darkMode));

        });

    }

});


/* =====================================
   OFFER / PRODUCT CATEGORY FILTER
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const filterButtons = document.querySelectorAll(".filter-btn");
    const offerItems = document.querySelectorAll(".offer-item");

    if (!filterButtons.length || !offerItems.length) return;

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
                btn.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            const filter = button.getAttribute("data-filter");

            offerItems.forEach(item => {
                const matches = filter === "all" || item.classList.contains(filter);
                item.style.display = matches ? "block" : "none";
            });

        });

    });

});


/* =====================================
   SORT CONTROL (offers.html)
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const sortSelect = document.getElementById("sortSelect");
    const grid = document.getElementById("offersGrid");

    if (!sortSelect || !grid) return;

    sortSelect.addEventListener("change", () => {

        const items = Array.from(grid.children);
        const value = sortSelect.value;

        items.sort((a, b) => {

            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            const nameA = a.dataset.name.toLowerCase();
            const nameB = b.dataset.name.toLowerCase();

            if (value === "price-low") return priceA - priceB;
            if (value === "price-high") return priceB - priceA;
            if (value === "name") return nameA.localeCompare(nameB);

            return 0;

        });

        items.forEach(item => grid.appendChild(item));

    });

});


/* =====================================
   EMAIL / PHONE VALIDATION HELPERS
===================================== */

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone.trim());
}

function showError(input, message) {
    clearFieldError(input);
    const error = document.createElement("small");
    error.className = "error-message";
    error.setAttribute("role", "alert");
    error.textContent = message;
    input.classList.add("is-invalid");
    input.parentElement.appendChild(error);
}

function clearFieldError(input) {
    input.classList.remove("is-invalid");
    const existing = input.parentElement.querySelector(".error-message");
    if (existing) existing.remove();
}

function clearErrors(form) {
    form.querySelectorAll(".error-message").forEach(error => error.remove());
    form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
}

function showSuccess(form, message) {
    let success = form.querySelector(".success-message");
    if (!success) {
        success = document.createElement("small");
        success.className = "success-message";
        success.setAttribute("role", "status");
        form.appendChild(success);
    }
    success.textContent = message;
}


/* =====================================
   CONTACT FORM VALIDATION
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let isValid = true;
        clearErrors(contactForm);

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const subject = document.getElementById("subject");
        const message = document.getElementById("message");

        if (name.value.trim() === "") {
            showError(name, "Name is required");
            isValid = false;
        }

        if (!isValidEmail(email.value)) {
            showError(email, "Please enter a valid email address");
            isValid = false;
        }

        if (subject.value === "") {
            showError(subject, "Please select a subject");
            isValid = false;
        }

        if (message.value.trim().length < 10) {
            showError(message, "Message must contain at least 10 characters");
            isValid = false;
        }

        if (isValid) {
            showSuccess(contactForm, "Thanks! Your message has been sent.");

            // Submit to Formspree (or your provider) once the action URL above is set.
            if (contactForm.action && !contactForm.action.includes("your-form-id")) {
                contactForm.submit();
            } else {
                contactForm.reset();
            }
        }

    });

});


/* =====================================
   LOYALTY CARD FORM VALIDATION
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const loyaltyForm = document.getElementById("loyaltyForm");
    if (!loyaltyForm) return;

    loyaltyForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let isValid = true;
        clearErrors(loyaltyForm);

        const fullName = document.getElementById("fullName");
        const email = document.getElementById("loyaltyEmail");
        const phone = document.getElementById("phone");
        const dob = document.getElementById("dob");

        if (fullName.value.trim() === "") {
            showError(fullName, "Full name is required");
            isValid = false;
        }

        if (!isValidEmail(email.value)) {
            showError(email, "Valid email required");
            isValid = false;
        }

        if (!isValidPhone(phone.value)) {
            showError(phone, "Phone number must be 10 digits");
            isValid = false;
        }

        if (dob.value === "") {
            showError(dob, "Date of birth is required");
            isValid = false;
        }

        if (isValid) {
            showSuccess(loyaltyForm, "Welcome aboard! Check your inbox to confirm.");
            loyaltyForm.reset();
        }

    });

});


/* =====================================
   NEWSLETTER VALIDATION (index + coming-soon)
===================================== */

function bindNewsletterForm(formId, inputId) {

    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const emailInput = document.getElementById(inputId);
        clearErrors(form);

        if (!isValidEmail(emailInput.value)) {
            showError(emailInput, "Please enter a valid email");
            return;
        }

        showSuccess(form, "Subscribed! Look out for deals in your inbox.");

        // Submit to Mailchimp (or your provider) once the action URL above is set.
        // Skips real submission while the action is still the "#" placeholder.
        if (form.action && !form.action.endsWith("#")) {
            form.submit();
        } else {
            form.reset();
        }

    });

}

document.addEventListener("DOMContentLoaded", () => {
    bindNewsletterForm("newsletterForm", "newsletterEmail");
    bindNewsletterForm("comingSoonForm", "comingSoonEmail");
});


/* =====================================
   STORE LOCATOR SEARCH (store-locator.html)
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.getElementById("storeSearchForm");
    const storeCards = document.querySelectorAll(".store-item");

    if (!searchForm || !storeCards.length) return;

    searchForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const query = document.getElementById("storeSearch").value.trim().toLowerCase();

        storeCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = query === "" || text.includes(query) ? "block" : "none";
        });

    });

});


/* =====================================
   COMING SOON COUNTDOWN TIMER
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const daysBox = document.getElementById("days");
    const hoursBox = document.getElementById("hours");
    const minutesBox = document.getElementById("minutes");
    const secondsBox = document.getElementById("seconds");

    if (!daysBox || !hoursBox || !minutesBox || !secondsBox) return;

    const launchDate = new Date("December 31, 2026 23:59:59").getTime();

    function updateCountdown() {

        const now = new Date().getTime();
        const distance = launchDate - now;

        if (distance <= 0) {
            daysBox.textContent = "0";
            hoursBox.textContent = "0";
            minutesBox.textContent = "0";
            secondsBox.textContent = "0";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysBox.textContent = days;
        hoursBox.textContent = hours;
        minutesBox.textContent = minutes;
        secondsBox.textContent = seconds;

    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

});


/* =====================================
   PAGINATION DEMO (offers.html)
   Purely visual — swaps the active page
   indicator; product list is static demo
   content so no real paging is performed.
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    const pageLinks = document.querySelectorAll(".pagination .page-link[data-page]");
    if (!pageLinks.length) return;

    pageLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            const pageNum = link.dataset.page;
            if (pageNum === "2" || pageNum === "3" || pageNum === "next") {
                return; // let the link navigate to coming-soon.html
            }

            e.preventDefault();

            document.querySelectorAll(".pagination .page-item").forEach(item =>
                item.classList.remove("active")
            );

            link.parentElement.classList.add("active");

            const grid = document.getElementById("offersGrid");
            if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });

        });

    });

});

/* ============================================
   WEEKLY OFFERS COUNTDOWN
============================================ */
function startWeeklyCountdown(){
  const el = document.getElementById('weeklyCountdown');
  if(!el) return;
  function getNextSunday(){
    const now = new Date();
    const next = new Date(now);
    next.setHours(23,59,59,0);
    const daysUntilSunday = (7 - now.getDay()) % 7;
    next.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    return next;
  }
  let target = getNextSunday();
  function tick(){
    const now = new Date();
    let diff = target - now;
    if(diff <= 0){ target = getNextSunday(); diff = target - now; }
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    el.textContent = `New deals in ${d}d ${h}h ${m}m ${s}s`;
  }
  tick();
  setInterval(tick, 1000);
}
document.addEventListener('DOMContentLoaded', startWeeklyCountdown);
