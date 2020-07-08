const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
let token;

try {
  let paths = {};
  let returnCreds = {};
  const userInput = (JSON.parse(core.getInput('vaultPath')));
  for (key in userInput)
  {
    if (!paths.hasOwnProperty(userInput[key][0]))
    	paths[userInput[key][0]] = [];
    userInput[key].length == 2 ? paths[userInput[key][0]].push(userInput[key].length-1 + ':' + userInput[key][1]) : paths[userInput[key][0]].push(userInput[key].length-1 + ":")        
    paths[userInput[key][0]].push(key);
  }
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

      for (onePath in paths) {
        let secretOptions = {};
        secretOptions = {
          hostname: 'vault.colpal.cloud',
          port: 443,
          path: '/v1' + onePath,
          method: 'GET',
          headers: {
            'X-Vault-Token': token,
            'Content-Type': 'application/json'
          }
        }

        let req2 = https.request(secretOptions, (res) => {
          console.log(`\nstatusCode: ${res.statusCode}`)

          res.on('data', (d) => {
            let secret = JSON.parse(d);
            secret.errors && (console.log(secret) || process.exit(1));
            console.log("Secret opened!");

            for (let k = 0; k < paths[onePath].length; k+=2)
            {
                let str = paths[onePath][k];
                let idx = paths[onePath][k].indexOf(":");
                if (str[idx-1] == 1)
                {
                  let thisSecret = str.substr(idx+1)
                  returnCreds[paths[onePath][k+1]] = secret.data.data[thisSecret];
                }
                else
                    returnCreds[paths[onePath][k+1]] = secret.data.data;  
            }
              core.setOutput("creds", returnCreds);
          })
        })
        req2.on('error', (error) => {
          console.error(error)
          req2.end()
          process.exit(1);
        })
        req2.write(data)
        req2.end()
      }
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