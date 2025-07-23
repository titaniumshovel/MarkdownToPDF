// DOM elements
const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const convertBtn = document.getElementById('convertBtn');
const fileName = document.getElementById('fileName');
const notification = document.getElementById('notification');
const styleSelect = document.getElementById('styleSelect');

// Check if running in Electron
const isElectron = window.electronAPI !== undefined;

// Configure marked options for better rendering
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
});

// Update preview when markdown input changes
let updateTimer;
markdownInput.addEventListener('input', () => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
        updatePreview();
    }, 300);
});

// Update preview when style changes
styleSelect.addEventListener('change', () => {
    updatePreview();
});

// Handle file upload
uploadBtn.addEventListener('click', async () => {
    if (isElectron) {
        // Electron environment - use native file dialog
        const result = await window.electronAPI.openFileDialog();
        if (result.success) {
            markdownInput.value = result.content;
            fileName.textContent = `File: ${result.fileName}`;
            updatePreview();
        }
    } else {
        // Web environment - use HTML file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    markdownInput.value = event.target.result;
                    fileName.textContent = `File: ${file.name}`;
                    updatePreview();
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
});

// Clear input
clearBtn.addEventListener('click', () => {
    markdownInput.value = '';
    fileName.textContent = '';
    updatePreview();
});

// Convert to PDF
convertBtn.addEventListener('click', async () => {
    if (isElectron) {
        // Electron environment - use native PDF generation
        const htmlContent = generatePDFHTML();
        const result = await window.electronAPI.generatePDF(htmlContent);
        
        if (result.success) {
            showNotification(`PDF saved successfully to: ${result.filePath}`, 'success');
        } else {
            showNotification('Failed to save PDF. Please try again.', 'error');
        }
    } else {
        // Web environment - use browser print dialog
        const htmlContent = generatePDFHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
            printWindow.print();
            // Close the window after a delay to ensure print dialog appears
            setTimeout(() => {
                printWindow.close();
            }, 1000);
        };
        
        showNotification('Use the print dialog to save as PDF (select "Save as PDF" as printer)', 'success');
    }
});

// Update preview function
function updatePreview() {
    const markdown = markdownInput.value.trim();
    const selectedStyle = styleSelect.value;
    
    if (markdown) {
        const html = marked.parse(markdown);
        preview.innerHTML = `<div class="pdf-preview ${selectedStyle}">${html}</div>`;
        convertBtn.disabled = false;
    } else {
        preview.innerHTML = `
            <div class="preview-placeholder">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" opacity="0.3">
                    <path d="M5 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H5zm0 1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                    <path d="M5.5 4a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3z"/>
                </svg>
                <p>Preview will appear here</p>
            </div>
        `;
        convertBtn.disabled = true;
    }
}

// Generate HTML for PDF with selected styling
function generatePDFHTML() {
    const markdown = markdownInput.value.trim();
    const selectedStyle = styleSelect.value;
    const html = marked.parse(markdown);
    
    // Get the CSS for the selected style from the existing stylesheet
    const styleSheets = Array.from(document.styleSheets);
    let relevantCSS = '';
    
    styleSheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules);
            rules.forEach(rule => {
                if (rule.selectorText && 
                    (rule.selectorText.includes(`.pdf-preview.${selectedStyle}`) || 
                     rule.selectorText.includes('.pdf-preview') && !rule.selectorText.includes('.professional') && !rule.selectorText.includes('.academic') && !rule.selectorText.includes('.modern'))) {
                    relevantCSS += rule.cssText + '\n';
                }
            });
        } catch (e) {
            // Handle cross-origin or other CSS access issues
        }
    });
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 0.75in;
            orphans: 3;
            widows: 3;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: inherit;
            line-height: inherit;
        }
        
        .pdf-preview {
            max-width: none;
            margin: 0;
            padding: 0;
            background: white;
            width: 100%;
        }
        
        /* Base styles for ${selectedStyle} */
        ${getStyleCSS(selectedStyle)}
    </style>
</head>
<body>
    <div class="pdf-preview ${selectedStyle}">
        ${html}
    </div>
