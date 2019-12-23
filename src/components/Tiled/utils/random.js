export const randomItem = list => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

export const randomNumber = (max = 2, min = 1) =>
  Math.floor(Math.random() * (max - min + 1) + min);
