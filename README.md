# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage

### Basic

```yaml
jobs:
  main:
    # Make sure you are running on a self-hosted runner
    runs-on: self-hosted
    steps:
      # Be sure to set an ID on the step that invokes the action. We need this
      # later to access outputs!
      - id: secret
        uses: ./
        with:
          # These come from your AppRole definition in Vault
          role-id: APPROLE_ROLE_ID
          secret-id: ${{ secrets.APPROLE_SECRET_ID }}
          # The first item is the path in Vault, the second is the key you want
          secret-paths: >-
            {
              "username" : ["secret/our-account", "username"],
              "password" : ["secret/our-account", "password"]
            }
      # Don't forget to mask the secrets you don't want to show up in logs!
      - run: echo "::add-mask::${{ steps.secret.outputs.password}}"
      - run: echo "My username is ${{ steps.secret.outputs.username }}"
      - run: echo "My password is ${{ steps.secret.outputs.password }}"
      - uses: colpal/actions-clean@v1
        if: ${{ always() }}
```

### Cross-Runner

```yaml
jobs:
  get_secrets:
    # Make sure you are running on a self-hosted runner
    runs-on: self-hosted
    # This allows the outputs to be accessed by another job
    outputs:
      username: ${{ steps.secret.outputs.username }}
      password: ${{ steps.secret.outputs.password }}
      report: ${{ steps.secret.outputs.report }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      # Be sure to set an ID on the step that invokes the action. We need this
      # later to access outputs!
      - id: secret
        uses: colpal/actions-vault-kv@v1
        with:
          # These come from your AppRole definition in Vault
          role-id: APPROLE_ROLE_ID
          secret-id: ${{ secrets.APPROLE_SECRET_ID }}
          # The first item is the path in Vault, the second is the key you want
          # If you don't provide a key, it grabs the entire secret as JSON
          secret-paths: >-
            {
              "username" : ["secret/our-account", "username"],
              "password" : ["secret/our-account", "password"],
              "report" : ["secret/report"]
            }
      - uses: colpal/actions-clean@v1
        if: ${{ always() }}

  use_secrets:
    runs-on: ubuntu-latest
    # Don't forget to "need" the job that grabbed the secrets
    needs: [get_secrets]
    # Here, we can bind the secrets as ENV variables on this runner
    env:
      USERNAME: ${{ needs.get_secrets.outputs.username }}
      PASSWORD: ${{ needs.get_secrets.outputs.password }}
      REPORT: ${{ needs.get_secrets.outputs.report }}
    steps:
      # Don't forget to mask the secrets you don't want to show up in logs!
      - run: |
          echo "::add-mask::$PASSWORD"
          echo "::add-mask::$REPORT"
      - run: echo "My username is $USERNAME"
      - run: echo "My password is $PASSWORD"
      - run: echo "$REPORT" > report.json
```