</body>
</html>
    `;
}

// Get CSS for specific style
function getStyleCSS(style) {
    const baseStyles = `
        .pdf-preview { max-width: none; margin: 0; padding: 0; background: white; width: 100%; }
    `;
    
    if (style === 'professional') {
        return baseStyles + `
        .pdf-preview.professional { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000000; }
        .pdf-preview.professional h1 { font-size: 24pt; font-weight: bold; color: #000000; margin: 36pt 0 18pt 0; page-break-after: avoid; page-break-inside: avoid; border-bottom: 2pt solid #000000; padding-bottom: 6pt; text-align: left; orphans: 3; widows: 3; }
        .pdf-preview.professional h2 { font-size: 18pt; font-weight: bold; color: #000000; margin: 24pt 0 12pt 0; page-break-before: auto; page-break-after: avoid; page-break-inside: avoid; border-bottom: 1pt solid #666666; padding-bottom: 3pt; orphans: 3; widows: 3; }
        .pdf-preview.professional h3 { font-size: 14pt; font-weight: bold; color: #000000; margin: 18pt 0 9pt 0; page-break-after: avoid; page-break-inside: avoid; orphans: 3; widows: 3; }
        .pdf-preview.professional h4 { font-size: 12pt; font-weight: bold; color: #000000; margin: 15pt 0 6pt 0; page-break-after: avoid; page-break-inside: avoid; orphans: 3; widows: 3; }
        .pdf-preview.professional h5, .pdf-preview.professional h6 { font-size: 11pt; font-weight: bold; color: #000000; margin: 12pt 0 6pt 0; page-break-after: avoid; page-break-inside: avoid; orphans: 3; widows: 3; }
        .pdf-preview.professional p { margin: 0 0 12pt 0; text-align: justify; text-indent: 0; orphans: 3; widows: 3; }
        .pdf-preview.professional a { color: #000000; text-decoration: underline; }
        .pdf-preview.professional code { font-family: 'Courier New', 'Consolas', monospace; font-size: 10pt; background-color: #f5f5f5; padding: 2pt 4pt; border: 1pt solid #e0e0e0; }
        .pdf-preview.professional pre { font-family: 'Courier New', 'Consolas', monospace; font-size: 10pt; background-color: #f9f9f9; border: 1pt solid #d0d0d0; padding: 12pt; margin: 12pt 0; page-break-inside: avoid; white-space: pre-wrap; word-wrap: break-word; text-decoration: none; }
        .pdf-preview.professional blockquote { margin: 12pt 0 12pt 36pt; padding: 0 0 0 18pt; border-left: 3pt solid #cccccc; font-style: italic; color: #555555; page-break-inside: avoid; }
        .pdf-preview.professional ul, .pdf-preview.professional ol { margin: 12pt 0; padding-left: 36pt; }
        .pdf-preview.professional li { margin: 6pt 0; line-height: 1.5; }
        .pdf-preview.professional table { border-collapse: collapse; width: 100%; margin: 18pt 0; page-break-inside: avoid; font-size: 11pt; }
        .pdf-preview.professional th { background-color: #f0f0f0; font-weight: bold; padding: 8pt 12pt; border: 1pt solid #666666; text-align: left; vertical-align: top; }
        .pdf-preview.professional td { padding: 8pt 12pt; border: 1pt solid #999999; text-align: left; vertical-align: top; }
        .pdf-preview.professional tr:nth-child(even) td { background-color: #f9f9f9; }
        .pdf-preview.professional hr { border: none; border-top: 1pt solid #666666; margin: 24pt 0; page-break-after: avoid; }
        `;
    } else if (style === 'academic') {
        return baseStyles + `
        .pdf-preview.academic { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 2.0; color: #000000; }
        .pdf-preview.academic h1 { font-size: 18pt; font-weight: bold; text-align: center; margin: 24pt 0 18pt 0; page-break-after: avoid; }
        .pdf-preview.academic h2 { font-size: 14pt; font-weight: bold; margin: 18pt 0 12pt 0; page-break-after: avoid; }
        .pdf-preview.academic h3 { font-size: 12pt; font-weight: bold; margin: 15pt 0 9pt 0; page-break-after: avoid; }
        .pdf-preview.academic h4 { font-size: 11pt; font-weight: bold; margin: 12pt 0 6pt 0; page-break-after: avoid; }
        .pdf-preview.academic h5, .pdf-preview.academic h6 { font-size: 11pt; font-style: italic; margin: 9pt 0 6pt 0; page-break-after: avoid; }
        .pdf-preview.academic p { margin: 0 0 12pt 0; text-align: justify; text-indent: 18pt; }
        .pdf-preview.academic a { color: #000000; text-decoration: none; }
        .pdf-preview.academic code { font-family: 'Courier New', monospace; font-size: 9pt; background-color: #f8f8f8; padding: 1pt 3pt; }
        .pdf-preview.academic pre { font-family: 'Courier New', monospace; font-size: 9pt; background-color: #f8f8f8; border: 1pt solid #ccc; padding: 9pt; margin: 12pt 0; page-break-inside: avoid; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; text-decoration: none; }
        .pdf-preview.academic blockquote { margin: 12pt 0 12pt 36pt; font-style: italic; }
        .pdf-preview.academic ul, .pdf-preview.academic ol { margin: 6pt 0; padding-left: 24pt; }
        .pdf-preview.academic li { margin: 3pt 0; }
        .pdf-preview.academic table { border-collapse: collapse; width: 100%; margin: 12pt 0; font-size: 10pt; }
        .pdf-preview.academic th, .pdf-preview.academic td { border: 1pt solid #000; padding: 6pt 8pt; }
        .pdf-preview.academic th { background-color: #f5f5f5; font-weight: bold; }
        .pdf-preview.academic hr { border: none; border-top: 1pt solid #000; margin: 18pt 0; }
        `;
    } else if (style === 'modern') {
        return baseStyles + `
        .pdf-preview.modern { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #2c3e50; }
        .pdf-preview.modern h1 { font-size: 28pt; font-weight: 300; color: #2c3e50; margin: 36pt 0 24pt 0; border-bottom: 2pt solid #3498db; padding-bottom: 12pt; page-break-after: avoid; }
        .pdf-preview.modern h2 { font-size: 20pt; font-weight: 400; color: #34495e; margin: 24pt 0 12pt 0; page-break-after: avoid; }
        .pdf-preview.modern h3 { font-size: 16pt; font-weight: 500; color: #34495e; margin: 18pt 0 9pt 0; page-break-after: avoid; }
        .pdf-preview.modern h4 { font-size: 13pt; font-weight: 500; color: #34495e; margin: 15pt 0 6pt 0; page-break-after: avoid; }
        .pdf-preview.modern h5, .pdf-preview.modern h6 { font-size: 12pt; font-weight: 500; color: #7f8c8d; margin: 12pt 0 6pt 0; page-break-after: avoid; }
        .pdf-preview.modern p { margin: 0 0 15pt 0; text-align: left; }
        .pdf-preview.modern a { color: #3498db; text-decoration: none; }
        .pdf-preview.modern code { font-family: 'Monaco', 'Menlo', monospace; font-size: 10pt; background-color: #ecf0f1; padding: 3pt 6pt; border-radius: 3pt; }
        .pdf-preview.modern pre { font-family: 'Monaco', 'Menlo', monospace; font-size: 10pt; background-color: #2c3e50; color: #ecf0f1; padding: 15pt; margin: 18pt 0; border-radius: 6pt; text-decoration: none; }
        .pdf-preview.modern pre code { background-color: transparent; color: inherit; padding: 0; }
        .pdf-preview.modern blockquote { margin: 18pt 0; padding: 12pt 18pt; background-color: #ecf0f1; border-left: 4pt solid #3498db; font-style: normal; }
        .pdf-preview.modern ul, .pdf-preview.modern ol { margin: 12pt 0; padding-left: 24pt; }
        .pdf-preview.modern li { margin: 6pt 0; }
        .pdf-preview.modern table { border-collapse: collapse; width: 100%; margin: 18pt 0; font-size: 10pt; }
        .pdf-preview.modern th { background-color: #34495e; color: white; font-weight: 500; padding: 12pt 15pt; border: none; }
        .pdf-preview.modern td { padding: 12pt 15pt; border: none; border-bottom: 1pt solid #ecf0f1; }
        .pdf-preview.modern tr:nth-child(even) td { background-color: #f8f9fa; }
        .pdf-preview.modern hr { border: none; border-top: 1pt solid #bdc3c7; margin: 36pt 0; }
        `;
    }
    
    return baseStyles;
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type === 'error' ? 'error' : ''}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Initialize preview
updatePreview();