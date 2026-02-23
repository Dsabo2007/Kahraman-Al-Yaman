// Translations
const translations = {
    ar: {
        site_name: "كهرمان اليمان",
        welcome: "كهرمان اليمان",
        start: "ابد",
        search_placeholder: "ادخل رقم المنتج...",
        dashboard_title: "لوحة التحكم",
        add_product: "اضافة منتج",
        product_list: "قائمة المنتجات",
        upl_image: "رفع صورة",
        prod_name_ar: "اسم المنتج (عربي)",
        prod_name_en: "اسم المنتج (انجليزي)",
        prod_desc_ar: "التفاصيل (عربي)",
        prod_desc_en: "التفاصيل (انجليزي)",
        prod_num: "رقم المنتج",
        save: "حفظ",
        edit: "تعديل",
        delete: "حذف",
        edit_mode: "تعديل المنتج",
        add_mode: "إضافة منتج",
        cancel: "إلغاء",
        no_products: "لا توجد منتجات حاليا",
        admin_link: "الادارة",
        admin_login: "دخول الادارة",
        login: "دخول",
        security_settings: "إعدادات الأمان",
        current_password: "كلمة المرور الحالية",
        new_password: "كلمة المرور الجديدة",
        confirm_password: "تأكيد كلمة المرور الجديدة",
        change_password: "تغيير كلمة المرور",
        products_tab: "المنتجات",
        security_tab: "إعدادات الأمان",
        nav_home: "الرئيسية",
        nav_home: "الرئيسية",
        nav_products: "المنتجات",
        classification: "تصنيف المنتج",
        logo_silver: "لوقو فضي",
        logo_gold: "لوقو ذهبي",
        logo_diamond: "لوقو ماسي",
        filter_all: "الكل",
        footer_dev: "تم البرمجة والتطوير بواسطة المهندس محمد صباح",
        whatsapp: "واتساب"
    },
    en: {
        site_name: "Kahraman Al-Yaman",
        welcome: "Kahraman Al-Yaman",
        start: "Start",
        search_placeholder: "Enter Product ID...",
        dashboard_title: "Dashboard",
        add_product: "Add Product",
        product_list: "Product List",
        upl_image: "Upload Image",
        prod_name_ar: "Product Name (Arabic)",
        prod_name_en: "Product Name (English)",
        prod_desc_ar: "Details (Arabic)",
        prod_desc_en: "Details (English)",
        prod_num: "Product Number",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        edit_mode: "Edit Product",
        add_mode: "Add Product",
        cancel: "Cancel",
        no_products: "No products available",
        admin_link: "Admin",
        admin_login: "Admin Login",
        login: "Login",
        security_settings: "Security Settings",
        current_password: "Current Password",
        new_password: "New Password",
        confirm_password: "Confirm New Password",
        change_password: "Change Password",
        products_tab: "Products",
        security_tab: "Security Settings",
        nav_home: "Home",
        nav_home: "Home",
        nav_products: "Products",
        classification: "Product Classification",
        logo_silver: "Silver Logo",
        logo_gold: "Gold Logo",
        logo_diamond: "Diamond Logo",
        filter_all: "All",
        footer_dev: "Programmed and Developed by Engineer Muhammad Sabah",
        whatsapp: "WhatsApp"
    }
};

// State
let currentLang = localStorage.getItem('site_lang') || 'ar';


let products = []; // Initialized empty, loaded from Supabase
let currentFilter = 'diamond'; // Default to Diamond

// DOM Elements
const langToggle = document.getElementById('lang-toggle');
const productsList = document.getElementById('products-list');
const searchInput = document.getElementById('search-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLang);
    fetchProducts(); // Load from Supabase

    if (langToggle) {
        langToggle.textContent = currentLang === 'ar' ? 'ENGLISH' : 'العربية';
        langToggle.addEventListener('click', toggleLanguage);
    }

    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Check if on Admin Page
    if (document.getElementById('product-form')) {
        checkAdminAuth();
        initAdmin();
        initTabs();
    }

    // View Toggles
    initViewToggles();

    // Filter Bar
    initFilterBar();
});


