# explorer-jes

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=zowe_explorer-jes&metric=alert_status)](https://sonarcloud.io/dashboard?id=zowe_explorer-jes)

The issues for the JES explorer are tracked under the Zowe Zlux repository, https://github.com/zowe/zlux and tagged accordingly with the 'explorer-jes' label. Open issues tagged with 'explorer-jes' can be found [here](https://github.com/zowe/zlux/issues?q=is%3Aopen+is%3Aissue+label%3Aexplorer-jes).

# Configure NPM Registry

This is required for explorer-ui-server and orion editor component because they are published only on Zowe Artifactory.

```
npm config set registry https://zowe.jfrog.io/zowe/api/npm/npm-release
```

# App Development Workflow 

### Install Dependencies

Configure your npm registry to pickup Zowe dependencies
```
npm config set registry https://zowe.jfrog.io/zowe/api/npm/npm-release/
npm install
```

### Build for Development

Modify the host variable in WebContent/js/utilities/urlUtils.js to a host and port that has the Zowe Jobs API server available

```
npm run dev 
```

Then you can visit http://localhost:8080 to test.
When testing you may see errors with API calls do to CORS (Cross origin resource sharing), to work around this you may disable CORS checking in your browser for local development. 

### Run unit tests

```
npm run test
```

### Run fvt/selenium tests

See [README](/tests/FVTTests/README.md)

### Build for Production

```
npm run prod
```

### Prepare for commit (Run linting, tests and production build)
```
npm run preCommit
```

### Prepare PAX Packaging Workspace

```
./scripts/prepare-workspace.sh
```

## Start With explorer-ui-server

After preparing PAX workspace, you can serve the explorer UI with explorer-ui-server:

```
node .pax/ascii/server/src/index.js --config .pax/ascii/server/configs/config.json
```

## Run SonarQube Code Analysis

Install [SonarQube Scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner).

If you are using Mac, try install with [HomeBrew sonar-scanner formula](https://formulae.brew.sh/formula/sonar-scanner), then update the configuration of SonarQube server at `/usr/local/Cellar/sonar-scanner/<version>/libexec/conf/sonar-scanner.properties`.

Example scanner configurations:

```
sonar.host.url=https://jayne.zowe.org:9000
sonar.login=<hash>
```

Then you can run `sonar-scanner` to start code analysis.

Build pipeline has embedded the SonarQube code analysis stage.


# ZLUX App Development Workflow


## Download:

```
cd /path/to/zlux
git clone https://github.com/zowe/explorer-jes.git
cd explorer-jes
npm install
npm run build
```

## Registering Plugin with Zowe Desktop 
### Add Plugin Locator
Add file `org.zowe.explorer-jes.json` to `/path/to/zlux-app-server/plugins`

```
{
    "identifier": "org.zowe.explorer-jes",
    "pluginLocation": "../../explorer-jes"
}
```

### Ant Deploy:

```
cd /path/to/zlux-build
ant deploy
```