# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
```yaml
jobs:
  get_credentials:
```
 ** `# Make sure you are running on a self-hosted runner `**
    runs-on: self-hosted 
    steps:
      - uses: actions/checkout@v2.3.1
      
      # Be sure to set an ID on the step that invokes the action. We need this later to access outputs!
      - id: secret
        uses: actions/actions-vault-kv@v1
        with:
          ROLE_ID: 12345678-9123-abcd-wzys-0123456789ab # Your Role ID here
          SECRET_ID: 12345678-9123-abcd-wzys-0123456789ab # Your Secret ID here
          secret-paths: |
          {
             "usr" : ["secret/hello-world/user-pass", "username"],
             "pass" : ["secret/hello-world/user-pass", "password"],
             "id" : ["secret/hello-world/id"]
          }
```
