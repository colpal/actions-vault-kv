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
        console.log("res: " + res);
    }).catch(res => {
        core.setFailed("Could not log you in, check your Role ID and Secret ID!");
        console.log(res.err);
        process.exit(1);
    })

    for (onePath in paths)
    {   
        secretOptions.path = '/v1/secret/data' + onePath.substr(onePath.indexOf("secret/")+6);
        await fetch(secretOptions, data).then(res => {
            paths[onePath] = secretResponse.val.data.data;
        }).catch(res => {
            core.setFailed("Could not open your secret, check the paths!");
            console.log(res.err);
            process.exit(1);
        })
    }
    console.log("Paths: " + paths);
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