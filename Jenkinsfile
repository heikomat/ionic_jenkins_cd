pipeline {
  agent any
  stages {
    // 1
    stage('prepare') {
      steps {sh ':'}
    }

    // 2
    stage('test build') {
      steps {sh ':'}
    }

    stage('prepare build') {
      parallel {
        // 3
        stage("build base android app") {
          steps {sh ':'}
        }

        stage("build base ios app") {
          steps {sh ':'}
        }
      }
    }

    stage('build and deploy') {
      parallel {

        // 4
        stage('Android app') {
          stages {
            stage("setup build dependencies") {
              steps {sh ':'}
            }
            stage("prepare project") {
              steps {sh ':'}
            }
            stage("build") {
              steps {sh ':'}
            }
            stage("upload") {
              steps {sh ':'}
            }
          }
        }

        // 5
        stage('iOS app') {
          stages {
            stage("setup build dependencies") {
              steps {sh ':'}
            }
            stage("setup keychain and profile") {
              steps {sh ':'}
            }
            stage("prepare xcode project") {
              steps {sh ':'}
            }
            stage("build") {
              steps {sh ':'}
            }
            stage("upload") {
              steps {sh ':'}
            }
            stage("reset keychain") {
              steps {sh ':'}
            }
          }
        }
      }
    }

    // 6
    stage('cleanup') {
      steps {sh ':'}
    }
  }
}
