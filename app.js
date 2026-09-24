const state = {
  originalQuestions: [],
  questions: [],
  currentIndex: 0,
  deckName: "",
  order: "ordered",
  reviewWrongOnly: false
};

const els = {
  setupView: document.querySelector("#setupView"),
  quizView: document.querySelector("#quizView"),
  resultsView: document.querySelector("#resultsView"),
  fileInput: document.querySelector("#fileInput"),
  fileInfo: document.querySelector("#fileInfo"),
  fileName: document.querySelector("#fileName"),
  questionCount: document.querySelector("#questionCount"),
  setupTitle: document.querySelector("#setupTitle"),
  setupError: document.querySelector("#setupError"),
  startButton: document.querySelector("#startButton"),
  deckTitle: document.querySelector("#deckTitle"),
  counter: document.querySelector("#counter"),
  progressBar: document.querySelector("#progressBar"),
  questionText: document.querySelector("#questionText"),
  authorLine: document.querySelector("#authorLine"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  commentBox: document.querySelector("#commentBox"),
  previousButton: document.querySelector("#previousButton"),
  nextButton: document.querySelector("#nextButton"),
  changeFileButton: document.querySelector("#changeFileButton"),
  resultsTitle: document.querySelector("#resultsTitle"),
  score: document.querySelector("#score"),
  scoreDetail: document.querySelector("#scoreDetail"),
  reviewWrongButton: document.querySelector("#reviewWrongButton"),
  restartButton: document.querySelector("#restartButton"),
  newFileButton: document.querySelector("#newFileButton")
};

els.fileInput.addEventListener("change", loadSelectedFile);
els.startButton.addEventListener("click", startQuiz);
els.previousButton.addEventListener("click", previousQuestion);
els.nextButton.addEventListener("click", nextQuestion);
els.changeFileButton.addEventListener("click", resetToSetup);
els.newFileButton.addEventListener("click", resetToSetup);
els.restartButton.addEventListener("click", restartDeck);
els.reviewWrongButton.addEventListener("click", reviewWrongAnswers);

async function loadSelectedFile(event) {
  const file = event.target.files?.[0];
  els.setupError.textContent = "";
  els.startButton.disabled = true;

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".tsv")) {
    els.setupError.textContent = "Please choose a .tsv file.";
    return;
  }

  try {
    const text = await file.text();
    const questions = parseTsv(text);

    if (!questions.length) {
      throw new Error("No valid questions were found.");
    }

    state.originalQuestions = questions;
    state.deckName = file.name.replace(/\.tsv$/i, "");

    els.fileName.textContent = state.deckName;
    els.questionCount.textContent = `${questions.length} question${questions.length === 1 ? "" : "s"}`;
    els.fileInfo.classList.remove("hidden");
    els.setupTitle.textContent = state.deckName;
    els.startButton.disabled = false;
  } catch (error) {
    state.originalQuestions = [];
    els.fileInfo.classList.add("hidden");
    els.setupError.textContent = error.message;
  }
}

