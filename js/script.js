document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const subtitleEditor = document.getElementById('subtitle-editor');
    const downloadBtn = document.getElementById('download-btn');
    
    const maxChars = 42; 

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        fileNameDisplay.textContent = `File: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const rawText = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let formattedText;

            if (fileExtension === 'srt') {
                formattedText = processSrt(rawText, maxChars);
            } else if (fileExtension === 'vtt') {
                formattedText = processVtt(rawText, maxChars);
            } else {
                subtitleEditor.value = "Format file tidak didukung. Harap unggah .srt atau .vtt.";
                return;
            }
            
            subtitleEditor.value = formattedText;
            downloadBtn.disabled = false;
        };
        
        reader.readAsText(file);
    });

    downloadBtn.addEventListener('click', () => {
        const fileName = fileNameDisplay.textContent.replace('File: ', '');
        const newFileName = fileName;

        const content = subtitleEditor.value;

        let mimeType = 'application/octet-stream';
        if (newFileName.endsWith('.srt')) mimeType = 'application/x-subrip';
        else if (newFileName.endsWith('.vtt')) mimeType = 'text/vtt';

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    function processSrt(text, maxChars) {
        const blocks = text.split(/\r?\n\s*\n/).filter(block => block.trim() !== '');
        const processedBlocks = blocks.map(block => {
            const lines = block.split(/\r?\n/);
            if (lines.length < 3 || !lines[0].match(/^\d+$/) || !lines[1].includes('-->')) return block; 

            const [index, timestamp, ...dialogLines] = lines;
            const fullDialog = dialogLines.join(' ');
            const formattedDialog = breakLines(fullDialog, maxChars);
            
            return `${index}\n${timestamp}\n${formattedDialog}`;
        });
        return processedBlocks.join('\n\n').trim();
    }

    function processVtt(text, maxChars) {
        const blocks = text.split(/\r?\n\s*\n/).filter(block => block.trim() !== '');
        let webvttHeader = '';
        if (blocks[0] && blocks[0].startsWith('WEBVTT')) {
            webvttHeader = blocks.shift();
        }
        
        const processedBlocks = blocks.map(block => {
            const lines = block.split(/\r?\n/);
            if (lines.length < 1 || !lines.find(line => line.includes('-->'))) return block;

            const timestampLine = lines.find(line => line.includes('-->'));
            const timestampIndex = lines.indexOf(timestampLine);
            const dialogLines = lines.slice(timestampIndex + 1);

            const fullDialog = dialogLines.join(' ');
            const formattedDialog = breakLines(fullDialog, maxChars);
            
            const precedingLines = lines.slice(0, timestampIndex + 1).join('\n');
            
            return `${precedingLines}\n${formattedDialog}`;
        });

        return (webvttHeader ? webvttHeader + '\n\n' : '') + processedBlocks.join('\n\n').trim();
    }

    function breakLines(text, maxChars) {
        const tags = {};
        let tagCounter = 0;
        
        // 1. Hapus tag \fs (ukuran font)
        let cleanedFsText = text.replace(/\\fs\d+/g, '').replace(/\{\}/g, '');

        // 2. Proteksi tag sisa agar tidak merusak perhitungan panjang karakter
        const cleanedText = cleanedFsText.replace(/(<[^>]+>|\{[^}]+\})/g, (match) => {
            const placeholder = `_TAG_${tagCounter}_`;
            tags[placeholder] = match;
            tagCounter++;
            return placeholder;
        });

        const finalCleanedText = cleanedText.replace(/\s+/g, ' ').trim();
        const textOnlyLength = finalCleanedText.replace(/_TAG_\d+_/g, '').length;

        let resultText = "";

        if (textOnlyLength <= maxChars) {
            resultText = finalCleanedText;
        } 
        else if (textOnlyLength <= maxChars * 2) {
            // LOGIKA BARU: Cek apakah sisa karakter baris kedua setidaknya 1/3 dari maxChars
            const secondLineSize = textOnlyLength - maxChars;
            if (secondLineSize < (maxChars / 3)) {
                // Jika kurang dari 1/3 (misal < 14 karakter), biarkan jadi 1 baris panjang
                resultText = finalCleanedText;
            } else {
                // Jika cukup panjang, bagi menjadi 2 baris seimbang
                resultText = splitToBalancedLines(finalCleanedText, 2);
            }
        } 
        else {
            // Jika melebihi 2x lipat maxChars, paksa jadi 2 baris seimbang
            resultText = splitToBalancedLines(finalCleanedText, 2);
        }

        // 3. Kembalikan tag asli ke posisinya
        for (const placeholder in tags) {
            const regex = new RegExp(placeholder, 'g');
            resultText = resultText.replace(regex, tags[placeholder]);
        }
        
        return resultText;
    }

    function splitToBalancedLines(text, numLines) {
        const words = text.split(' ');
        const textOnly = text.replace(/_TAG_\d+_/g, '');
        const targetLen = Math.ceil(textOnly.length / numLines);
        
        let lines = [];
        let currentLineWords = [];
        let currentLen = 0;

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const wordCleanLen = word.replace(/_TAG_\d+_/g, '').length;
            
            if (lines.length < numLines - 1 && currentLen + (currentLen > 0 ? 1 : 0) + wordCleanLen > targetLen) {
                if (currentLineWords.length > 0) {
                    lines.push(currentLineWords.join(' '));
                    currentLineWords = [word];
                    currentLen = wordCleanLen;
                } else {
                    currentLineWords.push(word);
                    currentLen += wordCleanLen;
                }
            } else {
                currentLineWords.push(word);
                currentLen += (currentLineWords.length > 1 ? 1 : 0) + wordCleanLen;
            }
        }
        
        if (currentLineWords.length > 0) {
            lines.push(currentLineWords.join(' '));
        }

        return lines.join('\n');
    }
});