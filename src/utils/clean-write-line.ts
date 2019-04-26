export const cleanLine = () => process.stdout.write('\r\x1b[K');

export default (current: number, all: number, message: string) => {
  if (current !== 0) {
    cleanLine();
  }
  process.stdout.write(`${message} ${current + 1}/${all}`);
  if (current + 1 === all) {
    cleanLine();
  }
};
