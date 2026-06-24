// متغیرهای سراسری
let curS = 0, curA = 0;
let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks')) || [];
let memList = JSON.parse(localStorage.getItem('quran_mem')) || [];

window.onload = () => {
    initSels();
    initTestSels(); 
    updateHome();
};

// مدیریت نمایش بخش‌ها
function showV(id, btn) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    
    const targetView = document.getElementById(id);
    if(targetView) {
        targetView.classList.add('active');
    }
    
    if(btn) btn.classList.add('active');
    
    if(id === 'v-home') updateHome();
    // وقتی به بخش حفظ می‌رویم، آیه را رندر می‌کنیم تا مطمئن شویم نمایش داده می‌شود
    if(id === 'v-mem') renderAyah();
}

// مقداردهی اولیه لیست سوره‌ها
function initSels() {
    const sSel = document.getElementById('s-sel');
    if(!sSel) return;
    sSel.innerHTML = "";
    quranData.forEach((s, i) => {
        sSel.innerHTML += `<option value="${i}">${s.name}</option>`;
    });
    changeSoreh();
}

// تغییر سوره
function changeSoreh() {
    const sSel = document.getElementById('s-sel');
    if(!sSel) return;
    curS = parseInt(sSel.value);
    
    const aSel = document.getElementById('a-sel');
    if(!aSel) return;
    aSel.innerHTML = "";
    quranData[curS].ayahs.forEach((a, i) => {
        aSel.innerHTML += `<option value="${i}">آیه ${a.n}</option>`;
    });
    curA = 0;
    renderAyah();
}

// تغییر آیه از لیست
function changeAyah() {
    const aSel = document.getElementById('a-sel');
    if(!aSel) return;
    curA = parseInt(aSel.value);
    renderAyah();
}

/**
 * تابع اصلی نمایش آیه و معنی
 * این تابع مسئول نمایش متن عربی، ترجمه و وضعیت نشانک‌هاست
 */
function renderAyah() {
    const surah = quranData[curS];
    const ayah = surah.ayahs[curA];
    if (!surah || !ayah) return;

    // ۱. نمایش نام سوره و شماره آیه در هدر
    const metaEl = document.getElementById("ayah-meta");
    if(metaEl) metaEl.textContent = `سوره ${surah.name} - آیه ${ayah.n}`;

    // ۲. رندر کلمات آیه برای قابلیت دایره کشیدن دور کلمات
    const ayahTextEl = document.getElementById("ayah-text");
    if(ayahTextEl) {
        ayahTextEl.innerHTML = "";
        const words = ayah.t.split(" ");
        words.forEach(w => {
            const span = document.createElement("span");
            span.className = "word";
            span.textContent = w;
            span.onclick = () => span.classList.toggle("circle");
            ayahTextEl.appendChild(span);
            ayahTextEl.appendChild(document.createTextNode(" "));
        });
    }

    // ۳. مدیریت نمایش معنی زیر آیه
    let transEl = document.getElementById("ayah-translation");
    if (!transEl && ayahTextEl) {
        // ساخت باکس ترجمه اگر وجود نداشته باشد
        transEl = document.createElement("div");
        transEl.id = "ayah-translation";
        transEl.className = "translation-box"; // استایل را در CSS تعریف کنید یا اینجا اضافه کنید
        transEl.style = "text-align: center; margin-top: 15px; color: #666; font-size: 0.95em; line-height: 1.6; border-top: 1px dashed #ddd; padding-top: 10px; direction: rtl;";
        ayahTextEl.after(transEl);
    }
    
    if (transEl) {
        if (ayah.tr) {
            transEl.textContent = ayah.tr;
            transEl.style.display = "block";
        } else {
            transEl.style.display = "none";
        }
    }

    // ۴. هماهنگ‌سازی منوی کشویی آیه
    const aSel = document.getElementById('a-sel');
    if(aSel) aSel.value = curA;
    
    // ۵. بروزرسانی ظاهر دکمه‌های نشانک و حفظ
    updateBookmarkUI();
    updateDoneUI();
}

// آیه بعدی
function nextA() {
    if(curA < quranData[curS].ayahs.length - 1) {
        curA++;
        renderAyah();
    } else if(curS < quranData.length - 1) {
        curS++;
        const sSel = document.getElementById('s-sel');
        if(sSel) sSel.value = curS;
        changeSoreh();
    }
}

// آیه قبلی
function prevA() {
    if(curA > 0) {
        curA--;
        renderAyah();
    }
}

// مدیریت نشانک‌ها (Bookmark)
function toggleBookmark() {
    let id = `${quranData[curS].number}:${quranData[curS].ayahs[curA].n}`;
    let idx = bookmarks.indexOf(id);
    if(idx > -1) bookmarks.splice(idx, 1);
    else bookmarks.push(id);
    localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks));
    updateBookmarkUI();
}

