const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const words = [];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

app.get("/api/vocab", (_req, res) => {
  res.json(words);
});

app.post("/api/vocab", (req, res) => {
  const text = (req.body.word || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Word is required" });
  }

  const newWord = {
    id: Date.now(),
    word: text,
    learned: false,
    learnedDate: null,
  };
  words.push(newWord);
  res.status(201).json(newWord);
});

app.patch("/api/vocab/:id/learned", (req, res) => {
  const id = Number(req.params.id);
  const target = words.find((item) => item.id === id);
  if (!target) {
    return res.status(404).json({ error: "Word not found" });
  }

  target.learned = !target.learned;
  target.learnedDate = target.learned ? todayKey() : null;
  res.json(target);
});

app.get("/api/stats/today", (_req, res) => {
  const today = todayKey();
  const learnedToday = words.filter((item) => item.learnedDate === today).length;
  res.json({ date: today, learnedToday, totalWords: words.length });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
