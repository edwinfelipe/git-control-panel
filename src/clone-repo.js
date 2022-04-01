const NodeGit = require("nodegit");
const fse = require("fs-extra");
const { join } = require("path");
const cloneRepo = async (repo) => {
  console.log(`\nCloning ${repo.name}...\n`.blue);
  const path = join(__dirname, "tmp", repo.slug);
  const baseUri = `${process.env.BASE_REPO}/${repo.slug}.git`;
  try {
    await fse.remove(path);
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
