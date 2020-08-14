const core = require('@actions/core');
const { GoogleAuth } = require('google-auth-library');

function fail(error, message) {
  core.error(error);
  core.setFailed(message);
  process.exit(1);
}

function setValues(paths, userInput) {
  Object.entries(userInput).forEach(([userKey, [path, secret]]) => {
    const response = paths[path];

    if (secret) {
      core.setOutput(userKey, response[secret]);
    } else {
      core.setOutput(userKey, response);
    }
  });
}

function maskValues(paths) {
  Object.values(paths).forEach((secretObject) => {
    Object.values(secretObject).forEach((secret) => {
      core.setSecret(secret);
    });
  });
}

async function main() {
  const roleID = core.getInput('role-id', { required: true });
  const secretID = core.getInput('secret-id', { required: true });
  const secretPaths = core.getInput('secret-paths', { required: true });
  const serviceAccountKey = core.getInput('service-account-key', { required: true });
  const vaultAddress = core.getInput('vault-address');
  const clientID = core.getInput('iap-client-id');

  let userInput;
  try {
    userInput = JSON.parse(secretPaths);
  } catch (e) {
    fail(e, 'Could not parse your input for "secret-paths". Make sure "secret-paths" is a valid JSON object');
  }

  let credentials;
  try {
    credentials = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'));
  } catch (e) {
    fail(e, 'Could not parse "service-account-key" as JSON');
  }

  let client;
  try {
    client = await (new GoogleAuth({ credentials })).getIdTokenClient(clientID);
  } catch (e) {
    fail(e, 'Could not create a valid Google Auth client');
  }

  try {
    await client.request({
      url: `${vaultAddress}/v1/sys/health`,
      method: 'get',
    });
  } catch (e) {
    fail(e, 'No basic connectivity could be established to Vault');
  }

  let tokenResponse;
  try {
    tokenResponse = await client.request({
      url: `${vaultAddress}/v1/auth/approle/login`,
      method: 'post',
      data: {
        role_id: roleID,
        secret_id: secretID,
      },
    });
  } catch (e) {
    fail(e, 'Could not log you in, check your Role ID and Secret ID!');
  }
  const vaultToken = tokenResponse.data.auth.client_token;

  const paths = {};
  Object.values(userInput).forEach(([path]) => {
    paths[path] = null;
  });

  const regex = /\/?secret\/(.*)/;
  const promises = Object
    .keys(paths)
    .map(async (onePath) => {
      const [, capture] = onePath.match(regex);
      try {
        const response = await client.request({
          url: `${vaultAddress}/v1/secret/data/${capture}`,
          method: 'get',
          headers: {
            'X-Vault-Token': vaultToken,
          },
        });
        return { ...response, ACTUAL_PATH: onePath };
      } catch (e) {
        return fail(e, `Could not open: ${onePath}. Check that the path is valid`);
      }
    });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    paths[response.ACTUAL_PATH] = response.data.data.data;
  });

  maskValues(paths);
  console.log(paths);
  setValues(paths, userInput);
}

main();
