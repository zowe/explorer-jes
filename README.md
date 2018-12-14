# explorer-jes

[![Code Quality](https://jayne.zowe.org:9000/api/project_badges/measure?project=zowe%3Aexplorer-jes&metric=alert_status)](https://jayne.zowe.org:9000/dashboard/index/zowe:explorer-jes)

**Pre reqs**
```
npm install
```

**Development:**
```
npm run dev 
GOTO: localhost:8080
```
**Production:**
```
npm run prod
```

**Run SonarQube Code Analysis**

Install [SonarQube Scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner).

If you are using Mac, try install with [HomeBrew sonar-scanner formula](https://formulae.brew.sh/formula/sonar-scanner), then update the configuration of SonarQube server at `/usr/local/Cellar/sonar-scanner/<version>/libexec/conf/sonar-scanner.properties`.

Example scanner configurations:

```
sonar.host.url=https://jayne.zowe.org:9000
sonar.login=<hash>
```

Then you can run `sonar-scanner` to start code analysis.

Build pipeline has embedded the SonarQube code analysis stage.
