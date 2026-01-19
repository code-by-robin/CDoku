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
        const liveMode = document.getElementById('live-progress-toggle').checked;

        // Update UI logic for running state
        document.getElementById('stats-output').style.display = 'none';
        document.getElementById('btn-rerun').style.display = 'none';
        document.getElementById('btn-start').style.display = 'none'; // Hide Start button

        const counterEl = document.getElementById('live-counter');
        const countValEl = document.getElementById('current-count');
        const spinnerEl = document.getElementById('loading-spinner');
        const progressContainerEl = document.getElementById('progress-container');
        const progressFillEl = document.getElementById('progress-fill');

        if (liveMode) {
            // Live Mode: Show Progress Bar, Hide Spinner
            counterEl.style.display = 'block';
            countValEl.textContent = '0';
            spinnerEl.style.display = 'none';
            progressContainerEl.style.display = 'block';
            progressFillEl.style.width = '0%';
        } else {
            // Fast Mode: Show Spinner, Hide Progress Bar
            counterEl.style.display = 'none';
            spinnerEl.style.display = 'block';
            progressContainerEl.style.display = 'none';
        }

        // Use setTimeout to loose coupling with UI repaint
        setTimeout(() => {
            if (liveMode) {
                this.runBenchmarkLive(ITERATIONS);
            } else {
                this.runBenchmarkFast(ITERATIONS);
            }
        }, 50);
    },

    runBenchmarkFast: function (iterations) {
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            this.core.resetMatrix();
            this.core.generator();
        }

        const endTime = performance.now();
        const durationSec = (endTime - startTime) / 1000;
        const rate = iterations / durationSec;

        this.displayStats(durationSec, rate);
    },

    runBenchmarkLive: function (totalIterations) {
        // Time-Slicing: Instead of fixed chunks, we run as many as possible in 8ms.
        // This leaves ~8ms for the browser to render the frame (60fps = 16.6ms).
        const TIME_BUDGET_MS = 8;

        let completed = 0;
        const startTime = performance.now();
        const countValEl = document.getElementById('current-count');
        const progressFillEl = document.getElementById('progress-fill');

        // Rubber band animation state
        this.visualProgress = 0;
        this.targetProgress = 0;
        let animationFrameId;

        // Physics-based animation loop
        const animateProgressBar = () => {
            const diff = this.targetProgress - this.visualProgress;

            // Proportional control
            if (Math.abs(diff) < 0.1) {
                this.visualProgress = this.targetProgress;
            } else {
                this.visualProgress += diff * 0.1;
            }

            progressFillEl.style.width = this.visualProgress + '%';

            if (completed < totalIterations || this.visualProgress < 99.9) {
                animationFrameId = requestAnimationFrame(animateProgressBar);
            } else {
                progressFillEl.style.width = '100%';
            }
        };

        animationFrameId = requestAnimationFrame(animateProgressBar);

        const processChunk = () => {
            const chunkStart = performance.now();

            // Run loop until time budget is exceeded
            while (performance.now() - chunkStart < TIME_BUDGET_MS && completed < totalIterations) {
                this.core.resetMatrix();
                this.core.generator();
                completed++;
            }

            countValEl.textContent = completed.toLocaleString();
            this.targetProgress = (completed / totalIterations) * 100;

            if (completed < totalIterations) {
                // Yield to main thread for rendering, then continue
                setTimeout(processChunk, 0);
            } else {
                // Done
                const endTime = performance.now();
                const durationSec = (endTime - startTime) / 1000;
                const rate = totalIterations / durationSec;

                // Allow cleanup
                setTimeout(() => {
                    cancelAnimationFrame(animationFrameId);
                    progressFillEl.style.width = '100%';

                    this.displayStats(durationSec, rate);
                    document.getElementById('live-counter').style.display = 'none';
                    document.getElementById('progress-container').style.display = 'none';
                }, 500);
            }
        };

        // Start processing
        setTimeout(processChunk, 0);
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
