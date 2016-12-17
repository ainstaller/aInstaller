const AutoLaunch = require('auto-launch');
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

var updaterAutoLauncher = new AutoLaunch({
  name: 'aupdater',
  path: aupdaterPath,
});

//updaterAutoLauncher.enable();
//updaterAutoLauncher.disable();
module.exports = updaterAutoLauncher;
