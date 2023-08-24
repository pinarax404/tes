const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');
const FormData 	= require('form-data');
const { myIp, fullName, mailId, mailCode, userAgent, delay } = require('./index.js');

const igShared = 'https://www.instagram.com/data/shared_data/';
const igApiv1 = 'https://www.instagram.com/api/v1';
const password = 'badakweslepas';

var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'dpr': '1',
    'x-asbd-id': '129477',
    'x-ig-app-id': '936619743392459',
    'x-ig-www-claim': '0',
    'x-instagram-ajax': '1008014958',
    'x-csrftoken': '',
    'user-agent': '',
    'cookie': ''
}

const igCreate = async (modeCreate, modeAgent) => {
    const ip = await myIp();
    console.log(chalk`{bold.white IP: {bold.green ${ip.ip}} | Country: {bold.green ${ip.country}}}`);

    const name = await fullName();
    const email = await mailId();
    const app = await preFlow();
    var loop = 0;

    if (name !== false && email !== false && app !== false) {
        const username = await igApiSuggest(name);
        const sendMail = await igApiSendMail(email);
        if (username !== false && sendMail !== false) {
            var code = '';
            do {
                var reqGetCode = await mailCode(email);
                loop++;
                await delay(1000);
                code = reqGetCode;
            } while(reqGetCode === null && loop < 20);
            if (code !== false || code !== null || code !== 'null') {
                console.log(chalk`{bold.white Waiting Email Code: {bold.green ${code}}}`);
                await igApiCreate(code, email, name, username, password, modeAgent);
                var check = await igApiCheck(username);
                if (check !== false && check && check.data && check.data.user && check.data.user.username) {
                    fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', username + '|' + password + '|' + email + '|' + header.cookie + '\n');
                    console.log(chalk`{bold.white ✔ Create: {bold.green Success}}`);
                    console.log(chalk`{bold.white ✔ Username: {bold.green ${username}}}`);
                    console.log(chalk`{bold.white ✔ Email: {bold.green ${email}}}`);
                    if (modeCreate === 2 || modeCreate === 3) {
                        var upload = await igApiUpProfile();
                        if (upload !== false && upload && upload.changed_profile === true) {
                            console.log(chalk`{bold.white ✔ Profile: {bold.green Success}}`);
                            console.log(chalk`{bold.white ========================================}`);
                        } else {
                            console.log(chalk`{bold.white ✔ Profile: {bold.red Failed}}`);
                            console.log(chalk`{bold.white ========================================}`);
                        }
                        const koki = await cookies('serialize');
                        return koki;
                    } else {
                        console.log(chalk`{bold.white ✔ Profile: {bold.yellow none}}`);
                        console.log(chalk`{bold.white ========================================}`);
                        return true;
                    }
                } else {
                    console.log(chalk`{bold.white ✘ Create: {bold.red Checkpoint}}`);
                    console.log(chalk`{bold.white ✘ Username: {bold.red ${username}}}`);
                    console.log(chalk`{bold.white ✘ Email: {bold.red ${email}}}`);
                    console.log(chalk`{bold.white ========================================}`);
                    return false;
                }
            } else {
                console.log(chalk`{bold.white Waiting Email Code: {bold.red Failed}}`);
                return false;
            }
        } else {
            console.log(chalk`{bold.red Failed While Submitting Email}`);
            return false;
        }
    } else {
        console.log(chalk`{bold.red Failed While Generating Cookies}`);
        return false;
    }
}

