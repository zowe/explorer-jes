# explorer-jes

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=zowe_explorer-jes&metric=alert_status)](https://sonarcloud.io/dashboard?id=zowe_explorer-jes)

The issues for the JES explorer are tracked under the Zowe Zlux repository, https://github.com/zowe/zlux and tagged accordingly with the 'explorer-jes' label. Open issues tagged with 'explorer-jes' can be found [here](https://github.com/zowe/zlux/issues?q=is%3Aopen+is%3Aissue+label%3Aexplorer-jes).


# App Development Workflow 

### Install Dependencies

As following modules 
 `explorer-ui-server`, `orion-editor-component` and `explorer-fvt-utilities` are published on Zowe Artifactory.
 `.npmrc` file is pre-configured with registry value of `https://zowe.jfrog.io/zowe/api/npm/npm-release`
```
npm install
```

### Build for Development

Modify the `proxy.target` property in `package.json` to a host and port that has the Zowe Jobs API server available (i.e. like the API ML Gateway)

```
npm run dev 
```

Then you can visit https://localhost:8080 to test.
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
./.pax/prepare-workspace.sh
```

## Start With explorer-ui-server

After preparing PAX workspace, you can serve the explorer UI with explorer-ui-server:

```
node .pax/ascii/src/index.js --config .pax/ascii/configs/config.json
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


## Build and install as plugin in local zlux development environment

Modify `explorer-jes/Webcontent/index.html`   
Change relative path for `iframe-adapter.js` & `logger.js` to absolute path.   
Append with your `API Gateway` `Hostname` and `Port`

For example:
```
  <script type="text/javascript" src="https://mymainframe.com:7554/ui/v1/zlux/lib/org.zowe.zlux.logger/0.9.0/logger.js"></script>
  <script type="text/javascript" src="https://mymainframe.com:7554/ui/v1/zlux/ZLUX/plugins/org.zowe.zlux.bootstrap/web/iframe-adapter.js"></script>
```

Build web folder
```
cd explorer-jes
# root folder
npm install
# This will create web folder
npm run build
```

Install as ZLUX App/Plugin
```
# install in zlux locally
cd zlux/zlux-app-server/bin
./install-app.sh <path-to-explorer-jes>
```
`explorer-jes` root already have sample `pluginDefinition.json` & will have `web` folder after `build`.


## Enable Redux logs
Either use [Redux Dev Tool Browser Extension](https://github.com/reduxjs/redux-devtools) in your browser 
Or enable redux logs by setting `enableReduxLogger` variable `true` in your local storage.

### Redux Logger - Enable/Disable
Use preferences menu on top right corner to turn on or off browser settings, and refresh browser to have settings take effect.
![Logger Preference](loggerPreference.jpg)

