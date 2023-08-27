const fs = require('fs');
const chalk = require('chalk');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { myIp, fullName, mailId, getCode, makeid, delay } = require('./index.js');

var cookies = '';

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
                await requestWeb('login', {'username': username, 'password': password});
                const check = await requestWeb('igcheck', {'username': username});
                if (check !== false) {
                    fs.appendFileSync('../storage/downloads/hasil_akun_create.txt', username + '|' + password + '|' + email + '|' + cookies + '\n');
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

const followtarget = async (a, b) => {
    var count = 1;
    var next = '';

    const check = await requestWeb('infouid', {'uid': b.uid});
    if (check === false) {
        console.log(chalk`{bold.red Failed While Scrapping ${b.uid}}`);
        return false;
    } else if (check !== false && check.is_private === true) {
        console.log(chalk`{bold.yellow Target ${b.uid} is Private}`);
        return false;
    } else {
        try {
            do {
                var grab = await requestWeb(a, {'uid': b.uid, 'next': next});
                if (grab !== false) {
                    var items = grab.users;
                    await Promise.all(
                        items.map(async (lists) => {
                            if (!lists.is_private) {
                                var task = [requestWeb('follow', {'uid': lists.pk})];
                                var [follow] = await Promise.all(task);
                                if (follow) {
                                    console.log(chalk`{bold.white [${count++}] Follow ${lists.pk} {bold.green Success}}`);
                                } else {
                                    console.log(chalk`{bold.white [${count++}] Follow ${lists.pk} {bold.red Failed}}`);
                                }
                            } else {
                                console.log(chalk`{bold.yellow Target ${lists.pk} is Private, Skip}`);
                            }
                        })
                    );
                    next = grab.next_max_id;
                } else {
                    console.log(chalk`{bold.red Failed While Scrapping ${b.uid}}`);
                    return false;
                }
            } while (count < 220 && grab.next_max_id);
            console.log(chalk`{bold.green Follow Complete}`);
            return true;
        } catch (err) {
            console.log(chalk`{bold.red Auto Follow Failed}`);
            return false;
        }
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

    var appheader = {
        'User-Agent': 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)',
        'X-Ads-Opt-Out': '0',
        'X-CM-Bandwidth-KBPS': '-1.000',
        'X-CM-Latency': '-1.000',
        'X-IG-App-Locale': 'en_US',
        'X-IG-Device-Locale': 'en_US',
        'X-Pigeon-Session-Id': getUUID(),
        'X-Pigeon-Rawclienttime': datenow() + '.939',
        'X-IG-Connection-Speed': '3656kbps',
        'X-IG-Bandwidth-Speed-KBPS': '-1.000',
        'X-IG-Bandwidth-TotalBytes-B': '0',
        'X-IG-Bandwidth-TotalTime-MS': '0',
        'X-IG-Extended-CDN-Thumbnail-Cache-Busting-Value': '1000',
        'X-Bloks-Version-Id': '1b030ce63a06c25f3e4de6aaaf6802fe1e76401bc5ab6e5fb85ed6c2d333e0c7',
        'X-MID': parseCookies('getvalue', 'mid'),
        'X-IG-WWW-Claim': '0',
        'X-Bloks-Is-Layout-RTL': 'false',
        'X-IG-Connection-Type': 'WIFI',
        'X-IG-Capabilities': '3brTvwE=',
        'X-IG-App-ID': '567067343352427',
        'X-IG-Device-ID': getUUID(),
        'X-IG-Android-ID': 'android-18c7682505872861',
        'cookie': cookies,
        'content-type': 'application/x-www-form-urlencoded'
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
            await fetch('https://www.instagram.com/api/v1/web/accounts/web_create_ajax/', {'headers': authheader, 'timeout': 35000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${datenow()}:${b.password}&email=${b.email}&first_name=${b.name}&username=${b.username}&day=25&month=8&year=1994&client_id=${parseCookies('getvalue', 'mid')}&seamless_login_enabled=1&tos_version=row&force_sign_up_code=${code.signup_code}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'login') {
        authheader['User-Agent'] = 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)';
        authheader['X-Instagram-AJAX'] = '1008288139';
        try {
            const ajax = await fetch('https://www.instagram.com/api/v1/web/accounts/login/ajax/', {'headers': authheader, 'timeout': 35000, 'body': `enc_password=#PWD_INSTAGRAM_BROWSER:0:${datenow()}:${b.password}&optIntoOneTap=false&queryParams={}&trustedDeviceRecords={}&username=${b.username}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            await parseCookies('update', ajax);
            return true;
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

    if (a === 'updatebio') {
        try {
            const get = await fetch('https://i.instagram.com/api/v1/accounts/current_user/?edit=true', {'headers': appheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const attr = await get.json();
            const ajax = await fetch('https://i.instagram.com/api/v1/accounts/edit_profile/', {'headers': appheader, 'timeout': 35000, 'body': `ig_sig_key_version=4&signed_body=8429b96afd2a02dd472616692424e8e5dbc394edc6cf49b1f2ace60273c08188.{"biography":"${b.bio}","email":"${attr.user.email}","external_url":"${b.link}","first_name":"${attr.user.full_name}","gender":${attr.user.gender},"phone_number":"${attr.user.phone_number}","username":"${attr.user.username}","_csrftoken":"${parseCookies('getvalue', 'csrftoken')}","_uid":"${attr.user.pk}","device_id":"android-18c7682505872861","_uuid":"${appheader['X-IG-Device-ID']}"}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
            return true;
        } catch (err) {
            return false;
        }
    }

    if (a === 'infousername') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${b.username}`, {'headers': polarisheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.data && resp.data.user && resp.data.user.id) {
                return {'id': resp.data.user.id, 'is_private': resp.data.user.is_private};
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'infouid') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/users/${b.uid}/info/`, {'headers': polarisheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
            const resp = await ajax.json();
            if (resp && resp.user && resp.user.pk) {
                return {'id': resp.user.pk, 'is_private': resp.user.is_private};
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    }

    if (a === 'followers') {
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${b.uid}/followers/?count=10&search_surface=follow_list_page&max_id=${b.next}`, {'headers': polarisheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
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
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${b.uid}/following/?count=10&search_surface=follow_list_page&max_id=${b.next}`, {'headers': polarisheader, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
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
        try {
            const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/create/${b.uid}/`, {'headers': polarisheader, 'timeout': 35000, 'body': `container_module=profile&nav_chain=PolarisProfileRoot:profilePage:1:via_cold_start&user_id=${b.uid}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
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

module.exports = { createAccount, requestWeb, followtarget };
