const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// Report crashes to our server.
/*
electron.crashReporter.start({
    productName: 'YourName',
    companyName: 'YourCompany',
    submitURL: 'https://your-domain.com/url-to-submit',
    autoSubmit: true
});
*/

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// Chrome flags
// WebGL 2
//app.commandLine.appendSwitch('enable-unsafe-es3-apis');

// GPU rasterization
//app.commandLine.appendSwitch('force-gpu-rasterization');

// Disable background throttling
//app.commandLine.appendSwitch('disable-renderer-background');

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1320,
        height: 1200,
        minWidth: 200,
        minHeight: 100,
        frame: false,
        backgroundColor: '#222222',
        webPreferences: {
            webSecurity: false,
            webgl: true,
            experimentalCanvasFeatures: true
        },
        titleBarStyle: 'hidden-inset'
    });

    // Debugging
    mainWindow.openDevTools({ detach: true });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});