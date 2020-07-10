const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
let returnCreds = {};
let currentCreds = {}
let paths = {};
let token;

try {
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

    const secretOptions = {};
          secretOptions = {
          hostname: 'vault.colpal.cloud',
          port: 443,
          path: '/v1/secret/data/hello-world/user-pass',
          method: 'GET',
          headers: {
            'X-Vault-Token': token,
            'Content-Type': 'application/json'
          }
    }

    (async function (request) {
        try {
            const loginResponse = await fetch(tokenOptions, data);
            console.log("Login Response: " + loginResponse);
            if (loginResponse == 200){
                let secretResponse = await fetch(secretOptions, data);
                console.log(currentCreds);
            }
        } catch(e) {
            console.log(e);
        }
    })();

    function fetch(options, data) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
            
                res.on('data', (d) => {
                  let response = JSON.parse(d);
                  if (response.hasOwnProperty("errors"))
                      reject(response);
                  else if (response.hasOwnProperty("auth.client_token")) {
                      token = response.auth.client_token;
                      resolve(res.statusCode);
                  }
                  else {
                      currentCreds = response.data.data;
                      resolve(res.statusCode);
                  }
                })
            })
            req.on('error', (error) => {
                console.error(error)
                reject(error);
            })
            req.write(data)
            req.end()
        })
    }
} catch (error) {
    core.setFailed(error.message);
}