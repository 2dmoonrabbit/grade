// ========= 현재 시간 =========
const clockEl = document.getElementById("clock");
function updateClock(){
  const now = new Date();
  clockEl.textContent = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
}
updateClock();
setInterval(updateClock, 1000);

// ========= 모달 =========
const modal = document.getElementById("modal");
document.getElementById("rabbit1Btn").addEventListener("click", ()=>{
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
});
document.getElementById("closeModalBtn").addEventListener("click", ()=>{
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
});
modal.addEventListener("click",(e)=>{ if(e.target===modal){ modal.classList.remove("is-open"); }});
window.addEventListener("keydown",(e)=>{ if(e.key==="Escape"){ modal.classList.remove("is-open"); }});

// ========= 보상 문구(달성 전 ???) =========
function updatePopupRewards(score){
  document.querySelectorAll(".modal__body p[data-score][data-text]").forEach(p=>{
    const need = Number(p.dataset.score);
    const text = p.dataset.text || "???";
    p.innerHTML = (score >= need) ? `<b>${need}점</b> · ${text}` : `<b>${need}점</b> · ???`;
  });
}

// ========= 점수 애니메이션 =========
const scoreText = document.getElementById("scoreText");
let currentScore = null;

function animateScore(from, to, duration=650){
  const start = performance.now();
  const diff = to - from;
  function tick(now){
    const t = Math.min((now-start)/duration, 1);
    scoreText.textContent = `${Math.round(from + diff*t)} 점`;
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ========= 구글 스프레드시트 연동(파싱 최강 버전) =========
const SHEET_ID   = "여기에_스프레드시트_ID";
const SHEET_GID  = "0";
const CELL_RANGE = "A1";

function parseToNumber(v){
  if(v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^0-9]/g,""));
  return Number.isFinite(n) ? n : null;
}

// gviz 응답에서 setResponse(...) 안의 JSON만 안전하게 추출
function extractSetResponseJson(text){
  // 1) 주석 제거
  const cleaned = text.replace(/^\/\*O_o\*\//, "").trim();

  const key = "google.visualization.Query.setResponse(";
  const start = cleaned.indexOf(key);
  if (start === -1) throw new Error("GVIZ_NO_SETRESPONSE");

  const jsonStart = start + key.length;
  // 마지막 ");" 찾기 (뒤에서부터)
  const end = cleaned.lastIndexOf(");");
  if (end === -1 || end <= jsonStart) throw new Error("GVIZ_NO_END");

  return cleaned.slice(jsonStart, end).trim();
}

async function fetchScore(){
  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}` +
    `/gviz/tq?tqx=out:json&gid=${encodeURIComponent(SHEET_GID)}` +
    `&range=${encodeURIComponent(CELL_RANGE)}` +
    `&cb=${Date.now()}`;

  const res = await fetch(url, { cache:"no-store" });
  if(!res.ok) throw new Error(`HTTP_${res.status}`);

  const text = await res.text();
  const jsonStr = extractSetResponseJson(text);
  const data = JSON.parse(jsonStr);

  const cell = data?.table?.rows?.[0]?.c?.[0];
  const value = cell?.f ?? cell?.v;
  const next = parseToNumber(value);
  if(next === null) throw new Error("VALUE_NULL");

  updatePopupRewards(next);

  if(currentScore === null){
    currentScore = next;
    scoreText.textContent = `${currentScore} 점`;
    return;
  }
  if(next !== currentScore){
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
