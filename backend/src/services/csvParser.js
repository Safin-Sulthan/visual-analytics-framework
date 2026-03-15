const { parse } = require('csv-parse');
const fs = require('fs');

/**
 * Parse a CSV file and return { columns, rowCount }.
 * Reads only headers + counts rows to avoid loading entire file into memory.
 */
const parseCSVMeta = (filePath) =>
  new Promise((resolve, reject) => {
    let columns = [];
    let rowCount = 0;
    let headersExtracted = false;

    const stream = fs.createReadStream(filePath).pipe(
      parse({ trim: true, skip_empty_lines: true })
    );

    stream.on('data', (row) => {
      if (!headersExtracted) {
        columns = row;
        headersExtracted = true;
      } else {
        rowCount++;
      }
    });

    stream.on('end', () => resolve({ columns, rowCount }));
    stream.on('error', (err) => reject(err));
  });

/**
 * Parse a CSV file fully and return an array of row objects.
 * Use with caution on large files.
 */
const parseCSVFull = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];

    const stream = fs.createReadStream(filePath).pipe(
      parse({ columns: true, trim: true, skip_empty_lines: true })
    );

    stream.on('data', (row) => rows.push(row));
    stream.on('end', () => resolve(rows));
    stream.on('error', (err) => reject(err));
  });

module.exports = { parseCSVMeta, parseCSVFull };
