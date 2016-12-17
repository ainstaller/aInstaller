const elevate = require('node-windows').elevate;
const path = require('path');
const fs = require('fs-extra');

var asarAupdaterPath = path.join(__dirname, './aupdater.exe');
var aupdaterPath = path.join(process.env.APPDATA, "ainstaller/aupdater.exe");

try {
  if (fs.existsSync(aupdaterPath)) {
    fs.createReadStream(asarAupdaterPath).pipe(fs.createWriteStream(aupdaterPath));
  }
} catch(e) {
  console.error(e);
}

console.log(asarAupdaterPath);
console.log(aupdaterPath);

class AutoLaunch {
  create(exePath) {
    let cmd = `schtasks /Create /tn "aInstaller" /sc onlogon /rl highest /tr "${aupdaterPath}"`;
    console.log(elevate(cmd));
  }

  remove() {
    let cmd = `schtasks /Delete /tn "aInstaller" /f`;
    console.log(elevate(cmd));
  }

  enable() {
    this.create();
  }

  disable() {
    this.remove();
  }
}

var updaterAutoLauncher = new AutoLaunch();

//updaterAutoLauncher.enable();
//updaterAutoLauncher.disable();
module.exports = updaterAutoLauncher;
