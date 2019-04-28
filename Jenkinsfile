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


node('ibm-jenkins-slave-nvm') {
  def lib = library("jenkins-library@classes").org.zowe.jenkins_shared_library

  def pipeline = lib.pipelines.nodejs.NodeJSPipeline.new(this)

  pipeline.admins.add("jackjia")

  pipeline.setup(
    packageName: 'org.zowe.explorer-jes',
    github: [
      email                      : 'zowe.robot@gmail.com',
      usernamePasswordCredential : 'zowe-robot-github',
    ],
    artifactory: [
      url                        : 'https://gizaartifactory.jfrog.io/gizaartifactory',
      usernamePasswordCredential : 'GizaArtifactory',
    ],
    installRegistries: [
      [
        email                      : 'giza-jenkins@gmail.com',
        usernamePasswordCredential : 'GizaArtifactory',
        registry                   : 'https://gizaartifactory.jfrog.io/gizaartifactory/api/npm/npm-release/',
      ]
    ],
    publishRegistry: [
      email                      : 'giza-jenkins@gmail.com',
      usernamePasswordCredential : 'GizaArtifactory',
    ]
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
      coberturaReportFile       : "coverage/cobertura-coverage.xml"
    ],
    htmlReports   : [
      [dir: "coverage/lcov-report", files: "index.html", name: "Report: Code Coverage"],
    ],
  )

  // define we need publish stage
  pipeline.publish(
    operation: {
        echo "prepare pax workspace..."
        sh "scripts/prepare-pax-workspace.sh"

        def packageName = (pipeline.packageInfo && pipeline.packageInfo['name']) ? pipeline.packageInfo['name'] : 'explore-jes'
        echo "creating pax file from workspace..."
        pax = lib.package.Pax.new(this)
        if (!pax) {
            error 'Failed to initialize package/Pax instance.'
        }
        pax.init([
            'sshHost'          : 'river.zowe.org',
            'sshPort'          : 2022,
            'sshCredential'    : 'ssh-zdt-test-image-guest',
            'localWorkspace'   : './pax-workspace',
            'remoteWorkspace'  : '/zaas1/buildWorkspace',
        ])
        def result = pax.pack(
          job: "${packageName}-packaging",
          filename: "${packageName}.pax",
          paxOptions: '-x os390',
        )
        echo "Packaged: ${result}"
    },
    artifacts: [
      './pax-workspace/explorer-jes.pax'
    ]
  )

  // define we need release stage
  pipeline.release()

  pipeline.end()
}
