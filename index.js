const options = {
  apiVersion: 'v1', 
  endpoint: 'https://vault.colpal.cloud/'
};
const vault = require("node-vault")(options);
const github = require('@actions/github');
const core = require('@actions/core');

const path = core.getInput('vaultPath');
const creds = {username: "test", password: "test123"}
core.setOutput("creds", creds);

  /*-------------------------------------------------------------------*/
  
vault.auths()
.then(() => {
  return vault.enableAuth({
    mount_point: 'approle',
    type: 'approle',
    description: 'Approle auth',
  });
})
.then(() => {
  const roleId = core.getInput('ROLE_ID');
  const secretId = core.getInput('SECRET_ID');
  return vault.approleLogin({ role_id: roleId, secret_id: secretId });
})
.then(() => {
  console.log("It worked");
})
.catch((result) => {
  console.log("Could not log in")
  console.log(result)
  process.exit(1);
})