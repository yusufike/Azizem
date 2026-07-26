/* =========================================================
   ARCADE OYUNLARI VE GELİŞMİŞ GRAFİK MOTORU (arcade.js)
   ========================================================= */

// Parçacık (Efekt) Dizisi
let particles = [];

/* =========================================================
   1. GRAFİK VE EFEKT FONKSİYONLARI
   ========================================================= */

// Parçacık Ekleme
function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 1,
            color: color,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.015
        });
    }
}

// Parçacıkları Çizme ve Güncelleme
function renderParticles(ctx) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Parlama Efekti
function enableGlow(ctx, color, blur = 10) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
}

function disableGlow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}


/* =========================================================
   2. GERÇEKÇİ ORMAN ARKA PLANI VE YILAN ÇİZİMİ
   ========================================================= */

function drawForestBackground(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    // Orman Zemin Gradyanı (Koyu Yeşil - Toprak Tonları)
    let forestGrad = ctx.createLinearGradient(0, 0, 0, h);
    forestGrad.addColorStop(0, '#112415');
    forestGrad.addColorStop(0.5, '#1b3821');
    forestGrad.addColorStop(1, '#0e1d11');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(0, 0, w, h);

    // Çim ve Yaprak Desenleri
    ctx.fillStyle = 'rgba(46, 125, 50, 0.25)';
    for (let x = 10; x < w; x += 30) {
        for (let y = 10; y < h; y += 30) {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Sarmaşık / Ağaç Kökü Detayları
    ctx.strokeStyle = 'rgba(27, 94, 32, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.2);
    ctx.quadraticCurveTo(w * 0.5, h * 0.1, w, h * 0.3);
    ctx.moveTo(0, h * 0.8);
    ctx.quadraticCurveTo(w * 0.5, h * 0.9, w, h * 0.75);
    ctx.stroke();
}

function drawRealisticSnake(ctx, snake, food) {
    // 1. Orman Arka Planını Çiz
    drawForestBackground(ctx, ctx.canvas);

    // 2. Yemin (Elma/Meyve) Çizimi
    const fx = food.x * 10 + 5;
    const fy = food.y * 10 + 5;

    // Elma Gövdesi
    enableGlow(ctx, '#ff3366', 10);
    ctx.fillStyle = '#e60039';
    ctx.beginPath();
    ctx.arc(fx, fy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Elma Yaprağı
    disableGlow(ctx);
    ctx.fillStyle = '#76ff03';
    ctx.fillRect(fx, fy - 6, 2, 2);

    // 3. Yılanın Çizimi (Pullanma ve Gerçekçi Deri Efekti)
    snake.forEach((part, index) => {
        const px = part.x * 10;
        const py = part.y * 10;

        if (index === 0) {
            // YILAN BAŞI
            enableGlow(ctx, '#00e676', 8);
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.arc(px + 5, py + 5, 5.5, 0, Math.PI * 2);
            ctx.fill();

            // Gözler
            disableGlow(ctx);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 3, py + 2, 2, 2);
            ctx.fillRect(px + 3, py + 6, 2, 2);
            ctx.fillStyle = '#000000';
            ctx.fillRect(px + 4, py + 3, 1, 1);
            ctx.fillRect(px + 4, py + 7, 1, 1);
        } else {
            // YILAN GÖVDESİ VE PUL DESENLERİ
            // Gövde Tabanı
            ctx.fillStyle = (index % 2 === 0) ? '#388e3c' : '#2e7d32';
            ctx.beginPath();
            ctx.arc(px + 5, py + 5, 4.8, 0, Math.PI * 2);
            ctx.fill();

            // Pul Detayı (Scales)
            ctx.strokeStyle = '#1b5e20';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px + 5, py + 5, 3, 0, Math.PI);
            ctx.stroke();

            // Sırt Çizgisi Parıltısı
            ctx.fillStyle = '#a5d6a7';
            ctx.fillRect(px + 4, py + 2, 2, 2);
        }
    });

    renderParticles(ctx);
}


/* =========================================================
   3. XOX OYUNU (TAM ÇALIŞIR HALE GETİRİLDİ)
   ========================================================= */

let xoxBoardState = ["", "", "", "", "", "", "", "", ""];
let xoxCurrentPlayer = "X";
let xoxActive = true;

function renderXOX() {
    const board = document.getElementById("xoxBoard");
    if (!board) return;
    board.innerHTML = "";
    
    xoxBoardState.forEach((cell, idx) => {
        const div = document.createElement("div");
        div.className = "xox-cell";
        div.innerText = cell;
        if (cell === "X") div.style.color = "#ff4d6d";
        if (cell === "O") div.style.color = "#2ec4b6";
        div.onclick = () => handleXOXClick(idx);
        board.appendChild(div);
    });
}

function handleXOXClick(idx) {
    if (xoxBoardState[idx] !== "" || !xoxActive) return;
    
    xoxBoardState[idx] = xoxCurrentPlayer;
    renderXOX();
    
    if (checkXOXWin()) {
        document.getElementById("xoxStatus").innerText = `Tebrikler! ${xoxCurrentPlayer} Kazandı! 🎉`;
        xoxActive = false;
        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60 });
        return;
    }
    
    if (!xoxBoardState.includes("")) {
        document.getElementById("xoxStatus").innerText = "Berabere Bitti! 🤝";
        xoxActive = false;
        return;
    }

    xoxCurrentPlayer = xoxCurrentPlayer === "X" ? "O" : "X";
    document.getElementById("xoxStatus").innerText = `Sıra: ${xoxCurrentPlayer}`;
}

