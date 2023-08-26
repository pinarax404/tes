const fs = require('fs');
const chalk = require('chalk');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { myIp, fullName, mailId, getCode, makeid, delay } = require('./index.js');

var cookies = 'csrftoken=wMhxqRONQTzCcaPGmVb280hAIpkzlqW2;rur="PRN\05461734602757\0541724617844:01f7ca9e95b8f242a24e9bbb200978eaa0bccfd7593c505cb185ab0445885463fad57064";mid=ZOpg5wAAAAHNr_RXtOkGozqAnNb2;ds_user_id=61734602757;ig_did=6BAFF406-6C7D-4518-8CED-3E2AA723E802;sessionid=61734602757%3AZzbIrgcPjw4JRS%3A16%3AAYcKBHWE8mStQ4bXTlfZmJnmM8aQSyBA_HtaU7TfGA;';

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
                console.log(cookies);
                const check = await requestWeb('igcheck', {'username': username});
                if (check !== false) {
                    fs.appendFileSync('../storage/downloads/hasil_akun_kosongan.txt', username + '|' + password + '|' + email + '|' + cookies + '\n');
                    console.log(chalk`{bold.white ✔ Create: {bold.green Success}}`);
                    console.log(chalk`{bold.white ✔ Username: {bold.green ${username}}}`);
                    console.log(chalk`{bold.white ✔ Email: {bold.green ${email}}}`);
                    if (a === 1) {
                        console.log(chalk`{bold.white ========================================}`);
                        return true;
                    } else if (a === 2 || a === 3) {
                        const upload = await requestWeb('updateprofile');
                        if (upload === true) {
                            console.log(chalk`{bold.white ✔ Profile: {bold.green Success}}`);
                            console.log(chalk`{bold.white ========================================}`);
                        } else {
                            console.log(chalk`{bold.white ✘ Profile: {bold.red Failed}}`);
                            console.log(chalk`{bold.white ========================================}`);
                        }
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

const requestWeb = async (a, b) => {
    var authheader = {
        'Host': 'www.instagram.com',
        'Cookie': cookies,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/116.0.5845.103 Mobile/15E148 Safari/604.1',
        'X-IG-App-ID': '1217981644879628',
        'X-Web-Device-Id': parseCookies('getvalue', 'ig_did'),
        'X-ASBD-ID': '129477',
        'X-CSRFToken': parseCookies('getvalue', 'csrftoken'),
        'Origin': 'https://www.instagram.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Site': 'same-origin',
        'Content-Length': '37',
        'X-Instagram-AJAX': '1008286845',
        'Connection': 'keep-alive',
        'X-IG-WWW-Claim': '0',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Mode': 'cors'
    };

    var polarisheader = {
        'Host': 'www.instagram.com',
        'Accept': '*/*',
        'X-ASBD-ID': '129477',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-Fetch-Site': 'same-origin',
        'X-IG-App-ID': '1217981644879628',
        'X-Instagram-AJAX': '1008286845',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Mode': 'cors',
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/116.0.5845.103 Mobile/15E148 Safari/604.1',
        'X-IG-WWW-Claim': '0',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'X-CSRFToken': parseCookies('getvalue', 'csrftoken')
    };

    var uploadheader = {
        'viewport-width': '601',
        'x-csrftoken': parseCookies('getvalue', 'csrftoken'),
        'x-instagram-ajax': '1',
        'x-requested-with': 'XMLHttpRequest',
        'cookie': cookies
    };

    if (a === 'openApp') {
        try {
            const ajax = await fetch('https://www.instagram.com/data/shared_data/', {'headers': {'content-type': 'application/x-www-form-urlencoded'}, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.config && resp.config.csrf_token) {
                cookies = `ig_did=${getUUID()};datr=${makeid(24)};csrftoken=${resp.config.csrf_token};mid=${makeid(28)};ig_nrcb=1;`;
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'suggestuser') {
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/username_suggestions/', {'headers': authheader, 'timeout': 35000, 'body': `email=&name=${b.first_name}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.suggestions) {
                const username = resp.suggestions[Math.floor(Math.random() * resp.suggestions.length)];
                return username;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'sendmail') {
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/accounts/send_verify_email/', {'headers': authheader, 'timeout': 35000, 'body': `device_id=${parseCookies('getvalue', 'mid')}&email=${b.email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
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
        try {
            const send = await fetch('https://www.instagram.com/api/v1/accounts/check_confirmation_code/', {'headers': authheader, 'timeout': 35000, 'body': `code=${b.code}&device_id=${parseCookies('getvalue', 'mid')}&email=${b.email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const code = await send.json();
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/web_create_ajax/', {'headers': authheader, 'timeout': 40000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${datenow()}:${b.password}&email=${b.email}&first_name=${b.name}&username=${b.username}&day=25&month=8&year=1994&client_id=${parseCookies('getvalue', 'mid')}&seamless_login_enabled=1&tos_version=row&force_sign_up_code=${code.signup_code}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            const resp = await ajax.json();
            return resp;
        } catch (err) {
            return false;
        }
    }

    if (a === 'igcheck') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${b.username}`, {'headers': polarisheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.data && resp.data.user && resp.data.user.id) {
                return resp.data.user.id;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'updateprofile') {
        try {
            const apiImage = await fetch(`https://image.ionus.fun/a%20%28${Math.floor(Math.random() * (808 - 1) + 1)}%29.jpg`).then((e) => {return e}).catch((e) => {return false});
            const blob = await apiImage.buffer();
            const toSend = new FormData();
            toSend.append('profile_pic', blob, 'profilepic.jpg');
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/web_change_profile_picture/', {'headers': uploadheader, 'timeout': 35000, 'body': toSend, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
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
}

const datenow = () => {
    var date = new Date();
    var datenow = Math.floor(date.getTime()/1000);
    return datenow;
}

function getUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16).toUpperCase();
    });
    return uuid;
}

const parseCookies = (a, b) => {
    if (a === 'update') {
        cookies = '';
        var raw = b.headers.raw()['set-cookie'];
        raw.map((entry) => {
            var name = entry.split(';')[0].split('=')[0];
            var value = entry.split(';')[0].split('=')[1];
            cookies += name + '=' + value + ';';
        });
        return true;
    }
    if (a === 'getvalue') {
        if (cookies.includes(b)) {
            var raw = cookies.split(b + '=')[1].split(';')[0];
            return raw;
        } else {
            return '';
        }
    }
    if (a === 'reset') {
        cookies = '';
        return true;
    }
}

module.exports = { createAccount, requestWeb };
