const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const androapi = require('termux-api-library');

const androidApi = async (call, moreCall, input) => {
    if (call === 'deviceBtn') {
        try {
            const [mobileData, wifi, airplane] = await Promise.all([exec("su -c 'settings get global mobile_data'"), exec("su -c 'settings get global wifi_on'"), exec("su -c 'settings get global airplane_mode_on'")]);

            const btnData = JSON.parse(mobileData.stdout) === 0 ? 'off' : 'on';
            const btnWifi = JSON.parse(wifi.stdout) === 0 ? 'off' : 'on';
            const btnAirplane = JSON.parse(airplane.stdout) === 0 ? 'off' : 'on';

            return {"status": "ok", "btnData": btnData, "btnWifi": btnWifi, "btnAirplane": btnAirplane};
        } catch (err) {
            return {"status": "fail", "btnData": "off", "btnWifi": "off", "btnAirplane": "off"};
        }
    }

    if (call === 'deviceBattery') {
        try {
            const request = await exec("termux-battery-status");
            const res = JSON.parse(request.stdout);

            return {"status": "ok", "percentage": res.percentage, "temperature": res.temperature.toFixed(0)};
        } catch (err) {
            return {"status": "fail", "percentage": "0", "temperature": "0"};
        }
    }

    if (call === 'networkInfo') {
        try {
            const mobileData = await exec("termux-telephony-deviceinfo");
            const wifi = await exec("termux-wifi-connectioninfo");

            return {"status": "ok", "dataState": JSON.parse(mobileData.stdout), "wifi": JSON.parse(wifi.stdout)};
        } catch (err) {
            return {"status": "fail", "mobileData": {}, "wifi": {}};
        }
    }

    if (call === 'setDeviceBtn') {
        if (moreCall === 'mobileData') {
            try {
                const command = input === 'on' ? "su -c 'svc data enable'" : "su -c 'svc data disable'";
                await exec(command);

                return {"status": "ok"};
            } catch (err) {
                return {"status": "fail"};
            }
        }

        if (moreCall === 'wifi') {
            try {
                const command = input === 'on' ? "termux-wifi-enable true" : "termux-wifi-enable false";
                await exec(command);

                return {"status": "ok"};
            } catch (err) {
                return {"status": "fail"};
            }
        }

        if (moreCall === 'airplane') {
            if (input === 'on') {
                try {
                    await exec("su -c 'settings put global airplane_mode_on 1'");
                    await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");

                    return {"status": "ok"};
                } catch (err) {
                    return {"status": "fail"};
                }
            }

            if (input === 'off') {
                try {
                    await exec("su -c 'settings put global airplane_mode_on 1'");
                    await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");

                    return {"status": "ok"};
                } catch (err) {
                    return {"status": "fail"};
                }
            }
        }
    }

    if (call === 'scanWifi') {
        try {
            const request = await exec("termux-wifi-scaninfo");
            const res = JSON.parse(request.stdout);

            return {"status": "ok", "wifi": res};
        } catch (err) {
            return {"status": "fail", "wifi": []};
        }
    }
}

module.exports = { androidApi };