function updateBookmarkUI() {
    let id = `${quranData[curS].number}:${quranData[curS].ayahs[curA].n}`;
    let btn = document.getElementById('bookmark-btn');
    if(!btn) return;
    btn.style.background = bookmarks.includes(id) ? "#f1c40f" : "#f9f9f9";
}

function openBookmarks() {
    const list = document.getElementById('bookmark-list');
    if(!list) return;
    list.innerHTML = bookmarks.length === 0 ? "<p>نشانکی یافت نشد.</p>" : "";
    bookmarks.forEach(id => {
        let [sNum, aNum] = id.split(":");
        let soreh = quranData.find(x => x.number == sNum);
        if(!soreh) return;
        let div = document.createElement('div');
        div.className = "card";
        div.style.cursor = "pointer";
        div.innerHTML = `<strong>سوره ${soreh.name}</strong> - آیه ${aNum}`;
        div.onclick = () => {
            curS = quranData.findIndex(x => x.number == sNum);
            const sSel = document.getElementById('s-sel');
            if(sSel) sSel.value = curS;
            changeSoreh();
            curA = aNum - 1;
            renderAyah();
            closeBookmarks();
            showV('v-mem');
        };
        list.appendChild(div);
    });
    document.getElementById('bookmark-modal').style.display = "flex";
}

function closeBookmarks() { 
    const modal = document.getElementById('bookmark-modal');
    if(modal) modal.style.display = "none"; 
}

// مدیریت وضعیت حفظ شده‌ها
function toggleMemorized() {
    let id = `${quranData[curS].number}:${quranData[curS].ayahs[curA].n}`;
    let idx = memList.indexOf(id);
    if(idx > -1) memList.splice(idx, 1);
    else memList.push(id);
    localStorage.setItem('quran_mem', JSON.stringify(memList));
    updateDoneUI();
    updateHome();
}

function updateDoneUI() {
    let id = `${quranData[curS].number}:${quranData[curS].ayahs[curA].n}`;
    let btn = document.getElementById('done-btn');
    if(!btn) return;
    btn.style.background = memList.includes(id) ? "#27ae60" : "#f9f9f9";
    btn.style.color = memList.includes(id) ? "white" : "black";
}

// بروزرسانی آمار صفحه اصلی
function updateHome() {
    let total = 0;
    quranData.forEach(s => total += s.ayahs.length);
    let percent = total > 0 ? (memList.length / total) * 100 : 0;
    let mainProg = document.getElementById('main-progress');
    if(mainProg) mainProg.style.width = percent + "%";
    let statTxt = document.getElementById('stat-text');
    if(statTxt) statTxt.innerText = `${memList.length} آیه از ${total} آیه حفظ شده (٪${Math.round(percent)})`;
}

// جستجو
function runSearch() {
    let query = document.getElementById('search-input').value.trim();
    let resDiv = document.getElementById('search-results');
    if(!resDiv) return;
    resDiv.innerHTML = "";
    if(query.length < 2) return;
    const normalize = (txt) => txt.replace(/[\u064B-\u065F]/g, "");
    let cleanQuery = normalize(query);
    quranData.forEach((s, sIdx) => {
        s.ayahs.forEach((a, aIdx) => {
            if(normalize(a.t).includes(cleanQuery)) {
                let d = document.createElement('div');
                d.className = "card";
                d.innerHTML = `<small>${s.name} آیه ${a.n}</small><p>${a.t}</p>`;
                d.onclick = () => {
                    curS = sIdx; 
                    const sSel = document.getElementById('s-sel');
                    if(sSel) sSel.value = sIdx;
                    changeSoreh(); 
                    curA = aIdx;
                    renderAyah(); 
                    showV('v-mem');
                };
                resDiv.appendChild(d);
            }
        });
    });
}

// بخش آزمون (بدون تغییر در منطق)
function initTestSels() {
    const sStart = document.getElementById('t-s-start');
    const sEnd = document.getElementById('t-s-end');
    if(!sStart || !sEnd) return;
    sStart.innerHTML = ""; sEnd.innerHTML = "";
    quranData.forEach((s, i) => {
        let opt = `<option value="${i}">${s.name}</option>`;
        sStart.innerHTML += opt; sEnd.innerHTML += opt;
    });
    sEnd.value = quranData.length - 1;
    updateTestAyahs('start'); updateTestAyahs('end');
}

function updateTestAyahs(type) {
    const sIdx = document.getElementById(`t-s-${type}`).value;
    const aSel = document.getElementById(`t-a-${type}`);
    if(!aSel) return;
    aSel.innerHTML = "";
    quranData[sIdx].ayahs.forEach((a, i) => {
        aSel.innerHTML += `<option value="${i}">آیه ${a.n}</option>`;
    });
    if(type === 'end') aSel.value = quranData[sIdx].ayahs.length - 1;
}

