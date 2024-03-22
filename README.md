# Pre-release to release
pre2release is an action to automatically finds repository's latest pre-release and converts it to a release and set the release as `latest`

## Action Parameters

```YAML
- name: 'Get json subbed'
  id: subbed
  uses: "snsinahub-org/pre2release@v2.0.0"
  with:
  
    # List of variables
    
    # Required: false
    # Default: ${{ github.repository }}
    repo: ${{ github.repository }}
    
    # Required: false
    # Default: ${{ github.token }}
    token: ${{ github.token }}
    
        
    # Description:  You can add a prefix to semver e.g. v2.0.0 
    # Required: false
    # Default: ''
    prefix: ''
    
    
    
    # Description: make a release pre-release if the value is yes
    # Required: false
    # Default: 'no'
    # Accepted values: no, yes
    prerelease:

    # Description: returns latest version if set to 'false' and throws error if set to 'true' and newest release tag is not pre-release
    # Required: false
    # Default: 'true'
    # Accepted values: 'false', 'true'
    REQUIRE_PRERELEASE:
    
    
```

## Output
```YAML
  # Return latest version tag
  version: 
```

## Example
```YAML
name: pre2release
description: pre2release@v2.0.0
on:
  workflow_dispatch:
  
jobs:
  without_prep:
    name: subs
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v3                 
      - uses: actions/setup-node@v3
        with:
          node-version: 16      
      - name: 'Convert pre-release to release'
        id: version
        uses: "snsinahub-org/pre2release@v2.0.0"
        with:          
          prefix: 'v'
          REQUIRE_PRERELEASE: 'true'
      - name: 'print version'
        run: |
         echo ${{ steps.version.outputs.version }}
         echo ${{ steps.version.outputs.version }} >> $GITHUB_STEP_SUMMARY
```
