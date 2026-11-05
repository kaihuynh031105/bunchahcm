/**
 * Bún Chả Hà Nội Chính Gốc – Đến Với Sài Gòn
 * Frontend Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Price map for dishes ---
  const dishPrices = {
    'buncha-truyenthong': { name: 'Bún Chả Truyền Thống', price: 60000 },
    'buncha-dacbiet': { name: 'Bún Chả Đặc Biệt (Hà Thành Đệ Nhất)', price: 85000 },
    'nem-ran': { name: 'Bún Nem Rán Giòn Rụm (Chả Giò Phố Cổ)', price: 65000 },
    'nem-chua-ran': { name: 'Nem Chua Rán Hà Nội (Đĩa 6 chiếc)', price: 50000 },
    'cha-com': { name: 'Chả Cốm Làng Vòng Chiên Vàng', price: 55000 },
    'banh-cuon': { name: 'Bánh Cuốn Nóng Thịt Mộc Nhĩ Gia Truyền', price: 50000 },
    'trung-op-la': { name: 'Trứng Ốp La Lòng Đào Kèm Chả (2 quả)', price: 15000 },
    'nuoc-mam-bac': { name: 'Bát Nước Mắm Pha Bắc Chuẩn Vị (Thêm)', price: 15000 },
    'tra-da': { name: 'Trà Đá Hà Nội Chính Hiệu (Trà Mạn Thái Nguyên)', price: 10000 },
    'che-thap-cam': { name: 'Chè Thập Cẩm Hà Nội Cốt Dừa', price: 30000 }
  };

  // --- Mobile Navigation ---
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileClose = document.getElementById('mobileClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- Navbar Sticky Shadow ---
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Menu Filter Tabs ---
  const tabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // --- Order Form & Price Calculation ---
  const dishSelect = document.getElementById('dishSelect');
  const guestCountInput = document.getElementById('guestCount');
  const totalSummaryPrice = document.getElementById('totalSummaryPrice');
  const orderForm = document.getElementById('orderForm');

  function updateOrderCalculation() {
    const selectedDishKey = dishSelect.value;
    const quantity = parseInt(guestCountInput.value, 10) || 1;

    let singlePrice = 60000;
    if (dishPrices[selectedDishKey]) {
      singlePrice = dishPrices[selectedDishKey].price;
    }

    const total = singlePrice * quantity;
    if (totalSummaryPrice) {
      totalSummaryPrice.textContent = total.toLocaleString('vi-VN') + 'đ';
    }
    return total;
  }

  if (dishSelect) dishSelect.addEventListener('change', updateOrderCalculation);
  if (guestCountInput) guestCountInput.addEventListener('input', updateOrderCalculation);

  // --- Quick Select Dish from Menu Cards ---
  const selectDishButtons = document.querySelectorAll('.btn-select-dish');
  selectDishButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dishKey = btn.getAttribute('data-dish-key');
      if (dishSelect && dishKey) {
        dishSelect.value = dishKey;
        updateOrderCalculation();
        
        // Scroll smoothly to order section
        const orderSection = document.getElementById('order');
        if (orderSection) {
          orderSection.scrollIntoView({ behavior: 'smooth' });
          // Highlight form briefly
          const formCard = document.querySelector('.order-form-card');
          if (formCard) {
            formCard.style.outline = '3px solid var(--color-ember-red)';
            setTimeout(() => {
              formCard.style.outline = 'none';
            }, 1200);
          }
        }
      }
    });
  });

  // Initialize calculation
  updateOrderCalculation();

  // Set default arrival time to 30 mins from now
  const arrivalTimeInput = document.getElementById('arrivalTime');
  if (arrivalTimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    arrivalTimeInput.value = `${hours}:${minutes}`;
  }

  // --- Form Submission Handler ---
  // Modal Elements
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalName = document.getElementById('modalName');
  const modalPhone = document.getElementById('modalPhone');
  const modalTime = document.getElementById('modalTime');
  const modalDish = document.getElementById('modalDish');
  const modalTotal = document.getElementById('modalTotal');
  const modalService = document.getElementById('modalService');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerName = document.getElementById('customerName').value.trim();
      const customerPhone = document.getElementById('customerPhone').value.trim();
      const arrivalTime = document.getElementById('arrivalTime').value;
      const selectedDishKey = dishSelect.value;
      const dishInfo = dishPrices[selectedDishKey] || { name: 'Bún Chả Truyền Thống', price: 60000 };
      const serviceType = document.getElementById('serviceType').value;
      const guestCount = parseInt(guestCountInput.value, 10) || 1;
      const customerNotes = document.getElementById('customerNotes').value.trim();
      const totalAmount = updateOrderCalculation();

      // Basic validation
      if (!customerName || !customerPhone || !arrivalTime) {
        alert('Vui lòng điền đầy đủ Tên, Số điện thoại và Giờ đến!');
        return;
      }

      const orderData = {
        name: customerName,
        phone: customerPhone,
        service: serviceType === 'delivery' ? 'Giao hàng tận nơi' : 'Đặt bàn ăn tại quán',
        dish: dishInfo.name,
        quantity: guestCount,
        arrivalTime: arrivalTime,
        notes: customerNotes || 'Không có ghi chú thêm',
        totalPrice: totalAmount,
        timestamp: new Date().toISOString()
      };

      // 1. Requirement: hiện console.log
      console.log('Đơn đã gửi!', orderData);

      // 2. Requirement: alert "Đơn đã gửi!"
      alert('Đơn đã gửi! Cảm ơn bạn ' + customerName + ' đã đặt món tại Bún Chả Hà Nội Chính Gốc. Quán sẽ gọi xác nhận ngay.');

      // 3. Show rich modal confirmation
      if (modalOverlay) {
        if (modalName) modalName.textContent = customerName;
        if (modalPhone) modalPhone.textContent = customerPhone;
        if (modalTime) modalTime.textContent = arrivalTime;
        if (modalDish) modalDish.textContent = `${dishInfo.name} (x${guestCount})`;
        if (modalService) modalService.textContent = orderData.service;
        if (modalTotal) modalTotal.textContent = totalAmount.toLocaleString('vi-VN') + 'đ';

        modalOverlay.classList.add('open');
      }

      // Reset notes only
      document.getElementById('customerNotes').value = '';
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('open');
      }
    });
  }
});
