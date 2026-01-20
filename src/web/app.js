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

        // Reset play mode state
        this.isPlaying = false;
        document.getElementById('play-controls').classList.remove('active');

        this.renderGrid(this.core.matrix);
    },

    togglePlaySetup: function () {
        const controls = document.getElementById('play-controls');
        controls.classList.toggle('active');
    },

    startGame: function () {
        const hiddenCountInput = document.getElementById('hidden-count');
        let count = parseInt(hiddenCountInput.value) || 0;

        // Cap count to reasonable limits (1-80)
        count = Math.max(1, Math.min(80, count));
        hiddenCountInput.value = count;

        this.isPlaying = true;
        const puzzleMatrix = this.core.generatePuzzle(count);

        this.renderGrid(puzzleMatrix);
        document.getElementById('play-controls').classList.remove('active');
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

                        const value = matrix[row][col];

                        if (this.isPlaying && value === 0) {
                            // Editable cell
                            cell.className = 'cell pop-in editable';

                            // Setup input handling
                            cell.onclick = () => this.handleCellClick(cell, row, col);
                        } else {
                            // Fixed cell
                            cell.className = 'cell pop-in';
                            cell.textContent = value !== 0 ? value : '';
                        }

                        box.appendChild(cell);
                    }
                }
                board.appendChild(box);
            }
        }
    },

    handleCellClick: function (cellElement, row, col) {
        // Simple prompt for now, can be upgraded to on-screen keypad later
        // or we can just replace innerHTML with an input

        // If already correct, don't allow changing
        if (cellElement.classList.contains('correct')) return;

        cellElement.innerHTML = '';
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'cell-input';
        input.maxLength = 1;

        input.onblur = () => {
            const val = parseInt(input.value);
            if (!isNaN(val) && val >= 1 && val <= 9) {
                this.validateMove(cellElement, row, col, val);
            } else {
                cellElement.innerHTML = ''; // Clear if invalid
                cellElement.classList.remove('active');
            }
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        };

        cellElement.appendChild(input);
        input.focus();
        cellElement.classList.add('active');
    },

    validateMove: function (cellElement, row, col, value) {
        const isValid = this.core.validateMove(row, col, value);

        cellElement.textContent = value;
        cellElement.classList.remove('active');
        cellElement.classList.remove('correct', 'incorrect');

        // Trigger reflow to restart animation if needed
        void cellElement.offsetWidth;

        if (isValid) {
            cellElement.classList.add('correct');
        } else {
            cellElement.classList.add('incorrect');
            // Allow retry
            setTimeout(() => {
                cellElement.classList.remove('incorrect');
                cellElement.textContent = '';
                cellElement.classList.add('editable');
            }, 1000);
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
