// Constants

const COLOR_CODES = {
    'A': '\x1b[31m',
    'B': '\x1b[41m',
    'C': '\x1b[44m',
    'D': '\x1b[35m',
    'E': '\x1b[42m',
    'F': '\x1b[47m',
    'G': '\x1b[46m',
    'H': '\x1b[45m',
    'I': '\x1b[43m',
    'J': '\x1b[32m',
    'K': '\x1b[47m',
    'L': '\x1b[37m',
}

const SHAPE_A = [['A', 'A', 'A'], ['A', 'X', 'X']];
const SHAPE_B = [['X', 'B'], ['B', 'B'], ['B', 'B']];
const SHAPE_C = [['X', 'X', 'X', 'C'], ['C', 'C', 'C', 'C']];
const SHAPE_D = [['X', 'D', 'X', 'X'], ['D', 'D', 'D', 'D']];
const SHAPE_E = [['X', 'X', 'E', 'E'], ['E', 'E', 'E', 'X']];
const SHAPE_F = [['F', 'F'], ['X', 'F']]
const SHAPE_G = [['G', 'G', 'G'], ['X', 'X', 'G'], ['X', 'X', 'G']];
const SHAPE_H = [['H', 'H', 'X'], ['X', 'H', 'H'], ['X', 'X', 'H']];
const SHAPE_I = [['I', 'I', 'I'], ['I', 'X', 'I']];
const SHAPE_J = [['J'], ['J'], ['J'], ['J']];
const SHAPE_K = [['K', 'K'], ['K', 'K']];
const SHAPE_L = [['X', 'L', 'X'], ['L', 'L', 'L'], ['X', 'L', 'X']];

const SHAPES = [SHAPE_A, SHAPE_B, SHAPE_C, SHAPE_D, SHAPE_E, SHAPE_F, SHAPE_G, SHAPE_H, SHAPE_I, SHAPE_J, SHAPE_K, SHAPE_L];


// Display utils

const addColor = cell =>{
    return COLOR_CODES[cell] + cell + '\x1b[0m';
}

const displayGrid = (grid) => {
    grid.forEach(row => {
        console.log(row.map(cell => cell === 'X' ? ' ' : addColor(cell)).join(' '));
    });
}

const displayShapes = (shapes) => {
    for (let i = 0; i < shapes.length; i++) {
        console.log('Shape ' + i);
        shapes[i].forEach(shape => {
            displayGrid(shape);
            console.log('---------------------');
        });
    }
}

// Shape utils

const getAllRotations = (shape) => {
    const rotations = [];
    for (let i = 0; i < 4; i++) {
        if (!rotations.some(rotation => JSON.stringify(rotation) === JSON.stringify(shape))) {
            rotations.push(shape);
        }
        shape = rotate(shape);

    }
    mirrorShape = mirror(shape);
    for (let i = 0; i < 4; i++) {
        if (!rotations.some(rotation => JSON.stringify(rotation) === JSON.stringify(mirrorShape))) {
            rotations.push(mirrorShape);
        }
        mirrorShape = rotate(mirrorShape);
    }
    return rotations;
}

const rotate = (shape) => {
    const newShape = new Array(shape[0].length).fill(null).map(() => new Array(shape.length).fill(null));
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            newShape[j][shape.length - 1 - i] = shape[i][j];
        }
    }
    return newShape;
}

const mirror = (shape) => {
    const newShape = shape.map(row => row.slice().reverse());
    return newShape;
}

const ALL_SHAPES = SHAPES.map(shape => getAllRotations(shape));


// Grid utils

const getShapesIndexes = (grid) => {
    const indexes = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const idx = SHAPES.findIndex(shape => shape.some(row => row.includes(grid[i][j])));
            if (grid[i][j] !== 'X' && !indexes.includes(idx)) {
                indexes.push(idx);
            }
        }

    }
    return indexes;
}

const maybePlaceShape = (grid, shape, row, col) => {
    const newGrid = grid.map(row => row.slice());
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] !== 'X') {
                const withinBounds = row + i < grid.length && col + j < grid[0].length && row + i >= 0 && col + j >= 0;

                if (!withinBounds || newGrid[row + i][col + j] !== 'X') {
                    // console.log('Cannot place shape');
                    return grid;
                }
                else {
                    // console.log('Placing shape');
                    newGrid[row + i][col + j] = shape[i][j];
                }
            }
        }
    }
    return newGrid;
}

