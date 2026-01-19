/**
 * CDoku App Controller
 */

const app = {
    core: new SudokuCore(),

    init: function () {
        console.log("CDoku Web Initialized");
    },

    // --- Navigation ---
    hideAllViews: function () {
        document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    },

    showLanding: function () {
        this.hideAllViews();
        document.getElementById('landing-view').classList.add('active');
    },

    switchToSingle: function () {
        this.hideAllViews();
        document.getElementById('single-view').classList.add('active');
        // Small delay to allow transition, then run
        setTimeout(() => this.runSingle(), 100);
    },

    switchToBenchmark: function () {
        this.hideAllViews();
        document.getElementById('benchmark-view').classList.add('active');
        document.getElementById('stats-output').style.display = 'none';
        document.getElementById('btn-rerun').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'block';

        // Small delay so UI renders the spinner before locking thread
        setTimeout(() => this.runBenchmark(), 500);
    },

    // --- Single Run Logic ---
    runSingle: function () {
        this.core.resetMatrix();
        this.core.generator();
        this.renderGrid(this.core.matrix);
    },

    renderGrid: function (matrix) {
        const board = document.getElementById('sudoku-board');
        board.innerHTML = '';

        // Create 3x3 boxes structure for visual grouping
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = document.createElement('div');
                box.className = 'box';

                // Fill box with cells
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.textContent = matrix[row][col];
                        box.appendChild(cell);
                    }
                }
                board.appendChild(box);
            }
        }
    },

    // --- Benchmark Logic ---
    runBenchmark: function () {
        const ITERATIONS = 100000;
        document.getElementById('stats-output').style.display = 'none';
        document.getElementById('btn-rerun').style.display = 'none';
        document.getElementById('loading-spinner').style.display = 'block';

        // Use setTimeout to loose coupling with UI repaint
        setTimeout(() => {
            const startTime = performance.now();

            for (let i = 0; i < ITERATIONS; i++) {
                this.core.resetMatrix();
                this.core.generator();
            }

            const endTime = performance.now();
            const durationSec = (endTime - startTime) / 1000;
            const rate = ITERATIONS / durationSec;

            this.displayStats(durationSec, rate);
        }, 50);
    },

    displayStats: function (duration, rate) {
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('stats-output').style.display = 'block';
        document.getElementById('btn-rerun').style.display = 'inline-block';

        document.getElementById('stat-time').textContent = duration.toFixed(4) + ' s';
        document.getElementById('stat-rate').textContent = rate.toFixed(2);
    }
};

// Initialize
app.init();
