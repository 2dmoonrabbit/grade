// ========= 팝업(모달) =========
const modal = document.getElementById("modal");
const rabbit1Btn = document.getElementById("rabbit1Btn");
const closeModalBtn = document.getElementById("closeModalBtn");

function openModal(){
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal(){
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

rabbit1Btn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});


// ========= 구글 스프레드시트에서 점수 가져오기 =========
// 가장 쉬운 방식: 시트를 '웹에 게시' 후 gviz JSON으로 읽기
const scoreText = document.getElementById("scoreText");

// 1) 아래 3가지만 너의 시트에 맞게 바꿔줘
const SHEET_ID   = "여기에_스프레드시트_ID";  // 예: 1AbC... (URL의 /d/ 다음)
const SHEET_NAME = "Sheet1";                  // 탭 이름
const CELL_RANGE = "A1";                      // 점수 셀

function formatScore(value){
  const n = Number(value);
  if (Number.isFinite(n)) return `${n} 점`;
  return `${value}`;
}

async function fetchScore(){
  const url =
    `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}` +
    `/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}` +
    `&range=${encodeURIComponent(CELL_RANGE)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("시트 요청 실패");

  const text = await res.text();
  const jsonStr = text
    .replace("/*O_o*/", "")
    .replace(/^google\.visualization\.Query\.setResponse\(/, "")
    .replace(/\);\s*$/, "");

  const data = JSON.parse(jsonStr);
  const v = data?.table?.rows?.[0]?.c?.[0]?.v;

  if (v === null || v === undefined || v === "") {
    scoreText.textContent = "-- 점";
    return;
  }
  scoreText.textContent = formatScore(v);
}

async function start(){
  try {
    await fetchScore();
  } catch (err) {
    console.error(err);
    scoreText.textContent = "연동 오류";
  }
}

start();

// 원하면 주기적으로 갱신(예: 30초)
// setInterval(fetchScore, 30000);
