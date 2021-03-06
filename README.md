# actions-vault-kv
A library to easily get secrets from Hashicorp Vault within a Github Actions workflow.

## Usage

```yaml
steps:
  - id: 'vault'
    uses: 'colpal/actions-vault-kv@v2'
    with:
      # Together, the role-id and secret-id allow you to login to Vault, and determine what secrets
      # you can access. You receive both of them when you submit a pull request on the colpal/vault
      # repository to create a new AppRole
      role-id: '{{ YOUR_ROLE_ID }}'
      secret-id: '${{ secrets.YOUR_SECRET_ID }}'

      # This is a special "org-wide" secret that allows this action to connect to Vault beyond the
      # IAP. Essentially, COPY THIS EXACTLY.
      service-account-key: '${{ secrets.VAULT_IAP_SA }}'

      # This is a JSON object declaring which secrets you want from Vault. The action will use this
      # to grab the secrets, and set them as output variables on this step.
      #
      #   Each key (the left side of the colon) is what name of the output variable will be.
      #
      #   Each value (the right side of the colon) can be specified in two ways:
      #     ["path/to/the/secret", "the-key-you-want"]
      #       This will grab just that one key from the secret at that path in Vault, and set it
      #       in the output variable.
      #     OR
      #     ["path/to/the/secret"]
      #       This will grab the entire secret at that path in Vault, and set them as a JSON-string
      #       in the output variable.
      secret-paths: >-
        {
          "database": ["secret/database"],
          "privateKey": ["secret/ssh", "private-key"],
        }

  # Here is an example of using the JSON-string output option
  - run: 'echo "$DATABASE_USERNAME:$DATABASE_PASSWORD" > db-basic-auth.txt'
    env:
      # Note we have to parse the output as JSON before we can access the fields
      DATABASE_USERNAME: '${{ fromJson(steps.vault.outputs.database).username }}'
      DATABASE_PASSWORD: '${{ fromJson(steps.vault.outputs.database).password }}'

  # Here is an example of using the single secret output option
  - run: 'echo "$SSH_PRIVATE_KEY" > $HOME/.ssh/id_rsa'
    env:
      # Note we are using the output directly here
      SSH_PRIVATE_KEY: '${{ steps.vault.outputs.privateKey }}'
```
