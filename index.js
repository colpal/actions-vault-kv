const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
let token;

try {
    const vaultPath = core.getInput('vaultPath');
    const creds = {username: "test", password: "test123"}

    console.log(`Path is: ${vaultPath}`)

/*-------------------Get Token----------------------------------- */

    const data = JSON.stringify({
      role_id: core.getInput('ROLE_ID'), 
      secret_id: core.getInput('SECRET_ID')
    })
    const tokenOptions = {
      hostname: 'vault.colpal.cloud',
      port: 443,
      path: '/v1/auth/approle/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      }
    }

    let req = https.request(tokenOptions, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', (d) => {
        token = JSON.parse(d).auth.client_token;
        console.log("Login successful!");
      })
    })
    
    req.on('error', (error) => {
      console.error(error)
      req.end()
      process.exit(1);
    })
    req.write(data)
    req.end()

/*----------------------Get Secret----------------------------------- */
  const secretOptions = {
    hostname: 'vault.colpal.cloud',
    port: 443,
    path: '/v1' + vaultPath + '?list=true',
    method: 'GET',
    headers: {
      'X-Vault-Token' : token
    }
  }
  req = https.request(secretOptions, (res) => {
  console.log(`statusCode: ${res.statusCode}`)
  
  res.on('data', (d) => {
    console.log("Secret opened!");
    console.log(JSON.parse(d));
    })
  })
  
  req.on('error', (error) => {
    console.error(error)
    req.end()
    process.exit(1);
  })
  req.write(data)
  req.end()

  core.setOutput("creds", creds);

  } catch (error) {
    core.setFailed(error.message);
}