# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage

```yaml
steps:
  - id: 'vault'
    uses: 'colpal/actions-vault-kv@v1'
    with:
      # Together, the role-id and secret-id allow you to login to Vault, and determine what secrets
      # you can access.
      role-id: '{{ YOUR_ROLE_ID }}' # You request this in the colpal/vault repository
      secret-id: '${{ secrets.YOUR_SECRET_ID }}'  # You request this in the colpal/vault repository
      service-account-key: '${{ secrets.VAULT_IAP_SA }}' # This is a special "org-wide" secret
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
      DATABASE_USERNAME: "${{ fromJson(steps.vault.outputs.database).username }}"
      DATABASE_PASSWORD: "${{ fromJson(steps.vault.outputs.database).password }}"

  # Here is an example of using the single secret output option
  - run: 'echo "$SSH_PRIVATE_KEY" > $HOME/.ssh/id_rsa'
    env:
      SSH_PRIVATE_KEY: "${{ steps.vault.outputs.privateKey }}"
```