function initFilterBar() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            // Update filter with animation
            currentFilter = btn.dataset.filter;

            // Trigger Fade/Slide Animation
            const list = document.getElementById('products-list');
            list.style.opacity = '0';
            list.style.transform = 'translateY(20px)';

            setTimeout(() => {
                renderProducts();
                list.style.transition = 'all 0.5s ease';
                list.style.opacity = '1';
                list.style.transform = 'translateY(0)';
            }, 300);
        });
    });
}

function initViewToggles() {
    const listBtn = document.getElementById('view-list');
    const gridBtn = document.getElementById('view-grid');
    const productsList = document.getElementById('products-list');

    if (!listBtn || !gridBtn || !productsList) return;

    // Load saved preference
    const currentView = localStorage.getItem('products_view') || 'list';
    applyView(currentView);

    listBtn.addEventListener('click', () => {
        applyView('list');
        localStorage.setItem('products_view', 'list');
    });

    gridBtn.addEventListener('click', () => {
        applyView('grid');
        localStorage.setItem('products_view', 'grid');
    });

    function applyView(view) {
        if (view === 'grid') {
            productsList.classList.add('grid-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            productsList.classList.remove('grid-view');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        }
    }
}

function checkAdminAuth() {
    const modal = document.getElementById('login-modal');
    const app = document.getElementById('admin-app');
    const btn = document.getElementById('login-btn');
    const passInput = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error');

    // Check session
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        modal.classList.add('hidden');
        app.style.filter = 'none';
        app.style.pointerEvents = 'all';
        return;
    }

    btn.addEventListener('click', () => {
        const pass = passInput.value;
        const savedPassword = localStorage.getItem('admin_password') || '1234'; // Default password
        if (pass === savedPassword) {
            sessionStorage.setItem('admin_logged_in', 'true');
            modal.classList.add('hidden');
            app.style.filter = 'none';
            app.style.pointerEvents = 'all';
        } else {
            errorMsg.style.display = 'block';
            passInput.value = '';
            passInput.focus();
        }
    });

    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btn.click();
    });
}


// --- Data Layer (Node.js API) ---
async function fetchProducts() {
    try {
        const response = await fetch('https://kahraman-al-yaman-production.up.railway.app/api/products');
        if (!response.ok) throw new Error('Failed to fetch products from server');

        const data = await response.json();

        products = data || [];
        renderProducts();

        // If on admin page, render admin list too
        if (document.getElementById('admin-products-list')) {
            renderAdminList();
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        const msg = err.message.includes('fetch') ? "الخادم غير متصل. الرجاء تشغيل السيرفر." : "فشل في تحميل المنتجات";
        showToast(msg, "error");
    }
}


// Smooth Language Transition
function toggleLanguage() {
    document.body.classList.add('fade-out'); // Add fade-out class from CSS

    setTimeout(() => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        localStorage.setItem('site_lang', currentLang);

        updateLanguage(currentLang);
        langToggle.textContent = currentLang === 'ar' ? 'ENGLISH' : 'العربية';
        renderProducts(); // Re-render to update text

        // Wait a bit then fade back in
        setTimeout(() => {
            document.body.classList.remove('fade-out');
        }, 100);
    }, 500); // Wait for fade out transition (0.5s matches CSS)
}

function updateLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update static text
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
}

