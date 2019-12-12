export const randomItem = list => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};

export const randomNumber = max => Math.floor(Math.random() * max + 1);
