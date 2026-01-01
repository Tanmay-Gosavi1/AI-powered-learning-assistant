import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
        
        const result = await parser.getText();

        return {
            text: result.text,
            numPages: result.numpages,
            info: result.info
        }
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}