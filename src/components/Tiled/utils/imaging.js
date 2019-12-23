const applyLens = (size, array, i, j) => {
  return (
    array[i - 1][j - 1] * 0.03125 + // 3 -
    array[i - 1][j] * 0.125 + // 2 -
    array[i - 1][j + 1] * 0.03125 + // 3 -
    array[i][j - 1] * 0.125 + // 2 -
    array[i][j] * 0.375 + // 1 - 0.25
    array[i][j + 1] * 0.125 + // 2 -
    array[i + 1][j - 1] * 0.03125 + // 3 -
    array[i + 1][j] * 0.125 + // 2 -
    array[i + 1][j + 1] * 0.03125
  ); // 3 -
};

export const gaussianBlur = arr => {
  let matrix = arr;

  for (let i = 0; i < matrix.length - 1; i++) {
    for (let j = 0; j < matrix[0].length - 1; j++) {
      if (i === 0 || j === 0 || i === matrix.length || j === matrix[0].length) {
        matrix[i][j] = matrix[i][j];
      } else {
        matrix[i][j] = Math.round(applyLens(3, arr, i, j));
      }
    }
  }

  return matrix;
};
