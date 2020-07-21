const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');

const loginBody = JSON.stringify({
    role_id: core.getInput('ROLE_ID', {required: true}),
    secret_id: core.getInput('SECRET_ID', {required: true})
})
const tokenOptions = {
    hostname: 'vault.colpal.cloud',
    port: 443,
    path: '/v1/auth/approle/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': loginBody.length
    }
}
const secretOptions = {
    hostname: 'vault.colpal.cloud',
    port: 443,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}

async function main (request) {
    let userInput;
    try {
        userInput = JSON.parse(core.getInput('secret-paths', {required: true}));
    } catch (error) {
        fail(`Could not parse your input for 'secret-paths'. Make sure 'secret-paths' is a valid JSON object\n${error}`)
    }

    const paths = {};
    for (const [path] of Object.values(userInput)){
        paths[path] = null;
    }

    try {
        const tokenReponse = await fetch(tokenOptions, loginBody);
        secretOptions.headers["X-Vault-Token"] = tokenReponse.val.auth.client_token;
    } catch (res) {
        fail(`Could not log you in, check your Role ID and Secret ID!\n${res.err.errors}`)
    }

    const regex = /\/?secret\/(.*)/
    const responses = await Promise.all(Object.keys(paths).map(async onePath => {
        const [,capture] = onePath.match(regex);
        const path = `/v1/secret/data/${capture}`
        try {
            const response = await fetch({...secretOptions, path}, loginBody)
            response.ACTUAL_PATH = onePath;
            return response;
        } catch (res){
            fail(`Could not open: ${onePath}. Check that the path is valid.\n${JSON.stringify(res)}`)
        }
      })
    ); 
    for (const response of responses){
        paths[response.ACTUAL_PATH] = response.val.data.data;
    }

    setValues(paths, userInput);
}

function setValues(paths, userInput)
{
    for (const [userKey, [path, secret]] of Object.entries(userInput)) {
        const response = paths[path];

        if (secret) {
            core.setOutput(userKey, response[secret]);
        } else {
            core.setOutput(userKey, response)
        }
    }
}

function fetch(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
        
            res.on('data', (d) => {
                let response = JSON.parse(d);
                if (response.errors){
                    reject({status: res.statusCode, err: response})
                }
                resolve({status: res.statusCode, val: response});
            })
        })
        req.on('error', (error) => {
            console.err(error)
            reject({status: res.statusCode, err: error});
        })
        req.write(data)
        req.end()
    })
}

function fail(message){
    core.setFailed(message);
    process.exit(1);
}
main();