import {config} from './config';
import unzip from 'unzip';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
const NOT_INSTALLED = 'NOT_INSTALLED';
const INSTALLED = 'INSTALLED';
const CHANGED = 'CHANGED';

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

  empty() {
    return typeof this.year === 'undefined';
  }
}

class hud {
  constructor() {
    this.current = new version();
  }

  currentVersion(cb) {
    if (!this.current.empty()) {
      if (!this.isInstalled()) {
        this.current = new version();
      }

      if (typeof cb !== 'undefined') {
        cb();
      }

    } else if (typeof this.steamPath !== 'undefined' && this.current.empty()) {
      console.log('getting current version');

      const mmoPath = path.join(this.steamPath, config.TF_PATH, config.HUD_PATH, 'resource/ui/mainmenuoverride.res');
      var mmo;

      try {
        mmo = fs.readFileSync(mmoPath, 'utf8');
      } catch(e) {
        console.log('currentVersion: hud is not installed!');
      }

      this.current = new version(mmo);
      if (typeof cb !== 'undefined') {
        cb(this.current);
      }
    }
  }

  latestVersion(cb) {
    if (typeof this.latest !== 'undefined') {
      cb(this.latest);
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
      if (typeof this.steamPath === 'undefined') {
        this.getSteamPath();
      }

      console.log('steam path: ' + this.steamPath);

      return (!this.current.empty());
    } else {
      alert(os.platform() + ' system is not supported!');
    }

    return false;
  }

  getSteamPath() {
    if (os.platform() === 'win32') {
      var cproc = require('child_process');
      var utilsPath = path.join(__dirname, '../utils.exe');
      cproc.execFile(`${utilsPath}`, ['-steam-location'], (err, stdout, stderr) => {
        if (err) {
          alert(err);
          console.error(err);
          return;
        }

        console.log(stdout);

        // remove new line
        this.steamPath = stdout.substr(0, stdout.length - 1);
        this.dest = path.join(this.steamPath, config.TF_PATH, config.HUD_PATH);
      });
    } else {
      alert(os.platform() + ' system is not supported!');
      return;
    }
  }

  isUpToDate(cb) {
    if (!this.current.empty() && typeof this.latest !== 'undefined') {
      console.log(this.current);
      console.log(this.latest);

      return this.current.year === this.latest.year && 
        this.current.month === this.latest.month &&
        this.current.day === this.latest.day;
    }

    return false;
  }

  isChanged() {
    return false;
  }

  state() {
    if (this.isInstalled()) {
      if (!this.isUpToDate()) {
        return UPDATE_AVAILABLE; 
      }

      // not changed and up to date
      if (!this.isChanged() && this.isUpToDate()) {
        return INSTALLED;
      }

      if (this.isChanged()) {
        return CHANGED;
      }
    }

    return NOT_INSTALLED;
  }


  remove(cb) {
    try {
      fs.emptyDirSync(this.dest);
      this.current = new version();
      console.log('removed hud');
    } catch(e) {
      console.error(e);
    }

    cb();
  }

