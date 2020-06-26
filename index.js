const core = require('@actions/core');
const github = require('@actions/github');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}