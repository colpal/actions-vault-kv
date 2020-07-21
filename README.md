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
          role-id: 12345678-abcd  
          secret-id: 98765432-wxyz
          secret-paths: |
            {
              "usr" : ["secret/google", "username"],
              "pass" : ["secret/google", "password"],
              "creds" : ["secret/multipleCredentials"]
            }
          # Make sure you don't provide a duplicate key and follow conventions of a JSON Object
            
      # Accessing returned values and setting them as env. variables      
      - env:
          usr: ${{ steps.secret.outputs.usr }}
          pass: ${{ steps.secret.outputs.pass }}
          email: ${{ fromJson(steps.secret.outputs.creds).email }}
          id: ${{ fromJson(steps.secret.outputs.creds).id }}     
```
