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

// ========= 모달 =========
const modal = document.getElementById("modal");
document.getElementById("rabbit1Btn").addEventListener("click", () => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
});
document.getElementById("closeModalBtn").addEventListener("click", () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
});
modal.addEventListener("click", (e)=>{ if(e.target===modal){ modal.classList.remove("is-open"); }});
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ modal.classList.remove("is-open"); }});

// ========= 보상 문구(달성 전 ???) =========
function updatePopupRewards(score){
  document.querySelectorAll(".modal__body p[data-score][data-text]").forEach(p => {
    const need = Number(p.dataset.score);
    const text = p.dataset.text || "???";
    p.innerHTML = (score >= need)
      ? `<b>${need}점</b> · ${text}`
      : `<b>${need}점</b> · ???`;
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

// ========= 구글 스프레드시트 연동(탭 이름 대신 gid 사용) =========
const SHEET_ID    = "여기에_스프레드시트_ID";
const SHEET_GID   = "0";     // 탭 URL에 #gid=0 이면 0
const CELL_RANGE  = "A1";

function parseToNumber(v){
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^0-9]/g,""));
  return Number.isFinite(n) ? n : null;
}

async function fetchScore(){
  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}` +
    `/gviz/tq?tqx=out:json&gid=${encodeURIComponent(SHEET_GID)}` +
    `&range=${encodeURIComponent(CELL_RANGE)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

  if (currentScore === null){
    currentScore = next;
    scoreText.textContent = `${currentScore} 점`;
    return;
  }
  if (next !== currentScore){
    animateScore(currentScore, next);
    currentScore = next;
  }
}

async function startScore(){
  try{
    await fetchScore();
  }catch(err){
    console.error("Sheets error:", err);
    scoreText.textContent = "연동 오류";
  }
}
startScore();
setInterval(startScore, 30000);
