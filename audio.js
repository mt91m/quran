// audio.js - هماهنگ با index.html و app.js شما

let currentAudio = null;
let currentPlayingKey = null; // برای تشخیص اینکه کدام آیه در حال پخش است

/**
 * تابع اصلی پخش صوت که در HTML شما فراخوانی شده است
 * @param {number} surahNum - شماره سوره (مثلاً 78)
 * @param {number} ayahNum - شماره آیه (مثلاً 1)
 */
function playAyahAudio(surahNum, ayahNum) {
    const btn = document.getElementById('play-btn');
    const audioKey = `${surahNum}-${ayahNum}`;

    // اگر همین آیه در حال پخش بود، با کلیک مجدد متوقفش کن
    if (currentAudio && currentPlayingKey === audioKey) {
        stopAudio();
        return;
    }

    // اگر آیه دیگری در حال پخش بود، آن را ببنّد
    stopAudio();

    // ساخت آدرس فایل صوتی با فرمت 000000
    const sStr = String(surahNum).padStart(3, '0');
    const aStr = String(ayahNum).padStart(3, '0');
    const url = `https://wiki.ahlolbait.com/audios/parhizgar/${sStr}${aStr}.mp3`;

    currentAudio = new Audio(url);
    currentPlayingKey = audioKey;

    // ۱. حالت بارگذاری
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال بارگذاری...';
    btn.style.opacity = "0.7";
    btn.classList.add('loading');

    currentAudio.onplay = () => {
        // ۲. حالت در حال پخش
        btn.innerHTML = '<i class="fas fa-stop"></i> توقف پخش';
        btn.style.backgroundColor = "#e74c3c"; // تغییر رنگ به قرمز
        btn.style.opacity = "1";
        btn.classList.remove('loading');
    };

    currentAudio.onended = () => {
        resetAudioUI();
    };

    currentAudio.onerror = () => {
        alert("خطا در بارگذاری صوت از سرور.");
        resetAudioUI();
    };

    currentAudio.play().catch(err => {
        console.error("پخش متوقف شد:", err);
        resetAudioUI();
    });
}

/**
 * متوقف کردن صوت و بازگرداندن دکمه به حالت اولیه
 */
function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    currentPlayingKey = null;
    resetAudioUI();
}

/**
 * بازگرداندن ظاهر دکمه به حالت "پخش صوت"
 */
function resetAudioUI() {
    const btn = document.getElementById('play-btn');
    if (!btn) return;
    
    btn.innerHTML = '<i class="fas fa-play"></i> پخش صوت';
    btn.style.backgroundColor = ""; // بازگشت به رنگ اصلی CSS
    btn.style.opacity = "1";
    btn.classList.remove('loading');
}

// یک لیسنر برای اینکه وقتی آیه عوض شد (دکمه بعدی/قبلی)، صوت قبلی قطع شود
window.addEventListener('click', function(e) {
    if (e.target.closest('.nav-btn') || e.target.closest('#s-sel') || e.target.closest('#a-sel')) {
        stopAudio();
    }
});
