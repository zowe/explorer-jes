# explorer-jes

[![Code Quality](https://jayne.zowe.org:9000/api/project_badges/measure?project=zowe%3Aexplorer-jes&metric=alert_status)](https://jayne.zowe.org:9000/dashboard/index/zowe:explorer-jes)

## Build 

### Install Dependencies

```
npm install
```

### Build for Development

```
npm run dev 
```

Then you can visit http://localhost:8080 to test.


### Build for Production

```
npm run prod
```

### Prepare PAX Packaging Workspace

```
./scripts/prepare-pax-workspace.sh
```

## Start With explorer-ui-server

After preparing PAX workspace, you can serve the explorer UI with explorer-ui-server:

```
node pax-workspace/ascii/server/src/index.js --config pax-workspace/ascii/server/configs/config.json
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
