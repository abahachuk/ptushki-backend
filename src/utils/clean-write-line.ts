export const cleanLine = () => process.stdout.write('\r\x1b[K');

export const countedProgress = (current: number, all: number, message: string) => {
  if (current !== 0) {
    cleanLine();
  }
  process.stdout.write(`${message} ${current + 1}/${all}`);
  if (current + 1 === all) {
    cleanLine();
  }
};

export const dotProgress = (message: string) => {
  let current = 0;
  const timer = setInterval(() => {
    if (current !== 0) {
      cleanLine();
    }
    current += 1;
    process.stdout.write(`${message} ${'.'.repeat(current % 5)}`);
  }, 300);
  return {
    stop: () => {
      clearInterval(timer);
      cleanLine();
    },
  };
};
