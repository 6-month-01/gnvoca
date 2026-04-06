import fs from 'fs';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../노랭이.csv');
const publicPath = join(__dirname, 'public/data.csv');

const rawData = fs.readFileSync(inputPath, 'utf8');

Papa.parse(rawData, {
  header: false,
  skipEmptyLines: true,
  complete: function(results) {
    const newRows = [];
    let cleanedCount = 0;
    
    for (const row of results.data) {
      if (!row[0] || !row[1] || !row[2]) continue;
      
      const day = row[0].trim();
      const english = row[1].trim();
      let korean = row[2].trim();
      
      const parenRegex = /\(([^)]+)\)/g;
      
      // Clean the korean string
      korean = korean.replace(parenRegex, (match, inside) => {
        let hasExtraction = false;
        
        const synRegex = /([a-zA-Z\-]+)\s*([^a-zA-Z]+)/g;
        let synMatch;
        while ((synMatch = synRegex.exec(inside)) !== null) {
          const synEng = synMatch[1].trim();
          let synKor = synMatch[2].trim();
          synKor = synKor.replace(/,+$/, '').trim();
          
          if (synEng && synKor && /[가-힣]/.test(synKor)) {
            hasExtraction = true;
          }
        }
        
        // If we would have extracted it, remove the entire parenthesis from the string!
        if (hasExtraction) {
          cleanedCount++;
          return '';
        }
        
        return match; // keep it if no english extraction
      });
      
      // Remove trailing/leading spaces or commas from cleanup
      korean = korean.replace(/\s+/g, ' ').replace(/,\s*$/g, '').trim();
      
      newRows.push([day, english, korean]);
    }
    
    const newCsv = Papa.unparse(newRows);
    fs.writeFileSync(inputPath, newCsv, 'utf8');
    fs.writeFileSync(publicPath, newCsv, 'utf8');
    console.log(`Successfully cleaned ${cleanedCount} parenthesis blocks from the CSV.`);
  }
});
