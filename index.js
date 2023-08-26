const fs = require('fs');
const chalk = require('chalk');
const { prompt } = require('./src/prompt.js');
const { createAccount } = require('./src/instagram.js');

if (!fs.existsSync('../storage/downloads/hasil_akun_create.txt')) {fs.appendFileSync('../storage/downloads/hasil_akun_create.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_text.txt')) {fs.appendFileSync('../storage/downloads/bio_text.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_link.txt')) {fs.appendFileSync('../storage/downloads/bio_link.txt', '')};
if (!fs.existsSync('../storage/downloads/akun_target.txt')) {fs.appendFileSync('../storage/downloads/akun_target.txt', '')};

process.stdout.write('\033c');

const main = async (a) => {
    const req = await createAccount(a);
    if (req !== false) {
        if (a === 1 || a === 2) {
            main(a);
        } else if (a === 3) {
            
        }
    } else {
        main(a);
    }
}

const getBio = async () => {
    var data = fs.readFileSync('../storage/downloads/bio_text.txt', 'utf8');
    var lines = data.split('\r\n');
    return lines.join('%5Cn');
}

const getLink = async () => {
    var data = fs.readFileSync('../storage/downloads/bio_link.txt', 'utf8');
    var lines = data.split('\r\n');
    if (lines.length > 0 && lines[0] !== '') {
        var toSend = lines[0];
        lines.splice(0, 1);
        fs.writeFile('../storage/downloads/bio_link.txt', lines.join('\n'), (err) => {});
        return toSend.trim();
    } else {
        return false;
    }
}

const getTarget = async () => {
    var data = fs.readFileSync('../storage/downloads/akun_target.txt', 'utf8');
    var lines = data.split('\r\n');
    if (lines.length > 0 && lines[0] !== '') {
        var toSend = lines[0];
        lines.splice(0, 1);
        fs.writeFile('../storage/downloads/akun_target.txt', lines.join('\n'), (err) => {});
        return toSend.trim();
    } else {
        return false;
    }
}

(async () => {
    const mode = await prompt();
    main(mode.modeCreate);
})();
