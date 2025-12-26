// Clock
const clockEl=document.getElementById("clock");
function updateClock(){
  const d=new Date();
  clockEl.textContent=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
}
updateClock();
setInterval(updateClock,1000);

// Modal
const modal=document.getElementById("modal");
document.getElementById("rabbit1Btn").onclick=()=>modal.classList.add("is-open");
document.getElementById("closeModalBtn").onclick=()=>modal.classList.remove("is-open");
