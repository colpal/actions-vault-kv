const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    /*------------------------------------------------------- */
    let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://vault.colpal.cloud/v1/auth/approle/login", true); 
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(this.responseText);
        console.log(response.auth.policies);
      }
      else
        console.log("Soemthing went wrong. Status Code: " + this.status);
    };
    let data = "'" +  {"role_id": core.getInput('ROLE_ID'), "secret_id": core.getInput('SECRET_ID')} + "'" ;
    xhttp.send(JSON.stringify(data));
    core.setOutput("creds", creds);
  } catch (error) {
    core.setFailed(error.message);
}