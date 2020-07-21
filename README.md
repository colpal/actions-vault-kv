# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
jobs:
  get_credentials:
    #<b>Make sure you are running on a self-hosted runner</b>
    runs-on: self-hosted 
    name: An action to fetch credentials #You can name this anything you like
    steps:
      - name: Checkout
        uses: actions/checkout@v2
```
