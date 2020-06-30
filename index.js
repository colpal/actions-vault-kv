const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');

try {
    const path = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${path}`)
    /*------------------------------------------------------- */
    const data = JSON.stringify({
      role_id: core.getInput('ROLE_ID'), 
      secret_id: core.getInput('SECRET_ID')
    })
    const options = {
      hostname: 'vault.colpal.cloud',
      port: 443,
      path: '/v1/auth/approle/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', (d) => {
        console.log("It worked succesfully");
        console.log("Type of: " + typeof((JSON.parse(d)).auth.policies));
      })
    })
    
    req.on('error', (error) => {
      console.error(error)
    })
    
    req.write(data)
    req.end()

    core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}