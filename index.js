const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    /*------------------------------------------------------- */
    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let xhttp = new XMLHttpRequest();
    try
    {
      xhttp.open('POST', "https://vault.colpal.cloud/v1/auth/approle/login", false);  // `false` makes the request synchronous
      let data = "'" +  {"role_id": core.getInput('ROLE_ID'), "secret_id": core.getInput('SECRET_ID')} + "'" ;
      xhttp.send(data);

      if (xhttp.status === 200) {
        let response = JSON.parse(xhttp.responseText);
        console.log(response.auth.policies);
      }
    }
    catch(e)
    {
      console.log(e);
    }
    core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}