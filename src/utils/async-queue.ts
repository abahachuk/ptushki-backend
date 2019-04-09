const run = (tasks: (() => any | Promise<any>)[]) => tasks.map(task => task());

export function executeInThreadedQueue(tasks: (() => any | Promise<any>)[], maxThreads: number = 5) {
  const ttasks = tasks.slice();
  let currentTask = 0;
  let threads = maxThreads;
  let threadsOnStart = maxThreads;
  const threadHandler = (done: (arg: any[]) => any, fail: (arg: any) => any) => {
    if (currentTask === tasks.length) {
      threads -= 1;
      if (threads === 0) {
        done(ttasks);
      }
    } else {
      const n = currentTask;
      currentTask += 1;
      ttasks[n]().then(
        (res: any) => {
          ttasks[n] = res;
          threadHandler(done, fail);
        },
        (err: any) => fail(err),
      );
    }
  };
  return new Promise((resolve, reject) => {
    if (tasks.length <= maxThreads) {
      Promise.all(run(tasks)).then(res => resolve(res), err => reject(err));
    } else
      while (threadsOnStart) {
        threadsOnStart -= 1;
        threadHandler(resolve, reject);
      }
  });
}
