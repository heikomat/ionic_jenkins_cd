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
          BUILD_APP = BRANCH_IS_MASTER || env.BRANCH_NAME == 'both_build_test';

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
          agent {
            label "master"
          }

          steps {
            // we need the platform so that the ng run app:ionic-cordova command
            // can produce platform sepcific cordova code in www, and correctly
            // setup this code in the platform-folder
            unstash('node_modules');
            sh('npm run add_android');
            sh('npm run prepare_android');

            // these folders are all we need to later build the actual app
            stash(includes: 'www/, platforms/', name: 'base_android_build');
          }
          post {
            always {
              cleanup_workspace();
            }
          }
        }

        stage("build base ios app") {
          agent {
            label "master"
          }

          steps {
            // we need the platform so that the ng run app:ionic-cordova command
            // can produce platform sepcific cordova code in www, and correctly
            // setup this code in the platform-folder
            unstash('node_modules');
            sh('npm run add_ios');
            sh('npm run prepare_ios');

            // these folders are all we need to later build the actual app
            stash(includes: 'www/, platforms/', name: 'base_ios_build');
          }
          post {
            always {
              cleanup_workspace();
            }
          }
        }
      }
    }

    stage('build and deploy') {
      when {
        expression {BUILD_APP}
      }
      parallel {

        // 4
        stage('Android app') {
          agent {
            label "docker"
          }
          stages {
            stage("setup build dependencies") {
              steps {
                unstash('base_android_build');
                // the docker plugin automatically mounts the current folder als workind directory,
                // so we need to neither mount it ourselves, nor define the workdir ourselves.
                // see for mor info: https://github.com/jenkinsci/docker-plugin/issues/561
                dir("${env.WORKSPACE}/platforms/android") {
                  script {
                    // create gradlew file in the android project folder. This is needed by fastlane
                    docker
                      .image('amsitoperations/ams-android-gradle')
                      .inside() { c ->
                      sh 'gradle wrapper';
                    }
                  }
                }
              }
            }
            stage("prepare project") {
              steps {
                script {
                  docker
                    .image('bigoloo/gitlab-ci-android-fastlane')
                    // we run as root inside the docker container
                    .inside('--user=0:0') { c ->
                      sh ("""
                        APP_VERSION=${PACKAGE_VERSION} \
                        BUILD_NUMBER=${BUILD_NUMBER} \
                        fastlane prepare_android
                      """);
                  }
                }
              }
            }
            stage("build") {
              steps {
                script {
                  CURRENT_USER = sh (script: "id -u", returnStdout: true).trim();
                  CURRENT_GROUP = sh (script: "id -g", returnStdout: true).trim();
                  
                  withCredentials([
                    file(credentialsId: 'android_keystore', variable: 'KEYSTORE_FILE'),
                    string(credentialsId: 'android_keystore_password', variable: 'KEYSTORE_PASSWORD'),
                    string(credentialsId: 'android_signing_key_alias', variable: 'SIGNING_KEY_ALIAS'),
                    string(credentialsId: 'android_singing_key_password', variable: 'SIGNING_KEY_PASSWORD'),
                  ]) {
                    sh "cp ${KEYSTORE_FILE} ${env.WORKSPACE}/android.keystore";
                    docker
                      .image('bigoloo/gitlab-ci-android-fastlane')
                      // we run as root inside the docker container
                      .inside("--volume=\"${env.WORKSPACE}@tmp/secretFiles\" --user=0:0") { c ->
                        sh("""
                          KEYSTORE_FILE="${env.WORKSPACE}/android.keystore" \
                          KEYSTORE_PASSWORD=${KEYSTORE_PASSWORD} \
                          SIGNING_KEY_ALIAS=${SIGNING_KEY_ALIAS} \
                          SIGNING_KEY_PASSWORD=${SIGNING_KEY_PASSWORD} \
                          fastlane build_android
                        """)
                        
                        // make the build be accessible for the user outside the docker container.
                        // without this, building and workspace-cleanup won't work
                        sh "chown -R ${CURRENT_USER}:${CURRENT_GROUP} ./platforms/android/*";
                        sh "chown -R ${CURRENT_USER}:${CURRENT_GROUP} ./platforms/android/.*";
                    }
                  }
                }
              }
            }
            stage("upload") {
              steps {
                script {

                  withCredentials([
                    file(credentialsId: 'google_play_service_account', variable: 'GOOGLE_PLAY_SERVICE_ACCOUNT'),
                  ]) {
                    docker
                      .image('bigoloo/gitlab-ci-android-fastlane')
                      // we run as root inside the docker container
                      .inside('--user=0:0') { c ->
                        sh "GOOGLE_PLAY_SERVICE_ACCOUNT=${GOOGLE_PLAY_SERVICE_ACCOUNT} fastlane upload_android";
                    }
                  }
                }
              }
            }
          }
          post {
            always {
              cleanup_workspace();
            }
          }
        }

        // 5
        stage('iOS app') {
          agent {
            label "fastlane-ios"
          }
          stages {
            stage("setup build dependencies") {
              steps {
                sh("bundle install");
              }
            }
            stage("setup keychain and profile") {
              steps {
                // cleanup distribution environment
                // make sure the provisioning profile folder exists
                sh("mkdir -p ~/Library/MobileDevice/Provisioning\\ Profiles");

                // uninstall all provisioning profiles and previous build certificates
                sh("rm -f ~/Library/MobileDevice/Provisioning\\ Profiles/*");
                sh("security delete-keychain deploy_demo_build.keychain || :");

                withCredentials([
                  file(credentialsId: 'ios_provisioning_profile', variable: 'PROVISIONING_PROFILE_FILE'),
                  file(credentialsId: 'ios_distribution_certificate_and_key', variable: 'DISTRIBUTION_CERTIFICATE_FILE'),
                  string(credentialsId: 'ios_distribution_certificate_key_password', variable: 'DISTRIBUTION_CERTIFICATE_PASSWORD'),
                ]) {
                  script {
                    // setup the singing certificate
                    // see https://stackoverflow.com/a/19550453 on using a new keychain just for the build
                    def TEMP_KEYCHAIN_PASSWORD = 'sandbox-gondola-majority';
                    sh("security create-keychain -p ${TEMP_KEYCHAIN_PASSWORD} deploy_demo_build.keychain");
                    sh("security list-keychains -s ~/Library/Keychains/deploy_demo_build.keychain");
                    sh("security default-keychain -s ~/Library/Keychains/deploy_demo_build.keychain");

                    // install the certificate and keep the keychain for this build unlocked
                    sh("security import ${DISTRIBUTION_CERTIFICATE_FILE} -k deploy_demo_build.keychain -P ${DISTRIBUTION_CERTIFICATE_PASSWORD} -A");
                    sh("security unlock-keychain -p \"${TEMP_KEYCHAIN_PASSWORD}\" deploy_demo_build.keychain");
                    sh("security set-keychain-settings -t 3600 -l deploy_demo_build.keychain");

                    // make it so that xcode can use the keychain non-interactively
                    // see https://apple.stackexchange.com/a/285320
                    def certificate_identity = sh(script: "security find-identity -v -p codesigning \"deploy_demo_build.keychain\" | head -1 | grep '\"' | sed -e 's/[^\"]*\"//' -e 's/\".*//'", returnStdout: true).trim(); // Programmatically derive the identity
                    sh("security set-key-partition-list -S apple-tool:,apple: -s -k ${TEMP_KEYCHAIN_PASSWORD} -D \"${certificate_identity}\" -t private deploy_demo_build.keychain"); // Enable codesigning from a non user interactive shell

                    // install the provisioning profile
                    // see https://gist.github.com/benvium/2568707 for how to install provisioning profiles from command line
                    PROVISIONING_PROFILE_ID = sh(script: "/usr/libexec/PlistBuddy -c 'Print :UUID' /dev/stdin <<< \$(security cms -D -i ${PROVISIONING_PROFILE_FILE})_", returnStdout: true).trim();
                    sh("cp \"${PROVISIONING_PROFILE_FILE}\" ~/Library/MobileDevice/Provisioning\\ Profiles/${PROVISIONING_PROFILE_ID}.mobileprovision");
                  }
                }
              }
            }
            stage("prepare xcode project") {
              steps {
                unstash('base_ios_build');

                withCredentials([
                  file(credentialsId: 'ios_provisioning_profile', variable: 'PROVISIONING_PROFILE_FILE'),
                ]) {
                  script {
                    def apple_team_id = sh(script: "/usr/libexec/PlistBuddy -c 'Print :TeamIdentifier:0' /dev/stdin <<< \$(security cms -D -i ${PROVISIONING_PROFILE_FILE})_", returnStdout: true).trim();

                    sh("""\
                      PROVISIONING_PROFILE_FILE="${PROVISIONING_PROFILE_FILE}" \
                      APPLE_TEAM_ID=${apple_team_id} \
                      APP_VERSION=${PACKAGE_VERSION} \
                      BUILD_NUMBER=${BUILD_NUMBER} \
                      bundle exec fastlane prepare_ios
                    """);
                  }
                }
              }
            }
            stage("build") {
              steps {
                script {
                  sh("""\
                    PROVISIONING_PROFILE_ID="${PROVISIONING_PROFILE_ID}" \
                    bundle exec fastlane build_ios
                  """);
                }
              }
            }
            stage("upload") {
              steps {
                withCredentials([
                  usernamePassword(credentialsId: 'ios_distribution_appstore_user', usernameVariable: 'APPSTORE_USER', passwordVariable: 'APPSTORE_PASSWORD'),
                ]) {

                  script {
                    sh("""\
                      APPSTORECONNECT_USER=${APPSTORE_USER} \
                      FASTLANE_PASSWORD="${APPSTORE_PASSWORD}" \
                      FASTLANE_ITC_TEAM_ID=${APPSTORECONNECT_TEAMID} \
                      bundle exec fastlane upload_ios
                    """);
                  }
                }
              }
            }
            stage("reset keychain") {
              steps {
                // revert to the regular default keychain
                sh("security list-keychains -s ~/Library/Keychains/login.keychain");
                sh("security default-keychain -s login.keychain");
              }
            }
          }
          post {
            always {
              cleanup_workspace();
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

  post {
    always {
      script {
        cleanup_workspace();
      }
    }
  }
}
