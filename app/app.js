const electron = require('electron');
import {autoUpdater} from "electron-auto-updater";

// Module to control application life.
const app = electron.app;
const dialog = electron.dialog;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');
require('./startup');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let updateWindow;

function aupdate() {
  if (isDev) {
    console.log("dev mode enabled");
    createWindow();
    return;
  }

  console.log("checking for updates");

  autoUpdater.addListener("update-available", (event) => {
    console.log("A new update is available");
    dialog.showMessageBox({
      message: "A new update is available, starting download...",
      buttons: ['ok'],
      type: 'info'
    });

    updateWindow = new BrowserWindow({width: 1280, height: 720});
    updateWindow.loadURL(url.format({
      pathname: path.join(__dirname, '/update.html'),
      protocol: 'file:',
      slashes: true
    }));

    // Open the DevTools.
    //updateWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    updateWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      updateWindow = null;
    })
  });

  autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    dialog.showMessageBox({
      message: `aInstaller version ${releaseName} is downloaded and will be automatically installed!`,
      buttons: ['ok'],
      type: 'info'
    });
    console.log(event + ' - ' + releaseNotes  + ' - ' + releaseName  + ' - ' +  releaseDate  + ' - ' +  updateURL);
    console.log("quitAndInstall");
    autoUpdater.quitAndInstall();
    return true;
  });

  autoUpdater.addListener("error", (error) => {
    console.log(error);
    dialog.showMessageBox({
      message: 'Error while trying to update -> ' + JSON.stringify(error),
      buttons: ['ok'],
      type: 'info'
    });
    createWindow();
  });

  autoUpdater.addListener("checking-for-update", (event) => {
    console.log("checking-for-update");
  });

  autoUpdater.addListener("update-not-available", () => {
    console.log("update-not-available");
    createWindow();
  });

  autoUpdater.checkForUpdates();
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 720});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', aupdate);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
