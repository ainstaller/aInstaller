import deepEqual from 'deep-equal';
import {config} from './config';
import unzip from 'node-unzip-2';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
const NOT_INSTALLED = 'NOT_INSTALLED';
const INSTALLED = 'INSTALLED';
const CHANGED = 'CHANGED';

function changeExt(fileName, newExt) {
  var _tmp;
  return fileName.substr(0, ~(_tmp = fileName.lastIndexOf('.')) ? _tmp : fileName.length) + '.' + newExt;
}

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

      if (angular.isFunction(cb)) {
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
      if (angular.isFunction(cb)) {
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

        if (angular.isFunction(cb)) {
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

  getSteamPath(cb) {
    if (os.platform() === 'win32') {
      if (angular.isDefined(this.settings) && angular.isDefined(this.settings.hl2) && this.settings.hl2.length > 0) {
        this.steamPath = this.settings.hl2.substr(0, this.settings.hl2.indexOf('steamapps'));
        this.dest = path.join(this.steamPath, config.TF_PATH, config.HUD_PATH);

        if (angular.isFunction(cb)) {
          return cb();
        }

        return;
      }

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

        if (angular.isFunction(cb)) {
          cb();
        }
      });
    } else {
      alert(os.platform() + ' system is not supported!');
      return;
    }
  }

  isUpToDate(cb) {
    if (!this.current.empty() && typeof this.latest !== 'undefined') {
      //console.log(this.current);
      //console.log(this.latest);

      return this.current.year === this.latest.year && 
        this.current.month === this.latest.month &&
        this.current.day === this.latest.day;
    }

    return false;
  }

  isChanged(backup, current) {
    return deepEqual(current, backup) === false;
  }

  state(backup, current) {
    if (this.isInstalled()) {
      if (!this.isUpToDate()) {
        return UPDATE_AVAILABLE; 
      }

      return this.isChanged(backup, current) ? CHANGED : INSTALLED;
    }

    return NOT_INSTALLED;
  }


  remove(cb) {
    console.log('removing hud...');

    try {
      fs.emptyDirSync(this.dest);
      this.current = new version();
      console.log('removed hud');
    } catch(e) {
      console.log('error removing hud');
      console.error(e);
    }

    if (angular.isFunction(cb)) {
      cb();
    }
  }

  buildCrosshairs(settings) {
    // crosshairs
    var crosshairs = '';
    var toggleableCrosshairs = '';
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

      let chdata = `
      Crosshair${ch.id}
      {
        "labelText"		  "${ch.crosshair}"
        "fgcolor" 		  "${this.parseColor(ch.color)}"
        "enabled" 		  "${ch.enabled ? '1' : '0'}"
        "visible" 		  "${ch.enabled ? '1' : '0'}"
        "font"			    "size:${ch.size},outline:${ch.outline ? "on" : "off"}"

        "controlName"	  "CExLabel"
        "fieldName"	 	  "Crosshair${ch.id}"
        "zpos"			    "0"
        "xpos" 		 	    "c-25"
        "ypos" 		 	    "c-25"
        "wide" 		 	    "50"
        "tall" 		 	    "50"
        "textAlignment"	"center"
      }
      `;

      if (ch.toggleable) {
        toggleableCrosshairs += chdata;
      } else {
        crosshairs += chdata;
      }
    }

    return {
      crosshairs,
      toggleableCrosshairs,
      crosshairsDamageFlashColor,
    };
  }

  quickInject(settings, cb) {
    var ch = this.buildCrosshairs(settings);
    var crosshairs = ch.crosshairs;

    var hudlayoutPath = path.join(this.dest, 'scripts/hudlayout.res');
    var hudlayout = fs.readFileSync(hudlayoutPath, 'utf8');

    // removes current crosshairs from hudlayout.res
    while (true) {
      var idx = hudlayout.indexOf('Crosshair1');
      if (idx === -1) {
        break;

      } else {
        var cidx = hudlayout.substr(idx).indexOf('}')+1;
        hudlayout = hudlayout.substr(0, idx) + hudlayout.substr(idx+cidx);
      }
    }
    
    var idx = hudlayout.indexOf('{') + 2;
    hudlayout = hudlayout.substr(0, idx) + crosshairs + hudlayout.substr(idx);

    fs.writeFileSync(hudlayoutPath, hudlayout);
    cb();
  }

  install(settings, cb) {
    this.loadingText = 'Downloading ahud...';

    this.download(() => {
      this.loadingText = '';
      console.log('downloaded');

      const state = this.state();
      console.log('hud dest: ' + this.dest);

      // crosshairs
      var ch = this.buildCrosshairs(settings);

      var crosshairs = ch.crosshairs;
      var toggleableCrosshairs = ch.toggleableCrosshairs;
      var crosshairsDamageFlashColor = ch.crosshairsDamageFlashColor;

      console.log(crosshairs);

      var fileName = './ahud/' + this.latest.string() + '/ahud-master/';
      try {
        if (!fs.existsSync(this.dest)) {
          fs.mkdirSync(this.dest);
        } else {
          fs.emptyDirSync(this.dest);
        }

        fs.copySync(fileName, this.dest);
        console.log('copied');
      } catch(e) {
        console.error(e);
      }

      // styles - has to be copied first because it can replace animations file
      // chat, charge_meter, scoreboard, nobox(bool)
      var copyDirList = []; 

      // chat
      if (angular.isDefined(settings.styles['chat'])) {
        if (settings.styles.chat === 'bottom_right') {
          copyDirList.push('chat - bottom right');

        } else if (settings.styles.chat === 'top_left') {
          copyDirList.push('chat - top left');
        }
      }

      // medic charge meter
      if (angular.isDefined(settings.styles['charge_meter'])) {
        if (settings.styles.charge_meter === 'bottom') {
          copyDirList.push('medic - bottom charge meter');

        } else if (settings.styles.charge_meter === 'center') {
          copyDirList.push('medic - center charge meter & percentage');
        }
      }

      // scoreboard
      if (angular.isDefined(settings.styles['scoreboard'])) {
        if (settings.styles.scoreboard === '16v6') {
          copyDirList.push('scoreboard - 16v16 players');

        } else if (settings.styles.scoreboard === 'bottom') {
          copyDirList.push('scoreboard - bottom');
        }
      }

      // nobox
      if (angular.isDefined(settings.styles['nobox']) && settings.styles['nobox'] === true) {
        copyDirList.push('style - nobox');
      }

      for (var i in copyDirList) {
        var from = path.join('./ahud/', this.latest.string(), '/ahud-master/customization/', copyDirList[i]);

        try {
          fs.copySync(from, this.dest);
          console.log('copied style -> ' + copyDirList[i]);
        } catch(e) {
          console.error(e);
        }
      }
      // end: styles

      var hudlayoutPath = path.join(this.dest, 'scripts/hudlayout.res');
      var hudlayout = fs.readFileSync(hudlayoutPath, 'utf8');
      
      // toggleable crosshairs
      if (toggleableCrosshairs.length > 0) {
        var hatiPath = path.join(this.dest, 'resource/ui/HudAchievementTrackerItem.res');
        var hati = fs.readFileSync(path.join(__dirname, "../assets/achievements.res"), 'utf8');
        
        hati = hati.replace('// crosshairs', toggleableCrosshairs);
        fs.writeFileSync(hatiPath, hati);
        
        var trackerIndex = hudlayout.indexOf(`"HudAchievementTracker"`);
        var openIndex = hudlayout.substr(trackerIndex).indexOf("{");
        var closeIndex = hudlayout.substr(trackerIndex).indexOf("}");
        
        var oidx = trackerIndex+openIndex;
        var cidx = trackerIndex+closeIndex+1;
        var start = hudlayout.substr(0, oidx);
        var end = hudlayout.substr(cidx);
        
        var newTracker = `{
          "ControlName"   "EditablePanel"
          "fieldName"             "HudAchievementTracker"
          "xpos"                  "0"
          "NormalY"               "0"
          "EngineerY"             "0"
          "wide"                  "f0"
          "tall"                  "480"
          "visible"               "1"
          "enabled"               "1"    
          "zpos"                  "1"
        }`;
        
        hudlayout = start + newTracker + end;
      }
      
      // transparent viewmodels
      if (settings.styles.transparentViewmodels) {
        var dest = path.join(this.steamPath, config.TF_PATH, config.HUD_PATH, './materials/vgui/replay/thumbnails/');
        var src = path.join(__dirname, '../assets/vtf/');

        if (!fs.existsSync(dest)) {
          console.log('making dir -> ' + dest);
          fs.mkdirSync(dest);
        }
        
        fs.copyFileSync(path.join(src, "REFRACTnormal_transparent.vmt"), path.join(dest, "REFRACTnormal_transparent.vmt"));
        fs.copyFileSync(path.join(src, "REFRACTnormal_transparent.vtf"), path.join(dest, "REFRACTnormal_transparent.vtf"));
        
        crosshairs += `
        "TransparentViewmodelMask"
        {
          //alpha doesn't work for this, you need to change the texture's alpha
          "ControlName"	"ImagePanel"
          "fieldName"		"TransparentViewmodelMask"
          "xpos"			"0"
          "ypos"			"0"
          "zpos"			"-100"
          "wide"			"f0"
          "tall"			"480"
          "visible"		"1"
          "enabled"		"1"
          "image"			"replay/thumbnails/REFRACTnormal_transparent"
          "scaleImage"	"1"
        }
        `;
      }
      
      hudlayout = hudlayout.replace('// KNUCKLESCROSSES', crosshairs);
      fs.writeFileSync(hudlayoutPath, hudlayout);
      
      // crosshair's damage flash color
      var crosshairDamageFlashColorPath = path.join(this.dest, 'scripts/hudanimations_misc.txt');
      var chDmgFlashColors = fs.readFileSync(crosshairDamageFlashColorPath, 'utf8');
      console.log('DAMAGE FLASH' + crosshairsDamageFlashColor);
      
      var hidx = chDmgFlashColors.indexOf(`event HitMarker`);
      if (hidx >= 0) {
        var openIndex = chDmgFlashColors.substr(hidx).indexOf("{");
        var oidx = openIndex + hidx + 1;
        var start = chDmgFlashColors.substr(0, oidx);
        var end = chDmgFlashColors.substr(oidx);

        chDmgFlashColors = start + crosshairsDamageFlashColor + end;
        fs.writeFileSync(crosshairDamageFlashColorPath, chDmgFlashColors);
      }
      
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
        
        } else if (i === 'ammo_no_clip') {
          name = 'Ammo No Clip';

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

      ////////////////
      // background //
      ////////////////
      if (os.platform() === 'win32') {
        if (this.settings.background.enabled) {
          var dest = path.join(this.steamPath, config.TF_PATH, config.HUD_PATH, './materials/console/');
          var cproc = require('child_process');
          var vtfcmdPath = path.join(__dirname, '../assets/vtf/VTFCmd.exe');
          this.loadingText = 'Converting background image to texture...';

          cproc.execFile(`${vtfcmdPath}`, ['-file', this.settings.background.path, '-resize', '-nomipmaps', '-format', 'dxt1'], (err, stdout, stderr) => {
            if (err) {
              alert(err);
              console.error(err);
              return;
            }
    
            console.log(stdout);
            this.loadingText = "";
            
            var vtfPath = changeExt(this.settings.background.path, 'vtf');
            console.log(vtfPath);

            if (fs.existsSync(vtfPath)) {
              if (!fs.existsSync(dest)) {
                console.log('making dir -> ' + dest);
                fs.mkdirSync(dest);
              }

              var list = [
                'upward',
                'gravelpit',
                '2fort',
                'mvm',
              ];

              for (let i in list) {
                var widescreen = path.join(dest, `background_${list[i]}_widescreen.vtf`);
                var normal = path.join(dest, `background_${list[i]}.vtf`);
                console.log(widescreen, normal);

                fs.copyFileSync(vtfPath, widescreen);
                fs.copyFileSync(vtfPath, normal);
                console.log('copied background -> ' + list[i]);
              }
            }

            cb();
          });
        } else {
          cb();
        }
      } else {
        alert(os.platform() + ' system is not supported!');
      }

      // background
      // VTFCmd.exe -file ".\tf2.jpg" -resize -nomipmaps -format "dxt1"
      // var bgPath = path.join(this.dest, 'resource/console/background_upward_widescreen');
      // var inputRGABATA = fs.readFileSync('./app/assets/tf2.jpg');
      // try {
      //   var outputRGBAData = vtf.fromRGBA(inputRGABATA, 2560, 1440);
      // } catch (e) {
      //   console.error(e);
      // }
      // var bgDir = path.join(this.dest, 'resource/console/');
      // if (!fs.existsSync(bgDir)) {
      //   fs.mkdirSync(bgDir);
      // }
      // fs.writeFileSync(bgPath, outputRGBAData);
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
        var r = fs.createReadStream(fileName).pipe(unzip.Extract({ path: fileName.replace('.zip', '') }));
        r.on('close', () => {
          if (angular.isFunction(cb)) {
            cb();
          }
        });
      });
    }).on('error', (e) => {
      console.log(`error: ${e.message}`);
    });
  }
}

var ahud = new hud();
export {ahud};
