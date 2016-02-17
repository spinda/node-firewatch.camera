# firewatch.camera API client for Node.js

Have you seen [Firewatch][1]? It's a really good game by [Campo Santo][2] and
[Panic][3]. You should play it!

In the game, the protagonist, Henry, finds a disposable camera with 18 pictures
left on the roll. You can take pictures of things you find in the world, and at
the end you can upload them to [firewatch.camera][4]. They can be shared,
downloaded, and&mdash;most interestingly&mdash;physically printed and mailed to
you in a classic-style "Fotodome" envelope. I think that's pretty cool!

After uploading my own in-game camera roll, I wondered if this would work for
any random image on my PC. For fun, I reverse engineered the Firewatch Camera
API and put together this little tool and library as a demo.

![firewatch.camera Screenshot][5]

Please be polite to their servers, and of course you shouldn't use this for
anything serious.

## Installation

You'll need [Node.js and npm](http://nodejs.org/).

For the command line tool:

```
$ npm install -g firewatch.camera
```

For the library:

```
$ npm install --save firewatch.camera
```

## Usage

From the command line:

```
$ firewatch.camera photos/photo_01.jpg photos/photo_02.jpg photos/photo_03.jpg
Uploaded 1/3 photos
Uploaded 2/3 photos
Uploaded 3/3 photos

Done! Your photos are here:
 https://www.firewatch.camera/EvergreenBasinDrive/
```

As a library:

```javascript
const fs = require('fs');
const firewatch = require('firewatch.camera');

// Up to 18 photos -- the number of photos left on Henry's disposable camera.
const photoFiles = [
  'photos/photo_01.jpg',
  'photos/photo_02.jpg',
  'photos/photo_03.jpg',
];

// uploadCameraRoll accepts an array of streams or buffers of JPEG data.
const photoStreams = photoFiles.map(photo => fs.createReadStream(photo));

// If all goes well, you'll get back a URL like
// https://www.firewatch.camera/EvergreenBasinDrive/
firewatch.uploadCameraRoll(photoStreams, function (err, url) {
  if (err) {
    console.error(err.stack);
  } else {
    console.log('Your photos are here:', url);
  }
});

// Also exposed:
//  - firewatch.maxPhotoCount
//  - firewatch.TooManyPhotosError
//  - firewatch.FirewatchAPIError
```

## Legal

License: [BSD3][6]

Firewatch is a trademark of Campo Santo.

[1]: http://www.firewatchgame.com/ "Firewatch Homepage"
[2]: http://www.camposanto.com/ "Campo Santo Homepage"
[3]: https://panic.com "Panic Homepage"
[4]: https://www.firewatch.camera/ "firewatch.camera Homepage"
[5]: https://i.imgur.com/oO6pvg3.png "firewatch.camera Screenshot"
[6]: LICENSE "License File"

