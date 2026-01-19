// NOTES
// mgl. Optimierung: shuffle statt rand_int

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>

// locates start row for 3x3 box check
int check_start_row(int row)
{
    int start_row;
    start_row = (row / 3) * 3;
    return start_row;
}

// locates start column for 3x3 box check
int check_start_col(int col)
{
    int start_col;
    start_col = (col / 3) * 3 ;
    return start_col;
}

int rand_int (void)
{
    // int zufallszahl = (rand() % (max - min + 1)) + min;
    int rand_value = (rand() % (9 - 1 + 1)) + 1;
    return rand_value;
}

// checks the rules for a guess
bool guess_check (int matrix[9][9], int guess, int row, int col)
{
    // checks the row
    for (int i = 0 ; i < 9 ; i++)
    {
        if (matrix[row][i] == guess)
        {
            return false;
        }
    }
    
    //checks the column
    for (int j = 0 ; j < 9 ; j++)
    {
        if (matrix[j][col] == guess)
        {
            return false;
        }
    }
    
    // gets row to start for 3x3 box check
    int start_row;
    start_row = check_start_row(row);

    // gets column to start for 3x3 box check
    int start_col;
    start_col = check_start_col(col);

    // checks the 3x3 box
    for (int i = 0 ; i < 3 ; i++)
    {
        for (int j = 0 ; j < 3 ; j++)
        {
            if (matrix[start_row + i][start_col + j] == guess)
                    {
                        return false;
                    }
        }
    }
    
    return true;
}


void generator(int matrix[9][9])

{
    for (int row = 0; row < 9; row++)
    {
        for (int col = 0; col < 9; col++)
        {
            bool guess_success = false;
            while (guess_success == false)
            {
                int guess = 0;
                int guess_count = 0;
                            
                do
                {
                    guess = rand_int();
                    guess_count++;
                }
                                                                                    // sweet spot here is 47
                while ((guess_check(matrix, guess, row, col) == false) && (guess_count < 47));
                if (guess_check(matrix, guess, row, col) == true)
                {
                    matrix[row][col] = guess;
                    guess_success = true;
                }
                else if (guess_check(matrix, guess, row, col) == false)
                {
                    // goes back i times (sweet spot on i=10 with 285.71 sudokus per second)
                    for (int i = 0; i < 10; i++)
                    {
                        if (row == 0 && col ==0)
                        {
                            break;
                        }   
                        else if (col == 0)
                        {
                            col = 8;
                            row--;
                            matrix[row][col] = 0;
                        }
                        else
                        {
                            col--;
                            matrix[row][col] = 0;
                        }
                    }
                    
                }
                else
                {
                    printf("unexpected error in generator");
                }
            }
        }
    }
}

int main(void)
{
    srand(time(NULL));
    clock_t start_time = clock();
    for (int testi = 0; testi < 100000; testi++)
    {
        
            // initializes 9x9 array with all values set to 0
            int matrix[9][9] = {
            
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0},
                {0,0,0,0,0,0,0,0,0}
            };
        
            generator(matrix);
    }
    clock_t end_time = clock();
    double duration = (double)(end_time - start_time) / CLOCKS_PER_SEC;
    double sudokus_per_sec = 100000 / duration;
    printf("%f", duration);
    printf("\n");
    printf("%f", sudokus_per_sec);
    return 0;
}
