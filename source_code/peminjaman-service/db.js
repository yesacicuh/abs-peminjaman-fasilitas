const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.json');

// Jika file database.json kosong/belum ada format dasar, buatkan otomatis
if (!fs.existsSync(dbPath) || fs.readFileSync(dbPath, 'utf8').trim() === '') {
    fs.writeFileSync(dbPath, JSON.stringify({ loans: [] }, null, 2));
}

module.exports = {
    read: () => JSON.parse(fs.readFileSync(dbPath, 'utf8')),
    write: (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
};