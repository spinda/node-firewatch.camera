#!/usr/bin/env node

"use strict";

const fs = require('fs');
const firewatch = require('../index');

let photoFiles = process.argv.slice(2);

if (photoFiles.length < 1 || photoFiles.length > firewatch.maxPhotoCount) {
  console.error(`Usage: firewatch.camera <photos...>
  where <photos...> is a list of JPEG photo files to upload to firewatch.camera
  (up to ${firewatch.maxPhotoCount} photos)`);
  process.exit(1);
}

photoFiles.forEach(function (photoFile) {
  try {
    fs.accessSync(photoFile, fs.R_OK);
  } catch (e) {
    console.error(`Can't read ${photoFile} (does it exist?)\n`);
    console.error(e.stack);
    process.exit(1);
  }
});

const photoStreams = photoFiles.map(function (photoFile) {
  return fs.createReadStream(photoFile)
});

firewatch.uploadCameraRoll(photoStreams, function (err, url) {
  if (err) {
    console.error('Uh oh, something went wrong!\n');
    console.error(err.stack);
  } else {
    console.log('\nDone! Your photos are here:\n', url);
  }
}, function (num_uploaded, total_photos) {
  console.log(`Uploaded ${num_uploaded}/${total_photos} photos`);
});

