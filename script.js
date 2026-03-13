// ===========================
//  Calculator Logic
// ===========================

const display    = document.getElementById('display');
const expression = document.getElementById('expression');

let current        = '';
let justCalculated = false;

// Render current input to display
function render() {
  if (current === '') {
    display.textContent = '0';
  } else {
    display.textContent = current;
  }

  // shrink font if the number is long
  display.classList.toggle('shrink', current.length > 9);
  display.classList.remove('error');
}

// Append a character to input
function append(char) {
  if (justCalculated) {
    // after =, start fresh on new number, keep going on operator
    if (!isNaN(char) || char === '.') current = '';
    justCalculated = false;
  }

  // prevent leading multiple zeros
  if (current === '0' && char !== '.' && !isNaN(char)) {
    current = char;
    render();
    return;
  }

  // prevent double decimal in current number segment
  const segments = current.split(/[\+\-\*\/]/);
  const lastSeg  = segments[segments.length - 1];
  if (char === '.' && lastSeg.includes('.')) return;

  current += char;
  render();
}

// Clear everything
function clearAll() {
  current        = '';
  justCalculated = false;
  expression.textContent = '';
  render();
}

// Delete last character
function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  current = current.slice(0, -1);
  render();
}

// Evaluate
function calculate() {
  if (!current) return;

  try {
    const expr = current;

    // replace display symbols with operators for eval
    const safe = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // guard against evil input (only allow numbers and operators)
    if (!/^[0-9+\-*/.%() ]+$/.test(safe)) throw new Error('invalid');

    let result = Function('"use strict"; return (' + safe + ')')();

    if (!isFinite(result)) throw new Error('infinity');

    // round off floating point noise
    result = Math.round(result * 1e10) / 1e10;

    expression.textContent = expr + ' =';
    current = String(result);
    justCalculated = true;
    render();

  } catch (e) {
    display.textContent = 'Error';
    display.classList.add('error');
    expression.textContent = '';
    current = '';
    justCalculated = false;
  }
}

// ===========================
//  Event Delegation on Buttons
// ===========================
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  if (action === 'clear')  clearAll();
  else if (action === 'delete') deleteLast();
  else if (action === 'equals') calculate();
  else if (value !== undefined) append(value);
});

// ===========================
//  Keyboard Support
// ===========================
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') append(e.key);
  else if (e.key === '.')           append('.');
  else if (e.key === '+')           append('+');
  else if (e.key === '-')           append('-');
  else if (e.key === '*')           append('*');
  else if (e.key === '%')           append('%');
  else if (e.key === '/') { e.preventDefault(); append('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace')   deleteLast();
  else if (e.key === 'Escape')      clearAll();
});