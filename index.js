const github = require('@actions/github');
const core = require('@actions/core');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    core.setOutput("creds", creds);
    /*------------------------------------------------------- */
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://vault.colpal.cloud/", true); 
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var response = JSON.parse(this.responseText);
        console.log(response.auth.policies);
      }
    };
    var data = "'" + JSON.stringify({"role_id": core.getInput('ROLE_ID'), "secret_id": core.getInput('SECRET_ID')}) + "'" ;
    xhttp.send(data);
  } catch (error) {
    core.setFailed(error.message);
}