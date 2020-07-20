const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
const { promises } = require('fs');

const data = JSON.stringify({
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
        'Content-Length': data.length
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
        userInput = JSON.parse(core.getInput('secret-paths'));
    } catch (error) {
        fail(`Could not parse your input for 'secret-paths'. Make sure 'secret-paths' is a valid JSON object\n${error}`)
    }

    const paths = {};
    for (const [path] of Object.values(userInput)){
        paths[path] = null;
    }
    
    await fetch(tokenOptions, data).then(res => {
        secretOptions.headers["X-Vault-Token"] = res.val.auth.client_token;
    }).catch(res => {
        fail(`Could not log you in, check your Role ID and Secret ID!\n${res.err.errors}`)
    })

    const regex = /\/?secret\/(.*)/
    promises = Object.keys(paths).map(async path => {
        const [,capture] = path.match(regex);
        newPath = `/v1/secret/data/${capture}`
        const response = await fetch({...secretOptions, newPath}, data)
        response.TEMP_PATH = path;
        return response;
    })

    const responses = await promises.all(promises); 
    console.log("Responses: \n" + responses);

    for (const onePath of Object.keys(paths))
    {   
        const regex = /\/?secret\/(.*)/
        const [,capture] = onePath.match(regex);
        path = `/v1/secret/data/${capture}`
        newSecretOptions = {...secretOptions, path};

        await fetch(newSecretOptions, data).then(res => {
            paths[onePath] = res.val.data.data;
        }).catch(res => {
            fail(`Could not open: ${onePath}. Check that the path is valid.\n${JSON.stringify(res.err)}`)
        })
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