function renderProducts() {
    if (!productsList) return;
    productsList.innerHTML = '';

    // 1. Filter
    let filteredProducts = products;

    // Always filter by current category (remove 'all' logic basically, but keep safe fallback)
    filteredProducts = products.filter(p => (p.classification || 'silver') === currentFilter);

    if (filteredProducts.length === 0) {
        productsList.innerHTML = `<p style="text-align:center; color: var(--text-light); margin-top: 2rem; font-size: 1.2rem;">${translations[currentLang].no_products}</p>`;
        return;
    }

    // 2. Sort by DB Number logic (Standard) OR just Visual Re-numbering?
    // User asked for: "re-number displayed products starting from 1... regardless of original number"
    // So we just iterate the filtered list and assign a visual index.

    // We still might want to sort them by their original number initially so the order is deterministic
    // filteredProducts.sort((a, b) => a.number - b.number); 
    // BUT, if user wants them ordered by addition or another metric, we should respect that.
    // For now, let's sort by ID (creation time) or Number to keep it stable.
    filteredProducts.sort((a, b) => a.number - b.number);

    filteredProducts.forEach((product, index) => {
        // Map DB snake_case to CamelCase if they come raw from DB, 
        // OR rely on the mapping done during Fetch/Save. 
        // Current implementation tries to map during fetch/save, but let's be safe.
        const nameAr = product.nameAr || product.name_ar;
        const nameEn = product.nameEn || product.name_en;
        const descAr = product.descAr || product.desc_ar;
        const descEn = product.descEn || product.desc_en;

        const name = currentLang === 'ar' ? nameAr : nameEn;
        const desc = currentLang === 'ar' ? descAr : descEn;

        // VISUAL Numbering: 1 to N based on FILTERED results
        const visualNumber = index + 1;

        const card = document.createElement('div');
        card.className = 'product-card';
        // Staggered animation for items
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;

        // Use internal ID for DOM to avoid duplicates if same number exists in different categories
        // Although in this filtered view effectively numbers are unique, but good practice.
        card.id = `product-card-${product.id}`;
        card.dataset.productNumber = product.number; // Store number for search

        card.innerHTML = `
            <div class="product-id-badge ${'badge-' + (product.classification || 'silver')}">
                <i class="fa-solid fa-hashtag"></i> <span>${visualNumber}</span>
            </div>
            <div class="product-image-frame">
                ${product.image ? `<img src="${product.image}" class="product-image" loading="lazy" alt="${name}">` : '<div style="color:#ccc"><i class="fa-regular fa-image fa-3x"></i></div>'}
            </div>
            <div class="product-details">
                <h2 class="product-title">${name}</h2>
                <p class="product-desc">${desc}</p>
            </div>
        `;
        productsList.appendChild(card);
    });
}

function handleSearch(e) {
    e.preventDefault(); // Prevent form submission

    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    if (!query) return;

    // Search in CURRENT visible list logic?
    // User probably wants to find product #101 wherever it is.
    // Use data-product-number attribute.

    // Find all cards with this number
    // Search in CURRENT visible list logic?
    // User probably wants to find product #101 wherever it is.
    // Use data-product-number attribute.

    // Find all cards with this number
    const targetCards = document.querySelectorAll(`.product-card[data-product-number="${query}"]`);

    if (targetCards.length > 0) {
        const targetElement = targetCards[0]; // Scroll to first match
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight effect
        targetCards.forEach(card => {
            card.classList.add('pulse');
            card.style.border = '2px solid var(--color-accent)';
            setTimeout(() => {
                card.classList.remove('pulse');
                card.style.border = '';
            }, 3000);
        });
    } else {
        showToast("لم يتم العثور على المنتج في هذا القسم", "error");
    }
}

