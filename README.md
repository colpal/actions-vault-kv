# actions-vault-kv
A library to get credentials from HashiCorp Vault

## Usage
```yaml
jobs:
  get_credentials: #You can name this anything you like
    runs-on: self-hosted #**Make sure you are running on a self-hosted runner**
    name: An action to fetch credentials #You can name this anything you like
    steps:
      - name: Checkout
        uses: actions/checkout@v2
```
