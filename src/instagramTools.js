const chalk = require('chalk');
const fetch = require('node-fetch');

var header = {
    'content-type': 'application/x-www-form-urlencoded',
    'dpr': '1',
    'x-asbd-id': '129477',
    'x-ig-app-id': '936619743392459',
    'x-ig-www-claim': '0',
    'x-instagram-ajax': '1008220018',
    'x-csrftoken': '',
    'user-agent': 'Mozilla/5.0 (Linux; Android 7.1.2; SM-G935FD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    'cookie': ''
}

async function igEditBio(bio, link, cookie) {
    var head = {
        'User-Agent': 'Instagram 121.0.0.29.119 Android (26/8.0.0; 480dpi; 1080x2076; samsung; SM-A530F; jackpotlte; samsungexynos7885; en_US; 185203708)',
        'X-Ads-Opt-Out': '0',
        'X-CM-Bandwidth-KBPS': '-1.000',
        'X-CM-Latency': '-1.000',
        'X-IG-App-Locale': 'en_US',
        'X-IG-Device-Locale': 'en_US',
        'X-Pigeon-Session-Id': uuid(),
        'X-Pigeon-Rawclienttime': '1692734896.939',
        'X-IG-Connection-Speed': '3656kbps',
        'X-IG-Bandwidth-Speed-KBPS': '-1.000',
        'X-IG-Bandwidth-TotalBytes-B': '0',
        'X-IG-Bandwidth-TotalTime-MS': '0',
        'X-IG-Extended-CDN-Thumbnail-Cache-Busting-Value': '1000',
        'X-Bloks-Version-Id': '1b030ce63a06c25f3e4de6aaaf6802fe1e76401bc5ab6e5fb85ed6c2d333e0c7',
        'X-MID': cookie.mid,
        'X-IG-WWW-Claim': '0',
        'X-Bloks-Is-Layout-RTL': 'false',
        'X-IG-Connection-Type': 'WIFI',
        'X-IG-Capabilities': '3brTvwE=',
        'X-IG-App-ID': '567067343352427',
        'X-IG-Device-ID': uuid(),
        'X-IG-Android-ID': 'android-18c7682505872861',
        'cookie': cookie.cookiejar,
        'content-type': 'application/x-www-form-urlencoded'
    };

    try {
        var body = `ig_sig_key_version=4&signed_body=8429b96afd2a02dd472616692424e8e5dbc394edc6cf49b1f2ace60273c08188.{"biography":"${bio}","email":"${cookie.email}","external_url":"${link}","first_name":"${cookie.first_name}","gender":3,"phone_number":"","username":"${cookie.username}","_csrftoken":"${cookie.csrftoken}","_uid":"${cookie.ds_user_id}","device_id":"android-18c7682505872861","_uuid":"${head['X-IG-Device-ID']}"}`;
        const ajax = await fetch('https://i.instagram.com/api/v1/accounts/edit_profile/', {'headers': head, 'timeout': 35000, 'body': body, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        return resp;
    } catch (err) {
        return false;
    }
}

async function igFollowFollowers(target, cookie) {
    header['x-csrftoken'] = cookie.csrftoken;
    header['cookie'] = cookie.cookiejar;

    const start = await toolsFollow('followers', target);
    return start;
}

async function toolsFollow(mode, target) {
    var count = 1;
    var next = '';
    try {
        do {
            var grab = await igGrab(mode, target, next);
            if (grab !== false) {
                var items = grab.users;
                await Promise.all(
                    items.map(async (lists) => {
                        if (!lists.is_private) {
                            var task = [igFollow(lists.pk)];
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
                return false;
            }
        } while (count < 220 && grab.next_max_id);
        return true;
    } catch (err) {
        return false;
    }
}

async function igGrab(mode, target, next) {
    try {
        const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${target}/${mode}/?count=5&search_surface=follow_list_page&max_id=${next}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
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

async function igFollow(target) {
    try {
        const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/create/${target}/`, {'headers': header, 'timeout': 35000, 'body': `container_module=profile&nav_chain=PolarisProfileRoot%3AprofilePage%3A1%3Avia_cold_start&user_id=${target}`, 'method': 'POST'}).then((e) => {return e}).catch((e) => {return false});
        const resp = await ajax.json();
        if (resp && resp.friendship_status && resp.friendship_status.following === true) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
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

module.exports = { igEditBio, igFollowFollowers };
