const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { server } = require('../server');

const TEST_PORT = 3123;
const ARTIFACTS_DIR = path.join(__dirname, '..', 'test-artifacts');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🚀 Khởi động Server thử nghiệm tại cổng', TEST_PORT);
  
  await new Promise(resolve => {
    server.listen(TEST_PORT, resolve);
  });

  const baseUrl = `http://localhost:${TEST_PORT}`;
  console.log('🌐 Server đang chạy tại:', baseUrl);

  let browser;
  try {
    // Launch browser (msedge or chrome)
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true
    });
  } catch (err) {
    console.log('Chuyển sang Chromium mặc định hoặc Chrome:', err.message);
    browser = await chromium.launch({
      headless: true
    });
  }

  try {
    // ==========================================
    // 1. TEST & FULLPAGE SCREENSHOT (DESKTOP)
    // ==========================================
    console.log('\n📸 [1/3] Tiến hành chụp ảnh màn hình toàn trang (Desktop 1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await sleep(800);

    const fullpageScreenshotPath = path.join(ARTIFACTS_DIR, 'screenshot-fullpage.png');
    await desktopPage.screenshot({
      path: fullpageScreenshotPath,
      fullPage: true
    });
    console.log('✓ Đã lưu ảnh toàn trang tại:', fullpageScreenshotPath);
    await desktopContext.close();

    // ==========================================
    // 2. TEST RESPONSIVE & MOBILE SCREENSHOT
    // ==========================================
    console.log('\n📱 [2/3] Tiến hành kiểm tra Responsive & chụp ảnh Mobile View (iPhone 14: 390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });
    await sleep(600);

    // Verify hamburger menu button exists and works
    const hamburgerBtn = mobilePage.locator('#mobileToggle');
    if (await hamburgerBtn.isVisible()) {
      console.log('✓ Nút Hamburger Menu hiển thị chuẩn trên thiết bị di động');
      await hamburgerBtn.click();
      await sleep(400);
      const isDrawerOpen = await mobilePage.locator('#mobileMenu').evaluate(el => el.classList.contains('open'));
      console.log('✓ Trạng thái Drawer Menu di động khi bấm:', isDrawerOpen ? 'Đã mở thành công' : 'Chưa mở');
      
      // Close drawer
      await mobilePage.locator('#mobileClose').click();
      await sleep(300);
    }

    // 2.1 First take top mobile viewport screenshot
    const mobileScreenshotPath = path.join(ARTIFACTS_DIR, 'screenshot-mobile.png');
    await mobilePage.screenshot({
      path: mobileScreenshotPath,
      fullPage: false
    });
    console.log('✓ Đã lưu ảnh Mobile View (Hero Top) tại:', mobileScreenshotPath);

    // 2.2 Scroll through mobile page to ensure all images are rendered
    await mobilePage.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await sleep(600);

    const mobileFullScreenshotPath = path.join(ARTIFACTS_DIR, 'screenshot-mobile-fullpage.png');
    await mobilePage.screenshot({
      path: mobileFullScreenshotPath,
      fullPage: true
    });
    console.log('✓ Đã lưu ảnh Mobile Fullpage tại:', mobileFullScreenshotPath);

    await mobileContext.close();

    // ==========================================
    // 3. QUAY VIDEO DEMO: SCROLL + MENU FILTER + CLICK FORM SUBMIT
    // ==========================================
    console.log('\n🎥 [3/3] Bắt đầu quay video demo: Cuộn trang, lọc Menu, chọn món và gửi form...');
    const videoTempDir = path.join(ARTIFACTS_DIR, 'temp_video');
    if (!fs.existsSync(videoTempDir)) {
      fs.mkdirSync(videoTempDir, { recursive: true });
    }

    const videoContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: videoTempDir,
        size: { width: 1280, height: 720 }
      }
    });

    const page = await videoContext.newPage();
    
    // Listen for console logs
    let consoleLogFound = false;
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Đơn đã gửi!')) {
        consoleLogFound = true;
        console.log('   [Browser Console Log]:', text);
      }
    });

    // Listen for alert dialogs
    let alertHandled = false;
    page.on('dialog', async dialog => {
      console.log('   [Browser Alert Dialog]:', dialog.message());
      alertHandled = true;
      await sleep(500);
      await dialog.accept();
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await sleep(1000);

    // Step 1: Smooth scroll down to Story
    console.log('   - Cuộn xem phần Hero & Giới thiệu...');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await sleep(1200);

    // Step 2: Scroll to Menu
    console.log('   - Cuộn đến phần Thực đơn 10 món...');
    await page.locator('#menu').scrollIntoViewIfNeeded();
    await sleep(1200);

    // Step 3: Test Menu Filter Tabs
    console.log('   - Thử nghiệm các Tab lọc món ăn...');
    await page.click('button[data-filter="main"]');
    await sleep(800);
    await page.click('button[data-filter="side"]');
    await sleep(800);
    await page.click('button[data-filter="drink"]');
    await sleep(800);
    await page.click('button[data-filter="all"]');
    await sleep(800);

    // Step 4: Click "Chọn món" on Bún Chả Đặc Biệt
    console.log('   - Nhấn "+ Chọn món" trên thẻ Bún Chả Đặc Biệt...');
    const specialDishBtn = page.locator('.btn-select-dish[data-dish-key="buncha-dacbiet"]');
    await specialDishBtn.click();
    await sleep(1500); // Wait for smooth scroll to #order

    // Step 5: Fill in the Order / Reservation Form
    console.log('   - Điền thông tin vào Phiếu đặt bàn / đặt hàng...');
    await page.fill('#customerName', 'Nguyễn Minh Đức');
    await sleep(400);
    await page.fill('#customerPhone', '0908 688 868');
    await sleep(400);
    await page.fill('#arrivalTime', '12:30');
    await sleep(400);
    await page.selectOption('#serviceType', 'dinein');
    await sleep(400);
    await page.fill('#guestCount', '2');
    await sleep(400);
    await page.fill('#customerNotes', 'Cho 2 suất nướng xém cạnh thơm lừng, nhiều tía tô kinh giới và 2 cốc trà đá nhé quán!');
    await sleep(800);

    // Step 6: Submit Order Form
    console.log('   - Nhấn nút "GỬI ĐƠN ĐẶT HÀNG / ĐẶT BÀN"...');
    await page.click('#submitOrderBtn');
    await sleep(1500);

    // Step 7: Inspect Modal Confirmation
    console.log('   - Kiểm tra Modal hóa đơn xác nhận hiển thị...');
    const isModalVisible = await page.locator('#modalOverlay').evaluate(el => el.classList.contains('open'));
    console.log('   - Modal hiển thị:', isModalVisible ? 'Thành công ✓' : 'Chưa hiện');
    await sleep(1800);

    // Close modal
    await page.click('#modalCloseBtn');
    await sleep(800);

    // Step 8: Scroll to Footer to see Designer credit
    console.log('   - Cuộn xuống Footer kiểm tra thông tin và Credit Designer...');
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await sleep(1200);

    const creditText = await page.locator('.designer-credit').innerText();
    console.log('   - Credit Designer kiểm tra:', creditText);

    // Close video page to finalize recording
    await page.close();
    await videoContext.close();

    // Rename recorded video file to demo-scroll-and-click.webm
    const files = fs.readdirSync(videoTempDir).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      const generatedVideoPath = path.join(videoTempDir, files[0]);
      const finalVideoPath = path.join(ARTIFACTS_DIR, 'demo-scroll-and-click.webm');
      if (fs.existsSync(finalVideoPath)) {
        fs.unlinkSync(finalVideoPath);
      }
      fs.renameSync(generatedVideoPath, finalVideoPath);
      console.log('✓ Đã lưu video demo thành công tại:', finalVideoPath);
    }

    // Clean temp video dir
    try {
      fs.rmSync(videoTempDir, { recursive: true, force: true });
    } catch (_) {}

    console.log('\n======================================================');
    console.log('🎉 TẤT CẢ CÁC BƯỚC TEST TỰ ĐỘNG ĐÃ HOÀN TẤT THÀNH CÔNG!');
    console.log('- Console.log Đơn đã gửi:', consoleLogFound ? 'ĐẠT ✓' : 'CHƯA');
    console.log('- Alert Dialog Đơn đã gửi:', alertHandled ? 'ĐẠT ✓' : 'CHƯA');
    console.log('- Fullpage Screenshot:', fullpageScreenshotPath);
    console.log('- Mobile View Screenshot:', mobileScreenshotPath);
    console.log('======================================================\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình chạy test:', error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

runTests();
