// ===== 현재 시간 =====
const clockEl = document.getElementById("clock");
function updateClock(){
  const d = new Date();
  clockEl.textContent =
    String(d.getHours()).padStart(2,"0") + ":" +
    String(d.getMinutes()).padStart(2,"0");
}
updateClock();
setInterval(updateClock, 1000);

// ===== 모달 =====
const modal = document.getElementById("modal");
document.getElementById("rabbit1Btn").onclick = () => modal.classList.add("is-open");
document.getElementById("closeModalBtn").onclick = () => modal.classList.remove("is-open");

// ===== 구글 스프레드시트 연동 =====
const scoreText = document.getElementById("scoreText");

const SHEET_ID   = "여기에_스프레드시트_ID";
const SHEET_NAME = "Sheet1";
const CELL_RANGE = "A1";

function formatScore(v){
  if (v === null || v === undefined) return "-- 점";
  const s = String(v).trim();
  if (s.includes("점")) return s;
  const n = Number(s);
  if (!isNaN(n)) return `${n} 점`;
  return s;
}

async function fetchScore(){
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}` +
    `/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&range=${CELL_RANGE}`;

  const res = await fetch(url);
  const text = await res.text();

  const json = JSON.parse(
    text.replace("/*O_o*/","")
        .replace(/^google\.visualization\.Query\.setResponse\(/,"")
        .replace(/\);$/,"")
  );

  const cell = json.table.rows[0].c[0];
  const value = cell.f ?? cell.v;

  scoreText.textContent = formatScore(value);
}

fetchScore();
setInterval(fetchScore, 30000);
