const fse = require("fs-extra");
const Table = require("cli-table3");

const { execSync } = require("child_process");
const { join } = require("path");
const cloneRepo = require("./clone-repo");
const readLineAsync = require("./readline");

const { OPTIONS_MESSAGE } = require("./constants");
const getStories = (branch) => {
  const ticketRegex = new RegExp(/[A-Za-z]{1,3}-\d{1,}/, "g");
  const tickets = Array.from(
    branch.split("/").reverse()[0].matchAll(ticketRegex)
  ).map((t) => t[0]);
  const stories =
    tickets.length > 1
      ? tickets
      : tickets.map((s) => `https://jira.newfold.com/browse/${s}`);
  return stories;
};

const getTableRow = (item) => {
  const table = [...Object.values(item)].map((val) => {
    const today = new Date().getTime();
    const lastCommitDate = new Date(item.date).getTime();
    const diff = today - lastCommitDate;
    const monthToMilliSeconds = 2.592e9;
    const week = 6.048e8;
    const threeDays = 2.592e8;
    if (diff < threeDays) {
      return `${val}`.green;
    } else if (diff < week) {
      return `${val}`.yellow;
    } else if (diff < monthToMilliSeconds) {
      return `${val}`.red;
    } else {
      return `${val}`.grey;
    }
  });

  return table;
};

const getUnmergedReleases = async () => {
  return new Promise(async (resolve, reject) => {
    const slug = await readLineAsync(
      "\nWrite slugs to research about specific repos, let it empty to verify every repo in our DB: "
        .yellow
    );
    const slugs = slug.split(" ");
    let repos = await fse.readJSON(`${__dirname}/repos.json`);
    repos = repos.filter((repo) => slugs.includes(repo.slug) || !slug);
    if (!repos.length) {
      resolve("There are no repos that match the criteria".red);
    }
    const table = new Table({
      head: ["Repo", "Branch", "Author", "Date", "Ahead", "Stories", "Status"],
    });
    for (let repo of repos) {
      await cloneRepo(repo);
      const dir = join(__dirname, "..", "tmp", repo.slug);

      const defaultBranch = execSync(
        `cd ${dir} && git remote show origin | grep 'HEAD branch' | cut -d' ' -f5`
      )
        .toString()
        .trim();
      const items = execSync(
        `cd ${dir} && 
                git for-each-ref --sort=-authordate --format='{"author": "%(authorname)","branch": "%(refname:short)", "date": "%(authordate:format:%Y/%m/%d)"}' refs/remotes/origin/release --no-merged="${defaultBranch}"
          `
      )
        .toString()
        .split("\n")
        .filter((branch) => branch)
        .map((branch) => JSON.parse(branch));
      if (!items.length) {
        console.log(
          `${repo.name} does not contain release branches ahead ${defaultBranch}`
            .green
        );
      } else {
        for (let item of items) {
          item.ahead = Number(
            execSync(`cd ${dir} && git rev-list --right-only --count origin/${defaultBranch}...${item.branch}
          `).toString()
          );
          item = { repo: repo.name, ...item };
          item.stories = getStories(item.branch).join(" ");
          item.status = "  ●  ".green;
          const stories = item.stories.split(" ");
          if (stories.length > 1) {
            for (let story of stories) {
              const ahead = Number(
                execSync(`cd ${dir} && git rev-list --right-only --count ${item.branch}...origin/feature/${story}
              `).toString()
              );
              console.log(ahead);
              if (ahead <= 0) {
                item.status = "  ●  ".red;
              }
            }
          }
          table.push(getTableRow(item));
        }
      }
    }
    console.log(table.toString());
    console.log("done".green);
    resolve(OPTIONS_MESSAGE.cyan);
  });
};

module.exports = getUnmergedReleases;
