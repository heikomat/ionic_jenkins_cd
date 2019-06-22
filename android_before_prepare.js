#!/usr/bin/env node

/**
 * see these links for more infos on how cordova hooks work:
 * https://cordova.apache.org/docs/en/latest/guide/appdev/hooks/index.html
 * 
 * and on what we do in this hook:
 * https://cordova.apache.org/docs/en/latest/guide/platforms/android/#setting-gradle-properties
 */
const {promises: fsPromises} = require('fs');
const path = require('path');

module.exports = function (context) {
  const rootFolder = context.opts.projectRoot;
  const source = path.join(rootFolder, 'build-extras.gradle')
  const target = path.join(rootFolder, 'platforms', 'android', 'build-extras.gradle')
  return fsPromises.copyFile(source, target);
}
