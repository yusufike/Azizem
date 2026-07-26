/* =========================================================
   ULTIMATE GERÇEKÇİ TETRİS (tetris.js)
   ========================================================= */

const tetrisCols = 10;
const tetrisRows = 18;
let arena = [];
let tetrisScore = 0;
let tetrisHighScore = localStorage.getItem("tetrisHighScore") || 0;
let tetrisLoop = null;
let tetrisActive = false;
let dropCounter = 0;
let dropInterval = 700; // Düşüş hızı (milisaniye)
let lastTime = 0;
let tetrisParticles = [];

let player = {
    pos: {x: 0, y: 0},
    matrix: null,
    colorIndex: 0
};

// Tetris Parçaları ve Neon Renk Paleti
const tetrisPieces = 'ILJOTSZ';
const tetrisColors = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000'  // Z - Red
];

// Web Audio API ile Ses Efektleri
const tAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTetrisSound(type) {
    if (!tAudioCtx) return;
    if (tAudioCtx.state === 'suspended') tAudioCtx.resume();
    const osc = tAudioCtx.createOscillator();
    const gainNode = tAudioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(tAudioCtx.destination);

    if (type === 'move') {
        osc.frequency.setValueAtTime(200, tAudioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.03, tAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, tAudioCtx.currentTime + 0.05);
        osc.start(); osc.stop(tAudioCtx.currentTime + 0.05);
    } else if (type === 'drop') {
        osc.frequency.setValueAtTime(400, tAudioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, tAudioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.08, tAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, tAudioCtx.currentTime + 0.1);
        osc.start(); osc.stop(tAudioCtx.currentTime + 0.1);
    } else if (type === 'clear') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, tAudioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, tAudioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.12, tAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, tAudioCtx.currentTime + 0.2);
        osc.start(); osc.stop(tAudioCtx.currentTime + 0.2);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, tAudioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, tAudioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.15, tAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, tAudioCtx.currentTime + 0.3);
        osc.start(); osc.stop(tAudioCtx.currentTime + 0.3);
    }
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
    if (type === 'L') return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
    if (type === 'J') return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
    if (type === 'O') return [[4, 4], [4, 4]];
    if (type === 'Z') return [[5, 5, 0], [0, 5, 5]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0]];
    if (type === 'T') return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
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
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerReset() {
    const pieces = tetrisPieces;
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

    if (collide(arena, player)) {
        tetrisActive = false;
        playTetrisSound('gameover');
        alert("Oyun Bitti! Skorun: " + tetrisScore);
        arena.forEach(row => row.fill(0));
        tetrisScore = 0;
        document.getElementById("tetrisScore").innerText = tetrisScore;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        playTetrisSound('drop');
    }
    dropCounter = 0;
}

function moveTetris(dir) {
    if (!tetrisActive) return;
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    } else {
        playTetrisSound('move');
    }
    drawTetris();
}

function rotateTetris() {
    if (!tetrisActive) return;
    const posX = player.pos.x;
    let offset = 1;
    rotateMatrix(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotateMatrix(player.matrix);
            player.pos.x = posX;
            return;
        }
    }
    playTetrisSound('move');
    drawTetris();
}

function rotateMatrix(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        tetrisScore += rowCount * 10;
        rowCount *= 2;
        playTetrisSound('clear');
        document.getElementById("tetrisScore").innerText = tetrisScore;
        
        if (tetrisScore > tetrisHighScore) {
            tetrisHighScore = tetrisScore;
            localStorage.setItem("tetrisHighScore", tetrisHighScore);
            let highElem = document.getElementById("tetrisHighScore");
            if (highElem) highElem.innerText = tetrisHighScore;
        }
    }
}

function drawBlock(ctx, x, y, colorCode, blockSize) {
    ctx.fillStyle = tetrisColors[colorCode];
    ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, blockSize - 1);

    // 3D Parlama ve Gölge Efekti
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * blockSize, y * blockSize, blockSize - 1, 3);
    ctx.fillRect(x * blockSize, y * blockSize, 3, blockSize - 1);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * blockSize, (y + 1) * blockSize - 4, blockSize - 1, 3);
    ctx.fillRect((x + 1) * blockSize - 4, y * blockSize, 3, blockSize - 1);
}

function drawTetris() {
    const canvas = document.getElementById("tetrisCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Siber / Neon Arka Plan Gradyanı
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(1, '#131824');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid Çizgileri (Hafif Görünür)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    let blockSize = canvas.width / tetrisCols;
    
    for (let i = 0; i < tetrisCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * blockSize, 0);
        ctx.lineTo(i * blockSize, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j < tetrisRows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * blockSize);
        ctx.lineTo(canvas.width, j * blockSize);
        ctx.stroke();
    }

    // Düşmüş Blokları Çiz
    arena.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                drawBlock(ctx, x, y, val, blockSize);
            }
        });
    });

    // Aktif Oyuncu Parçasını Çiz
    if (player.matrix) {
        player.matrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) {
                    drawBlock(ctx, x + player.pos.x, y + player.pos.y, val, blockSize);
                }
            });
        });
    }
}

function updateTetris(time = 0) {
    if (!tetrisActive) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    drawTetris();
    requestAnimationFrame(updateTetris);
}

function startTetris() {
    arena = createMatrix(tetrisCols, tetrisRows);
    tetrisScore = 0;
    tetrisActive = true;
    
    document.getElementById("tetrisScore").innerText = tetrisScore;
    let highElem = document.getElementById("tetrisHighScore");
    if (highElem) highElem.innerText = tetrisHighScore;

    const canvas = document.getElementById("tetrisCanvas");
    if (!canvas) return;
    
    canvas.width = canvas.parentElement.clientWidth - 20;
    canvas.height = canvas.width * (tetrisRows / tetrisCols);

    playerReset();
    lastTime = performance.now();
    updateTetris();
}