/*
Supported TSV formats:

1) Six to eight columns without a header:
   Question    Answer A    Answer B    Answer C    Answer D    Correct    Comment    Author

   Comment and Author are optional.
   Correct may be A/B/C/D, 1/2/3/4, or the exact correct answer text.

2) Header-based TSV. Recognized names include:
   question/prompt
   a/answer_a/option_a
   b/answer_b/option_b
   c/answer_c/option_c
   d/answer_d/option_d
   correct/answer/correct_answer
   comment/comments/explanation/note
   author/autor/created_by
*/
function parseTsv(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows = normalized
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(parseTsvLine);

  if (!rows.length) return [];

  const headers = rows[0].map(v => normalizeHeader(v));
  const headerMap = buildHeaderMap(headers);
  const hasHeader = headerMap.question !== -1 && headerMap.correct !== -1;

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const questions = [];

  dataRows.forEach((row, index) => {
    let question, options, correctRaw, comment = "", author = "";

    if (hasHeader) {
      question = valueAt(row, headerMap.question);
      options = [
        valueAt(row, headerMap.a),
        valueAt(row, headerMap.b),
        valueAt(row, headerMap.c),
        valueAt(row, headerMap.d)
      ].filter(v => v !== "");
      correctRaw = valueAt(row, headerMap.correct);
      comment = valueAt(row, headerMap.comment);
      author = valueAt(row, headerMap.author);
    } else else {
  if (row.length < 6) return;

  question = row[0].trim();

  // Original OpenStudyCards format:
  // Question | CorrectIndex(0-3) | A | B | C | D
  if (/^[0-3]$/.test(row[1].trim())) {
    options = row.slice(2, 6).map(v => v.trim());

    // Convert 0-3 into the existing parser's 1-4 format
    correctRaw = String(Number(row[1].trim()) + 1);

    comment = row.length > 6 ? row[6].trim() : "";
    author = row.length > 7 ? row[7].trim() : "";
  } else {
  if (row.length < 6) return;

  question = row[0].trim();

  // Original OpenStudyCards format:
  // Question | CorrectIndex(0-3) | A | B | C | D
  if (/^[0-3]$/.test(row[1].trim())) {
    options = row.slice(2, 6).map(v => v.trim());

    // Convert 0-3 into the existing parser's 1-4 format
    correctRaw = String(Number(row[1].trim()) + 1);

    comment = row.length > 6 ? row[6].trim() : "";
    author = row.length > 7 ? row[7].trim() : "";
  } else {
    // Alternative format:
    // Question | A | B | C | D | Correct
    options = row.slice(1, 5).map(v => v.trim());
    correctRaw = row[5].trim();

    comment = row.length > 6 ? row[6].trim() : "";
    author = row.length > 7 ? row[7].trim() : "";
  }
}
}

    if (!question || options.length < 2 || !correctRaw) return;

    const correctIndex = resolveCorrectIndex(correctRaw, options);
    if (correctIndex === -1) {
      throw new Error(`Could not understand the correct answer on TSV row ${index + (hasHeader ? 2 : 1)}.`);
    }

    questions.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}-${Math.random()}`,
      question,
      options,
      correctIndex,
      comment,
      author,
      selectedIndex: null
    });
  });

  return questions;
}

function parseTsvLine(line) {
  // TSV normally does not require CSV-style parsing, but quoted values are
  // supported here so tabs inside quoted text do not break the row.
  const result = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "\t" && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function buildHeaderMap(headers) {
  return {
    question: firstIndex(headers, ["question", "prompt", "front"]),
    a: firstIndex(headers, ["a", "answer_a", "option_a", "choice_a", "answer1", "option1"]),
    b: firstIndex(headers, ["b", "answer_b", "option_b", "choice_b", "answer2", "option2"]),
    c: firstIndex(headers, ["c", "answer_c", "option_c", "choice_c", "answer3", "option3"]),
    d: firstIndex(headers, ["d", "answer_d", "option_d", "choice_d", "answer4", "option4"]),
    correct: firstIndex(headers, ["correct", "answer", "correct_answer", "correctanswer", "key"]),
    comment: firstIndex(headers, ["comment", "comments", "explanation", "note", "notes"]),
    author: firstIndex(headers, ["author", "autor", "created_by", "createdby"])
  };
}

function firstIndex(headers, candidates) {
  for (const name of candidates) {
    const index = headers.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

function valueAt(row, index) {
  return index >= 0 && index < row.length ? row[index].trim() : "";
}

function resolveCorrectIndex(raw, options) {
  const value = raw.trim();
  const upper = value.toUpperCase();

  if (/^[A-Z]$/.test(upper)) {
    const index = upper.charCodeAt(0) - 65;
    if (index >= 0 && index < options.length) return index;
  }

  if (/^\d+$/.test(value)) {
    const index = Number(value) - 1;
    if (index >= 0 && index < options.length) return index;
  }

  return options.findIndex(option => option.trim().toLowerCase() === value.toLowerCase());
}

function startQuiz() {
  state.order = document.querySelector('input[name="order"]:checked').value;
  state.questions = cloneQuestions(state.originalQuestions);

  if (state.order === "random") shuffle(state.questions);

  state.currentIndex = 0;
  state.reviewWrongOnly = false;
  showView("quiz");
  renderQuestion();
}

function cloneQuestions(questions) {
  return questions.map(q => ({
    ...q,
    options: [...q.options],
    selectedIndex: null
  }));
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  const total = state.questions.length;

  els.deckTitle.textContent = state.deckName;
  els.counter.textContent = `Question ${state.currentIndex + 1} of ${total}`;
  els.progressBar.style.width = `${((state.currentIndex + 1) / total) * 100}%`;
  els.questionText.textContent = q.question;

  if (q.author) {
    els.authorLine.textContent = `Author: ${q.author}`;
    els.authorLine.classList.remove("hidden");
  } else {
    els.authorLine.textContent = "";
    els.authorLine.classList.add("hidden");
  }

  els.answers.innerHTML = "";
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";

    const letter = String.fromCharCode(65 + index);
    const letterSpan = document.createElement("span");
    letterSpan.className = "letter";
    letterSpan.textContent = `${letter}.`;

    const textSpan = document.createElement("span");
    textSpan.textContent = option;

    button.append(letterSpan, textSpan);

    if (q.selectedIndex !== null) {
      if (index === q.correctIndex) button.classList.add("correct");
      if (index === q.selectedIndex && q.selectedIndex !== q.correctIndex) {
        button.classList.add("wrong");
      }
      if (index === q.selectedIndex) button.classList.add("selected");
    }

    button.addEventListener("click", () => selectAnswer(index));
    els.answers.appendChild(button);
  });

  renderFeedback(q);
  renderComment(q);

  els.previousButton.disabled = state.currentIndex === 0;
  els.nextButton.textContent = state.currentIndex === total - 1 ? "Finish Quiz" : "Next →";
}

function selectAnswer(index) {
  const q = state.questions[state.currentIndex];
  q.selectedIndex = index;
  renderQuestion();
}

function renderFeedback(q) {
  if (q.selectedIndex === null) {
    els.feedback.className = "feedback hidden";
    els.feedback.textContent = "";
    return;
  }

  if (q.selectedIndex === q.correctIndex) {
    els.feedback.className = "feedback good";
    els.feedback.textContent = "✓ Correct";
  } else {
    els.feedback.className = "feedback bad";
    els.feedback.innerHTML = "";

    const strong = document.createElement("strong");
    strong.textContent = "✕ Wrong. ";

    const text = document.createTextNode(`Correct answer: ${q.options[q.correctIndex]}`);
    els.feedback.append(strong, text);
  }
}


function renderComment(q) {
  // Reveal comments only after the user has answered, so they cannot spoil the question.
  if (q.selectedIndex === null || !q.comment) {
    els.commentBox.className = "comment-box hidden";
    els.commentBox.innerHTML = "";
    return;
  }

  els.commentBox.className = "comment-box";
  els.commentBox.innerHTML = "";

  const label = document.createElement("strong");
  label.textContent = "Comment: ";

  const text = document.createTextNode(q.comment);
  els.commentBox.append(label, text);
}

function previousQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex++;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const answered = state.questions.filter(q => q.selectedIndex !== null);
  const correct = state.questions.filter(q => q.selectedIndex === q.correctIndex).length;
  const wrong = state.questions.filter(q => q.selectedIndex !== null && q.selectedIndex !== q.correctIndex);
  const unanswered = state.questions.length - answered.length;
  const percent = state.questions.length ? Math.round((correct / state.questions.length) * 100) : 0;

  els.resultsTitle.textContent = state.deckName;
  els.score.textContent = `${percent}%`;
  els.scoreDetail.textContent =
    `${correct} correct · ${wrong.length} wrong · ${unanswered} unanswered · ${state.questions.length} total`;

  els.reviewWrongButton.disabled = wrong.length === 0;
  showView("results");
}

function reviewWrongAnswers() {
  const wrong = state.questions
    .filter(q => q.selectedIndex !== null && q.selectedIndex !== q.correctIndex)
    .map(q => ({ ...q, options: [...q.options] }));

  if (!wrong.length) return;

  state.questions = wrong;
  state.currentIndex = 0;
  state.reviewWrongOnly = true;
  showView("quiz");
  renderQuestion();
}

function restartDeck() {
  state.questions = cloneQuestions(state.originalQuestions);
  if (state.order === "random") shuffle(state.questions);
  state.currentIndex = 0;
  state.reviewWrongOnly = false;
  showView("quiz");
  renderQuestion();
}

function resetToSetup() {
  state.originalQuestions = [];
  state.questions = [];
  state.currentIndex = 0;
  state.deckName = "";
  els.fileInput.value = "";
  els.fileInfo.classList.add("hidden");
  els.startButton.disabled = true;
  els.setupTitle.textContent = "Choose a question file";
  els.setupError.textContent = "";
  showView("setup");
}

function showView(name) {
  els.setupView.classList.toggle("hidden", name !== "setup");
  els.quizView.classList.toggle("hidden", name !== "quiz");
  els.resultsView.classList.toggle("hidden", name !== "results");
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
