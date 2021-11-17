const promisify: Promisify =
  func =>
  (...args) =>
    new Promise((resolve, reject) => {
      func(...args, (err: Err, data: Data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });

export default promisify;
