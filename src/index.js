require("dotenv").config();
require("colors");

const readLineAsync = require("./readline");
const cloneRepo = require("./clone-repo");
const addRepo = require("./add-repo");
const getUnmergedReleases = require("./get-unmerged-releases");
const { OPTIONS_MESSAGE } = require("./constants");
console.log("Hey, welcome to Control Panel 2.0!\n".blue);
console.log(OPTIONS_MESSAGE.cyan);

const main = async (isFirstTime = false) => {
  const command = await readLineAsync(
    isFirstTime ? "\nWhat do you want to do?" : "\nSomething else you want to do?"
  );

  switch (command) {
    case "ar": {
      addRepo().then(() => {
        main();
      });
      break;
    }
    case "cr": {
      cloneRepo({
        slug: "marketing-hub-frontend",
        name: "marketing-hub-frontend",
      });
      break;
    }
    case "ex":
      break;
    case "lr":
      getUnmergedReleases().then((res) => {
        console.log(res);
        main();
      });
      break;

    default: {
      console.log("Please provide a valid option".red);
      main();
    }
  }
};

main(true);
