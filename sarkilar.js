// Şarkı Listesi ve Oynatıcı Mantığı
const songs = [
    { title: "🎵 Azer Bülbül - Ben Seninle Mutluyum", src: "Azer Bülbül - Ben Seninle Mutluyum(_t1jBwvACMgk_).m4a" },
    { title: "🎵 ASLAR & Lessio & Astral - Yenildiğim Tek Savaştın", src: "ASLAR & Lessio & Astral - yenildiğim tek savaştın _ Lyrics Video _(_a6Z8_oaGyDU_).m4a" },
    { title: "🎵 Keizerkado & omer11 - C'est La Vie", src: "Keizerkado & omer11 - C_EST LA VİE 2.0(_S-aEEFiGK9Y_).m4a" }
];
let currentSongIdx = 0;
let isPlaying = false;
let audioElement = new Audio();

function toggleMusic() {
    if (!audioElement.src) {
        loadCurrentSong();
    }
    
    isPlaying = !isPlaying;
    const btn = document.getElementById("musicBtn");

    if (isPlaying) {
        audioElement.play().catch(() => {});
        if (btn) btn.innerText = "Durdur ⏸";
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

// Sayfa yüklendiğinde ilk şarkıyı hazırla ve başlığı yaz
document.addEventListener("DOMContentLoaded", () => {
    updateSongTitle();
    loadCurrentSong();
    audioElement.addEventListener('ended', () => {
        nextSong();
        if (isPlaying) audioElement.play().catch(() => {});
    });
});
