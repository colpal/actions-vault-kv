const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
let token;

try {
    let vaultPath = [];
    let paths = {};
    core.getInput('vaultPath').split(",").forEach(i => {
        vaultPath.push(i.trim());
    });
/*-------------------Get token and secret----------------------------------- */

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

    const req = https.request(tokenOptions, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', (d) => {
        token = JSON.parse(d).auth.client_token;
        console.log("Login successful!");

        const secretOptions = {
          hostname: 'vault.colpal.cloud',
          port: 443,
          path: '/v1' + vaultPath[0],
          method: 'GET',
          headers: {
            'X-Vault-Token' : token,
            'Content-Type': 'application/json'
          }
        }
        const req2 = https.request(secretOptions, (res) => {
        console.log(`\nstatusCode: ${res.statusCode}`)
        
        res.on('data', (d) => {
          const secret = JSON.parse(d);
          secret.errors && (console.log(secret) || process.exit(1));
          console.log("Secret opened!");
      
          if(vaultPath.length == 1)
            core.setOutput("creds", secret.data.data);
          else if (vaultPath.length == 2)
            core.setOutput("creds",secret.data.data[vaultPath[1]])
          else {
            let returnCreds = {};
            for (let i = 1; i < vaultPath.length; i++){
              returnCreds[vaultPath[i]] = secret.data.data[vaultPath[i]];
            }
            core.setOutput("creds",returnCreds)
          }
          })
        })
        
        req2.on('error', (error) => {
          console.error(error)
          req2.end()
          process.exit(1);
        })
        req2.write(data)
        req2.end()
      })
    })
    req.on('error', (error) => {
      console.error(error)
      req.end()
      process.exit(1);
    })
    req.write(data)
    req.end()
  } catch (error) {
    core.setFailed(error.message);
}