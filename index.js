const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
let returnCreds = {};
let currentCreds = {};
let userInput = {};
let paths = {};
let token = "";

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
    const secretOptions = {
          hostname: 'vault.colpal.cloud',
          port: 443,
          path: "",
          method: 'GET',
          headers: {
            'X-Vault-Token': token,
            'Content-Type': 'application/json'
        }
    }
    /*---------------- Constructing paths json -------------------*/
    userInput = (JSON.parse(core.getInput('vaultPath')));
    for (key in userInput)
    {
      if (!paths.hasOwnProperty(userInput[key][0]))
          paths[userInput[key][0]] = [];
      userInput[key].length == 2 ? paths[userInput[key][0]].push(userInput[key].length-1 + ':' + userInput[key][1]) : paths[userInput[key][0]].push(userInput[key].length-1 + ":")        
      paths[userInput[key][0]].push(key);
    }
    console.log(paths);
   /*------------------------------------------------------------*/
    async function main (request) {
        try {
            let loginResponse = await fetch(tokenOptions, data);
            console.log("Login Response: " + loginResponse);
            loginResponse.then(async (statusCode) => {
                secretOptions.headers["X-Vault-Token"] = token;
                for (onePath in path)
                {
                    secretOptions.path = '/v1' + onePath;
                    let secretResponse = await fetch(secretOptions, data);
                    console.log(currentCreds);
                }
            })
        } catch(e) {
            console.log(e);
        }
    }
    main();

    function fetch(options, data) {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
            
                res.on('data', (d) => {
                  let response = JSON.parse(d);
                  if (response.hasOwnProperty("errors"))
                      reject(response);
                  else if (response.hasOwnProperty("auth") && token === "") {
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