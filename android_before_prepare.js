#!/usr/bin/env node

/**
 * see these links for more infos on how cordova hooks work:
 * https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/index.html
 * 
 * and on what we do in this hook:
 * https://cordova.apache.org/docs/en/latest/guide/platforms/android/#setting-gradle-properties
 */
const fs = require('fs')
const path = require('path');

module.exports = function(context) {
  var Q = context.requireCordovaModule('q');
  var deferral = new Q.defer();

  const rootFolder = context.opts.projectRoot;
  const source = path.join(rootFolder, 'build-extras.gradle')
  const target = path.join(rootFolder, 'platforms', 'android', 'build-extras.gradle')
  fs.copyFile(source, target, (error) => {
    if (error !== undefined && error !== null) {
      console.log(error);
      return deferral.reject(error);
    }

    deferral.resolve();
  });

  return deferral.promise;
}
