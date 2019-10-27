import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { createConnection, getConnection, Repository } from 'typeorm'
import { Sample } from '../common/Sample'
import url from 'url';
import path from 'path';
import os from 'os';

let win: BrowserWindow

const isDevelopment = process.env.NODE_ENV !== 'production'

const initDb = () => {
  return createConnection({
    type: 'sqlite',
    database: 'sample.sqlite',
    synchronize: true,
    entities: [ Sample ]
  })
}

const createWindow = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDevelopment) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    win.webContents.openDevTools()
  } else {
    win.loadURL(url.format({
      pathname: __dirname + '/index.html',
      protocol: 'file:',
      slashes: true
    }));
  }

  win.on('close', () => {
    win = null
  })
}

ipcMain.on('get-sample-request', async event => {
  let agents = await getConnection().getRepository<Sample>('Sample').find()
  event.reply('get-sample-reponse', agents)
})

ipcMain.on('add-sample-request', async (event, sample: Sample) => {
  const sampleRepo = await getConnection().getRepository<Sample>('Sample')
  await sampleRepo.save(sample)
  const samples = await sampleRepo.find()
  event.reply('add-sample-response', samples)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  if (win == null) {
    await initDb()
    createWindow();
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST_MODE) {
    BrowserWindow.addDevToolsExtension(
      path.join(os.homedir(), '/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.2.0_0')
    )
  }
  await initDb()
  createWindow()
})

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit()
      }
    })
  } else {
    process.on("SIGTERM", () => {
      app.quit()
    });
  }
}
