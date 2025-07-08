// DOM elements
const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const convertBtn = document.getElementById('convertBtn');
const fileName = document.getElementById('fileName');
const notification = document.getElementById('notification');

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
    
    if (markdown) {
        const html = marked.parse(markdown);
        preview.innerHTML = `<div class="pdf-preview">${html}</div>`;
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

// Generate HTML for PDF with professional styling
function generatePDFHTML() {
    const markdown = markdownInput.value.trim();
    const html = marked.parse(markdown);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        
        body {
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.8;
            color: #2c3e50;
            max-width: 100%;
            margin: 0;
            padding: 0;
        }
        
        h1 {
            font-size: 28pt;
            margin: 24pt 0 12pt;
            color: #1a252f;
            border-bottom: 3px solid #3498db;
            padding-bottom: 6pt;
            page-break-after: avoid;
        }
        
        h2 {
            font-size: 22pt;
            margin: 18pt 0 9pt;
            color: #2c3e50;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 18pt;
            margin: 15pt 0 6pt;
            color: #34495e;
            page-break-after: avoid;
        }
        
        h4 {
            font-size: 14pt;
            margin: 12pt 0 6pt;
            color: #34495e;
            page-break-after: avoid;
        }
        
        h5, h6 {
            font-size: 12pt;
            margin: 9pt 0 6pt;
            color: #34495e;
            page-break-after: avoid;
        }
        
        p {
            margin: 9pt 0;
            text-align: justify;
            orphans: 3;
            widows: 3;
        }
        
        a {
            color: #3498db;
            text-decoration: none;
        }
        
        code {
            background-color: #f4f4f4;
            padding: 2pt 4pt;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 12pt;
            overflow-x: auto;
            margin: 12pt 0;
            page-break-inside: avoid;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 12pt;
            margin: 12pt 0;
            color: #555;
            font-style: italic;
        }
        
        ul, ol {
            margin: 9pt 0;
            padding-left: 24pt;
        }
        
        li {
            margin: 3pt 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 12pt 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 9pt;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 12pt auto;
            page-break-inside: avoid;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 24pt 0;
            page-break-after: avoid;
        }
        
        /* Ensure proper page breaks */
        h1, h2, h3, h4, h5, h6 {
            page-break-inside: avoid;
        }
        
        p {
            page-break-inside: avoid;
        }
        
        /* Keep headings with their content */
        h1 + *, h2 + *, h3 + *, h4 + *, h5 + *, h6 + * {
            page-break-before: avoid;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>
    `;
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