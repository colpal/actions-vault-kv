const github = require('@actions/github');
const core = require('@actions/core');
const https = require('https');
let returnCreds = {};
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

    (async function () {
        try {
            let loginPromise = getToken(tokenOptions, data);
            let loginResponse = await loginPromise;
            console.log(loginResponse); //Promise response
        } catch(e) {
            console.log(e);
        }
    })();

} catch (error) {
    core.setFailed(error.message);
}

function getToken(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`)
        
            res.on('data', (d) => {
              token = JSON.parse(d).auth.client_token;
              console.log("Login successful!");
            })
        
            res.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                resolve(response_body.toString());
            })

            req.on('error', (error) => {
                console.error(error)
                reject(error);
            })
        req.write(data)
        req.end()
        })
    })
}