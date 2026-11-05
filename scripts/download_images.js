const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const images = [
  {
    name: 'hero-buncha.jpg',
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    fallbackDesc: 'Mâm Bún Chả Hà Nội than hoa đặc sắc'
  },
  {
    name: 'buncha-truyenthong.jpg',
    url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Bún chả truyền thống'
  },
  {
    name: 'buncha-dacbiet.jpg',
    url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Bún chả đặc biệt'
  },
  {
    name: 'nem-ran.jpg',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Nem rán giòn rụm'
  },
  {
    name: 'nem-chua-ran.jpg',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Nem chua rán Hà Nội'
  },
  {
    name: 'cha-com.jpg',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Chả cốm Làng Vòng'
  },
  {
    name: 'banh-cuon.jpg',
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Bánh cuốn nóng thịt mộc nhĩ'
  },
  {
    name: 'trung-op-la.jpg',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Trứng ốp la lòng đào'
  },
  {
    name: 'nuoc-mam-bac.jpg',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Nước mắm pha Bắc'
  },
  {
    name: 'tra-da.jpg',
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Trà đá Hà Nội'
  },
  {
    name: 'che-thap-cam.jpg',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    fallbackDesc: 'Chè thập cẩm Hà Nội'
  },
  {
    name: 'saigon-night.jpg',
    url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
    fallbackDesc: 'Phố Sài Gòn về đêm'
  },
  {
    name: 'charcoal-smoke.jpg',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
    fallbackDesc: 'Khói than hoa nướng thịt'
  }
];

const destDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

function createSvgPlaceholder(name, text) {
  const filePath = path.join(destDir, name.replace('.jpg', '.svg'));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#C83823;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1E1E1E;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <circle cx="300" cy="180" r="100" fill="#FFF9E6" opacity="0.15" />
    <text x="50%" y="45%" text-anchor="middle" fill="#FFF9E6" font-family="'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="bold">Bún Chả Hà Nội Phố</text>
    <text x="50%" y="60%" text-anchor="middle" fill="#FEF3C7" font-family="'Segoe UI', Roboto, sans-serif" font-size="18">${text}</text>
  </svg>`;
  fs.writeFileSync(filePath, svg, 'utf8');
}

async function run() {
  console.log('Downloading images...');
  for (const item of images) {
    const targetPath = path.join(destDir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await downloadFile(item.url, targetPath);
      console.log(`✓ Saved ${item.name}`);
    } catch (err) {
      console.warn(`! Failed to download ${item.name}: ${err.message}. Creating SVG placeholder.`);
      createSvgPlaceholder(item.name, item.fallbackDesc);
    }
  }
  console.log('Done downloading images.');
}

run();
