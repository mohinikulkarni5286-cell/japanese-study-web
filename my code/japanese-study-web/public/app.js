const form = document.getElementById("vocab-form");
const input = document.getElementById("word-input");
const list = document.getElementById("vocab-list");
const dailyCount = document.getElementById("daily-count");

async function fetchWords() {
  const res = await fetch("/api/vocab");
  return res.json();
}

async function fetchStats() {
  const res = await fetch("/api/stats/today");
  return res.json();
}

async function addWord(word) {
  await fetch("/api/vocab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  });
}

async function toggleLearned(id) {
  await fetch(`/api/vocab/${id}/learned`, {
    method: "PATCH",
  });
}

function renderWords(words) {
  list.innerHTML = "";
  words.forEach((item) => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = item.word;
    if (item.learned) text.classList.add("learned");

    const btn = document.createElement("button");
    btn.textContent = item.learned ? "Unlearn" : "Learned";
    btn.addEventListener("click", async () => {
      await toggleLearned(item.id);
      await refresh();
    });

    li.appendChild(text);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function refresh() {
  const [words, stats] = await Promise.all([fetchWords(), fetchStats()]);
  renderWords(words);
  dailyCount.textContent = `Learned today: ${stats.learnedToday} (Total words: ${stats.totalWords})`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  await addWord(value);
  input.value = "";
  await refresh();
});

refresh();
