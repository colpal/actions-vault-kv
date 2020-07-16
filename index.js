const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');

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
    path: '/v1',
    method: 'GET',
    headers: {
        'X-Vault-Token': "",
        'Content-Type': 'application/json'
    }
}

async function main (request) {

    const userInput = (JSON.parse(core.getInput('secret-paths')));
    const paths = {};

    for (const [path] of Object.values(userInput)) {
        paths[path] = null;
    }

    for (onePath in paths)
    {
        secretOptions.path = '/v1/secret/data' + onePath.substr(onePath.indexOf("secret/")+6);
        let secretResponse = getSecret();
        if (!secretResponse) {
            core.setFailed("Could not open the secret you requested!");
            process.exit(1);
        }
        paths[onePath] = secretResponse;
    }
    mapValues(paths, userInput);    
}
main();

function mapValues(paths, userInput)
{
    for (key in userInput)
    {
        let response = paths[userInput[key][0]]
        if (userInput[key][1])
            core.setOutput(key, response[userInput[key][1]])
        else 
            core.setOutput(key, response)
    }
}

function fetch(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
        
            res.on('data', (d) => {
                resolve(JSON.parse(d));
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
async function getSecret() {
    const response = {}
    if (secretOptions.headers["X-Vault-Token"] == ""){
        response = await fetch(tokenOptions, data);
        secretOptions.headers["X-Vault-Token"] = response.auth.client_token;
    }
    response = await fetch (secretOptions, data);
    return response.data.data;
}