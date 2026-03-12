Divide & Conquer Algorithm Visualizer
Course: Algorithm Design and Analysis  
  
---
Overview
An interactive, step-by-step visualizer for eight Divide & Conquer algorithms, built entirely with vanilla HTML5, CSS3, and JavaScript — no external libraries or frameworks required.
Each algorithm is animated in real time, with color-coded DIVIDE / CONQUER / COMBINE phases, a live execution log, and a full complexity analysis panel including recurrence relations and Master Theorem applications.
---
Algorithms Implemented
#	Algorithm	Time Complexity	Recurrence
01	Merge Sort	Θ(n log n)	T(n) = 2T(n/2) + Θ(n)
02	Quick Sort	Θ(n log n) avg	T(n) = 2T(n/2) + Θ(n)
03	Min / Max Finding	Θ(n)	T(n) = 2T(n/2) + 2
04	Max Subarray Sum	Θ(n log n)	T(n) = 2T(n/2) + Θ(n)
05	Matrix Multiplication	Θ(n³)	T(n) = 8T(n/2) + Θ(n²)
06	Strassen's Algorithm	Θ(n^2.807)	T(n) = 7T(n/2) + Θ(n²)
07	Closest Pair of Points	Θ(n log n)	T(n) = 2T(n/2) + Θ(n)
08	Convex Hull	Θ(n log n)	O(n log n) dominated by sort
---
Features
Visualization
Bar chart animations for sorting and array algorithms (Merge Sort, Quick Sort, Min/Max, Max Subarray)
Canvas-based geometry for Closest Pair and Convex Hull with animated point sets
Interactive matrix grids with cell-by-cell computation highlights for Matrix Multiply and Strassen's
Color Coding
🔵 Blue — DIVIDE phase (splitting the problem)
🟣 Purple — CONQUER phase (recursive sub-problems)
🟢 Green — COMBINE phase (merging results)
🟡 Amber — Pivot / active element
🔴 Red — Comparison / closest pair highlight
Controls
Run — Fully automated animation at selected speed
Step — Manual step-by-step execution (press repeatedly to advance)
Reset — Restore to initial state
New Data — Generate a fresh random dataset
Speed Slider — 5 levels from slow (600ms/step) to fast (80ms/step)
Complexity Panel
Each algorithm shows:
Recurrence relation
Solved time complexity
Space complexity
Master Theorem case (where applicable)
Execution Log
A live scrolling log shows every DIVIDE, CONQUER, and COMBINE step with exact index ranges and computed values.
---
How Each Algorithm Works
1. Merge Sort
Recursively splits the array at the midpoint, sorts both halves, then merges them by comparing the front elements of each half and appending the smaller one. Visualized with highlighted sub-ranges and animated merging.
2. Quick Sort
Chooses the rightmost element as pivot and partitions the array in-place. Elements smaller than pivot move left, larger move right. Pivot lands in its final sorted position, then both sides recurse. Animated with pivot (amber) and comparison (purple) bars.
3. Min / Max Finding
Recursively splits the array and finds min/max of each half. Combines by returning the smaller minimum and larger maximum. Uses only ⌈3n/2⌉ − 2 comparisons, better than the naive 2(n−1). Final min shown in green, max in red.
4. Maximum Subarray Sum
Splits at midpoint. Computes max subarray in the left half, right half, and a crossing subarray that spans the midpoint. The crossing subarray is found by extending left and right from the midpoint to maximize the sum. Returns the maximum of the three.
5. Matrix Multiplication (D&C)
Partitions two n×n matrices into four n/2×n/2 sub-matrices each. Performs 8 recursive multiplications and 4 additions. Does not improve on the naive O(n³) — this motivates Strassen's. Animated cell-by-cell with row/column highlighting.
6. Strassen's Algorithm
Improves on standard D&C by replacing 8 sub-multiplications with 7 (M₁…M₇), at the cost of extra additions. Uses Master Theorem Case 1: log₂7 ≈ 2.807, giving Θ(n^2.807). Each Mᵢ is animated in sequence, then C is assembled.
7. Closest Pair of Points
Sort points by x-coordinate
Split at the median x value
Recurse on left and right halves
Find closest pair δ = min(left_d, right_d)
Check the δ-wide strip around the dividing line — at most 8 points need checking per point in the strip
Animated with a dashed dividing line and highlighted closest-pair points in red.
8. Convex Hull (Andrew's Monotone Chain)
Sort points by x then y
Build lower hull: iterate left-to-right, pop points that make a right turn
Build upper hull: iterate right-to-left with the same rule
Concatenate lower and upper hulls
The left-turn test uses the 2D cross product: cross(O,A,B) = (A−O)×(B−O). Animated showing the growing hull polygon in green.
---
File Structure
```
project/
├── index.html    — Page structure, layout, panels, nav
├── style.css     — All styling, animations, color scheme
├── script.js     — All algorithm logic and animation engine
└── README.md     — This file
```
---
How to Run
Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari). No build step, server, or installation required.
---
Technical Implementation Notes
Animation engine: Each algorithm is an `async` function using `await delay(ms)` between steps. The delay function either uses `setTimeout` (Run mode) or blocks on a `Promise` that resolves only when the Step button is pressed (Step mode).
Bar rendering: Bars are CSS `div` elements with `height` driven by `style.height`. Transitions are handled in CSS with `cubic-bezier` for a spring feel.
Geometry rendering: An HTML5 `<canvas>` element sized to the viewport, redrawn from scratch on each animation frame to show current state.
Matrix rendering: CSS Grid with dynamic column/row counts and class-toggling for highlight states.
No dependencies: Pure HTML/CSS/JS, fully self-contained.