  install(settings, cb) {
    this.download(() => {
      console.log('downloaded');

      const state = this.state();
      console.log('hud dest: ' + this.dest);

      // crosshairs
      var crosshairs = '';
      var crosshairsDamageFlashColor = '';
      for (var i in settings.crosshairs) {
        var ch = settings.crosshairs[i];

        if (ch.color === '') {
          ch.color = '255 255 255 255';
        }

        console.log(ch);
        if (ch.dmgFlash === true) {
          crosshairsDamageFlashColor += `
          Animate Crosshair${ch.id}	 	FgColor 	"${this.parseColor(ch.dmgFlashColor)}" 		Linear 0.0  0.0
	        Animate Crosshair${ch.id}	 	FgColor 	"${this.parseColor(ch.color)}" 		      	Linear 0.15 0.0
          `;
        }

        crosshairs += `
        Crosshair${ch.id}
        {
          "labelText"		  "${ch.crosshair}"
          "fgcolor" 		  "${this.parseColor(ch.color)}"
          "enabled" 		  "${ch.enabled ? '1' : '0'}"
          "visible" 		  "${ch.enabled ? '1' : '0'}"
          "font"			    "size:${ch.size},outline:${ch.outline ? 'on' : 'off'}"

          "controlName"	  "CExLabel"
          "fieldName"	 	  "Crosshair${ch.id}"
          "zpos"			    "0"
          "xpos" 		 	    "c-25"
          "ypos" 		 	    "c-25"
          "wide" 		 	    "50"
          "tall" 		 	    "50"
          "textAlignment"	"center"
        }
        `
      }

      console.log(crosshairs);

      var fileName = './ahud/' + this.latest.string() + '/ahud-master/';
      try {
        fs.emptyDirSync(this.dest);
        fs.copySync(fileName, this.dest);
        console.log('copied');
      } catch(e) {
        console.error(e);
      }

      var hudlayoutPath = path.join(this.dest, 'scripts/hudlayout.res');
      var hudlayout = fs.readFileSync(hudlayoutPath, 'utf8');
      hudlayout = hudlayout.replace('// KNUCKLESCROSSES', crosshairs);
      fs.writeFileSync(hudlayoutPath, hudlayout);

      // crosshair's damage flash color
      var crosshairDamageFlashColorPath = path.join(this.dest, 'scripts/hudanimations_ahud.txt');
      var chDmgFlashColors = fs.readFileSync(crosshairDamageFlashColorPath, 'utf8');
      console.log('DAMAGE FLASH' + crosshairsDamageFlashColor);
      chDmgFlashColors = chDmgFlashColors.replace(/Animate[\s]+KnucklesCrosses[\s]+FgColor[\s]+"CrosshairDamage"[\s]+Linear[\s]+0.0[\s]+0.0/g, crosshairsDamageFlashColor);
      
      fs.writeFileSync(crosshairDamageFlashColorPath, chDmgFlashColors);

      // colors
      var hudcolorsPath = path.join(this.dest, 'resource/scheme/colors.res');
      var hudcolors = fs.readFileSync(hudcolorsPath, 'utf8');
      
      console.log(settings.colors);
      for (var i in settings.colors) {
        var color = settings.colors[i];
        if (typeof color['color'] !== 'undefined') {
          color = color.color;
        }

        if (i === 'hp') {
          name = 'HP';

        } else if (i === 'hp_buff') {
          name = 'HP Buff';

        } else if (i === 'hp_low') {
          name = 'HP Low';

        } else if (i === 'damage') {
          name = 'Damage Numbers';

        } else if (i === 'healing') {
          name = 'Healing Numbers';

        } else if (i === 'ammo') {
          name = 'Ammo In Clip';

        } else if (i === 'ammo_reserve') {
          name = 'Ammo In Reserve';

        } else if (i === 'low_ammo_flash_start') {
          name = 'LowAmmo1';

        } else if (i === 'low_ammo_flash_end') {
          name = 'LowAmmo2';

        } else if (i === 'stickies') {
          name = 'Stickies';

        } else if (i === 'metal') {
          name = 'Metal';

        } else if (i === 'killstreak') {
          name = 'Killstreak';

        } else if (i === 'charge_percent') {
          name = 'ChargePercent';

        } else if (i === 'ubercharge_meter') {
          name = 'Ubercharge Meter';

        } else if (i === 'ubercharge_flash_start') {
          name = 'Ubercharge1';

        } else if (i === 'ubercharge_flash_end') {
          name = 'Ubercharge2';
        } 

        if (name !== '' && color !== '') {
          hudcolors = hudcolors.replace(new RegExp(`"${name}"(.*)`), `"${name}" "${this.parseColor(color)}"`)
        }
      }
      
      fs.writeFileSync(hudcolorsPath, hudcolors);
      cb();
    });
  }

  parseColor(color) {
    if (typeof color === 'undefined' || color.length === 0) {
      console.log('color not parsed! -> ' + color);
      return '255 255 255 255';
    }

    color = color.replace(/[rgba()]/g, '');
    var colors = color.split(',');
    
    if (colors.length === 4) {
      colors[colors.length-1] = ' ' + Math.floor(colors[colors.length-1] * 255);

    } else if (colors.length === 3) {
      colors.push(' 255');
    }

    return colors.join('');
  }

  download(cb) {
    var dir = './ahud/';
    var fileName = dir + this.latest.string() + '.zip';

    try {
      fs.accessSync(fileName, fs.F_OK);
      console.log('exists');
      cb();
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
