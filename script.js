/* ══════════════════════════════════════════════════════════
   DIVIDE & CONQUER VISUALIZER  ·  script.js
   All 8 algorithms with step-by-step animation
══════════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────
let currentAlgo = 'mergesort';
let isRunning    = false;
let stepMode     = false;
let stepResolve  = null;
let animSteps    = [];
let stepIndex    = 0;
let arr          = [];
let points       = [];
let speedMs      = () => [600, 450, 300, 180, 80][+document.getElementById('speedSlider').value - 1];

// ── Algo metadata ─────────────────────────────────────────
const ALGO_META = {
  mergesort: {
    badge: '01', title: 'Merge Sort',
    desc: 'A classic divide-and-conquer sorting algorithm that splits the array in half, recursively sorts each half, then merges the two sorted halves.',
    divide:  'Split array at midpoint into two sub-arrays of size ⌊n/2⌋ and ⌈n/2⌉.',
    conquer: 'Recursively sort each sub-array until single elements remain.',
    combine: 'Merge two sorted halves by comparing front elements and appending the smaller.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)', time: 'Θ(n log n)', space: 'O(n)', master: 'Case 2 — a=2, b=2, f(n)=n'
  },
  quicksort: {
    badge: '02', title: 'Quick Sort',
    desc: 'Selects a pivot element and partitions the array such that all smaller elements come before it and all larger elements come after it.',
    divide:  'Choose rightmost element as pivot; partition array around it.',
    conquer: 'Recursively sort elements before and after the pivot.',
    combine: 'No explicit combine step — array is sorted in-place.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)', time: 'Θ(n log n) avg', space: 'O(log n)', master: 'Avg Case 2; Worst: T(n)=T(n-1)+n'
  },
  minmax: {
    badge: '03', title: 'Min / Max',
    desc: 'Find both minimum and maximum elements in an array using divide and conquer with only ~3n/2 comparisons rather than the naive 2n.',
    divide:  'Split array in half at each recursive step.',
    conquer: 'Find min and max of each half recursively.',
    combine: 'Return the smaller of the two minimums and the larger of the two maximums.',
    recurrence: 'T(n) = 2T(n/2) + 2', time: 'Θ(n)', space: 'O(log n)', master: 'Case 3 — comparisons: ⌈3n/2⌉ − 2'
  },
  maxsub: {
    badge: '04', title: 'Max Subarray',
    desc: "Kadane's divide-and-conquer variant: find the contiguous subarray with the largest sum by considering left, right, and crossing subarrays.",
    divide:  'Split array at midpoint into left and right halves.',
    conquer: 'Recursively find max subarray in each half.',
    combine: 'Find max crossing subarray (must include midpoint); return max of all three.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)', time: 'Θ(n log n)', space: 'O(log n)', master: 'Case 2 — same as Merge Sort'
  },
  matrix: {
    badge: '05', title: 'Matrix Multiply',
    desc: 'Standard D&C matrix multiplication: partition each n×n matrix into four n/2×n/2 sub-matrices and compute 8 recursive multiplications.',
    divide:  'Partition A and B each into four (n/2)×(n/2) sub-matrices.',
    conquer: 'Recursively compute 8 sub-matrix multiplications.',
    combine: 'Add sub-products to form the four quadrants of C = A×B.',
    recurrence: 'T(n) = 8T(n/2) + Θ(n²)', time: 'Θ(n³)', space: 'Θ(n²)', master: 'Case 1 — no improvement over naive'
  },
  strassen: {
    badge: '06', title: "Strassen's",
    desc: "Volker Strassen's algorithm reduces the 8 sub-multiplications to 7 by introducing clever auxiliary matrices M₁…M₇.",
    divide:  'Partition A and B into four (n/2)×(n/2) sub-matrices.',
    conquer: 'Compute only 7 products M₁…M₇ instead of 8.',
    combine: 'Reconstruct C₁₁, C₁₂, C₂₁, C₂₂ from M values using additions.',
    recurrence: 'T(n) = 7T(n/2) + Θ(n²)', time: 'Θ(n^2.807)', space: 'Θ(n²)', master: 'Case 1 — log₂7 ≈ 2.807'
  },
  closest: {
    badge: '07', title: 'Closest Pair',
    desc: 'Find the two closest points in a set using D&C. Sort by x, split, recurse on each half, then check the strip around the dividing line.',
    divide:  'Sort points by x-coordinate; split at median into left and right halves.',
    conquer: 'Recursively find closest pair in each half.',
    combine: 'Check the δ-wide strip for pairs closer than δ = min(left_d, right_d).',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)', time: 'Θ(n log n)', space: 'O(n)', master: 'Case 2'
  },
  convex: {
    badge: '08', title: 'Convex Hull',
    desc: "Andrew's monotone chain algorithm: sort points by x, then build lower and upper hulls by maintaining a left-turn invariant.",
    divide:  'Sort all n points by x-coordinate (then y as tiebreak).',
    conquer: 'Build lower hull left-to-right; upper hull right-to-left.',
    combine: 'Concatenate lower and upper hulls, removing duplicate endpoints.',
    recurrence: 'T(n) = O(n log n)', time: 'Θ(n log n)', space: 'O(n)', master: 'Dominated by sort step'
  }
};

// ── DOM refs ──────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setAlgo('mergesort');

  $('algoNav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn || isRunning) return;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setAlgo(btn.dataset.algo);
  });

  $('btnRun').addEventListener('click',     runAlgo);
  $('btnStep').addEventListener('click',    stepAlgo);
  $('btnReset').addEventListener('click',   resetViz);
  $('btnNewData').addEventListener('click', () => { generateData(); resetViz(false); });
});

// ── Set algorithm ────────────────────────────────────────
function setAlgo(name) {
  currentAlgo = name;
  const m = ALGO_META[name];
  $('algoBadge').textContent        = m.badge;
  $('algoTitle').textContent        = m.title;
  $('algoDesc').textContent         = m.desc;
  $('stepDivideText').textContent   = m.divide;
  $('stepConquerText').textContent  = m.conquer;
  $('stepCombineText').textContent  = m.combine;
  $('cxRecurrence').textContent     = m.recurrence;
  $('cxTime').textContent           = m.time;
  $('cxSpace').textContent          = m.space;
  $('cxMaster').textContent         = m.master;

  generateData();
  resetViz(false);
}

// ── Generate data ────────────────────────────────────────
function generateData() {
  const geo = ['closest', 'convex'];
  const mat = ['matrix', 'strassen'];

  if (geo.includes(currentAlgo)) {
    generatePoints();
  } else if (mat.includes(currentAlgo)) {
    // matrices generated in the runner
  } else {
    generateArray();
  }
}

function generateArray(n = 20) {
  arr = Array.from({ length: n }, () => Math.floor(Math.random() * 220) + 20);
}

function generatePoints(n = 25) {
  points = Array.from({ length: n }, () => ({
    x: Math.random() * 0.88 + 0.06,
    y: Math.random() * 0.82 + 0.09
  }));
}

// ── Reset visualisation ──────────────────────────────────
function resetViz(hard = true) {
  isRunning = false; stepMode = false; stepResolve = null;
  animSteps = []; stepIndex = 0;

  setStatus('ready', 'Ready');
  setPhase(null);
  clearLog();
  logEntry('▸ Press Run to animate, or Step for manual control.', 'init');

  const geo = ['closest','convex'];
  const mat = ['matrix','strassen'];

  $('barStage').style.display    = (geo.includes(currentAlgo)||mat.includes(currentAlgo)) ? 'none' : 'flex';
  $('geoCanvas').style.display   = geo.includes(currentAlgo) ? 'block' : 'none';
  $('matrixStage').style.display = mat.includes(currentAlgo) ? 'flex'  : 'none';

  if (!geo.includes(currentAlgo) && !mat.includes(currentAlgo)) {
    renderBars(arr, []);
    $('treeContainer').innerHTML = '';
  }
  if (geo.includes(currentAlgo)) {
    renderPoints(points, [], null, []);
  }
  if (mat.includes(currentAlgo)) {
    renderMatrixPlaceholder();
  }
}

// ── Status helpers ───────────────────────────────────────
function setStatus(state, text) {
  const dot = $('statusDot');
  dot.className = 'status-dot ' + state;
  $('statusText').textContent = text;
}

function setPhase(phase) {
  ['phaseD','phaseC','phaseCB'].forEach(id => $( id).classList.remove('active'));
  if (phase === 'divide')  $('phaseD').classList.add('active');
  if (phase === 'conquer') $('phaseC').classList.add('active');
  if (phase === 'combine') $('phaseCB').classList.add('active');
}

// ── Log helpers ──────────────────────────────────────────
function clearLog() {
  $('logEntries').innerHTML = '';
}
function logEntry(text, type = 'info') {
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.textContent = text;
  $('logEntries').appendChild(div);
  $('logEntries').scrollTop = $('logEntries').scrollHeight;
}

// ── Delay ────────────────────────────────────────────────
function delay(ms) {
  return new Promise(res => {
    if (stepMode) {
      stepResolve = res;
    } else {
      setTimeout(res, ms);
    }
  });
}

// ── Run / Step ───────────────────────────────────────────
async function runAlgo() {
  if (isRunning) return;
  stepMode = false;
  clearLog();
  await startAlgo();
}

async function stepAlgo() {
  if (!isRunning) {
    stepMode = true;
    clearLog();
    startAlgo();
    return;
  }
  if (stepResolve) {
    const res = stepResolve;
    stepResolve = null;
    res();
  }
}

async function startAlgo() {
  isRunning = true;
  setStatus('running', 'Running…');
  $('btnRun').disabled  = true;
  $('btnReset').disabled = true;

  try {
    switch (currentAlgo) {
      case 'mergesort': await runMergeSort(); break;
      case 'quicksort': await runQuickSort(); break;
      case 'minmax':    await runMinMax();    break;
      case 'maxsub':    await runMaxSub();    break;
      case 'matrix':    await runMatrix();    break;
      case 'strassen':  await runStrassen();  break;
      case 'closest':   await runClosest();   break;
      case 'convex':    await runConvex();    break;
    }
    setStatus('done', 'Complete ✓');
    logEntry('✓ Algorithm complete.', 'result');
  } catch(e) {
    // Interrupted
    setStatus('ready', 'Reset');
  } finally {
    isRunning = false;
    $('btnRun').disabled   = false;
    $('btnReset').disabled = false;
    stepResolve = null;
  }
}

// ──────────────────────────────────────────────────────────
//  BAR RENDERING
// ──────────────────────────────────────────────────────────
function renderBars(array, states) {
  // states: array of {i, cls} objects
  const stateMap = {};
  (states||[]).forEach(s => stateMap[s.i] = s.cls);

  const container = $('barsContainer');
  container.innerHTML = '';
  const max = Math.max(...array);
  array.forEach((v, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar ' + (stateMap[i] || '');
    bar.style.height = (v / max * 220) + 'px';
    bar.dataset.val = v;
    container.appendChild(bar);
  });
}

function updateBar(i, val, cls, array) {
  const bars = $('barsContainer').children;
  if (!bars[i]) return;
  const max = Math.max(...array);
  bars[i].style.height = (val / array.length < 1 ? val / Math.max(...array) : val / max) * 220 + 'px';
  bars[i].className = 'bar ' + (cls || '');
  bars[i].dataset.val = val;
}

function setBarClass(indices, cls, array) {
  const bars = $('barsContainer').children;
  indices.forEach(i => { if(bars[i]) bars[i].className = 'bar ' + cls; });
}

// ──────────────────────────────────────────────────────────
//  1. MERGE SORT
// ──────────────────────────────────────────────────────────
async function runMergeSort() {
  const a = [...arr];
  logEntry(`▸ Starting Merge Sort on ${a.length} elements`, 'info');
  renderBars(a, []);
  await mergeSort(a, 0, a.length - 1);
  renderBars(a, a.map((_, i) => ({ i, cls: 'sorted' })));
}

async function mergeSort(a, l, r) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);

  setPhase('divide');
  logEntry(`  DIVIDE  [${l}…${r}] → [${l}…${m}] + [${m+1}…${r}]`, 'divide');
  // highlight range being divided
  highlightRange(a, l, r, m);
  await delay(speedMs());

  setPhase('conquer');
  await mergeSort(a, l, m);
  await mergeSort(a, m + 1, r);

  setPhase('combine');
  logEntry(`  MERGE   [${l}…${m}] + [${m+1}…${r}] → [${l}…${r}]`, 'combine');
  await merge(a, l, m, r);
  renderBars(a, []);
}

function highlightRange(a, l, r, m) {
  const states = a.map((_, i) => {
    if (i === m || i === m+1) return { i, cls: 'pivot' };
    if (i >= l && i <= r)     return { i, cls: 'active' };
    return { i, cls: '' };
  });
  renderBars(a, states);
}

async function merge(a, l, m, r) {
  const left  = a.slice(l, m + 1);
  const right = a.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;

  while (i < left.length && j < right.length) {
    const states = [];
    for (let x = 0; x < a.length; x++) {
      if (x === l + i || x === m + 1 + j) states.push({ i: x, cls: 'compare' });
      else if (x >= l && x <= r) states.push({ i: x, cls: 'active' });
    }
    renderBars(a, states);
    await delay(speedMs() * 0.6);

    if (left[i] <= right[j]) a[k++] = left[i++];
    else                      a[k++] = right[j++];
    renderBars(a, []);
  }
  while (i < left.length)  a[k++] = left[i++];
  while (j < right.length) a[k++] = right[j++];
}

// ──────────────────────────────────────────────────────────
//  2. QUICK SORT
// ──────────────────────────────────────────────────────────
async function runQuickSort() {
  const a = [...arr];
  logEntry(`▸ Starting Quick Sort on ${a.length} elements`, 'info');
  renderBars(a, []);
  await quickSort(a, 0, a.length - 1);
  renderBars(a, a.map((_, i) => ({ i, cls: 'sorted' })));
}

async function quickSort(a, l, r) {
  if (l >= r) {
    if (l === r) setBarClass([l], 'sorted', a);
    return;
  }
  setPhase('divide');
  logEntry(`  DIVIDE  [${l}…${r}] pivot = ${a[r]}`, 'divide');

  const pivotIdx = await partition(a, l, r);

  setPhase('conquer');
  logEntry(`  CONQUER [${l}…${pivotIdx-1}] and [${pivotIdx+1}…${r}]`, 'conquer');

  await quickSort(a, l, pivotIdx - 1);
  await quickSort(a, pivotIdx + 1, r);
}

async function partition(a, l, r) {
  const pivot = a[r];
  let i = l - 1;

  const states = a.map((_, idx) => ({
    i: idx,
    cls: idx === r ? 'pivot' : (idx >= l && idx <= r ? 'active' : '')
  }));
  renderBars(a, states);
  await delay(speedMs());

  for (let j = l; j < r; j++) {
    const s2 = [...states];
    s2[j] = { i: j, cls: 'compare' };
    renderBars(a, s2);
    await delay(speedMs() * 0.5);

    if (a[j] < pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
      renderBars(a, states);
      await delay(speedMs() * 0.4);
    }
  }
  [a[i+1], a[r]] = [a[r], a[i+1]];

  // mark pivot in place
  const s3 = a.map((_, idx) => ({ i: idx, cls: idx === i+1 ? 'sorted' : (idx >= l && idx <= r ? 'active' : '') }));
  renderBars(a, s3);
  await delay(speedMs());

  logEntry(`  PLACE   pivot ${pivot} at index ${i+1}`, 'combine');
  return i + 1;
}

// ──────────────────────────────────────────────────────────
//  3. MIN / MAX
// ──────────────────────────────────────────────────────────
async function runMinMax() {
  const a = [...arr];
  logEntry(`▸ Finding Min & Max in ${a.length} elements`, 'info');
  renderBars(a, []);

  setPhase('divide');
  const { min, max } = await minMaxDC(a, 0, a.length - 1);

  const minIdx = a.indexOf(min);
  const maxIdx = a.indexOf(max);
  renderBars(a, [{ i: minIdx, cls: 'min-bar' }, { i: maxIdx, cls: 'max-bar' }]);

  logEntry(`  RESULT  Min = ${min}  |  Max = ${max}`, 'result');
}

async function minMaxDC(a, l, r) {
  if (l === r) {
    logEntry(`  BASE    a[${l}] = ${a[l]}`, 'conquer');
    setBarClass([l], 'active', a);
    await delay(speedMs() * 0.5);
    return { min: a[l], max: a[l] };
  }
  if (r - l === 1) {
    logEntry(`  COMPARE a[${l}]=${a[l]} vs a[${r}]=${a[r]}`, 'combine');
    setBarClass([l, r], 'compare', a);
    await delay(speedMs());
    return { min: Math.min(a[l], a[r]), max: Math.max(a[l], a[r]) };
  }

  const m = Math.floor((l + r) / 2);
  setPhase('divide');
  logEntry(`  DIVIDE  [${l}…${r}] mid=${m}`, 'divide');
  highlightRange(a, l, r, m);
  await delay(speedMs());

  setPhase('conquer');
  const left  = await minMaxDC(a, l, m);
  const right = await minMaxDC(a, m + 1, r);

  setPhase('combine');
  const result = { min: Math.min(left.min, right.min), max: Math.max(left.max, right.max) };
  logEntry(`  COMBINE [${l}…${m}]: min=${left.min},max=${left.max} + [${m+1}…${r}]: min=${right.min},max=${right.max} → min=${result.min},max=${result.max}`, 'combine');
  await delay(speedMs() * 0.7);
  return result;
}

// ──────────────────────────────────────────────────────────
//  4. MAX SUBARRAY
// ──────────────────────────────────────────────────────────
async function runMaxSub() {
  // Use smaller array with negative values for interest
  const a = arr.map(v => v - 120); // mix positives and negatives
  arr = a;
  logEntry(`▸ Finding Maximum Subarray (values include negatives)`, 'info');
  renderBars(a.map(v => Math.abs(v)), []);

  setPhase('divide');
  const result = await maxSubDC(a, 0, a.length - 1);

  // highlight winning subarray
  const states = a.map((_, i) => ({
    i, cls: (i >= result.l && i <= result.r) ? 'sorted' : ''
  }));
  renderBars(a.map(v => Math.abs(v)), states);
  logEntry(`  RESULT  Max Sum = ${result.sum}, Indices [${result.l}…${result.r}]`, 'result');
}

async function maxSubDC(a, l, r) {
  if (l === r) return { sum: a[l], l, r };

  const m = Math.floor((l + r) / 2);
  setPhase('divide');
  logEntry(`  DIVIDE  [${l}…${r}] mid=${m}`, 'divide');
  highlightRange(a.map(v=>Math.abs(v)), l, r, m);
  await delay(speedMs());

  setPhase('conquer');
  const left  = await maxSubDC(a, l, m);
  const right = await maxSubDC(a, m + 1, r);

  setPhase('combine');
  logEntry(`  CROSS   finding max crossing [${l}…${r}]`, 'combine');
  const cross = await maxCross(a, l, m, r);

  const best = [left, right, cross].reduce((b, c) => c.sum > b.sum ? c : b);
  logEntry(`  MERGE   best=[${best.l}…${best.r}] sum=${best.sum}`, 'combine');
  await delay(speedMs() * 0.5);
  return best;
}

async function maxCross(a, l, m, r) {
  let sumL = -Infinity, sumR = -Infinity, cur = 0, li = m, ri = m + 1;
  for (let i = m; i >= l; i--) {
    cur += a[i];
    if (cur > sumL) { sumL = cur; li = i; }
  }
  cur = 0;
  for (let i = m + 1; i <= r; i++) {
    cur += a[i];
    if (cur > sumR) { sumR = cur; ri = i; }
  }
  const crossStates = a.map((_, i) => ({
    i, cls: (i >= li && i <= ri) ? 'compare' : ''
  }));
  renderBars(a.map(v => Math.abs(v)), crossStates);
  await delay(speedMs());
  return { sum: sumL + sumR, l: li, r: ri };
}

// ──────────────────────────────────────────────────────────
//  5. MATRIX MULTIPLICATION
// ──────────────────────────────────────────────────────────
function randomMatrix(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1));
}

function matMul(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

function renderMatrix(el, M, cls = '') {
  const n = M.length;
  el.innerHTML = '';
  el.style.gridTemplateColumns = `repeat(${n}, 44px)`;
  el.style.gridTemplateRows    = `repeat(${n}, 44px)`;
  el.className = 'matrix-grid';
  M.forEach((row, i) => row.forEach((v, j) => {
    const cell = document.createElement('div');
    cell.className = 'matrix-cell ' + cls;
    cell.textContent = v;
    cell.id = `mc_${el.id}_${i}_${j}`;
    el.appendChild(cell);
  }));
}

function renderMatrixPlaceholder() {
  const ms = $('matrixStage');
  ms.innerHTML = `<div style="color:var(--muted2);font-size:13px">Press Run to generate and multiply 4×4 matrices.</div>`;
}

async function runMatrix() {
  const n = 4;
  const A = randomMatrix(n);
  const B = randomMatrix(n);
  const ms = $('matrixStage');
  ms.innerHTML = '';

  // Build display
  const row = document.createElement('div');
  row.className = 'matrix-row-display';

  const gA = document.createElement('div'); gA.id = 'mgA';
  const lblX = document.createElement('div'); lblX.className = 'matrix-label'; lblX.textContent = '×';
  const gB = document.createElement('div'); gB.id = 'mgB';
  const lblEq = document.createElement('div'); lblEq.className = 'matrix-label'; lblEq.textContent = '=';
  const gC = document.createElement('div'); gC.id = 'mgC';

  row.append(gA, lblX, gB, lblEq, gC);
  ms.appendChild(row);

  const infoDiv = document.createElement('div');
  infoDiv.style.cssText = 'font-size:12px;color:var(--muted2);text-align:center;max-width:500px;line-height:1.7';
  ms.appendChild(infoDiv);

  renderMatrix($('mgA'), A, '');
  renderMatrix($('mgB'), B, '');

  // Initialize C with zeros
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  renderMatrix($('mgC'), C, '');

  setPhase('divide');
  logEntry(`▸ Matrix Multiply ${n}×${n}`, 'info');
  logEntry(`  DIVIDE  Split A & B into 2×2 blocks of ${n/2}×${n/2}`, 'divide');
  infoDiv.textContent = `DIVIDE: Splitting ${n}×${n} matrices into four ${n/2}×${n/2} sub-matrices`;
  await delay(speedMs() * 2);

  setPhase('conquer');
  logEntry(`  CONQUER 8 recursive sub-matrix multiplications`, 'conquer');

  // Animate computing each cell
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      infoDiv.textContent = `CONQUER: Computing C[${i}][${j}] = Σ A[${i}][k] × B[k][${j}]`;

      // highlight row i of A, col j of B
      for (let k = 0; k < n; k++) {
        const ca = $(`mc_mgA_${i}_${k}`);
        const cb = $(`mc_mgB_${k}_${j}`);
        if (ca) ca.className = 'matrix-cell hl-a';
        if (cb) cb.className = 'matrix-cell hl-b';
      }
      const cc = $(`mc_mgC_${i}_${j}`);
      if (cc) cc.className = 'matrix-cell computing';
      await delay(speedMs() * 0.8);

      // compute
      let sum = 0;
      for (let k = 0; k < n; k++) sum += A[i][k] * B[k][j];
      C[i][j] = sum;

      if (cc) { cc.className = 'matrix-cell hl-res'; cc.textContent = sum; }

      // unhighlight
      for (let k = 0; k < n; k++) {
        const ca = $(`mc_mgA_${i}_${k}`);
        const cb = $(`mc_mgB_${k}_${j}`);
        if (ca) ca.className = 'matrix-cell';
        if (cb) cb.className = 'matrix-cell';
      }
      logEntry(`  C[${i}][${j}] = ${sum}`, 'combine');
    }
  }

  setPhase('combine');
  infoDiv.textContent = `COMBINE: 8 sub-products added to form C = A×B ✓`;
  logEntry(`  COMBINE All sub-products merged into result matrix`, 'combine');
}

// ──────────────────────────────────────────────────────────
//  6. STRASSEN
// ──────────────────────────────────────────────────────────
async function runStrassen() {
  const n = 2;
  const A = randomMatrix(n);
  const B = randomMatrix(n);
  const ms = $('matrixStage');
  ms.innerHTML = '';

  const row = document.createElement('div');
  row.className = 'matrix-row-display';
  const gA = document.createElement('div'); gA.id = 'sgA';
  const lblX = document.createElement('div'); lblX.className = 'matrix-label'; lblX.textContent = '×';
  const gB = document.createElement('div'); gB.id = 'sgB';
  const lblEq = document.createElement('div'); lblEq.className = 'matrix-label'; lblEq.textContent = '=';
  const gC = document.createElement('div'); gC.id = 'sgC';
  row.append(gA, lblX, gB, lblEq, gC);
  ms.appendChild(row);

  renderMatrix($('sgA'), A);
  renderMatrix($('sgB'), B);

  const C0 = [[0,0],[0,0]];
  renderMatrix($('sgC'), C0);

  // Strassen M block display
  const mBlock = document.createElement('div');
  mBlock.className = 'strassen-block';
  const formulas = [
    'M₁=(A₁₁+A₂₂)(B₁₁+B₂₂)',
    'M₂=(A₂₁+A₂₂)·B₁₁',
    'M₃=A₁₁·(B₁₂−B₂₂)',
    'M₄=A₂₂·(B₂₁−B₁₁)',
    'M₅=(A₁₁+A₁₂)·B₂₂',
    'M₆=(A₂₁−A₁₁)(B₁₁+B₁₂)',
    'M₇=(A₁₂−A₂₂)(B₂₁+B₂₂)'
  ];
  const mDivs = formulas.map((f, i) => {
    const d = document.createElement('div');
    d.className = 'strassen-m'; d.id = `sm${i+1}`;
    d.textContent = f; mBlock.appendChild(d); return d;
  });
  ms.appendChild(mBlock);

  const infoDiv = document.createElement('div');
  infoDiv.style.cssText = 'font-size:12px;color:var(--muted2);text-align:center;max-width:500px;line-height:1.7;margin-top:8px';
  ms.appendChild(infoDiv);

  setPhase('divide');
  logEntry(`▸ Strassen 2×2 — only 7 multiplications needed`, 'info');
  infoDiv.textContent = 'DIVIDE: Partitioning 2×2 matrices into scalar sub-problems';
  await delay(speedMs() * 1.5);

  const a=A[0][0],b=A[0][1],c=A[1][0],d=A[1][1];
  const e=B[0][0],f=B[0][1],g=B[1][0],h=B[1][1];

  const Ms = [
    (a+d)*(e+h),  // M1
    (c+d)*e,      // M2
    a*(f-h),      // M3
    d*(g-e),      // M4
    (a+b)*h,      // M5
    (c-a)*(e+f),  // M6
    (b-d)*(g+h)   // M7
  ];

  setPhase('conquer');
  logEntry(`  CONQUER Computing M₁…M₇`, 'conquer');

  for (let i = 0; i < 7; i++) {
    mDivs[i].className = 'strassen-m active';
    infoDiv.textContent = `CONQUER: Computing ${formulas[i].split('=')[0]} = ${Ms[i]}`;
    logEntry(`  ${formulas[i].split('=')[0]} = ${Ms[i]}`, 'conquer');
    await delay(speedMs() * 1.2);
    mDivs[i].className = 'strassen-m done';
    mDivs[i].textContent = formulas[i].split('=')[0] + ' = ' + Ms[i];
  }

  setPhase('combine');
  logEntry(`  COMBINE Assembling C from M values`, 'combine');
  infoDiv.textContent = 'COMBINE: C₁₁=M₁+M₄−M₅+M₇, C₁₂=M₃+M₅, C₂₁=M₂+M₄, C₂₂=M₁−M₂+M₃+M₆';
  await delay(speedMs() * 1.5);

  const C = [
    [Ms[0]+Ms[3]-Ms[4]+Ms[6], Ms[2]+Ms[4]],
    [Ms[1]+Ms[3],              Ms[0]-Ms[1]+Ms[2]+Ms[5]]
  ];
  renderMatrix($('sgC'), C, 'hl-res');
  logEntry(`  C = [[${C[0]}],[${C[1]}]]`, 'result');
}

// ──────────────────────────────────────────────────────────
//  GEOMETRY HELPERS
// ──────────────────────────────────────────────────────────
function getCanvas() { return $('geoCanvas'); }
function getCtx()    { return getCanvas().getContext('2d'); }

function toPixel(p) {
  const cv = getCanvas();
  return { x: p.x * cv.width, y: p.y * cv.height };
}

function renderPoints(pts, highlighted = [], line = null, hull = []) {
  const cv = getCanvas();
  const ctx = getCtx();
  ctx.clearRect(0, 0, cv.width, cv.height);

  // grid subtle
  ctx.strokeStyle = 'rgba(30,37,53,0.8)';
  ctx.lineWidth = 1;
  for (let x = 0; x < cv.width; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,cv.height); ctx.stroke(); }
  for (let y = 0; y < cv.height; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(cv.width,y); ctx.stroke(); }

  // hull polygon
  if (hull.length > 2) {
    ctx.beginPath();
    const hp = hull.map(toPixel);
    ctx.moveTo(hp[0].x, hp[0].y);
    hp.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle   = 'rgba(52,211,153,0.08)';
    ctx.strokeStyle = 'rgba(52,211,153,0.8)';
    ctx.lineWidth = 2; ctx.fill(); ctx.stroke();
  }

  // connecting line
  if (line) {
    const p1 = toPixel(line[0]), p2 = toPixel(line[1]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = 'rgba(248,113,113,0.9)';
    ctx.lineWidth = 2; ctx.stroke();
  }

  // divide line
  if (highlighted.divLine !== undefined) {
    const dx = highlighted.divLine * cv.width;
    ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, cv.height);
    ctx.strokeStyle = 'rgba(56,189,248,0.4)';
    ctx.lineWidth = 1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
  }

  // points
  pts.forEach((p, i) => {
    const px = toPixel(p);
    const isHL = Array.isArray(highlighted) && highlighted.includes(i);
    ctx.beginPath();
    ctx.arc(px.x, px.y, isHL ? 7 : 4, 0, Math.PI * 2);
    ctx.fillStyle = hull.includes(p) ? '#34d399'
                  : isHL             ? '#f87171'
                  : '#38bdf8';
    ctx.fill();
    if (isHL) {
      ctx.strokeStyle = 'rgba(248,113,113,0.5)';
      ctx.lineWidth = 2; ctx.stroke();
    }
  });
}

function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

// ──────────────────────────────────────────────────────────
//  7. CLOSEST PAIR
// ──────────────────────────────────────────────────────────
async function runClosest() {
  const pts = [...points].sort((a, b) => a.x - b.x);
  logEntry(`▸ Closest Pair on ${pts.length} points`, 'info');
  renderPoints(pts, [], null, []);

  const result = await closestDC(pts, 0, pts.length - 1);
  renderPoints(pts, [pts.indexOf(result.p1), pts.indexOf(result.p2)], [result.p1, result.p2], []);
  logEntry(`  RESULT  Distance = ${result.d.toFixed(4)}`, 'result');
}

async function closestDC(pts, l, r) {
  if (r - l <= 2) {
    let best = { d: Infinity, p1: null, p2: null };
    for (let i = l; i <= r; i++)
      for (let j = i+1; j <= r; j++) {
        const d = dist(pts[i], pts[j]);
        if (d < best.d) best = { d, p1: pts[i], p2: pts[j] };
      }
    logEntry(`  BASE    [${l}…${r}] d=${best.d.toFixed(3)}`, 'conquer');
    renderPoints(pts, [l, r], null, []);
    await delay(speedMs());
    return best;
  }

  const m = Math.floor((l + r) / 2);
  const midX = pts[m].x;

  setPhase('divide');
  logEntry(`  DIVIDE  [${l}…${r}] split at x=${midX.toFixed(3)}`, 'divide');
  renderPoints(pts, [], null, []);
  // draw dividing line
  const cv = getCanvas(); const ctx = getCtx();
  ctx.beginPath(); ctx.moveTo(midX * cv.width, 0); ctx.lineTo(midX * cv.width, cv.height);
  ctx.strokeStyle = 'rgba(56,189,248,0.5)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
  ctx.stroke(); ctx.setLineDash([]);
  await delay(speedMs());

  setPhase('conquer');
  const left  = await closestDC(pts, l, m);
  const right = await closestDC(pts, m+1, r);
  const delta = Math.min(left.d, right.d);
  let best = left.d < right.d ? left : right;

  setPhase('combine');
  logEntry(`  STRIP   δ=${delta.toFixed(3)}, checking strip around x=${midX.toFixed(3)}`, 'combine');

  const strip = pts.filter(p => Math.abs(p.x - midX) < delta);
  for (let i = 0; i < strip.length; i++) {
    for (let j = i+1; j < strip.length && (strip[j].y - strip[i].y) < delta; j++) {
      const d = dist(strip[i], strip[j]);
      if (d < best.d) {
        best = { d, p1: strip[i], p2: strip[j] };
        renderPoints(pts, [pts.indexOf(strip[i]), pts.indexOf(strip[j])], [strip[i], strip[j]], []);
        await delay(speedMs() * 0.6);
      }
    }
  }
  return best;
}

// ──────────────────────────────────────────────────────────
//  8. CONVEX HULL
// ──────────────────────────────────────────────────────────
async function runConvex() {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  logEntry(`▸ Convex Hull (Andrew's Monotone Chain) on ${pts.length} points`, 'info');
  renderPoints(pts, [], null, []);

  setPhase('divide');
  logEntry(`  SORT    Points sorted by x-coordinate`, 'divide');
  await delay(speedMs());

  setPhase('conquer');
  logEntry(`  LOWER   Building lower hull left → right`, 'conquer');
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0)
      lower.pop();
    lower.push(p);
    renderPoints(pts, [], null, lower.length > 2 ? lower : []);
    await delay(speedMs() * 0.5);
  }

  logEntry(`  UPPER   Building upper hull right → left`, 'conquer');
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0)
      upper.pop();
    upper.push(p);
    const partial = [...lower, ...upper];
    renderPoints(pts, [], null, partial.length > 2 ? partial : []);
    await delay(speedMs() * 0.5);
  }

  setPhase('combine');
  lower.pop(); upper.pop();
  const hull = [...lower, ...upper];
  logEntry(`  COMBINE Lower + Upper hull = ${hull.length} vertices`, 'combine');
  renderPoints(pts, [], null, hull);

  logEntry(`  RESULT  Convex Hull has ${hull.length} vertices`, 'result');
}

function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// ── Canvas resize ────────────────────────────────────────
function resizeCanvas() {
  const cv = getCanvas();
  const wrapper = cv.parentElement;
  cv.width  = wrapper.clientWidth;
  cv.height = 420;
}
window.addEventListener('resize', () => {
  resizeCanvas();
  if (['closest','convex'].includes(currentAlgo)) renderPoints(points, [], null, []);
});
setTimeout(resizeCanvas, 50);
