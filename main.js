const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when the main window is closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from template below
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);

})

// Handle create the add window
function createAddWindow(){
    // Create new window
    addWindow = new BrowserWindow({
        width: 200,
        height: 200,
        title: 'Add Shopping List Items'
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection
    addWindow.on('close', function(){addWindow = null;});
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label: '&File',
        submenu: [
            {label: '&Add Item', click(){createAddWindow();}},
            {label: '&Clear Item', click(){
                mainWindow.webContents.send('item:clear');
            }},
            {label: '&Quit', click(){ app.quit(); }}
        ]
    }
];

// If Mac, add empty menu item
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: '&Developer Tools',
        submenu: [
            {
                label: '&Toggle DevTools',
                click(item, focusedWindow){focusedWindow.toggleDevTools();}
            },
            {role: 'reload',}
        ]
    });
}