const hasIsolatedX = (grid) => {
    let hasX = false;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === 'X') {
                hasX = true;
                if (i - 1 >= 0 && grid[i - 1][j] === 'X') {
                    return false;
                }
                if (i + 1 < grid.length && grid[i + 1][j] === 'X') {
                    return false;
                }
                if (j - 1 >= 0 && grid[i][j - 1] === 'X') {
                    return false;
                }
                if (j + 1 < grid[i].length && grid[i][j + 1] === 'X') {
                    return false;
                }
            }

        }
    }
    return hasX;
}

const leftmostEmptyCol = (grid) => {
    for (let j = 0; j < grid[0].length; j++) {
        for (let i = 0; i < grid.length; i++) {
            if (grid[i][j] === 'X') {
                return j;
            }
        }
    }
    return null;
}

// Solver

const solve = (grid, usedShapesIndexes) => {
    if (usedShapesIndexes.length === SHAPES.length) {
        return grid;
    }

    iterations++;

    for (let i = 0; i < SHAPES.length; i++) {
        if (!usedShapesIndexes.includes(i)) {
            const rotations = ALL_SHAPES[i];
            for (let j = 0; j < rotations.length; j++) {
                const rotatedShape = rotations[j];
                const col = leftmostEmptyCol(grid);
                for (let row = 0; row < grid.length; row++) {
                    const newGrid = maybePlaceShape(grid, rotatedShape, row, col);
                    if (newGrid !== grid && !hasIsolatedX(newGrid)) {
                        const newUsedShapesIndexes = usedShapesIndexes.slice();
                        newUsedShapesIndexes.push(i);
                        const solution = solve(newGrid, newUsedShapesIndexes);
                        if (solution !== null) {
                            return solution;
                        }
                    }
                }
                
            }
        }
    }
    return null;
}

// Problems

let iterations = 0;

const problem2 = () => {
    let problem2grid =  [['B', 'B', 'B', 'E', 'E', 'E', 'D', 'J', 'J', 'J', 'J'],
                         ['B', 'B', 'E', 'E', 'L', 'D', 'D', 'F', 'F', 'X', 'X'],
                         ['G', 'G', 'G', 'L', 'L', 'L', 'D', 'F', 'X', 'X', 'X'],
                         ['G', 'K', 'K', 'I', 'L', 'I', 'D', 'X', 'X', 'X', 'X'],
                         ['G', 'K', 'K', 'I', 'I', 'I', 'X', 'X', 'X', 'X', 'X']];
    displayGrid(problem2grid);
    console.log('-------------------');
    const problem2UsedShapesIndexes = [1, 3, 4, 5, 6, 8, 9, 10, 11];
    const solvedProblem2 = solve(problem2grid, problem2UsedShapesIndexes);
    displayGrid(solvedProblem2);
    console.log('Iterations: ' + iterations);

}

const problem80 = () => {
    let problem80grid = [['I', 'I', 'I', 'F', 'F', 'L', 'X', 'X', 'X', 'X', 'X'],
                         ['I', 'D', 'I', 'F', 'L', 'L', 'L', 'X', 'X', 'X', 'X'],
                         ['D', 'D', 'D', 'D', 'A', 'L', 'X', 'X', 'X', 'X', 'X'],
                         ['B', 'B', 'A', 'A', 'A', 'X', 'X', 'X', 'X', 'X', 'X'],
                         ['B', 'B', 'B', 'J', 'J', 'J', 'J', 'X', 'X', 'X', 'X']];
    displayGrid(problem80grid);
    console.log('-------------------');
    const problem80UsedShapesIndexes = getShapesIndexes(problem80grid);
    const solvedProblem80 = solve(problem80grid, problem80UsedShapesIndexes);
    displayGrid(solvedProblem80);
    console.log('Iterations: ' + iterations);
}

const problem250 = () => {
    let problem250grid = [['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
                            ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
                            ['X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X'],
                            ['X', 'X', 'X', 'X', 'C', 'C', 'C', 'C', 'X', 'X', 'X'],
                            ['X', 'X', 'X', 'J', 'J', 'J', 'J', 'C', 'X', 'X', 'X']];
    displayGrid(problem250grid);
    console.log('-------------------');
    const problem250UsedShapesIndexes = getShapesIndexes(problem250grid);
    const solvedProblem250 = solve(problem250grid, problem250UsedShapesIndexes);
    displayGrid(solvedProblem250);
    console.log('Iterations: ' + iterations);
}

problem250();