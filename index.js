const fs = require('fs');
const chalk = require('chalk');
const { prompt } = require('./src/prompt.js');
const { createAccount, uploadProfile, editBio, checktarget, follow } = require('./src/instagram.js');

if (!fs.existsSync('../storage/downloads/hasil_akun_ig.txt')) {fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_text.txt')) {fs.appendFileSync('../storage/downloads/bio_text.txt', '')};
if (!fs.existsSync('../storage/downloads/bio_link.txt')) {fs.appendFileSync('../storage/downloads/bio_link.txt', '')};
if (!fs.existsSync('../storage/downloads/akun_target.txt')) {fs.appendFileSync('../storage/downloads/akun_target.txt', '')};

process.stdout.write('\033c');

const main = async (a) => {
    const create = await createAccount(a);
    if (create !== false) {
        if (a === 1) {
            fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', create.username + '|' + create.password + '|' + create.email + '|' + create.cookies + '\n');
            console.log(chalk`{bold.white ========================================}`);
            main(a);
        } else if (a === 2) {
            const upload = await uploadProfile(create.cookies);
            if (upload === true) {
                console.log(chalk`{bold.white ✔ Profile: {bold.green Success}}`);
                console.log(chalk`{bold.white ========================================}`);
                main(a);
            } else {
                console.log(chalk`{bold.white ✘ Profile: {bold.red Failed}}`);
                console.log(chalk`{bold.white ========================================}`);
                main(a);
            }
        } else if (a === 3) {
            const bio = await getBio();
            const link = await getLink();
            const target = await getTarget();

            const uploadProfile = await uploadProfile(create.cookies);
            const updateBio = await editBio(create.cookies, {'bio': bio, 'link': link});

            uploadProfile = uploadProfile ? `✔ Profile: ${chalk.bold.green('Success')}` : `✘ Profile: ${chalk.bold.red('Failed')}`;
            updateBio = updateBio ? `✔ Bio: ${chalk.bold.green('Success')}` : `✘ Bio: ${chalk.bold.red('Failed')}`;

            console.log(chalk`{bold.white ${uploadProfile}}`);
            console.log(chalk`{bold.white ${updateBio}}`);
            console.log(chalk`{bold.white ========================================}`);

            const checkTarget = await checktarget(create.cookies, {'target': target});
            if (checkTarget !== false && checkTarget.is_private === false) {
                const grab = await follow(create.cookies, {'mode': 'followers', 'target': target});
                if (grab === true) {
                    console.log(chalk`{bold.green Follow Complete}`);
                    console.log(chalk`{bold.white ========================================}`);
                    main(a);
                } else {
                    console.log(chalk`{bold.yellow Account Limit}`);
                    console.log(chalk`{bold.white ========================================}`);
                    main(a);
                }
            } else if (checkTarget !== false && checkTarget.is_private === true) {
                console.log(chalk`{bold.yellow Target ${checkTarget} is Private}`);
                console.log(chalk`{bold.white ========================================}`);
                main(a);
            } else {
                console.log(chalk`{bold.red Auto Follow Failed}`);
                console.log(chalk`{bold.white ========================================}`);
                main(a);
            }
        }
    } else {
        console.log(chalk`{bold.white ========================================}`);
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

const getTarget = async () => {
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
    main(mode.modeCreate);
})();
