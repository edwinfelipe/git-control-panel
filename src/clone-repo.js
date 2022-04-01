const NodeGit = require("nodegit");
const fse = require("fs-extra");
const { join } = require("path");

const { execSync } = require("child_process");
const cloneRepo = async (repo) => {
  const path = join(__dirname, "tmp", repo.slug);
  const baseUri = `${process.env.BASE_REPO}/${repo.slug}.git`;
  try {
    const alreadyCloned = await fse.pathExists(join(path, ".git"));
    if (alreadyCloned) {
      console.log(`${repo.name} already cloned!\n`.yellow);
      console.log(`Fetching ${repo.name}...`.blue);
      execSync(`cd ${path} && git fetch`);
      return;
    }
    console.log(`\nCloning ${repo.name}...\n`.blue);

    await NodeGit.Clone(baseUri, path, {
      fetchOpts: {
        callbacks: {
          credentials: function (_, userName) {
            return NodeGit.Cred.sshKeyNew(
              userName,
              process.env.PUBLIC_PATH,
              process.env.PRIVATE_PATH,
              ""
            );
          },
          certificateCheck: () => 0,
        },
      },
    });

    console.log(`${repo.name} cloned Successfully!\n`.green);
  } catch (err) {
    console.log(`${err}`.red);
  }
};

module.exports = cloneRepo;
