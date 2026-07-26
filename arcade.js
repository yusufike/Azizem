/* ==========================================
   ARCADE OYUNLARI VE GRAFİK MOTORU
   ========================================== */

// Parçacık (Efekt) Dizisi
let particles = [];

// 1. GRAFİK EFEKT FONKSİYONLARI
// ------------------------------------------

// Her Oyun İçin Özel Canlı Arka Plan Çizimi
function drawCustomBackground(ctx, canvas, theme) {
    const w = canvas.width;
    const h = canvas.height;

    if (theme === 'snake') {
        // Yılan için: Doğa / Koyu Yeşil Gradient
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0a1912');
        grad.addColorStop(1, '#112d21');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Arka plan ızgarası
        ctx.strokeStyle = "rgba(46, 196, 182, 0.08)";
        for(let x=0; x<w; x+=10) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }

    } else if (theme === 'flappy') {
        // Flappy Bird için: Gökyüzü / Gün Batımı
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1a1c4b');
        grad.addColorStop(0.7, '#293a80');
        grad.addColorStop(1, '#70c5ce');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

    } else if (theme === 'tetris') {
        // Tetris için: Cyberpunk / Neon Izgara
        let grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0d0221');
        grad.addColorStop(1, '#020813');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Neon Çizgiler
        ctx.strokeStyle = "rgba(0, 246, 255, 0.05)";
        for(let y=0; y<h; y+=16) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    }
}

// Parıltı (Glow) Efektini Açar
function enableGlow(ctx, color, blurAmount = 15) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blurAmount;
}

// Parıltı Efektini Kapatır
function disableGlow(ctx) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
}

// Skor / Temas Anında Patlama Parçacıkları Oluşturur
function createExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 3 + 2,
            color: color,
            alpha: 1
        });
    }
}

// Parçacıkları Çizer ve Günceller
function renderParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03; // Yavaşça kaybolur

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        enableGlow(ctx, p.color, 8);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


// 2. GRAFİK GELİŞTİRMELİ YILAN OYUNU
// ------------------------------------------
let snakeInterval;
let snakeHighScore = localStorage.getItem("snakeHS") || 0;
let snakeDx = 1, snakeDy = 0;

function setSnakeDir(dir) {
    if (dir === 'UP' && snakeDy === 0) { snakeDx = 0; snakeDy = -1; }
    if (dir === 'DOWN' && snakeDy === 0) { snakeDx = 0; snakeDy = 1; }
    if (dir === 'LEFT' && snakeDx === 0) { snakeDx = -1; snakeDy = 0; }
    if (dir === 'RIGHT' && snakeDx === 0) { snakeDx = 1; snakeDy = 0; }
}

function startSnake() {
    const canvas = document.getElementById("snakeCanvas");
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    let snake = [{x: 10, y: 10}, {x: 9, y: 10}];
    let food = {x: 15, y: 15};
    snakeDx = 1; snakeDy = 0;
    let score = 0;
    
    document.getElementById("snakeScore").innerText = score;
    if (snakeInterval) clearInterval(snakeInterval);

    snakeInterval = setInterval(() => {
        const head = {x: snake[0].x + snakeDx, y: snake[0].y + snakeDy};
        snake.unshift(head);

        // Yem yeme durumu
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById("snakeScore").innerText = score;
            
            // 💥 Yem yendiğinde özel yeşil patlama efekti
            createExplosion(food.x * 10 + 5, food.y * 10 + 5, "#2ec4b6", 20);

            if (score > snakeHighScore) {
                snakeHighScore = score;
                localStorage.setItem("snakeHS", snakeHighScore);
                document.getElementById("snakeHighScore").innerText = snakeHighScore;
            }
            food = {x: Math.floor(Math.random() * 19), y: Math.floor(Math.random() * 19)};
        } else {
            snake.pop();
        }

        // Duvara çarpma
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            clearInterval(snakeInterval);
            alert("Yılan Oyunu Bitti! Skorun: " + score);
            return;
        }

        // 🎨 ÇİZİM BÖLÜMÜ
        drawCustomBackground(ctx, canvas, 'snake'); // Özel arka plan

        // Yemi Neon Parıltılı Çiz
        enableGlow(ctx, "#ff4d6d", 12);
        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.arc(food.x * 10 + 5, food.y * 10 + 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Yılanı Parlayan Yuvarlatılmış Kutularla Çiz
        enableGlow(ctx, "#2ec4b6", 8);
        ctx.fillStyle = "#2ec4b6";
        snake.forEach((part, index) => {
            // Baş kısmı daha parlak
            if(index === 0) ctx.fillStyle = "#ffffff";
            else ctx.fillStyle = "#2ec4b6";
            ctx.fillRect(part.x * 10, part.y * 10, 9, 9);
        });
        disableGlow(ctx);

        // Parçacık efektlerini ekrana çiz
        renderParticles(ctx);

    }, 110);
}
