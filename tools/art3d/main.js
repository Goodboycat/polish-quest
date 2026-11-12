import { SUBJECTS, start } from './icons.js';
const SIZE = 512, V = ['A polished gold', 'B steel and gold', 'C dark glass and gold'];
const sheet = document.getElementById('sheet'), draw = start(document.getElementById('gl'), SIZE);
const mk = (t, c) => { const d = document.createElement('div'); d.className = c || 'h'; d.textContent = t; return d; };
sheet.appendChild(mk(''));
V.forEach(v => sheet.appendChild(mk(v)));
SUBJECTS.forEach(s => {
  sheet.appendChild(mk(s.label));
  V.forEach((_, vi) => { const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE; c.className = 'cell'; c.id = s.id + '-' + 'abc'[vi]; c.style.width = c.style.height = '256px'; sheet.appendChild(c); draw(s, vi, c); });
});
window.ARTDONE = true;
