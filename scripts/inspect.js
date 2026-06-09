const xlsx = require('xlsx');
const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.xlsx'));
for (const file of files) {
  console.log('--------------------------------------------------');
  console.log('File:', file);
  try {
    const wb = xlsx.readFile(file);
    console.log('  Sheets:', wb.SheetNames);
    for (const sheet of wb.SheetNames) {
      const data = xlsx.utils.sheet_to_json(wb.Sheets[sheet], {header: 1});
      console.log('    ' + sheet + ' headers:');
      console.log('      ', data[0] ? data[0].slice(0, 10).map(v => String(v).substring(0, 20)) : 'empty');
    }
  } catch (e) {
    console.log('  Error reading file:', e.message);
  }
}
