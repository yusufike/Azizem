/* =========================================================
   ULTIMATE GERÇEKÇİ FLAPPY BIRD (bird.js)
   ========================================================= */

let fbBirdY = 160;
let fbBirdX = 60;
let fbVelocity = 0;
let fbGravity = 0.38;
let fbJumpStrength = -6.2;
let fbPipes = [];
let fbScore = 0;
let fbHighScore = localStorage.getItem("fbHighScore") || 0;
let fbLoop = null;
let fbActive = false;
let birdRotation = 0;
let wingAngle = 0;
let particles = [];

let clouds = [
    { x: 50, y: 40, speed: 0.5, size: 30 },
    { x: 180, y: 90, speed: 0.3, size: 20 },
    { x: 280, y: 50, speed: 0.4, size: 25 }
];

// Web Audio API ile Ses Efektleri (Dış dosya gerektirmez)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'jump') {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'score') {
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

// Parçacık (Tüy / Rüzgar) Üretici
function createFeatherParticles(x, y) {
    for (let i = 0; i < 4; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 1) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 2 + 1,
            alpha: 1,
            decay: 0.04
        });
    }
}

function startFlappy() {
    if (fbLoop) clearInterval(fbLoop);
    fbBirdY = 160;
    fbVelocity = 0;
    fbPipes = [];
    fbScore = 0;
    particles = [];
    fbActive = true;
    
    // En yüksek skoru ekrana yansıt
    document.getElementById("fbScore").innerText = fbScore;
    let highElem = document.getElementById("fbHighScore");
    if (highElem) highElem.innerText = fbHighScore;

    const canvas = document.getElementById("flappyCanvas");
    if (!canvas) return;
    
    canvas.width = canvas.parentElement.clientWidth - 20;
    canvas.height = 320;

    const ctx = canvas.getContext("2d");

    fbLoop = setInterval(() => {
        // Fizik
        fbVelocity += fbGravity;
        fbBirdY += fbVelocity;
        wingAngle += 0.2;

        // Boru Üretimi
        if (fbPipes.length === 0 || fbPipes[fbPipes.length - 1].x < canvas.width - 150) {
            let gapHeight = 110;
            let minTop = 40;
            let maxTop = canvas.height - gapHeight - 80;
            let topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
            
            fbPipes.push({
                x: canvas.width,
                topHeight: topHeight,
                bottomY: topHeight + gapHeight,
                width: 50,
                passed: false
            });
        }

        // Gece / Gündüz Döngüsü (Her 10 puanda bir renk değiştirir)
        let cycle = Math.floor(fbScore / 10) % 2; 
        let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (cycle === 1) {
            // Gece Teması
            skyGrad.addColorStop(0, '#0f2027');
            skyGrad.addColorStop(0.7, '#203a43');
            skyGrad.addColorStop(1, '#2c5364');
        } else {
            // Gündüz Teması
            skyGrad.addColorStop(0, '#4fc3f7');
            skyGrad.addColorStop(0.7, '#81d4fa');
            skyGrad.addColorStop(1, '#e1f5fe');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bulutlar
        ctx.fillStyle = cycle === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)';
        clouds.forEach(c => {
            c.x -= c.speed;
            if (c.x < -50) c.x = canvas.width + 50;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
            ctx.arc(c.x + c.size * 0.6, c.y - c.size * 0.2, c.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });

        // Borular
        fbPipes.forEach((p) => {
            p.x -= 2.2;

            let pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
            pipeGrad.addColorStop(0, '#2e7d32');
            pipeGrad.addColorStop(0.5, '#66bb6a');
            pipeGrad.addColorStop(1, '#1b5e20');
            ctx.fillStyle = pipeGrad;
            
            // Üst Boru
            ctx.fillRect(p.x, 0, p.width, p.topHeight);
            ctx.fillRect(p.x - 4, p.topHeight - 20, p.width + 8, 20);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(p.x - 4, p.topHeight - 20, p.width + 8, 20);
            ctx.strokeRect(p.x, 0, p.width, p.topHeight);

            // Alt Boru
            ctx.fillRect(p.x, p.bottomY, p.width, canvas.height - p.bottomY);
            ctx.fillRect(p.x - 4, p.bottomY, p.width + 8, 20);
            ctx.strokeRect(p.x - 4, p.bottomY, p.width + 8, 20);
            ctx.strokeRect(p.x, p.bottomY, p.width, canvas.height - p.bottomY);

            // Çarpışma
            let birdRadius = 12;
            if (
                fbBirdX + birdRadius > p.x && 
                fbBirdX - birdRadius < p.x + p.width && 
                (fbBirdY - birdRadius < p.topHeight || fbBirdY + birdRadius > p.bottomY)
            ) {
                gameOver(canvas, ctx);
            }

            // Skor ve Hafıza Kaydı
            if (!p.passed && p.x + p.width < fbBirdX) {
                p.passed = true;
                fbScore++;
                playSound('score');
                document.getElementById("fbScore").innerText = fbScore;
                if (fbScore > fbHighScore) {
                    fbHighScore = fbScore;
                    localStorage.setItem("fbHighScore", fbHighScore);
                    if (highElem) highElem.innerText = fbHighScore;
                }
            }
        });

        if (fbPipes.length > 0 && fbPipes[0].x < -60) {
            fbPipes.shift();
        }

        // Parçacıkları Çiz
        for (let i = particles.length - 1; i >= 0; i--) {
            let pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= pt.decay;
            if (pt.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = pt.alpha;
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Gerçekçi Kuş ve Kanat Animasyonu
        ctx.save();
        ctx.translate(fbBirdX, fbBirdY);
        let targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, fbVelocity * 0.1));
        birdRotation += (targetRotation - birdRotation) * 0.2;
        ctx.rotate(birdRotation);

        // Gövde
        let birdGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
        birdGrad.addColorStop(0, '#ffee58');
        birdGrad.addColorStop(0.7, '#fbc02d');
        birdGrad.addColorStop(1, '#f57f17');
        ctx.fillStyle = birdGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Hareketli Kanat
        ctx.fillStyle = '#ff8f00';
        ctx.beginPath();
        let wingOffset = Math.sin(wingAngle) * 3;
        ctx.ellipse(-3, 2 + wingOffset, 7, 3.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Göz
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(5, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(6.5, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Gaga
        ctx.fillStyle = '#ff5722';
        ctx.beginPath();
        ctx.moveTo(11, -2);
        ctx.lineTo(19, 1);
        ctx.lineTo(11, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Sınırlar
        if (fbBirdY > canvas.height - 15 || fbBirdY < 15) {
            gameOver(canvas, ctx);
        }

    }, 20);
}

function flappyJump() {
    if (!fbActive) return;
    fbVelocity = fbJumpStrength;
    wingAngle = 0; // Kanat çırpma tetikleyicisi
    createFeatherParticles(fbBirdX - 10, fbBirdY);
    playSound('jump');
}

function gameOver(canvas, ctx) {
    if (!fbActive) return;
    fbActive = false;
    clearInterval(fbLoop);
    playSound('hit');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OYUN BİTTİ', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = '16px sans-serif';
    ctx.fillText('Skorun: ' + fbScore, canvas.width / 2, canvas.height / 2 + 20);
}
