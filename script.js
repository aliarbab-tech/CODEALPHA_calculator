const display = document.getElementById("display");
const history = document.getElementById("history");
const keys = document.querySelectorAll(".key");

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

function updateDisplay() {
  display.textContent = formatNumber(current);
  history.textContent = previous !== null && operator
    ? `${formatNumber(previous)} ${operator}`
    : "\u00A0";
}

function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "Error";
  if (Math.abs(num) > 1e12) return num.toExponential(4);
  return value.toString();
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    justEvaluated = false;
  } else {
    current = current === "0" ? digit : current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated) {
    current = "0.";
    justEvaluated = false;
    updateDisplay();
    return;
  }
  if (!current.includes(".")) {
    current += ".";
    updateDisplay();
  }
}

function chooseOperator(op) {
  if (operator && previous !== null && !justEvaluated) {
    evaluate();
  }
  previous = current;
  operator = op;
  current = "0";
  justEvaluated = false;
  updateDisplay();
  highlightOperator(op);
}

function highlightOperator(op) {
  document.querySelectorAll(".operator").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.op === op);
  });
}

function evaluate() {
  if (operator === null || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;
  switch (operator) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? NaN : a / b; break;
    default: return;
  }
  result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
  current = Number.isNaN(result) ? "Error" : String(result);
  previous = null;
  operator = null;
  justEvaluated = true;
  highlightOperator(null);
  updateDisplay();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  highlightOperator(null);
  updateDisplay();
}

function negate() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

function backspace() {
  if (justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  updateDisplay();
}

keys.forEach(key => {
  key.addEventListener("click", () => {
    key.classList.add("pressed");
    setTimeout(() => key.classList.remove("pressed"), 120);

    if (key.dataset.num !== undefined) inputDigit(key.dataset.num);
    else if (key.dataset.op) chooseOperator(key.dataset.op);
    else if (key.dataset.action === "clear") clearAll();
    else if (key.dataset.action === "negate") negate();
    else if (key.dataset.action === "percent") percent();
    else if (key.dataset.action === "decimal") inputDecimal();
    else if (key.dataset.action === "equals") evaluate();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") chooseOperator("+");
  else if (e.key === "-") chooseOperator("−");
  else if (e.key === "*") chooseOperator("×");
  else if (e.key === "/") { e.preventDefault(); chooseOperator("÷"); }
  else if (e.key === "Enter" || e.key === "=") evaluate();
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") clearAll();
});

updateDisplay();
