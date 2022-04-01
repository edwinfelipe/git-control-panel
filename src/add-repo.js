const fse = require("fs-extra");
const { join } = require("path");
const isValidSlug = (str) => {
  const regex = new RegExp(/^[\w]{2,}-?[\w-]*?$/);
  return regex.test(str);
};
const readLineAsync = require("./readline");

const addRepo = async () => {
  return new Promise(async (resolve, reject) => {
    console.log("Add new Repo!\n".blue);
    const repo = {};
    const repos = (await fse.readJSON(join(__dirname, "repos.json"))) || [];
    try {
      const slug = await readLineAsync("Insert the repo slug: ".yellow);
      const alreadyExist = repos.find((repo) => repo.slug === slug);
      const isSlug = isValidSlug(slug);
      if (alreadyExist) {
        console.log("The repository you are trying to add already exist".red);
        return resolve();
      }
      if (!isSlug) {
        return resolve();
      }
      repo.slug = slug;
      const name = await readLineAsync("Insert the repo name: ".yellow);
      repo.name = name;

      repos.push(repo);
      await fse.writeJSON(join(__dirname, "repos.json"), repos);

      console.log(`${repo.slug} successfully added!\n`.green);

      const answer = await readLineAsync(
        "Do you want to add another repo?(y/n) "
      );
      if (answer.toLowerCase() === "y") {
        addRepo();
      } else {
        resolve();
      }
    } catch (err) {
      console.log(err.message.red);
      reject(err);
    }
  });
};

module.exports = addRepo;
