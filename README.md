# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
jobs:
  default:
    # Make sure you are running on a self-hosted runner
    runs-on: self-hosted 
    steps:
      - uses: actions/checkout@v2.3.1
      
      # Be sure to set an ID on the step that invokes the action. We need this later to access outputs!
      - id: secret
        uses: colpal/actions-vault-kv@v1
        with:
          role-id: 12345678-9123  
          secret-id: 12345678-9123
          secret-paths: |
            {
              "usr" : ["secret/google", "username"],
              "pass" : ["secret/google", "password"],
              "creds" : ["secret/multipleCredentials"]
            }
            
      # Accessing returned values and setting them as env. variables      
      - env:
          usr: ${{ steps.secret.outputs.usr }}
          pass: ${{ steps.secret.outputs.pass }}
          email: ${{ fromJson(steps.secret.outputs.creds).email }}
          id: ${{ fromJson(steps.secret.outputs.creds).id }}     
```
## Inputs
role-id: Your Role ID used to log into vault
secret-id: Your Secret ID used to log into vault
secret-paths: secret-paths follows JSON Object representation so make sure secret paths is a valid JSON Object
              Make sure that path starts with /secret/ or secret/ For Example: 
              ```yaml
              {
                "Your output key name" : ["secret/path-to-the-secret", "name of the credential in vault"],
                "Different key name" : ["secret/path-to-the-secret"]
              }
              ```
              **Notice: if the specific name of the credential from vault is not requested then you will receive all credentials from that path**
