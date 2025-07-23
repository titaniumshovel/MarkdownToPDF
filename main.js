const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  // Set custom user data directory to avoid cache permission issues
  app.setPath('userData', path.join(__dirname, 'user-data'));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file dialog for opening markdown files
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content, fileName: path.basename(filePath) };
  }

  return { success: false };
});

// Handle PDF generation
ipcMain.handle('generate-pdf', async (event, htmlContent) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'document.pdf',
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      // Create a hidden window for PDF generation
      const pdfWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Load the HTML content
      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      // Generate PDF with professional settings
      const pdfData = await pdfWindow.webContents.printToPDF({
        marginsType: 1, // Use minimal margins, let CSS handle the rest
        pageSize: 'A4',
        printBackground: true,
        landscape: false,
        scaleFactor: 100
      });

      // Save the PDF
      await fs.writeFile(result.filePath, pdfData);
      
      // Close the hidden window
      pdfWindow.close();

      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('PDF generation error:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false };
});