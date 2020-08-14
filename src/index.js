const core = require('@actions/core');
const { GoogleAuth } = require('google-auth-library');

function fail(error, message) {
  core.error(error);
  core.setFailed(message);
  process.exit(1);
}

function try$(a) {
  if (a instanceof Function) {
    try {
      return [null, a()];
    } catch (err) {
      return [err, null];
    }
  } else if (a instanceof Promise) {
    return a
      .then((x) => [null, x])
      .catch((err) => [err, null]);
  }
  return ['try$ was not invoked with an eligible argument', null];
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

  const [pathParseError, userInput] = try$(() => JSON.parse(secretPaths));
  if (pathParseError) fail(pathParseError, 'Could not parse your input for "secret-paths". Make sure "secret-paths" is a valid JSON object');

  const [decodeError, buffer] = try$(() => Buffer.from(serviceAccountKey, 'base64'));
  if (decodeError) fail(decodeError, 'The "service-account-key" was not recognized as base64');

  const [keyParseError, credentials] = try$(() => JSON.parse(buffer.toString('utf8')));
  if (keyParseError) fail(keyParseError, 'Could not parse "service-account-key" as JSON');

  const [iapError, client] = await try$(
    (new GoogleAuth({ credentials })).getIdTokenClient(clientID),
  );
  if (iapError) fail(iapError, 'Could not create a valid Google Auth client');

  const [connectError] = await try$(client.request({
    url: `${vaultAddress}/v1/sys/health`,
    method: 'get',
  }));
  if (connectError) fail(connectError, 'No basic connectivity could be established to Vault');

  const [loginError, tokenResponse] = await try$(client.request({
    url: `${vaultAddress}/v1/auth/approle/login`,
    method: 'post',
    data: {
      role_id: roleID,
      secret_id: secretID,
    },
  }));
  if (loginError) fail(loginError, 'Could not log you in, check your Role ID and Secret ID!');

  const [tokenPathError, vaultToken] = try$(() => tokenResponse.data.auth.client_token);
  if (tokenPathError) fail(tokenPathError, 'Token could not be found in login response');

  const paths = {};
  Object.values(userInput).forEach(([path]) => {
    paths[path] = null;
  });
  const regex = /\/?secret\/(.*)/;
  const promises = Object
    .keys(paths)
    .map(async (onePath) => {
      const [, capture] = onePath.match(regex);
      const [secretError, response] = await try$(client.request({
        url: `${vaultAddress}/v1/secret/data/${capture}`,
        method: 'get',
        headers: {
          'X-Vault-Token': vaultToken,
        },
      }));
      if (secretError) fail(secretError, `Could not open: ${onePath}. Check that the path is valid`);

      return { ...response, ACTUAL_PATH: onePath };
    });
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    paths[response.ACTUAL_PATH] = response.data.data.data;
  });

  maskValues(paths);
  setValues(paths, userInput);
}

main();
