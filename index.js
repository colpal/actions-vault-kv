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
  const mountPoint = 'approle';
  const roleName = 'hello-world';
  
  vault.auths()
  .then((result) => {
    if (result.hasOwnProperty('approle/')) return undefined;
    return vault.enableAuth({
      mount_point: mountPoint,
      type: 'approle',
      description: 'Approle auth',
    });
  })
  .then(() => vault.addApproleRole({ role_name: roleName, policies: 'hello-world' }))
  .then(() => Promise.all([vault.getApproleRoleId({ role_name: roleName }),
    vault.getApproleRoleSecret({ role_name: roleName })])
  )
  .then((result) => {
    const roleId = core.getInput('ROLE_ID');
    const secretId = core.getInput('SECRET_ID');
    return vault.approleLogin({ role_id: roleId, secret_id: secretId });
  })
  .then((result) => {
    console.log("It worked");
  })
  .catch((err) => console.error(err.message));
  