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

        // 4
        stage("prepare android build env") {
          steps {sh ':'}
        }

        stage("prepare ios build env") {
          steps {sh ':'}
        }
      }
    }

    stage('build and deploy') {
      parallel {

        // 5
        stage('Android app') {
          stages {
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

        // 6
        stage('iOS app') {
          stages {
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

    // 7
    stage('cleanup') {
      steps {sh ':'}
    }
  }
}
