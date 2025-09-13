const fs = require('fs');

const jsonHandler = {
    readJsonFile: (filePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    },

    writeJsonFile: (filePath, data) => {
        return new Promise((resolve, reject) => {
            const jsonData = JSON.stringify(data, null, 2);
            fs.writeFile(filePath, jsonData, 'utf8', (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
};

module.exports = jsonHandler;