function checkXOXWin() {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(comb => {
        return comb.every(i => xoxBoardState[i] === xoxCurrentPlayer);
    });
}

function resetXOX() {
    xoxBoardState = ["", "", "", "", "", "", "", "", ""];
    xoxCurrentPlayer = "X";
    xoxActive = true;
    const status = document.getElementById("xoxStatus");
    if (status) status.innerText = "Hamleni Yap!";
    renderXOX();
}


/* =========================================================
   4. YILAN OYUNU MANTIĞI
   ========================================================= */

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let snakeDir = "RIGHT";
let snakeLoop = null;
let snakeScore = 0;
let snakeHighScore = 0;

function startSnake() {
    if (snakeLoop) clearInterval(snakeLoop);
    snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    snakeDir = "RIGHT";
    snakeScore = 0;
    document.getElementById("snakeScore").innerText = snakeScore;
    spawnFood();

    const canvas = document.getElementById("snakeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    snakeLoop = setInterval(() => {
        let head = {...snake[0]};

        if (snakeDir === "UP") head.y--;
        if (snakeDir === "DOWN") head.y++;
        if (snakeDir === "LEFT") head.x--;
        if (snakeDir === "RIGHT") head.x++;

        // Duvara veya kendine çarpma kontrolü
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || checkSelfCollision(head)) {
            clearInterval(snakeLoop);
            alert("Oyun Bitti! Skorun: " + snakeScore);
            return;
        }

        snake.unshift(head);

        // Yem yeme kontrolü
        if (head.x === food.x && head.y === food.y) {
            snakeScore += 10;
            document.getElementById("snakeScore").innerText = snakeScore;
            if (snakeScore > snakeHighScore) {
                snakeHighScore = snakeScore;
                document.getElementById("snakeHighScore").innerText = snakeHighScore;
            }
            createParticles(food.x * 10 + 5, food.y * 10 + 5, "#ff3366", 12);
            spawnFood();
        } else {
            snake.pop();
        }

        drawRealisticSnake(ctx, snake, food);
    }, 120);
}

function setSnakeDir(dir) {
    if (dir === "UP" && snakeDir !== "DOWN") snakeDir = "UP";
    if (dir === "DOWN" && snakeDir !== "UP") snakeDir = "DOWN";
    if (dir === "LEFT" && snakeDir !== "RIGHT") snakeDir = "LEFT";
    if (dir === "RIGHT" && snakeDir !== "LEFT") snakeDir = "RIGHT";
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * 18) + 1,
        y: Math.floor(Math.random() * 18) + 1
    };
}

function checkSelfCollision(head) {
    return snake.some((part, index) => index !== 0 && part.x === head.x && part.y === head.y);
}


/* =========================================================
   5. FLAPPY BIRD OYUNU MANTIĞI
   ========================================================= */

let fbBirdY = 120;
let fbVelocity = 0;
let fbPipes = [];
let fbScore = 0;
let fbHighScore = 0;
let fbLoop = null;

