# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
jobs:
  get_credentials:
    # Make sure you are running on a self-hosted runner
    runs-on: self-hosted 
    name: An action to fetch credentials # You can name this anything you like
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      # Name this step anything you like
      - name: Fetching credentials from vault 
      id: secret
      uses: actions/actions-vault-kv@v1
      with:
        # Provide your valid Role ID and Secret ID
        ROLE_ID: 12345678-9123-abcd-wzys-0123456789ab # Your Role ID here
        SECRET_ID: 12345678-9123-abcd-wzys-0123456789ab # Your Secret ID here
        secret-paths: |
        {
           "usr" : ["secret/hello-world/user-pass", "username"],
           "pass" : ["secret/hello-world/user-pass", "password"],
           "id" : ["secret/hello-world/id"]
        }
```
