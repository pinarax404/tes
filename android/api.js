const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const androapi = require('termux-api-library');

const androidApi = async (call, moreCall, input) => {
    if (call === 'deviceBtn') {
        try {
            const [mobileData, wifi, airplane, battery] = await Promise.all([exec("su -c 'settings get global mobile_data'"), exec("su -c 'settings get global wifi_on'"), exec("su -c 'settings get global airplane_mode_on'"), exec("termux-battery-status")]);

            const btnData = JSON.parse(mobileData.stdout) === 0 ? 'off' : 'on';
            const btnWifi = JSON.parse(wifi.stdout) === 0 ? 'off' : 'on';
            const btnAirplane = JSON.parse(airplane.stdout) === 0 ? 'off' : 'on';
            const batt = JSON.parse(battery.stdout);

            return {"status": "ok", "btnData": btnData, "btnWifi": btnWifi, "btnAirplane": btnAirplane, "battery": batt.percentage + "%"};
        } catch (err) {
            return {"status": "fail", "btnData": "off", "btnWifi": "off", "btnAirplane": "off", "battery": "null"};
        }
    }

    if (call === 'networkInfo') {
        try {
            const mobileData = await exec("termux-telephony-deviceinfo");
            const wifi = await exec("termux-wifi-connectioninfo");

            const resMobileData = JSON.parse(mobileData.stdout);
            const resWifi = JSON.parse(wifi.stdout);

            const priority = resWifi.ssid === '<unknown ssid>' ? "mobile_data" : "wifi";
            const dataState = resMobileData.data_state === 'disconnected' ? "Disconnected" : "Connected";
            const dataType = resMobileData.network_type;
            const dataOperator = resMobileData.sim_operator_name;
            const wifiState = resWifi.ssid === '<unknown ssid>' ? "Disconnected" : "Connected";
            const wifiSsid = resWifi.ssid;

            return {"status": "ok", "priority": priority, "dataState": dataState, "dataType": dataType, "dataOperator": dataOperator, "wifiState": wifiState, "wifiSsid": wifiSsid};
        } catch (err) {
            return {"status": "fail", "priority": "null", "dataState": "null", "dataType": "null", "dataOperator": "null", "wifiState": "null", "wifiSsid": "null"};
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
                    await exec("su -c 'svc data disable'");
                    await exec("termux-wifi-enable false");
                    await exec("su -c 'settings put global airplane_mode_on 1'");
                    await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");

                    return {"status": "ok"};
                } catch (err) {
                    return {"status": "fail"};
                }
            }

            if (input === 'off') {
                try {
                    await exec("su -c 'svc data enable'");
                    await exec("su -c 'settings put global airplane_mode_on 0'");
                    await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state false'");

                    return {"status": "ok"};
                } catch (err) {
                    return {"status": "fail"};
                }
            }
        }
    }

    if (call === 'scanWifi') {
        try {
            await exec("termux-wifi-enable false");
            await exec("termux-wifi-enable true");
            const request = await exec("termux-wifi-scaninfo");
            const res = JSON.parse(request.stdout);

            return {"status": "ok", "wifi": res};
        } catch (err) {
            return {"status": "fail", "wifi": []};
        }
    }

    if (call === 'shell') {
        const request = await exec(input);
        return request;
    }
}

module.exports = { androidApi };
