const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');
const FormData 	= require('form-data');
const { myIp, fullName, mailId, getCode, delay } = require('./index.js');

var cookiejar = {};

const createAccount = async (a) => {
    const ip = await myIp();
    console.log(chalk`{bold.white IP: {bold.green ${ip.ip}} | Country: {bold.green ${ip.country}}}`);

    await parseCookies('reset');
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
                await parseCookies('reset');
                await requestWeb('openApp');
                await requestWeb('login', {'username': username, 'password': password});
                const check = await requestWeb('igusername', {'username': username});
                if (check !== false) {
                    const cookies = await parseCookies('getstring');
                    fs.appendFileSync('../storage/downloads/hasil_akun_ig.txt', username + '|' + password + '|' + email + '|' + cookies + '\n');
                    console.log(chalk`{bold.white ✔ Create: {bold.green Success}}`);
                    console.log(chalk`{bold.white ✔ Username: {bold.green ${username}}}`);
                    console.log(chalk`{bold.white ✔ Email: {bold.green ${email}}}`);
                    return true;
                } else {
                    console.log(chalk`{bold.white ✘ Create: {bold.red Checkpoint}}`);
                    console.log(chalk`{bold.white ✘ Username: {bold.red ${username}}}`);
                    console.log(chalk`{bold.white ✘ Email: {bold.red ${email}}}`);
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

const editBio = async (a) => {
    const edit = await requestApp('igSetBio', {'bio': a.bio, 'link': a.link});
    return edit;
}

const checktarget = async (a) => {
    if (isNaN(a.target)) {
        const send = await requestWeb('igusername', {'username': a.target});
        return send;
    } else {
        const send = await requestWeb('iguid', {'uid': a.target});
        return send;
    }
}

const follow = async (a) => {
    var count = 1;
    var next = '';
    try {
        do {
            var grab = await requestWeb(a.mode, {'target': a.target, 'next': next});
            if (grab !== false) {
                var items = grab.users;
                await Promise.all(
                    items.map(async (id) => {
                        if (id.is_private === false) {
                            var task = [requestWeb('follow', {'target': id.pk})];
                            var [follow] = await Promise.all(task);
                            if (follow) {
                                console.log(chalk`{bold.white [${count++}] Follow ${id.pk} {bold.green Success}}`);
                            } else {
                                console.log(chalk`{bold.white [${count++}] Follow ${id.pk} {bold.red Failed}}`);
                            }
                        } else {
                            console.log(chalk`{bold.yellow Target ${id.pk} is Private, Skip}`);
                        }
                    })
                );
                next = grab.next_max_id;
            } else {
                return false;
            }
        } while (count < 220 && grab.next_max_id);
        return true;
    } catch (err) {
        return false;
    }
}

const requestWeb = async (a, b) => {
    var header = {
        'Host': 'www.instagram.com',
        'Cookie': await parseCookies('getstring'),
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/116.0.5845.103 Mobile/15E148 Safari/604.',
        'Referer': 'https://www.instagram.com/',
        'X-IG-App-ID': '1217981644879628',
        'X-ASBD-ID': '129477',
        'X-CSRFToken': await parseCookies('getvalue', 'csrftoken'),
        'Origin': 'https://www.instagram.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Site': 'same-origin',
        'X-Instagram-AJAX': '1008242111',
        'Connection': 'keep-alive',
        'X-IG-WWW-Claim': '0',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Fetch-Mode': 'cors',
    };

    if (a === 'openApp') {
        try {
            const ajax = await fetch('https://www.instagram.com/data/shared_data/', {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'suggestuser') {
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
        const mid = await parseCookies('getvalue', 'mid');
        const date = await datenow();
        try {
            const send = await fetch('https://www.instagram.com/api/v1/accounts/check_confirmation_code/', {'headers': header, 'timeout': 35000, 'body': `code=${b.code}&device_id=${mid}&email=${b.email}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const code = await send.json();
            header['User-Agent'] = 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)';
            await fetch('https://www.instagram.com/api/v1/web/accounts/web_create_ajax/', {'headers': header, 'timeout': 40000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${date}:${b.password}&email=${b.email}&first_name=${b.name}&username=${b.username}&day=25&month=8&year=1994&client_id=${mid}&seamless_login_enabled=1&tos_version=row&force_sign_up_code=${code.signup_code}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'login') {
        header['User-Agent'] = 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)';
        const date = await datenow();
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/login/ajax/', {'headers': header, 'timeout': 40000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${date}:${b.password}&optIntoOneTap=false&queryParams={}&trustedDeviceRecords={}&username=${b.username}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'igusername') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${b.username}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.data && resp.data.user) {
                return {'is_private': resp.data.user.is_private, 'uid': resp.data.user.id};
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'iguid') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/users/${b.uid}/info/`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.user) {
                return {'is_private': resp.user.is_private, 'uid': resp.user.pk};
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'followers') {
        header['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${b.target}/followers/?count=10&search_surface=follow_list_page&max_id=${b.next}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.users) {
                return resp;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'following') {
        header['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${b.target}/following/?count=10&search_surface=follow_list_page&max_id=${b.next}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.users) {
                return resp;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'follow') {
        header['User-Agent'] = 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/create/${b.target}/`, {'headers': header, 'timeout': 35000, 'body': `container_module=profile&nav_chain=PolarisProfileRoot:profilePage:1:via_cold_start&user_id=${b.target}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.friendship_status) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }
}

const requestApp = async (a, b) => {
    var header = {
        'User-Agent': 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)',
        'X-Ads-Opt-Out': '0',
        'X-CM-Bandwidth-KBPS': '-1.000',
        'X-CM-Latency': '-1.000',
        'X-IG-App-Locale': 'en_US',
        'X-IG-Device-Locale': 'en_US',
        'X-Pigeon-Session-Id': uuid(),
        'X-Pigeon-Rawclienttime': await datenow() + '.939',
        'X-IG-Connection-Speed': '3656kbps',
        'X-IG-Bandwidth-Speed-KBPS': '-1.000',
        'X-IG-Bandwidth-TotalBytes-B': '0',
        'X-IG-Bandwidth-TotalTime-MS': '0',
        'X-IG-Extended-CDN-Thumbnail-Cache-Busting-Value': '1000',
        'X-Bloks-Version-Id': '1b030ce63a06c25f3e4de6aaaf6802fe1e76401bc5ab6e5fb85ed6c2d333e0c7',
        'X-MID': await parseCookies('getvalue', 'mid'),
        'X-IG-WWW-Claim': '0',
        'X-Bloks-Is-Layout-RTL': 'false',
        'X-IG-Connection-Type': 'WIFI',
        'X-IG-Capabilities': '3brTvwE=',
        'X-IG-App-ID': '567067343352427',
        'X-IG-Device-ID': uuid(),
        'X-IG-Android-ID': 'android-18c7682505872861',
        'cookie': await parseCookies('getstring'),
        'content-type': 'application/x-www-form-urlencoded'
    };

    if (a === 'igSetBio') {
        const csrf = await parseCookies('getvalue', 'csrftoken');
        try {
            const get = await fetch('https://i.instagram.com/api/v1/accounts/current_user/?edit=true', {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const attr = await get.json();
            const ajax = await fetch('https://i.instagram.com/api/v1/accounts/edit_profile/', {'headers': header, 'timeout': 35000, 'body': `ig_sig_key_version=4&signed_body=8429b96afd2a02dd472616692424e8e5dbc394edc6cf49b1f2ace60273c08188.{"biography":"${b.bio}","email":"${attr.user.email}","external_url":"${b.link}","first_name":"${attr.user.full_name}","gender":${attr.user.gender},"phone_number":"${attr.user.phone_number}","username":"${attr.user.username}","_csrftoken":"${csrf}","_uid":"${attr.user.pk}","device_id":"android-18c7682505872861","_uuid":"${header['X-IG-Device-ID']}"}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.user && resp.user.username) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }
}

function uuid() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const datenow = async () => {
    var date = new Date();
    var datenow = Math.floor(date.getTime()/1000);
    return datenow;
}

const parseCookies = async (a, b) => {
    if (a === 'update') {
        var raw = b.headers.raw()['set-cookie'];
        raw.map((entry) => {
            var name = entry.split(';')[0].split('=')[0];
            var value = entry.split(';')[0].split('=')[1];
            cookiejar[name] = value;
        });
        return true;
    }
    if (a === 'deserialize') {
        cookiejar = {};
        var raw = b.split(';');
        for (var i in raw) {
            if (raw[i] !== '') {
                var name = raw[i].split(';')[0].split('=')[0];
                var value = raw[i].split(';')[0].split('=')[1];
                cookiejar[name] = value;
            }
        }
        return true;
    }
    if (a === 'getvalue') {
        if (cookiejar[b]) {return cookiejar[b];} else {return '';}
    }
    if (a === 'getstring') {
        var c = '';
        for (var name in cookiejar) {c += name + '=' + cookiejar[name] + ';'}
        return c;
    }
    if (a === 'reset') {
        cookiejar = {};
        return true;
    }
}

module.exports = { createAccount, uploadProfile, editBio, checktarget, follow };
