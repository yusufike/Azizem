/* =========================================================
   ULTIMATE GERÇEKÇİ XOX (TIC-TAC-TOE) (xox.js)
   ========================================================= */

let xoxBoard = ['', '', '', '', '', '', '', '', ''];
let xoxActive = false;
let xoxPlayerTurn = true; // true: Sen (X), false: Robot (O)
let xoxScores = JSON.parse(localStorage.getItem("xoxScores")) || { wins: 0, losses: 0, draws: 0 };

// Web Audio API Ses Efektleri
const xAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playXoxSound(type) {
    if (!xAudioCtx) return;
    if (xAudioCtx.state === 'suspended') xAudioCtx.resume();
    const osc = xAudioCtx.createOscillator();
    const gainNode = xAudioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(xAudioCtx.destination);

    if (type === 'click') {
        osc.frequency.setValueAtTime(400, xAudioCtx.currentTime);
        osc.frequency.exponentialRampYToValueAtTime ? osc.frequency.exponentialRampToValueAtTime(600, xAudioCtx.currentTime + 0.05) : null;
        gainNode.gain.setValueAtTime(0.05, xAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, xAudioCtx.currentTime + 0.05);
        osc.start(); osc.stop(xAudioCtx.currentTime + 0.05);
    } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, xAudioCtx.currentTime);
        osc.frequency.setValueAtTime(600, xAudioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(900, xAudioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, xAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, xAudioCtx.currentTime + 0.3);
        osc.start(); osc.stop(xAudioCtx.currentTime + 0.3);
    } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, xAudioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, xAudioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, xAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, xAudioCtx.currentTime + 0.3);
        osc.start(); osc.stop(xAudioCtx.currentTime + 0.3);
    }
}

function startXox() {
    xoxBoard = ['', '', '', '', '', '', '', '', ''];
    xoxActive = true;
    xoxPlayerTurn = true;
    updateXoxUI();
    drawXoxBoard();
    setXoxStatus("Sıra sende! (X)");
}

function drawXoxBoard() {
    const canvas = document.getElementById("xoxCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth - 20;
    canvas.height = canvas.width; // Kare alan

    // Siber Arka Plan
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(1, '#131824');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let cellSize = canvas.width / 3;

    // Grid Çizgileri (Neon Parlamalı)
    ctx.strokeStyle = '#00f0f0';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0f0';

    // Dikey Çizgiler
    ctx.beginPath();
    ctx.moveTo(cellSize, 20);
    ctx.lineTo(cellSize, canvas.height - 20);
    ctx.moveTo(cellSize * 2, 20);
    ctx.lineTo(cellSize * 2, canvas.height - 20);
    // Yatay Çizgiler
    ctx.moveTo(20, cellSize);
    ctx.lineTo(canvas.width - 20, cellSize);
    ctx.moveTo(20, cellSize * 2);
    ctx.lineTo(canvas.width - 20, cellSize * 2);
    ctx.stroke();

    // Gölgeyi sıfırla (X ve O için netlik)
    ctx.shadowBlur = 0;

    // Taşları Çiz (X ve O)
    xoxBoard.forEach((cell, index) => {
        let row = Math.floor(index / 3);
        let col = index % 3;
        let x = col * cellSize + cellSize / 2;
        let y = row * cellSize + cellSize / 2;

        if (cell === 'X') {
            // Neon Mavi X
            ctx.strokeStyle = '#00f0f0';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f0f0';
            let offset = cellSize * 0.28;
            ctx.beginPath();
            ctx.moveTo(x - offset, y - offset);
            ctx.lineTo(x + offset, y + offset);
            ctx.moveTo(x + offset, y - offset);
            ctx.lineTo(x - offset, y + offset);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (cell === 'O') {
            // Neon Kırmızı O
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff3366';
            ctx.beginPath();
            ctx.arc(x, y, cellSize * 0.28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    });
}

// Canvas Üzerine Tıklama Olayı
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("xoxCanvas");
    if (canvas) {
        canvas.addEventListener("click", (e) => {
            if (!xoxActive || !xoxPlayerTurn) return;

            let rect = canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let cellSize = canvas.width / 3;

            let col = Math.floor(x / cellSize);
            let row = Math.floor(y / cellSize);
            let index = row * 3 + col;

            if (xoxBoard[index] === '') {
                xoxBoard[index] = 'X';
                playXoxSound('click');
                drawXoxBoard();

                if (checkXoxWin('X')) {
                    endXoxGame('player');
                } else if (xoxBoard.every(cell => cell !== '')) {
                    endXoxGame('draw');
                } else {
                    xoxPlayerTurn = false;
                    setXoxStatus("Robot düşünüyor...");
                    setTimeout(robotMove, 600); // Doğal gecikme
                }
            }
        });
    }
});

function robotMove() {
    if (!xoxActive) return;

    // Basit ve etkili yapay zeka hamlesi
    let emptyIndexes = xoxBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    if (emptyIndexes.length === 0) return;

    // Kazanma veya engelleme hamlesi aranabilir, şimdilik akıllı rastgele
    let move = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    
    // Robot kazanabileceği hamle var mı bakar
    for (let idx of emptyIndexes) {
        xoxBoard[idx] = 'O';
        if (checkXoxWin('O')) {
            move = idx;
            xoxBoard[idx] = '';
            break;
        }
        xoxBoard[idx] = '';
    }

    // Oyuncunun kazanacağı hamleyi engelle
    for (let idx of emptyIndexes) {
        xoxBoard[idx] = 'X';
        if (checkXoxWin('X')) {
            move = idx;
            xoxBoard[idx] = '';
            break;
        }
        xoxBoard[idx] = '';
    }

    xoxBoard[move] = 'O';
    playXoxSound('click');
    drawXoxBoard();

    if (checkXoxWin('O')) {
        endXoxGame('robot');
    } else if (xoxBoard.every(cell => cell !== '')) {
        endXoxGame('draw');
    } else {
        xoxPlayerTurn = true;
        setXoxStatus("Sıra sende! (X)");
    }
}

function checkXoxWin(player) {
    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8], // Yatay
        [0,3,6], [1,4,7], [2,5,8], // Dikey
        [0,4,8], [2,4,6]           // Çapraz
    ];
    return winConditions.some(condition => {
        return condition.every(index => xoxBoard[index] === player);
    });
}

function endXoxGame(result) {
    xoxActive = false;
    if (result === 'player') {
        xoxScores.wins++;
        playXoxSound('win');
        setXoxStatus("Tebrikler, Kazandın! 🏆");
    } else if (result === 'robot') {
        xoxScores.losses++;
        playXoxSound('lose');
        setXoxStatus("Robot Kazandı! 🤖");
    } else {
        xoxScores.draws++;
        setXoxStatus("Oyun Berabere! 🤝");
    }
    localStorage.setItem("xoxScores", JSON.stringify(xoxScores));
    updateXoxUI();
}

function setXoxStatus(text) {
    let statusElem = document.getElementById("xoxStatus");
    if (statusElem) statusElem.innerText = text;
}

function updateXoxUI() {
    let scoreElem = document.getElementById("xoxScoresText");
    if (scoreElem) {
        scoreElem.innerText = `Skor - Sen: ${xoxScores.wins} | Robot: ${xoxScores.losses} | Berabere: ${xoxScores.draws}`;
    }
}
