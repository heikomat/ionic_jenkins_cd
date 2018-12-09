def cleanup_workspace() {
  cleanWs()
  dir("${env.WORKSPACE}@tmp") {
    deleteDir()
  }
  dir("${env.WORKSPACE}@script") {
    deleteDir()
  }
  dir("${env.WORKSPACE}@script@tmp") {
    deleteDir()
  }
}

pipeline {
  agent any
  // only required if you actually use node in the build process
  tools {
    nodejs 'node-lts'
  }
  environment {
    NODE_JS_VERSION = 'node-lts' // so we use the same node version throughout the pipeline
    APPSTORECONNECT_TEAMID = '1310680'// only required if build for iOS
  }

  stages {
    // 1
    stage('prepare') {
      steps {
        script {
          // get the package version
          PACKAGE_VERSION = sh(
            script: 'node --print --eval "require(\'./package.json\').version"',
            returnStdout: true
          ).trim();

          echo("Package version is '${PACKAGE_VERSION}'");

          // Define when to build the app
          BRANCH_IS_MASTER = env.BRANCH_NAME == 'master';
          BUILD_APP = BRANCH_IS_MASTER;

          // prepare dependencies to use when setting up the android/ios projects
          nodejs(nodeJSInstallationName: env.NODE_JS_VERSION) {
            sh('npm install');
          }

          stash(includes: 'node_modules/', name: 'node_modules');
        }
      }
    }

    // 2
    /**
      * just run a dev build if we're not on master, so that every commit gets
      * at least built once. we don't do a production build here, because
      * dev-builds are fast, while production builds take a lot of ressources
      */
    stage('test build') {
      when {
        expression {!BUILD_APP}
      }
      steps {
        unstash('node_modules');
        sh ('npm run build');
      }
    }

    stage('prepare build') {
      when {
        expression {BUILD_APP}
      }
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
