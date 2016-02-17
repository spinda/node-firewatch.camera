'use strict';

const async = require('async');
const request = require('request');

const firewatchCameraSite = 'https://www.firewatch.camera/';
const cameraRollPrefix = firewatchCameraSite;
const apiPrefix = firewatchCameraSite + 'api/v1/';

const apiHttpHeaders = {
  'User-Agent': 'UnityPlayer/5.2.4f1 (http://unity3d.com)',
  'X-Unity-Version': '5.2.4f1',
};

const maxPhotoCount = 18;
exports.maxPhotoCount = maxPhotoCount;

function uploadCameraRoll (email, photos, cb, onProgress) {
  if (Array.isArray(email)) {
    onProgress = cb;
    cb = photos;
    photos = email;
    email = '';
  }

  if (!onProgress) {
    onProgress = function () {};
  }

  photos = Array.prototype.slice.call(photos);
  photos.reverse();

  if (photos.length > maxPhotoCount) {
    cb(new TooManyPhotosError(photos.length));
    return;
  }

  createCameraRoll(email, function (err, key) {
    if (err) {
      cb(err);
      return;
    }

    uploadPhotos(key, photos, onProgress, function (err) {
      if (err) {
        cb(err);
        return;
      }

      finalizeCameraRoll(key, function (err) {
        if (err) {
          cb(err);
          return;
        }

        cb(null, `${cameraRollPrefix}${key}/`);
      });
    });
  });
}
exports.uploadCameraRoll = uploadCameraRoll;

function createCameraRoll (email, cb) {
  makeApiRequest('roll/create/form', {email: email}, function (err, body) {
    if (err) {
      cb(err);
    } else {
      cb(null, body.trim());
    }
  });
}

function uploadPhotos (key, photos, onProgress, cb) {
  async.forEachOfSeries(photos,
    uploadPhoto.bind(null, key, photos.length, onProgress),
    cb);
}

function uploadPhoto (key, total, onProgress, photo, index, cb) {
  makeApiRequest(`roll/${key}/upload_photo`, {
    index: maxPhotoCount - index - 1,
    photo: {
      value: photo,
      options: {
        filename: 'photo',
        contentType: 'image/jpeg',
      },
    },
  }, function (err) {
    if (err) {
      cb(err);
    } else {
      onProgress(index + 1, total);
      cb();
    }
  });
}

function finalizeCameraRoll (key, cb) {
  makeApiRequest(`roll/${key}/complete`, {success: 1}, cb);
}

function makeApiRequest (path, form, cb) {
  const options = {
    headers: apiHttpHeaders,
    url: apiPrefix + path,
    method: 'POST',
    formData: form,
  };

  request(options, function (err, response, body) {
    if (err) {
      cb(err);
    } else if (response.statusCode !== 200) {
      cb(new FirewatchApiError(response, body));
    } else {
      cb(null, body);
    }
  });
}

class CustomError extends Error {
  constructor (message) {
    super(message);

    Object.defineProperty(this, 'message', {
      enumerable: false,
      value: message,
    });
    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: this.constructor.name,
    });

    Error.captureStackTrace(this, this.constructor);
  }
}

class TooManyPhotosError extends CustomError {
  constructor (photoCount) {
    super(`A camera roll can contain up to ${maxPhotoCount} photos, but ` +
      `${photoCount} were supplied`);

    Object.defineProperty(this, 'photoCount', {
      enumerable: false,
      value: photoCount,
    });
  }
}
exports.TooManyPhotosError = TooManyPhotosError;

class FirewatchApiError extends CustomError {
  constructor (response, body) {
    let message =
      `Bad status code ${response.statusCode} from firewatch.camera API`;
    let bodyJson = null;

    if (response.headers['content-type'] === 'application/json') {
      try {
        bodyJson = JSON.parse(body);
      } catch (_) {
        // If it's not valid JSON, just silently ignore it.
      }
    }

    let apiError = null;
    if (bodyJson && bodyJson.error) {
      apiError = bodyJson.error;
      message += `: ${apiError}`;
    }

    super(message);

    Object.defineProperty(this, 'response', {
      enumerable: false,
      value: response,
    });

    Object.defineProperty(this, 'body', {
      enumerable: false,
      value: body,
    });

    Object.defineProperty(this, 'statusCode', {
      enumerable: false,
      value: response.statusCode,
    });

    if (bodyJson) {
      Object.defineProperty(this, 'bodyJson', {
        enumerable: false,
        value: bodyJson
      });
    }

    if (apiError) {
      Object.defineProperty(this, 'apiError', {
        enumerable: false,
        value: apiError
      });
    }
  }
}
exports.FirewatchApiError = FirewatchApiError;

