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
    'user-agent': 'Mozilla/5.0 (Linux; U; Android 2.3.6; fa-fa; GT-S5570I Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'cookie': ''
}

async function igFollowFollowers(target, cookieJar) {
    header['x-csrftoken'] = cookieJar.csrftoken;
    header['cookie'] = cookieJar.cookiejar;

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
        const ajax = await fetch(`https://www.instagram.com/api/v1/friendships/${target}/${mode}/?count=10&search_surface=follow_list_page&max_id=${next}`, {'headers': header, 'timeout': 35000, 'body': null, 'method': 'GET'}).then((e) => {return e}).catch((e) => {return false});
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

module.exports = { igFollowFollowers };