let quiz = { pool: [], current: 0, score: 0, total: 0 };
function startNewTest() {
    let sStart = parseInt(document.getElementById('t-s-start').value);
    let aStart = parseInt(document.getElementById('t-a-start').value);
    let sEnd = parseInt(document.getElementById('t-s-end').value);
    let aEnd = parseInt(document.getElementById('t-a-end').value);
    if (sStart > sEnd || (sStart === sEnd && aStart > aEnd)) {
        alert("محدوده انتخابی معتبر نیست."); return;
    }
    quiz.pool = [];
    for (let i = sStart; i <= sEnd; i++) {
        let from = (i === sStart) ? aStart : 0;
        let to = (i === sEnd) ? aEnd : quranData[i].ayahs.length - 1;
        for (let j = from; j <= to; j++) {
            let a = quranData[i].ayahs[j];
            quiz.pool.push({ sName: quranData[i].name, text: a.t, n: a.n });
        }
    }
    let requestedCount = parseInt(document.getElementById('t-count').value);
    quiz.total = Math.min(requestedCount, quiz.pool.length);
    quiz.current = 0; quiz.score = 0;
    quiz.pool.sort(() => Math.random() - 0.5);
    document.getElementById('test-setup').style.display = "none";
    document.getElementById('test-screen').style.display = "block";
    nextQuestion();
}

function nextQuestion() {
    if(quiz.current >= quiz.total) {
        alert(`آزمون پایان یافت! امتیاز: ${quiz.score} از ${quiz.total}`);
        document.getElementById('test-setup').style.display = "block";
        document.getElementById('test-screen').style.display = "none";
        return;
    }
    quiz.current++;
    document.getElementById('next-q-btn').style.display = "none";
    document.getElementById('test-feedback').innerHTML = "";
    document.getElementById('test-progress-text').innerText = `سوال ${quiz.current} از ${quiz.total}`;
    let type = document.getElementById('t-type').value;
    if(type === 'mix') type = ['testi', 'truefalse', 'sort', 'blank'][Math.floor(Math.random()*4)];
    renderQuiz(type, quiz.pool[quiz.current - 1]);
}

function renderQuiz(type, target) {
    const qBox = document.getElementById('test-question');
    const oBox = document.getElementById('test-options');
    oBox.innerHTML = "";
    if(type === 'testi') {
        qBox.innerText = `آیه «${target.text}» در کدام سوره است؟`;
        let opts = [target.sName, "النبأ", "النازعات", "الفجر"].sort(()=>Math.random()-0.5);
        opts.forEach(opt => oBox.innerHTML += `<button class="test-option" onclick="checkAns('${opt}','${target.sName}')">${opt}</button>`);
    } else if(type === 'truefalse') {
        let isCorrect = Math.random() > 0.5;
        let showName = isCorrect ? target.sName : "بقره";
        qBox.innerText = `آیا آیه «${target.text.split(" ").slice(0,3).join(" ")}...» متعلق به سوره "${showName}" است؟`;
        oBox.innerHTML = `<button class="test-option" onclick="checkAns(${isCorrect}, true)">صحیح</button>
                          <button class="test-option" onclick="checkAns(${isCorrect}, false)">غلط</button>`;
    } else if(type === 'sort') {
        qBox.innerText = "کلمات آیه را به ترتیب انتخاب کنید:";
        let words = target.text.split(" ");
        let shuffled = [...words].sort(()=>Math.random()-0.5);
        let userSort = [];
        shuffled.forEach(w => {
            let b = document.createElement('button'); b.className="test-option"; b.innerText=w;
            b.onclick = () => { userSort.push(w); b.style.opacity="0.3"; b.disabled=true; if(userSort.length === words.length) checkAns(userSort.join(" "), target.text); };
            oBox.appendChild(b);
        });
    } else if(type === 'blank') {
        let words = target.text.split(" ");
        let idx = Math.floor(Math.random()*words.length);
        let hidden = words[idx];
        qBox.innerText = `جای خالی را پر کنید:\n "${target.text.replace(hidden, "......")}"`;
        let input = document.createElement('input'); input.id="blank-inp"; input.className="test-option";
        let btn = document.createElement('button'); btn.innerText="ثبت"; btn.className="btn-primary";
        btn.onclick = () => { 
            const norm = (t) => t.replace(/[\u064B-\u065F]/g, "").trim();
            checkAns(norm(document.getElementById('blank-inp').value), norm(hidden)); 
        };
        oBox.appendChild(input); oBox.appendChild(btn);
    }
}

function checkAns(user, correct) {
    let isWin = (user === correct);
    if(isWin) quiz.score++;
    document.getElementById('test-feedback').innerHTML = isWin ? `<p style="color:green;">✅ درست</p>` : `<p style="color:red;">❌ غلط. پاسخ: ${correct}</p>`;
    document.getElementById('next-q-btn').style.display = "block";
}