function startFlappy() {
    if (fbLoop) clearInterval(fbLoop);
    fbBirdY = 120;
    fbVelocity = 0;
    fbPipes = [];
    fbScore = 0;
    document.getElementById("fbScore").innerText = fbScore;

    const canvas = document.getElementById("flappyCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    fbLoop = setInterval(() => {
        fbVelocity += 0.45;
        fbBirdY += fbVelocity;

        // Boru üretimi
        if (fbPipes.length === 0 || fbPipes[fbPipes.length - 1].x < 130) {
            let gapY = Math.floor(Math.random() * 110) + 40;
            fbPipes.push({ x: 220, topHeight: gapY, bottomY: gapY + 80, passed: false });
        }

        // Temizleme
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Boruları Çiz ve Hareket Ettir
        ctx.fillStyle = '#2ec4b6';
        for (let i = fbPipes.length - 1; i >= 0; i--) {
            let p = fbPipes[i];
            p.x -= 2;

            // Üst Boru
            ctx.fillRect(p.x, 0, 32, p.topHeight);
            // Alt Boru
            ctx.fillRect(p.x, p.bottomY, 32, canvas.height - p.bottomY);

            // Çarpışma Kontrolü
            if (p.x < 30 && p.x + 32 > 15) {
                if (fbBirdY < p.topHeight || fbBirdY > p.bottomY) {
                    clearInterval(fbLoop);
                    alert("Flappy Bitti! Skorun: " + fbScore);
                    return;
                }
            }

            // Skor
            if (p.x + 32 < 15 && !p.passed) {
                p.passed = true;
                fbScore++;
                document.getElementById("fbScore").innerText = fbScore;
                if (fbScore > fbHighScore) {
                    fbHighScore = fbScore;
                    document.getElementById("fbHighScore").innerText = fbHighScore;
                }
            }

            if (p.x < -35) fbPipes.splice(i, 1);
        }

        // Kuşu Çiz
        enableGlow(ctx, '#ffb703', 8);
        ctx.fillStyle = '#ffb703';
        ctx.beginPath();
        ctx.arc(20, fbBirdY, 8, 0, Math.PI * 2);
        ctx.fill();
        disableGlow(ctx);

        // Zemin veya Tavan Çarpışması
        if (fbBirdY > canvas.height || fbBirdY < 0) {
            clearInterval(fbLoop);
            alert("Flappy Bitti! Skorun: " + fbScore);
            return;
        }

    }, 20);
}

function flappyJump() {
    fbVelocity = -6.5;
}


/* =========================================================
   6. TETRİS OYUNU MANTIĞI
   ========================================================= */

const tetrisCols = 10;
const tetrisRows = 15;
let arena = [];
let tetrisScore = 0;
let tetrisHighScore = 0;
let tetrisLoop = null;

let player = {
    pos: {x: 0, y: 0},
    matrix: null
};

const tetrisPieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]]  // J
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function playerReset() {
    const pieces = tetrisPieces;
    player.matrix = pieces[Math.floor(Math.random() * pieces.length)];
    player.pos.y = 0;
    player.pos.x = Math.floor(tetrisCols / 2) - Math.floor(player.matrix[0].length / 2);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Tetris Bitti! Skorun: " + tetrisScore);
        tetrisScore = 0;
        document.getElementById("tetrisScore").innerText = tetrisScore;
    }
}

function drawTetris() {
    const canvas = document.getElementById("tetrisCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Düşmüş blokları çiz
    arena.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                ctx.fillStyle = '#ff4d6d';
                ctx.fillRect(x * 16, y * 16, 15, 15);
            }
        });
    });

    // Hareket eden bloğu çiz
    if (player.matrix) {
        player.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    ctx.fillStyle = '#2ec4b6';
                    ctx.fillRect((x + player.pos.x) * 16, (y + player.pos.y) * 16, 15, 15);
                }
            });
        });
    }
}

function dropTetris() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    drawTetris();
}

function moveTetris(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
    drawTetris();
}

function rotateTetris() {
    const m = player.matrix;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }
    m.forEach(row => row.reverse());
    if (collide(arena, player)) moveTetris(-1);
    drawTetris();
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        tetrisScore += 10;
        document.getElementById("tetrisScore").innerText = tetrisScore;
        if (tetrisScore > tetrisHighScore) {
            tetrisHighScore = tetrisScore;
            document.getElementById("tetrisHighScore").innerText = tetrisHighScore;
        }
    }
}

function startTetris() {
    arena = createMatrix(tetrisCols, tetrisRows);
    tetrisScore = 0;
    document.getElementById("tetrisScore").innerText = tetrisScore;
    playerReset();
    if (tetrisLoop) clearInterval(tetrisLoop);
    tetrisLoop = setInterval(dropTetris, 800);
}


/* =========================================================
   7. SAYFA YÜKLENDİĞİNDE BAŞLATILACAKLAR
   ========================================================= */

window.addEventListener("DOMContentLoaded", () => {
    renderXOX();
});
