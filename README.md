# Markdown to PDF Converter

A professional desktop application for converting Markdown documents to beautifully styled PDFs. Perfect for creating client-ready documents with a clean, professional appearance.

## Features

- **Dual Input Methods**: Upload `.md` files or paste markdown text directly
- **Live Preview**: See exactly how your PDF will look before converting
- **Professional Styling**: Clean, modern design optimized for business documents
- **Easy File Management**: Built-in file explorer for saving PDFs
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To run the application in development mode:
```bash
npm start
```

### Building the Executable

To create a desktop executable for your platform:

**Windows (Recommended method):**
```bash
npm run package-win
```

The executable will be created in the `dist/markdown-to-pdf-win32-x64` folder. You can find `markdown-to-pdf.exe` there.

**Alternative method (if you have admin privileges):**
```bash
npm run build-win
```

**macOS:**
```bash
npm run build-mac
```

**Linux:**
```bash
npm run build-linux
```

## Usage

1. **Launch the Application**: Double-click the executable or run `npm start`

2. **Input Your Markdown**:
   - Click "Upload File" to select a `.md` file from your computer
   - Or paste/type markdown directly in the input area

3. **Preview**: The right panel shows a live preview of how your PDF will look

4. **Convert**: Click "Convert to PDF" when ready
   - A file explorer will open
   - Choose where to save your PDF
   - Click Save

5. **Clear**: Use the "Clear" button to reset and start with new content

## Markdown Support

The converter supports all standard Markdown features:

- **Headers** (H1-H6)
- **Bold** and *Italic* text
- **Lists** (ordered and unordered)
- **Links** and images
- **Code blocks** and inline code
- **Blockquotes**
- **Tables**
- **Horizontal rules**

### Example Markdown

```markdown
# Project Proposal

## Executive Summary

This document outlines our **comprehensive solution** for your business needs.

### Key Benefits

1. Increased efficiency
2. Cost reduction
3. Improved user experience

> "This solution has transformed our operations" - Previous Client

### Technical Specifications

| Feature | Description |
|---------|-------------|
| Performance | 99.9% uptime |
| Security | Enterprise-grade |
| Support | 24/7 availability |
```

## Customization

### Styling

To customize the PDF styling, edit the CSS in `renderer.js` within the `generatePDFHTML()` function.

### Application Icon

Replace `assets/icon.png` with your own icon (512x512 pixels recommended).

## Troubleshooting

### Application won't start
- Ensure Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

### PDF generation fails
- Check that you have write permissions in the save location
- Ensure the markdown content is not empty

### Preview not updating
- The preview updates automatically after a short delay
- Try clicking outside the input area to trigger an update

## Technical Details

Built with:
- **Electron**: Cross-platform desktop framework
- **Marked.js**: Markdown parsing
- **Native PDF generation**: Using Electron's built-in PDF capabilities

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

For issues or feature requests, please create an issue in the project repository.