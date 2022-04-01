const readline = require("readline");

const readLineAsync = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  return new Promise((resolve) => {
    console.log(question.yellow);
    rl.prompt();
    rl.on("line", (line) => {
      rl.close();
      resolve(line);
    });
  });
};
module.exports = readLineAsync;
