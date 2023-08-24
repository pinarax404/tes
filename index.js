const fs = require('fs');
const chalk = require('chalk');
const { prompt } = require('./src/prompt.js');
const { igCreate } = require('./src/instagramCreate.js');
const { igEditBio, igFollowFollowers } = require('./src/instagramTools.js');

if (!fs.existsSync('../storage/downloads/hasil_akun_ig.txt')) {fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_text.txt')) {fs.appendFileSync('../storage/downloads/bio_text.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_link.txt')) {fs.appendFileSync('../storage/downloads/bio_link.txt', '')};
if (!fs.existsSync('../storage/downloads/akun_target.txt')) {fs.appendFileSync('../storage/downloads/akun_target.txt', '')};

process.stdout.write('\033c');

const create = async (modeCreate, modeAgent) => {
    var toolsCreate = await igCreate(modeCreate, modeAgent);

    if (toolsCreate !== false) {
        if (modeCreate === 3) {
            const bio = getBio();
            const link = getLink();
            const target = getTarget();
            const setBio = await igEditBio(bio, link, toolsCreate);
            if (setBio && setBio.user && setBio.user.biography) {
                console.log(chalk`{bold.white Update Bio {bold.green Success}}`);
            } else {
                console.log(chalk`{bold.white Update Bio {bold.red Failed}}`);
            }
            await igFollowFollowers(target, toolsCreate);
            create(modeCreate, modeAgent);
        } else {
            create(modeCreate, modeAgent);
        }
    } else {
        create(modeCreate, modeAgent);
    }
}

function getBio() {
    var data = fs.readFileSync('../storage/downloads/bio_text.txt', 'utf8');
    return data.trim();
}

function getLink() {
    var data = fs.readFileSync('../storage/downloads/bio_link.txt', 'utf8');
    var lines = data.split('\n');
    if (lines.length > 0 && lines[0] !== '') {
        var toSend = lines[0];
        lines.splice(0, 1);
        fs.writeFile('../storage/downloads/bio_link.txt', lines.join('\n'), (err) => {});
        return toSend.trim();
    } else {
        return false;
    }
}

function getTarget() {
    var data = fs.readFileSync('../storage/downloads/akun_target.txt', 'utf8');
    var lines = data.split('\n');
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
    create(mode.modeCreate, mode.modeAgent);
})();
