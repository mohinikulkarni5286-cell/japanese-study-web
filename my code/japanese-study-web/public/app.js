const form = document.getElementById("vocab-form");
const input = document.getElementById("word-input");
const list = document.getElementById("vocab-list");
const addedItemsList = document.getElementById("added-items-list");
const dailyCount = document.getElementById("daily-count");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

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

function renderAddedItems(words) {
  addedItemsList.innerHTML = "";
  if (!words.length) {
    const li = document.createElement("li");
    li.classList.add("empty-state");
    li.textContent = "No items added yet.";
    addedItemsList.appendChild(li);
    return;
  }

  const newestFirst = [...words].reverse();
  newestFirst.forEach((item) => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = item.word;

    const status = document.createElement("span");
    status.classList.add("status-pill");
    status.textContent = item.learned ? "Learned" : "Pending";

    li.appendChild(text);
    li.appendChild(status);
    addedItemsList.appendChild(li);
  });
}

function setActiveTab(tabId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });
}

async function refresh() {
  const [words, stats] = await Promise.all([fetchWords(), fetchStats()]);
  renderWords(words);
  renderAddedItems(words);
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

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

refresh();
