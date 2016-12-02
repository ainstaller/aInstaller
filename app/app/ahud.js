import {config} from './config';
import unzip from 'unzip';
import fs from 'fs';
import os from 'os';

class version {
  constructor(str) {
    if (typeof str !== 'undefined' && str.length > 0) {
      this.parse(str);
    }
  }

  parse(str) {
    var self = this;
    let m = /v(\d+){0,4}\.(\d+){0,4}/g.exec(str);
    
    m.forEach((match, idx) => {
      if (idx === 1) {
        self.year = match;

      } else if (idx === 2) {
        self.month = match[0] + match[1];
        self.day = match[2] + match[3];
      }
    });
  }

  string() {
    if (typeof this.year === 'undefined') {
      return '';
    }

    return 'v' + this.year + '.' + this.month + this.day; 
  }
}

class hud {
  constructor() {
  }

  currentVersion(cb) {
    if (this.isInstalled()) {
      return '';
    }

    this.current = new version();
    cb(this.current);
  }

  latestVersion(cb) {
    if (typeof this.latest !== 'undefined') {
      cb();
    }

    const https = require('https');
    let mmo = 'https://raw.githubusercontent.com/n0kk/ahud/master/resource/ui/mainmenuoverride.res';

    var data = [];
    var self = this;

    https.get(mmo, (res) => {
      console.log(`Got response: ${res.statusCode}`);

      res.resume();
      res.on('data', function(chunk) {
        data.push(chunk);
      });

      res.on('end', () => {
        self.latest = new version(data);
        console.log(self.latest.year, self.latest.month, self.latest.day);

        if (typeof cb !== 'undefined') {
          cb(self.latest);
        }
      });
    }).on('error', (e) => {
      console.log(`error: ${e.message}`);
    });
  }

  isInstalled() {
    if (os.platform() === 'win32') {
    } else {
      alert(os.platform() + ' system is not supported!');
      return;
    }

    return false;
  }

  isUpToDate() {
    return false;
  }

  isChanged() {
    return false;
  }

  state() {
    if (this.isInstalled()) {
      if (!this.isUpToDate()) {
        return 'UPDATE_AVAILABLE'; 
      }

      // not changed and up to date
      if (!this.isChanged() && this.isUpToDate()) {
        return 'INSTALLED';
      }

      if (this.isChanged()) {
        return 'CHANGED';
      }
    }

    return 'NOT_INSTALLED';
  }

  install(cb) {
    this.download(() => {
      console.log('downloaded');
    });
  }

  download(cb) {
    var dir = './ahud/';
    var fileName = dir + this.latest.string() + '.zip';

    try {
      fs.accessSync(fileName, fs.F_OK);
      console.log('exists');
      return; // exists
    } catch(e) {
      console.error(e);
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    console.log('downloading...');
    const https = require('https');
    const file = fs.createWriteStream(fileName);
    var data = [];
    var self = this;

    https.get(config.DOWNLOAD_URL, (res) => {
      console.log(`Got response: ${res.statusCode}`);

      res.resume();
      res.on('data', function(chunk) {
        file.write(chunk);
      });

      res.on('end', () => {
        file.end();

        console.log('unzipping...');
        // unzip
        fs.createReadStream(fileName).pipe(unzip.Extract({ path: fileName.replace('.zip', '') }));

        if (typeof cb !== 'undefined') {
          cb();
        }
      });
    }).on('error', (e) => {
      console.log(`error: ${e.message}`);
    });
  }
}

var ahud = new hud();
export {ahud};
