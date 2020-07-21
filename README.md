# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
jobs:
  get_credentials:
    # Make sure you are running on a self-hosted runner
    runs-on: self-hosted 
    steps:
      - uses: actions/checkout@v2.3.1
      
      # Be sure to set an ID on the step that invokes the action. We need this later to access outputs!
      - id: secret
        uses: actions/actions-vault-kv@v1
        with:
          ROLE_ID: 12345678-9123   # Your Role ID here
          SECRET_ID: 12345678-9123 # Your Secret ID here
          secret-paths: |
          {
             "usr" : ["secret/hello-world/user-pass", "username"],
             "pass" : ["secret/hello-world/user-pass", "password"],
             "id" : ["secret/hello-world/id"]
          }
          # secret-paths follows JSON Object representation so make sure secret paths is a valid JSON Object
          # Make sure that path starts with /secret/ or secret/ For Example: 
          # {
          #    "Your output key name" : ["secret/path-to-the-secret", "name of the credential in vault"],
          #    "Different key name" : ["secret/path-to-the-secret"]
          # }
          # Notice: if the specific name of the credential from vault is not requested then you will receive all credentials from that path
```
