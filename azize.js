/* =========================================================
   AZİZE'YE ÖZEL ULTIMATE KELİME OYUNU (azize.js)
   ========================================================= */

let azizeActive = false;
let currentTargetWord = "";
let scrambledWord = "";
let currentHint = "";
let azizeScore = 0;
let azizeHighScore = localStorage.getItem("azizeHighScore") || 0;
let azizeParticles = [];

// Azize'ye Özel Aşk Dolu Kelime Havuzu ve Romantik Sözler
const azizeWordData = [
    { word: "AŞKIM", hint: "Gözlerinin içine baktığımda hissettiğim her şey..." },
    { word: "BEBEĞİM", hint: "Dünyanın en tatlı ve en güzel varlığı..." },
    { word: "CANIM", hint: "Uğruna her şeyi vereceğim, vazgeçilmezim..." },
    { word: "KARAM", hint: "Esmer güzeli, kalbimin sahibi..." },
    { word: "ASKIMM", hint: "Dilimden düşmeyen en güzel kelime..." },
    { word: "HAYATIM", hint: "Seninle anlam kazanan bu ömür..." },
    { word: "BİRİCİĞİM", hint: "Benim için eşi benzeri olmayan..." },
    { word: "MELEĞİM", hint: "Yüzüyle dünyamı aydınlatan..." },
    { word: "GÜNEŞİM", hint: "Her sabah içimi ısıtan ışığım..." },
    { word: "SEVGİLİM", hint: "Kalbimin en özel köşesindeki..." }
];

// Web Audio API Ses Efektleri
const azAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playAzizeSound(type) {
    if (!azAudioCtx) return;
    if (azAudioCtx.state === 'suspended') azAudioCtx.resume();
    const osc = azAudioCtx.createOscillator();
    const gainNode = azAudioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(azAudioCtx.destination);

    if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, azAudioCtx.currentTime);
        osc.frequency.setValueAtTime(600, azAudioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(900, azAudioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, azAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, azAudioCtx.currentTime + 0.3);
        osc.start(); osc.stop(azAudioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, azAudioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, azAudioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, azAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, azAudioCtx.currentTime + 0.2);
        osc.start(); osc.stop(azAudioCtx.currentTime + 0.2);
    } else if (type === 'hint') {
        osc.frequency.setValueAtTime(550, azAudioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, azAudioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, azAudioCtx.currentTime + 0.15);
        osc.start(); osc.stop(azAudioCtx.currentTime + 0.15);
    }
}

// Kalp Parçacık Efekti (Doğru Bilindiğinde Uçar)
function createHeartParticles(canvasWidth, canvasHeight) {
    for (let i = 0; i < 15; i++) {
        azizeParticles.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 1) * 3 - 1,
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: 0.02
        });
    }
}

function startWordGame() {
    azizeActive = true;
    azizeScore = 0;
    azizeParticles = [];
    updateAzizeUI();
    nextAzizeWord();
}

function nextAzizeWord() {
    if (!azizeActive) return;
    let data = azizeWordData[Math.floor(Math.random() * azizeWordData.length)];
    currentTargetWord = data.word;
    currentHint = data.hint;
    scrambleAzizeWord(currentTargetWord);
    drawAzizeCanvas();
}

function scrambleAzizeWord(str) {
    let arr = str.split('');
    do {
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        scrambledWord = arr.join('');
    } while (scrambledWord === str && str.length > 1);
}

function drawAzizeCanvas() {
    const canvas = document.getElementById("wordCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.parentElement.clientWidth - 20;
    canvas.height = 220;

    // Siber Neon Arka Plan
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(1, '#131824');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Kalp Parçacıklarını Güncelle ve Çiz
    for (let i = azizeParticles.length - 1; i >= 0; i--) {
        let p = azizeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
            azizeParticles.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ff3366';
        ctx.font = `${p.size * 2}px sans-serif`;
        ctx.fillText("❤️", p.x, p.y);
        ctx.restore();
    }

    // Başlık: Azizemeee Özel Oyun
    ctx.fillStyle = '#ff3366';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff3366';
    ctx.fillText("✨ Azizemeee Özel Oyun ✨", canvas.width / 2, 35);

    // Karıştırılmış Harfler Kutusu
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0f0';
    ctx.fillStyle = 'rgba(0, 240, 240, 0.1)';
    ctx.strokeStyle = '#00f0f0';
    ctx.lineWidth = 2;
    ctx.fillRect(30, 60, canvas.width - 60, 60);

    // Harfler
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(scrambledWord.split('').join(' '), canvas.width / 2, 100);

    // Romantik İpucu / Bilgi Metni
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#b0bec5';
    ctx.font = '13px sans-serif';
    ctx.fillText(currentHint, canvas.width / 2, 150);

    // Animasyon döngüsü
    if (azizeParticles.length > 0) {
        requestAnimationFrame(drawAzizeCanvas);
    }
}

function checkWordAnswer(userAnswer) {
    if (!azizeActive) return;
    let cleanAnswer = userAnswer.trim().toUpperCase();

    if (cleanAnswer === currentTargetWord) {
        playAzizeSound('correct');
        azizeScore += 10;
        if (azizeScore > azizeHighScore) {
            azizeHighScore = azizeScore;
            localStorage.setItem("azizeHighScore", azizeHighScore);
        }
        updateAzizeUI();
        setAzizeStatus("Harika aşkım, bildin! ❤️");
        
        const canvas = document.getElementById("wordCanvas");
        if (canvas) createHeartParticles(canvas.width, canvas.height);
        drawAzizeCanvas();

        setTimeout(nextAzizeWord, 1200);
    } else {
        playAzizeSound('wrong');
        setAzizeStatus("Tekrar dene bebeğim! 🌸");
    }
}

function showWordHint() {
    if (!azizeActive) return;
    playAzizeSound('hint');
    setAzizeStatus(`İpucu: Kelime '${currentTargetWord[0]}' ile başlıyor ve ${currentTargetWord.length} harfli! 💕`);
}

function setAzizeStatus(text) {
    let statusElem = document.getElementById("wordStatus");
    if (statusElem) statusElem.innerText = text;
}

function updateAzizeUI() {
    let scoreElem = document.getElementById("wordScore");
    if (scoreElem) scoreElem.innerText = azizeScore;
    let highElem = document.getElementById("wordHighScore");
    if (highElem) highElem.innerText = azizeHighScore;
}
