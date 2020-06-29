const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    shell.exec('./login.sh ' + core.getInput('ROLE_ID') + ' ' + core.getInput('SECRET_ID'))
    core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}