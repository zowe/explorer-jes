#!groovy

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018
 */



@Library('zoe-jenkins-library') _

def isPullRequest = env.BRANCH_NAME.startsWith('PR-')

def opts = []
// keep last 20 builds for regular branches, no keep for pull requests
opts.push(buildDiscarder(logRotator(numToKeepStr: (isPullRequest ? '' : '20'))))
// disable concurrent build
opts.push(disableConcurrentBuilds())

// define custom build parameters
def customParameters = []
customParameters.push(credentials(
  name: 'NPM_CREDENTIALS_ID',
  description: 'npm auth token',
  credentialType: 'org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl',
  defaultValue: 'giza-jenkins-basicAuth',
  required: true
))
customParameters.push(string(
  name: 'NPM_USER_EMAIL',
  description: 'npm user email',
  defaultValue: 'giza-jenkins@gmail.com',
  trim: true
))
customParameters.push(string(
  name: 'ARTIFACTORY_SERVER',
  description: 'Artifactory server, should be pre-defined in Jenkins configuration',
  defaultValue: 'gizaArtifactory',
  trim: true
))
opts.push(parameters(customParameters))

// set build properties
properties(opts)

node ('jenkins-slave') {
  currentBuild.result = 'SUCCESS'
  def packageName
  def packageVersion

  try {

    stage('checkout'){
      // checkout source code
      checkout scm

      // check if it's pull request
      echo "Current branch is ${env.BRANCH_NAME}"
      if (isPullRequest) {
        echo "This is a pull request"
      }

      // get package information
      packageName = sh(script: "node -e \"console.log(require('./package.json').name)\"", returnStdout: true).trim()
      packageVersion = sh(script: "node -e \"console.log(require('./package.json').version)\"", returnStdout: true).trim()
      echo "Building ${packageName} v${packageVersion}..."
    }

    stage('prepare') {
      // show node/npm version
      sh 'node -v'
      sh 'npm -v'

      ansiColor('xterm') {
        // login to private npm registry
        def npmRegistry = 'https://gizaartifactory.jfrog.io/gizaartifactory/api/npm/npm-release/'
        npmLogin(npmRegistry, params.NPM_CREDENTIALS_ID, params.NPM_USER_EMAIL)

        // sh 'npm prune'
        sh 'npm ci'
      }
    }

    stage('test') {
      ansiColor('xterm') {
        sh 'npm run lint'
        sh 'npm run coverage'
        sh 'npm run coverageReport'

        junit 'target/report.xml'
        cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml',
          sourceEncoding: 'ASCII',
          autoUpdateHealth: false,
          autoUpdateStability: false,
          onlyStable: false,
          failUnhealthy: false,
          failUnstable: false,
          zoomCoverageChart: false,
          conditionalCoverageTargets: '70, 0, 0',
          lineCoverageTargets: '80, 0, 0',
          methodCoverageTargets: '80, 0, 0',
          maxNumberOfBuilds: 0
      }
    }

    stage('build') {
      ansiColor('xterm') {
        sh 'npm run prod'
      }
      //copy static files to dist directory
      sh 'cp -r ./WebContent/css ./dist/'
      sh 'cp -r ./WebContent/img ./dist/'
      sh 'cp ./WebContent/index.html ./dist/'
    }

    stage('publish') {
      // ===== publishing to jfrog npm registry ==============================
      // artifactory is pre-defined in Jenkins management
      def server = Artifactory.server params.ARTIFACTORY_SERVER
      def npmRegistry = sh(script: "node -e \"console.log(require('./package.json').publishConfig.registry)\"", returnStdout: true).trim()
      if (!npmRegistry || !npmRegistry.startsWith('http')) {
        error 'npm registry is not defined, or cannot be retrieved'
      }
      // login to private npm registry
      def npmUser = npmLogin(npmRegistry, params.NPM_CREDENTIALS_ID, params.NPM_USER_EMAIL)

      if (!params.NPM_RELEASE) {
        // show current git status for troubleshooting purpose
        // if git status is not clean, npm version will fail
        sh "git config --global user.email \"${params.NPM_USER_EMAIL}\""
        sh "git config --global user.name \"${npmUser}\""
        sh "git status"

        def buildIdentifier = getBuildIdentifier('%Y%m%d-%H%M%S', 'master', false)
        def newVersion = "${packageVersion}-snapshot.${buildIdentifier}"
        echo "ready to publish snapshot version v${newVersion}..."
        sh "npm version ${newVersion}"
        // publish
        sh 'npm publish --tag snapshot --force'
      } else {
        echo "ready to release v${packageVersion}"
        // publish
        sh 'npm publish'
      }
    }

    stage('done') {
      // send out notification
      emailext body: "Job \"${env.JOB_NAME}\" build #${env.BUILD_NUMBER} success.\n\nCheck detail: ${env.BUILD_URL}" ,
          subject: "[Jenkins] Job \"${env.JOB_NAME}\" build #${env.BUILD_NUMBER} success",
          recipientProviders: [
            [$class: 'RequesterRecipientProvider'],
            [$class: 'CulpritsRecipientProvider'],
            [$class: 'DevelopersRecipientProvider'],
            [$class: 'UpstreamComitterRecipientProvider']
          ]
    }

  } catch (err) {
    currentBuild.result = 'FAILURE'

    // catch all failures to send out notification
    emailext body: "Job \"${env.JOB_NAME}\" build #${env.BUILD_NUMBER} failed.\n\nError: ${err}\n\nCheck detail: ${env.BUILD_URL}" ,
        subject: "[Jenkins] Job \"${env.JOB_NAME}\" build #${env.BUILD_NUMBER} failed",
        recipientProviders: [
          [$class: 'RequesterRecipientProvider'],
          [$class: 'CulpritsRecipientProvider'],
          [$class: 'DevelopersRecipientProvider'],
          [$class: 'UpstreamComitterRecipientProvider']
        ]

    throw err
  }
}