async function preFlow() {
    header['x-csrftoken'] = '';
    header['user-agent'] = 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
    header['cookie'] = '';
    try {
        const ajax = await fetch(igShared, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
        await cookies('deSerialize', ajax);
        const koki = await cookies('serialize');
        return koki;
    } catch (err) {
        return false;
    }
}

async function igApiSuggest(name) {
    try {
        const ajax = await fetch(igApiv1 + '/web/accounts/web_create_ajax/attempt/', {'headers': header, 'timeout': 35000, 'body': `email=&first_name=${name}&username=&opt_into_one_tap=false`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        const username = resp.username_suggestions[Math.floor(Math.random() * resp.username_suggestions.length)];
        return username;
    } catch (err) {
        return false;
    }
}

async function igApiSendMail(email) {
    const mid = await cookies('cookieName', 'mid');
    try {
        const ajax = await fetch(igApiv1 + '/accounts/send_verify_email/', {'headers': header, 'timeout': 35000, 'body': `device_id=${mid}&email=${email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        return resp;
    } catch (err) {
        return false;
    }
}

async function igApiCreate(code, email, name, username, password, modeAgent) {
    const mid = await cookies('cookieName', 'mid');
    try {
        const ajax1 = await fetch(igApiv1 + '/accounts/check_confirmation_code/', {'headers': header, 'timeout': 35000, 'body': `code=${code}&device_id=${mid}&email=${email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp1 = await ajax1.json();
        if (modeAgent === 2) {header['user-agent'] = userAgent()}
        let ajax2 = await fetch(igApiv1 + '/web/accounts/web_create_ajax/', {'headers': header, 'timeout': 45000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:0:${password}&email=${email}&first_name=${name}&username=${username}&day=10&month=10&year=2000&client_id=${mid}&seamless_login_enabled=1&tos_version=eu&force_sign_up_code=${resp1.signup_code}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        await cookies('deSerialize', ajax2);
        return true;
    } catch (err) {
        return false;
    }
}

async function igApiCheck(username) {
    try {
        const ajax = await fetch(igApiv1 + `/users/web_profile_info/?username=${username}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        return resp;
    } catch (err) {
        return false;
    }
}

const igApiUpProfile = async () => {
    const koki = await cookies('serialize');
    var head = {
        'viewport-width': '601',
        'x-csrftoken': koki.csrftoken,
        'x-instagram-ajax': '1',
        'x-requested-with': 'XMLHttpRequest',
        'cookie': koki.cookiejar
    };

    try {
        const apiImage = await fetch(`https://image.ionus.fun/a%20%28${Math.floor(Math.random() * (808 - 1) + 1)}%29.jpg`).then((e) => {return e}).catch((e) => {return false});
        const blob = await apiImage.buffer();
        const toSend = new FormData();
        toSend.append('profile_pic', blob, 'profilepic.jpg');
        const ajax = await fetch('https://www.instagram.com/accounts/web_change_profile_picture/', {'headers': head, 'timeout': 35000, 'body': toSend, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resBody = await ajax.json();
        return resBody;
    } catch (err) {
        return false;
    }
}

function cookies(a, b) {
    if (a === 'deSerialize') {
        if (b.headers.raw()['set-cookie']) {
            var t = {};
            var rawOld = header['cookie'].split(';');
            for (var i in rawOld) {
                if (rawOld[i] !== '') {
                    var name = rawOld[i].split(';')[0].split('=')[0];
                    var value = rawOld[i].split(';')[0].split('=')[1];
                    t[name] = value;
                }
            }

            var rawNew = b.headers.raw()['set-cookie'];
            rawNew.map((entry) => {
                var name = entry.split(';')[0].split('=')[0];
                var value = entry.split(';')[0].split('=')[1];
                t[name] = value;
                if (name === 'csrftoken') {header['x-csrftoken'] = value}
            });

            var newCok = '';
            for (var key in t) {newCok += key + '=' + t[key] + ';'}
            header['cookie'] = newCok;
            return true;
        } else {
            return false;
        }
    }
    if (a === 'serialize') {
        var cookieJar = {'cookiejar': ''};
        var raw = header.cookie.split(';');
        for (var i in raw) {
            if (raw[i] !== '') {
                var name = raw[i].split(';')[0].split('=')[0];
                var value = raw[i].split(';')[0].split('=')[1];
                cookieJar[name] = value;
                cookieJar['cookiejar'] += name + '=' + value + ';';
            }
        }
        return cookieJar;
    }
    if (a === 'cookieName') {
        var raw = cookies('serialize');
        var name = raw[b];
        return name;
    }
}

module.exports = { igCreate };
