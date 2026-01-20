# CDoku
A high-performance Sudoku Generator.

## Project Structure

### Native C (`src/`)
The native implementation is split into two specialized files:

*   **`benchmark.c`**: Designed for performance testing. It generates 100,000 Sudokus in a loop and outputs timing statistics (Duration, Sudokus per second). Unnecessary display code has been removed for maximum speed.
*   **`single_run.c`**: Designed for visual verification. It generates a single Sudoku and prints the grid to the console.

**Compilation**:
```bash
gcc src/benchmark.c -o benchmark
gcc src/single_run.c -o single_run
```

### Web Version (`src/web/`)
A premium web-based interface that runs the generator logic directly in the browser using JavaScript. The UI features a modern, physics-based "Glassmorphism" design with 3D animations.

*   **Single Run & Play Mode**:
    *   **Generate**: Visualizes a valid Sudoku grid instantly.
    *   **Play**: Turn the generated grid into a playable puzzle!
        *   **Configurable Difficulty**: Choose exactly how many fields to hide (1-80).
        *   **Interactive**: Click empty cells to enter numbers.
        *   **Smart Validation**: Immediate feedback—Correct entries glow green, incorrect ones shake red. The system ensures the puzzle remains solvable based on the original generation.
*   **Benchmark Mode**:
    *   Runs a high-performance 100,000 iteration loop to measure browser JS speed.
    *   **Live Progress**: Features a physics-based "rubber band" progress bar and live counter (can be toggled for max speed).
*   **Usage**: Open `src/web/index.html` in any modern web browser.

## Note on Creation
The core algorithm for Sudoku generation is human-made and programmed. The surrounding infrastructure, including the splitting of the C files and the entire Web interface implementation, was largely created with AI Agents in Google Antigravity.
