// Şarkı Listesi ve Otomatik Oynatıcı Mantığı
const songs = [
    { title: "🎵 Azer Bülbül - Ben Seninle Mutluyum", src: "Azer Bülbül - Ben Seninle Mutluyum(_t1jBwvACMgk_).m4a" },
    { title: "🎵 ASLAR & Lessio & Astral - Yenildiğim Tek Savaştın", src: "ASLAR & Lessio & Astral - yenildiğim tek savaştın _ Lyrics Video _(_a6Z8_oaGyDU_).m4a" },
    { title: "🎵 Keizerkado & omer11 - C'est La Vie", src: "Keizerkado & omer11 - C_EST LA VİE 2.0(_S-aEEFiGK9Y_).m4a" }
];

let currentSongIdx = 0;
let isPlaying = false;
let audioElement = new Audio();

// Sayfa yüklendiğinde müzik çalar HTML yapısını otomatik oluştur ve ekle
document.addEventListener("DOMContentLoaded", () => {
    // index içindeki müzik alanı yerini bulur veya üst kısma otomatik ekler
    let playerContainer = document.querySelector(".music-player");
    if (!playerContainer) {
        playerContainer = document.createElement("div");
        playerContainer.className = "music-player";
        playerContainer.style.cssText = "display:flex; align-items:center; justify-content:space-between; padding:12px 18px; background:var(--card-bg); border-radius:18px; border:1px solid var(--border); box-shadow:0 4px 15px var(--shadow); margin-bottom:15px;";
        const mainApp = document.getElementById("mainApp");
        if (mainApp) mainApp.insertBefore(playerContainer, mainApp.firstChild);
    }

    playerContainer.innerHTML = `
        <span id="songTitle" style="font-weight: 600; font-size: 13px;">🎵 Müzik Yükleniyor...</span>
        <div style="display: flex; gap: 5px;">
            <button onclick="prevSong()" class="music-btn" style="padding: 6px 10px; font-size: 12px; background:var(--accent); color:#fff; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">⏮</button>
            <button onclick="toggleMusic()" id="musicBtn" class="music-btn" style="padding: 6px 12px; font-size: 12px; background:var(--accent); color:#fff; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">Çal ▶</button>
            <button onclick="nextSong()" class="music-btn" style="padding: 6px 10px; font-size: 12px; background:var(--accent); color:#fff; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">⏭</button>
        </div>
    `;

    updateSongTitle();
    loadCurrentSong();
    
    audioElement.addEventListener('ended', () => {
        nextSong();
        if (isPlaying) audioElement.play().catch(() => {});
    });
});

function toggleMusic() {
    if (!audioElement.src) {
        loadCurrentSong();
    }
    
    isPlaying = !isPlaying;
    const btn = document.getElementById("musicBtn");

    if (isPlaying) {
        audioElement.play().then(() => {
            if (btn) btn.innerText = "Durdur ⏸";
        }).catch(err => {
            console.log("Oynatma hatası:", err);
            isPlaying = false;
            if (btn) btn.innerText = "Çal ▶";
        });

        if (typeof confetti === 'function') {
            confetti({ particleCount: 15, spread: 30, origin: { y: 0.1 } });
        }
    } else {
        audioElement.pause();
        if (btn) btn.innerText = "Çal ▶";
    }
}

function nextSong() {
    currentSongIdx = (currentSongIdx + 1) % songs.length;
    loadCurrentSong();
    if (isPlaying) {
        audioElement.play().catch(() => {});
    }
    updateSongTitle();
}

function prevSong() {
    currentSongIdx = (currentSongIdx - 1 + songs.length) % songs.length;
    loadCurrentSong();
    if (isPlaying) {
        audioElement.play().catch(() => {});
    }
    updateSongTitle();
}

function loadCurrentSong() {
    audioElement.src = "sarkilar/" + songs[currentSongIdx].src;
    audioElement.load();
}

function updateSongTitle() {
    const titleEl = document.getElementById("songTitle");
    if (titleEl) {
        titleEl.innerText = songs[currentSongIdx].title;
    }
}
