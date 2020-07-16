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
    
    await fetch(tokenOptions, data).then(res => {
        secretOptions.headers["X-Vault-Token"] = res.val.auth.client_token;
    }).catch(res => {
        console.log(res.err);
        core.setFailed("Could not log you in, check your Role ID and Secret ID!");
    })

    for (onePath in paths)
    {   
        const regex = /\/?secret\/(.*)/
        const [,capture] = onePath.match(regex);
        secretOptions.path = `/v1/secret/data/${capture}`;
        
        await fetch(secretOptions, data).then(res => {
            paths[onePath] = res.val.data.data;
        }).catch(res => {
            console.log("Could not open: " + onePath);
            console.log(res.err);
            core.setFailed("Could not open your secret, Check the log for more information!");  
        })
    }
    setValues(paths, userInput);    
}

function setValues(paths, userInput)
{
    for (const [key, val] of Object.entries(userInput)) {
        const path = val[0];
        const secret = val[1];
        const response = paths[path];

        if (secret){
            core.setOutput(key, response[secret]);
        } else {
            core.setOutput(key, response)
        }
    }
}

function fetch(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
        
            res.on('data', (d) => {
                resolve({status: res.statusCode, val: JSON.parse(d)});
            })
        })
        req.on('error', (error) => {
            console.error(error)
            reject({status: res.statusCode, err: error});
        })
        req.write(data)
        req.end()
    })
}

main();