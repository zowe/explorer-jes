#!groovy

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */


node('ibm-jenkins-slave-dind') {
  def lib = library("jenkins-library").org.zowe.jenkins_shared_library

  def pipeline = lib.pipelines.nodejs.NodeJSPipeline.new(this)

  pipeline.admins.add("jackjia", "jcain")

  // build parameters for FVT test
  pipeline.addBuildParameters(
    string(
      name: 'FVT_API_ARTIFACT',
      description: 'Jobs API artifact download pattern',
      defaultValue: 'libs-release-local/org/zowe/explorer/jobs/jobs-zowe-server-package/*/jobs-zowe-server-package-*.zip',
      trim: true,
      required: true
    ),
    string(
      name: 'FVT_ZOSMF_HOST',
      description: 'z/OSMF server for integration test',
      defaultValue: 'river.zowe.org',
      trim: true,
      required: true
    ),
    string(
      name: 'FVT_ZOSMF_PORT',
      description: 'z/OSMF port for integration test',
      defaultValue: '10443',
      trim: true,
      required: true
    ),
    credentials(
      name: 'FVT_ZOSMF_CREDENTIAL',
      description: 'The SSH credential used to connect to z/OSMF for integration test',
      credentialType: 'com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl',
      defaultValue: 'ssh-zdt-test-image-guest',
      required: true
    ),
    string(
      name: 'FVT_JOBNAME',
      description: 'Job name for integration test',
      defaultValue: 'ZOWESVR',
      trim: true,
      required: true
    ),
    string(
      name: 'FVT_SERVER_HOSTNAME',
      description: 'Server hostname for integration test',
      defaultValue: 'fvt-test-server',
      trim: true,
      required: true
    )
  )

  pipeline.setup(
    packageName: 'org.zowe.explorer-jes',
    github: [
      email                      : lib.Constants.DEFAULT_GITHUB_ROBOT_EMAIL,
      usernamePasswordCredential : lib.Constants.DEFAULT_GITHUB_ROBOT_CREDENTIAL,
    ],
    artifactory: [
      url                        : lib.Constants.DEFAULT_LFJ_ARTIFACTORY_URL,
      usernamePasswordCredential : lib.Constants.DEFAULT_LFJ_ARTIFACTORY_ROBOT_CREDENTIAL,
    ],
    pax: [
      sshHost                    : lib.Constants.DEFAULT_PAX_PACKAGING_SSH_HOST,
      sshPort                    : lib.Constants.DEFAULT_PAX_PACKAGING_SSH_PORT,
      sshCredential              : lib.Constants.DEFAULT_PAX_PACKAGING_SSH_CREDENTIAL,
      remoteWorkspace            : lib.Constants.DEFAULT_PAX_PACKAGING_REMOTE_WORKSPACE,
    ],
    installRegistries: [
      [
        email                      : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_EMAIL,
        usernamePasswordCredential : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_CREDENTIAL,
        registry                   : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_INSTALL,
      ]
    ],
    publishRegistry: [
      email                      : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_EMAIL,
      usernamePasswordCredential : lib.Constants.DEFAULT_LFJ_NPM_PRIVATE_REGISTRY_CREDENTIAL,
    ],
    // FIXME: ideally this should set to false (using default by remove this line)
    ignoreAuditFailure            : true,
    // FIXME: npm version in ibm-jenkins-slave-dind is too old, doesn't support "npm ci"
    alwaysUseNpmInstall           : true

  )

  // we have a custom build command
  pipeline.build(
    operation: {
      ansiColor('xterm') {
        sh "npm run prod"
      }
    }
  )

  pipeline.test(
    name          : 'Unit',
    junit         : "target/report.xml",
    cobertura     : [
      coberturaReportFile       : "coverage/cobertura-coverage.xml",
      // if coverage check failed, the pipeline will be marked as UNSTABLE, which
      // will block publish/release. So we overwrite default and set to false here.
      // FIXME: ideally this should set to true (using default by remove this line)
      autoUpdateStability       : false,
      fileCoverageTargets       : '100, 0, 0',
      classCoverageTargets      : '85, 0, 0',
      methodCoverageTargets     : '80, 0, 0',
      lineCoverageTargets       : '80, 0, 0',
      conditionalCoverageTargets: '70, 0, 0',
    ],
    htmlReports   : [
      [dir: "coverage/lcov-report", files: "index.html", name: "Report: Code Coverage"],
    ],
  )

  pipeline.test(
    name          : 'Integration',
    operation     : {
      echo "Preparing server for integration test ..."
      ansiColor('xterm') {
        // prepare environtment for integration test
        sh "./scripts/prepare-fvt.sh \"${params.FVT_API_ARTIFACT}\" \"${params.FVT_ZOSMF_HOST}\" \"${params.FVT_ZOSMF_PORT}\""
      }
      // run tests
      sh 'docker ps'
      // wait a while to give time for service to be started
      sleep time: 1, unit: 'MINUTES'

      echo "Starting integration test ..."
      timeout(time: 60, unit: 'MINUTES') {
        withCredentials([
          usernamePassword(
            credentialsId: params.FVT_ZOSMF_CREDENTIAL,
            passwordVariable: 'PASSWORD',
            usernameVariable: 'USERNAME'
          )
        ]) {
          ansiColor('xterm') {
            sh """
ZOWE_USERNAME=${USERNAME} \
ZOWE_PASSWORD=${PASSWORD} \
ZOWE_JOB_NAME=${params.FVT_JOBNAME} \
SERVER_HOST_NAME=${params.FVT_SERVER_HOSTNAME} \
SERVER_HTTPS_PORT=7554 \
npm run test:fvt
"""
          }
        }
      }
    },
    junit         : "target/*.xml",
  )

  // we need sonar scan
  // failBuild set to false whilst investigating https://github.com/zowe/zlux/issues/285
  pipeline.sonarScan(
    scannerTool     : lib.Constants.DEFAULT_LFJ_SONARCLOUD_SCANNER_TOOL,
    scannerServer   : lib.Constants.DEFAULT_LFJ_SONARCLOUD_SERVER,
    allowBranchScan : lib.Constants.DEFAULT_LFJ_SONARCLOUD_ALLOW_BRANCH,
    failBuild       : false
  )

  // we have pax packaging step
  pipeline.packaging(name: 'explorer-jes')

  // define we need publish stage
  pipeline.publish(
    operation: {
      echo "Default npm publish will be skipped."
    },
    artifacts: [
      '.pax/explorer-jes.pax'
    ]
  )

  // define we need release stage
  pipeline.release()

  pipeline.end()
}