// --- Utils ---
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-circle-exclamation'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// Image Compression
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Admin Logic
function initAdmin() {
    const form = document.getElementById('product-form');
    const imageInput = document.getElementById('img-input');
    const imagePreview = document.getElementById('img-preview');
    const adminList = document.getElementById('admin-products-list');

    let currentImageBase64 = null;
    let editingProductId = null; // Track which product is being edited

    // Handle Image Upload with Compression
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                showToast("جاري معالجة الصورة...", "nomal");
                const compressed = await compressImage(file);
                currentImageBase64 = compressed;
                imagePreview.style.backgroundImage = `url(${currentImageBase64})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.textContent = '';
                showToast("تم رفع الصورة بنجاح");
            } catch (err) {
                console.error(err);
                showToast("فشل في معالجة الصورة", "error");
            }
        }
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const numVal = document.getElementById('p-number').value;
        const targetClass = document.getElementById('p-classification').value;

        const productData = {
            number: numVal,
            classification: targetClass,
            name_ar: document.getElementById('p-name-ar').value,
            name_en: document.getElementById('p-name-en').value,
            desc_ar: document.getElementById('p-desc-ar').value,
            desc_en: document.getElementById('p-desc-en').value,
            image: currentImageBase64
        };

        if (editingProductId) {
            // UPDATE MODE
            const productIndex = products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                try {
                    showToast("جاري التحديث...", "normal");
                    const res = await fetch(`https://kahraman-al-yaman-production.up.railway.app/api/products/${editingProductId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });

                    if (!res.ok) throw new Error('Update failed');

                    // Update local cache
                    products[productIndex] = {
                        id: editingProductId,
                        ...productData,
                        nameAr: productData.name_ar,
                        nameEn: productData.name_en,
                        descAr: productData.desc_ar,
                        descEn: productData.desc_en
                    };

                    showToast('تم التعديل بنجاح');

                } catch (err) {
                    console.error(err);
                    showToast("فشل التحديث", "error");
                }
            }
        } else {
            // ADD MODE
            // Check for duplicate number WITHIN the same category
            const existingIndex = products.findIndex(p => p.number === numVal && (p.classification || 'silver') === targetClass);

            if (existingIndex !== -1) {
                // UPDATE (Replace existing)
                try {
                    showToast("جاري الحفظ...", "normal");
                    const docId = products[existingIndex].id;
                    const res = await fetch(`https://kahraman-al-yaman-production.up.railway.app/api/products/${docId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                    if (!res.ok) throw new Error('Update failed');

                    products[existingIndex] = { id: docId, ...productData, nameAr: productData.name_ar, nameEn: productData.name_en, descAr: productData.desc_ar, descEn: productData.desc_en };
                    showToast('تم الاستبدال بنجاح');
                } catch (err) {
                    console.error(err);
                    showToast("حدث خطأ أثناء الاستبدال", "error");
                }
            } else {
                // ADD NEW
                try {
                    showToast("جاري الحفظ...", "normal");
                    const res = await fetch(`https://kahraman-al-yaman-production.up.railway.app/api/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                    if (!res.ok) throw new Error('Save failed');

                    const data = await res.json();
                    products.push({ id: data.id, ...productData, nameAr: productData.name_ar, nameEn: productData.name_en, descAr: productData.desc_ar, descEn: productData.desc_en });
                    showToast('تم الحفظ بنجاح');
                } catch (err) {
                    console.error(err);
                    showToast("حدث خطأ أثناء الحفظ", "error");
                }
            }
        }

        // Finalize
        renderAdminList();
        renderProducts();
        cancelEdit();

    });

    // Edit Product - Load into form
    window.editProduct = (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            editingProductId = id; // Set ID

            // Populate form
            document.getElementById('p-number').value = product.number;
            document.getElementById('p-classification').value = product.classification || 'silver';
            document.getElementById('p-name-ar').value = product.nameAr || product.name_ar;
            document.getElementById('p-name-en').value = product.nameEn || product.name_en || '';
            document.getElementById('p-desc-ar').value = product.descAr || product.desc_ar || '';
            document.getElementById('p-desc-en').value = product.descEn || product.desc_en || '';

            // Load image
            if (product.image) {
                currentImageBase64 = product.image;
                imagePreview.style.backgroundImage = `url(${currentImageBase64})`;
                imagePreview.style.backgroundSize = 'cover';
                imagePreview.textContent = '';
            } else {
                currentImageBase64 = null;
                imagePreview.style.backgroundImage = '';
                imagePreview.textContent = 'اضغط لرفع صورة';
            }

            // Show edit mode UI
            document.querySelector('.admin-sidebar h2').textContent = translations[currentLang].edit_mode;
            document.querySelector('.submit-btn').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> تحديث المنتج';

            // Add cancel button if not exists
            if (!document.getElementById('btn-cancel-edit')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.id = 'btn-cancel-edit';
                cancelBtn.className = 'btn btn-secondary';
                cancelBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> إلغاء';
                cancelBtn.style.marginRight = '10px';
                cancelBtn.onclick = cancelEdit;
                document.querySelector('.submit-btn').parentNode.appendChild(cancelBtn);
            }

            // Scroll to form
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Cancel Edit - Reset form
    window.cancelEdit = () => {
        editingProductId = null;
        form.reset();
        currentImageBase64 = null;
        imagePreview.style.background = '';
        imagePreview.innerHTML = `
            <i class="fa-solid fa-cloud-arrow-up fa-2x"></i>
            <br>
            <span data-i18n="upl_image" style="margin-top:8px; display:block; font-size:0.9rem;">${translations[currentLang].upl_image}</span>
        `;

        const sidebarTitle = document.querySelector('.admin-sidebar h2');
        if (sidebarTitle) sidebarTitle.textContent = translations[currentLang].add_product;

        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> إضافة المنتج';


        const cancelBtn = document.getElementById('btn-cancel-edit');
        if (cancelBtn) cancelBtn.remove();
    };

    // Delete Product
    window.deleteProduct = async (id) => {
        if (confirm('هل انت متاكد من الحذف؟')) {
            try {
                const res = await fetch(`https://kahraman-al-yaman-production.up.railway.app/api/products/${id}`, {
                    method: 'DELETE'
                });

                if (!res.ok) throw new Error('Delete failed');

                products = products.filter(p => p.id !== id);
                renderAdminList();
                showToast('تم الحذف');

                // If deleting the product being edited, cancel edit mode
                if (editingProductId === id) {
                    cancelEdit();
                }
            } catch (err) {
                console.error(err);
                showToast("فشل الحذف", "error");
            }
        }
    };


    // Password Change Form
    const passwordForm = document.getElementById('password-change-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            const savedPassword = localStorage.getItem('admin_password') || '1234';

            if (currentPassword !== savedPassword) {
                showToast('كلمة المرور الحالية غير صحيحة', 'error');
                return;
            }

            if (newPassword.length < 4) {
                showToast('كلمة المرور يجب أن تكون 4 أحرف على الأقل', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast('كلمة المرور الجديدة وتأكيدها غير متطابقتين', 'error');
                return;
            }

            localStorage.setItem('admin_password', newPassword);
            showToast('تم تغيير كلمة المرور بنجاح');
            passwordForm.reset();
        });
    }

    // Add Backup/Restore Buttons functionality if they existed
    // For now we just focus on the core request improvements
    renderAdminList();
}

// Tab System
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

function renderAdminList() {
    const adminList = document.getElementById('admin-products-list');
    if (!adminList) return;
    adminList.innerHTML = '';

    // Sort by ID
    const sorted = [...products].sort((a, b) => a.number - b.number);

    sorted.forEach(p => {
        const item = document.createElement('div');
        item.className = 'admin-product-item';
        const name = p.nameAr || p.name_ar;
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                ${p.image ? `<img src="${p.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">` : ''}
                <div>
                    <strong>#${p.number}</strong> <span style="font-size:0.8rem; color:var(--text-light)">(${p.classification || 'silver'})</span> - ${name}
                </div>
            </div>
            <div class="admin-actions">
                <button type="button" class="btn-icon btn-edit" onclick="editProduct(${p.id})">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn-icon btn-delete" onclick="deleteProduct(${p.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        adminList.appendChild(item);
    });
}
