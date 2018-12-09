#!/usr/bin/env groovy

pipeline {
  stages {
    // 1
    stage('prepare') {
      steps {
        sh(script: ':', returnStdout: true);
      }
    }

    // 2
    stage('test build') {
      steps {
        sh(script: ':', returnStdout: true);
      }
    }

    stage('prepare build') {
      parallel {
        // 3
        stage("build base android app") {
          steps {
            sh(script: ':', returnStdout: true);
          }
        }

        stage("build base ios app") {
          steps {
            sh(script: ':', returnStdout: true);
          }
        }

        // 4
        stage("prepare android build env") {
          steps {
            sh(script: ':', returnStdout: true);
          }
        }

        stage("prepare ios build env") {
          steps {
            sh(script: ':', returnStdout: true);
          }
        }
      }
    }

    stage('build and deploy') {
      parallel {

        // 5
        stage('Android app') {
          stages {
            stage("prepare project") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("build") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("upload") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
          }
          post {
            always {
              cleanup_workspace();
            }
          }
        }

        // 6
        stage('iOS app') {
          stages {
            stage("setup keychain and profile") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("prepare xcode project") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("build") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("upload") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
            stage("reset keychain") {
              steps {
                sh(script: ':', returnStdout: true);
              }
            }
          }
        }
      }
    }

    // 7
    stage('cleanup') {
      steps {
        script {
          sh(script: ':', returnStdout: true);
        }
      }
    }
  }
}
