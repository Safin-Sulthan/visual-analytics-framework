const fs = require('fs');
const csvParser = require('csv-parser');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const rows = [];
    let headers = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('headers', (h) => {
        headers = h;
      })
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve({ rows, headers });
      })
      .on('error', (err) => {
        reject(new Error(`CSV parse error: ${err.message}`));
      });
  });
};

module.exports = { parseCSV };
