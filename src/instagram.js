const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');
const FormData 	= require('form-data');
const { myIp, fullName, mailId, getCode } = require('./index.js');

var cookiejar = {};

var header = {
    'Host': 'www.instagram.com',
    'Cookie': '',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.instagram.com/',
    'X-IG-App-ID': '1217981644879628',
    'X-ASBD-ID': '129477',
    'X-CSRFToken': '',
    'Origin': 'https://www.instagram.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Site': 'same-origin',
    'X-Instagram-AJAX': '1008242111',
    'Connection': 'keep-alive',
    'X-IG-WWW-Claim': '0',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Fetch-Mode': 'cors'
};

const createAccount = async (a) => {
    const ip = await myIp();
    console.log(chalk`{bold.white IP: {bold.green ${ip.ip}} | Country: {bold.green ${ip.country}}}`);

    await requestWeb('openApp');
    const first_name = await fullName();
    const email = await mailId();
    const username = await requestWeb('suggestuser', {'first_name': first_name});
    const password = 'badakweslepas';

    if (first_name !== false && email !== false && username !== false) {
        const sendMail = await requestWeb('sendmail', {'email': email});
        if (sendMail === true) {
            const code = await getCode(email);
            if (code !== false) {
                console.log(chalk`{bold.white Waiting Email Code: {bold.green ${code}}}`);
                await requestWeb('create', {'name': first_name, 'username': username, 'password': password, 'email': email, 'code': code});
                await requestWeb('openApp');
                await requestWeb('login', {'username': username, 'password': password});
                const coki = await parseCookies('getstring');
                console.log(coki);
                const check = await requestWeb('igusername', {'username': username});
                console.log(check);
                //if (check !== false) {
                //    const cookies = await parseCookies('getstring');
                //    fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', username + '|' + password + '|' + email + '|' + cookies + '\n');
                //    console.log(chalk`{bold.white ✔ Create: {bold.green Success}}`);
                //    console.log(chalk`{bold.white ✔ Username: {bold.green ${username}}}`);
                //    console.log(chalk`{bold.white ✔ Email: {bold.green ${email}}}`);
                //    return true;
                //} else {
                //    console.log(chalk`{bold.white ✘ Create: {bold.red Checkpoint}}`);
                //    console.log(chalk`{bold.white ✘ Username: {bold.red ${username}}}`);
                //    console.log(chalk`{bold.white ✘ Email: {bold.red ${email}}}`);
                //    return false;
                //}
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

const uploadProfile = async () => {
    var header = {
        'viewport-width': '601',
        'x-csrftoken': await parseCookies('getvalue', 'csrftoken'),
        'x-instagram-ajax': '1',
        'x-requested-with': 'XMLHttpRequest',
        'cookie': await parseCookies('getstring')
    };

    try {
        const apiImage = await fetch(`https://image.ionus.fun/a%20%28${Math.floor(Math.random() * (808 - 1) + 1)}%29.jpg`).then((e) => {return e}).catch((e) => {return false});
        const blob = await apiImage.buffer();
        const toSend = new FormData();
        toSend.append('profile_pic', blob, 'profilepic.jpg');
        const ajax = await fetch('https://www.instagram.com/accounts/web_change_profile_picture/', {'headers': header, 'timeout': 35000, 'body': toSend, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        if (resp && resp.changed_profile === true) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

const login = async (user, pass) => {
    await requestWeb('openApp');
    await requestWeb('login', {'username': user, 'password': pass});
    const check = await requestWeb('igusername', {'username': user});
    return check;
}

const requestWeb = async (a, b) => {
    if (a === 'openApp') {
        header['Cookie'] = '';
        header['User-Agent'] = agent('web');
        header['X-CSRFToken'] = '';
        try {
            const ajax = await fetch('https://www.instagram.com/data/shared_data/', {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'suggestuser') {
        header['User-Agent'] = agent('web');
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/web_create_ajax/attempt/', {'headers': header, 'timeout': 35000, 'body': `email=&first_name=${b.first_name}&username=&opt_into_one_tap=false`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.username_suggestions) {
                const username = resp.username_suggestions[Math.floor(Math.random() * resp.username_suggestions.length)];
                return username;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'sendmail') {
        header['User-Agent'] = agent('web');
        const mid = await parseCookies('getvalue', 'mid');
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/accounts/send_verify_email/', {'headers': header, 'timeout': 35000, 'body': `device_id=${mid}&email=${b.email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.email_sent === true) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'create') {
        header['User-Agent'] = agent('web');
        const mid = await parseCookies('getvalue', 'mid');
        const date = await datenow();
        try {
            const send = await fetch('https://www.instagram.com/api/v1/accounts/check_confirmation_code/', {'headers': header, 'timeout': 35000, 'body': `code=${b.code}&device_id=${mid}&email=${b.email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const code = await send.json();
            header['User-Agent'] = agent('app');
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/web_create_ajax/', {'headers': header, 'timeout': 40000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${date}:${b.password}&email=${b.email}&first_name=${b.name}&username=${b.username}&day=25&month=8&year=1994&client_id=${mid}&seamless_login_enabled=1&tos_version=row&force_sign_up_code=${code.signup_code}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'igusername') {
        header['User-Agent'] = agent('web');
        const ajax = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${b.username}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        return resp;
    }

    if (a === 'login') {
        header['User-Agent'] = agent('app');
        const date = await datenow();
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/login/ajax/', {'headers': header, 'timeout': 35000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${date}:${b.password}&optIntoOneTap=false&queryParams={}&trustedDeviceRecords={}&username=${b.username}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            const resp = await ajax.json();
            if (resp && resp.user === true && resp.userId && resp.authenticated === true && resp.status === 'ok') {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }
}

const datenow = () => {
    var date = new Date();
    var datenow = Math.floor(date.getTime()/1000);
    return datenow;
}

const agent = (a) => {
    if (a === 'web') {
        return 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
    }
    if (a === 'app') {
        return 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)';
    }
}

const parseCookies = (a, b) => {
    if (a === 'update') {
        header['Cookie'] = '';
        header['X-CSRFToken'] = '';
        var raw = b.headers.raw()['set-cookie'];
        raw.map((entry) => {
            var name = entry.split(';')[0].split('=')[0];
            var value = entry.split(';')[0].split('=')[1];
            header['Cookie'] += name + '=' + value + ';';
            if (name === 'csrftoken') {
                header['X-CSRFToken'] = value;
            }
        });
        return true;
    }
    if (a === 'getvalue') {
        var raw = header['Cookie'];
        var value = raw.split(b + '=')[1].split(';')[0];
        return value;
    }
    if (a === 'getstring') {
        return header['Cookie'];
    }
}

module.exports = { createAccount, login };
