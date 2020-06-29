const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}