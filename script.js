// ========= 현재 시간 =========
const clockEl = document.getElementById("clock");
function updateClock(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  clockEl.textContent = `${hh}:${mm}`;
}
updateClock();
setInterval(updateClock, 1000);

// ========= 모달(팝업) =========
const modal = document.getElementById("modal");
const rabbit1Btn = document.getElementById("rabbit1Btn");
const closeModalBtn = document.getElementById("closeModalBtn");

function openModal(){
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
}

rabbit1Btn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
window.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModal(); });

// ========= 보상 문구(달성 전엔 ???) =========
function updatePopupRewards(score){
  const items = document.querySelectorAll(".modal__body p[data-score][data-text]");
  items.forEach(p => {
    const need = Number(p.dataset.score);
    const text = p.dataset.text || "???";
    if (Number.isFinite(need) && score >= need) {
      p.innerHTML = `<b>${need}점</b> · ${text}`;
    } else if (Number.isFinite(need)) {
      p.innerHTML = `<b>${need}점</b> · ???`;
    }
  });
}

// ========= 점수 애니메이션 =========
const scoreText = document.getElementById("scoreText");
let currentScore = null;

function animateScore(from, to, duration = 650){
  const start = performance.now();
  const diff = to - from;

  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(from + diff * progress);
    scoreText.textContent = `${value} 점`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ========= 구글 스프레드시트 연동 =========
const SHEET_ID   = "1Sb_Gez-NEW-Ps0M-e8LL7jZkf8Qqr9PfNBWvpmjSTE0";
const SHEET_NAME = "Sheet1";
const CELL_RANGE = "B2";

function parseToNumber(v){
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/[^0-9]/g,""));
  return Number.isFinite(n) ? n : null;
}

async function fetchScore(){
  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}` +
    `/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}` +
    `&range=${encodeURIComponent(CELL_RANGE)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`시트 요청 실패: ${res.status}`);

  const text = await res.text();
  const jsonStr = text
    .replace("/*O_o*/", "")
    .replace(/^google\.visualization\.Query\.setResponse\(/, "")
    .replace(/\);\s*$/, "");

  const data = JSON.parse(jsonStr);
  const cell = data?.table?.rows?.[0]?.c?.[0];
  const value = (cell?.f ?? cell?.v);
  const next = parseToNumber(value);
  if (next === null) return;

  updatePopupRewards(next);

  if (currentScore === null) {
    currentScore = next;
    scoreText.textContent = `${currentScore} 점`;
    return;
  }

  if (next !== currentScore) {
    animateScore(currentScore, next);
    currentScore = next;
  }
}

async function startScore(){
  try{
    await fetchScore();
  }catch(err){
    console.error(err);
    scoreText.textContent = "연동 오류";
  }
}
startScore();
setInterval(startScore, 30000);
