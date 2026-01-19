/**
 * CDoku Core Logic
 * Ported from src/main.c to JavaScript
 */

class SudokuCore {
    constructor() {
        this.matrix = Array(9).fill().map(() => Array(9).fill(0));
    }

    resetMatrix() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.matrix[i][j] = 0;
            }
        }
    }

    // locates start row for 3x3 box check
    check_start_row(row) {
        return Math.floor(row / 3) * 3;
    }

    // locates start column for 3x3 box check
    check_start_col(col) {
        return Math.floor(col / 3) * 3;
    }

    rand_int() {
        // int rand_value = (rand() % (9 - 1 + 1)) + 1;
        // JS: Math.random() is [0, 1)
        return Math.floor(Math.random() * 9) + 1;
    }

    // checks the rules for a guess
    guess_check(matrix, guess, row, col) {
        // checks the row
        for (let i = 0; i < 9; i++) {
            if (matrix[row][i] === guess) {
                return false;
            }
        }

        //checks the column
        for (let j = 0; j < 9; j++) {
            if (matrix[j][col] === guess) {
                return false;
            }
        }

        // gets row to start for 3x3 box check
        let start_row = this.check_start_row(row);

        // gets column to start for 3x3 box check
        let start_col = this.check_start_col(col);

        // checks the 3x3 box
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (matrix[start_row + i][start_col + j] === guess) {
                    return false;
                }
            }
        }

        return true;
    }

    generator() {
        let matrix = this.matrix;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                let guess_success = false;
                while (guess_success === false) {
                    let guess = 0;
                    let guess_count = 0;

                    do {
                        guess = this.rand_int();
                        guess_count++;
                    }
                    // sweet spot here is 47
                    while ((this.guess_check(matrix, guess, row, col) === false) && (guess_count < 47));

                    if (this.guess_check(matrix, guess, row, col) === true) {
                        matrix[row][col] = guess;
                        guess_success = true;
                    } else if (this.guess_check(matrix, guess, row, col) === false) {
                        // goes back i times (sweet spot on i=10 with 285.71 sudokus per second - C benchmark)
                        for (let i = 0; i < 10; i++) {
                            if (row === 0 && col === 0) {
                                break;
                            } else if (col === 0) {
                                col = 8;
                                row--;
                                matrix[row][col] = 0;
                            } else {
                                col--;
                                matrix[row][col] = 0;
                            }
                        }

                    } else {
                        console.error("unexpected error in generator");
                    }
                }
            }
        }
    }
}
