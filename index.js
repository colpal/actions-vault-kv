const options = {
  apiVersion: 'v1', 
  endpoint: 'https://vault.colpal.cloud/'
};
const vault = require("node-vault")(options);
const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    console.log(`ROLE ID: ${core.getInput('ROLE_ID')}`)
    core.setOutput("creds", creds);

  /*-------------------------------------------------------------------*/
  
  } catch (error) {
    core.setFailed(error.message);
}