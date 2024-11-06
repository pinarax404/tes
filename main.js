const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fetch = require('node-fetch');
const androapi = require('termux-api-library');

const serverOn = async () => {
    server.listen(3000, () => {
        console.log('Server Running...');
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, './www')));

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, './www', 'index.html'));
    });

    // =========== get btn action ===========

    app.get('/getBatteryInfo', function(req, res) {
        try {
            androapi.termux_battery_status((response) => {
                res.send({"status": "success", "value": response});
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/getMobileDataBtn', async function(req, res) {
        try {
            const request = await exec("su -c 'settings get global mobile_data'");
            res.send({"status": "success", "value": request.stdout.trim()});
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/getWifiBtn', async function(req, res) {
        try {
            const request = await exec("su -c 'settings get global wifi_on'");
            res.send({"status": "success", "value": request.stdout.trim()});
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/getAirplaneBtn', async function(req, res) {
        try {
            const request = await exec("su -c 'settings get global airplane_mode_on'");
            res.send({"status": "success", "value": request.stdout.trim()});
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    // =========== get btn action ===========

    // =========== set btn action ===========

    app.post('/setMobileDataBtn', async function(req, res) {
        if (req.body.attr === 'false') {
            try {
                await exec("su -c 'svc data disable'");
                res.send({"status": "success"});
            } catch (err) {
                res.send({"status": "fail"});
            }
        } else if (req.body.attr === 'true') {
            try {
                await exec("su -c 'svc data enable'");
                res.send({"status": "success"});
            } catch (err) {
                res.send({"status": "fail"});
            }
        }
    });

    app.post('/setWifiBtn', async function(req, res) {
        try {
            await androapi.termux_wifi_enable(req.body.attr);
            res.send({"status": "success"});
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.post('/setAirplaneBtn', async function(req, res) {
        if (req.body.attr === 'false') {
            try {
                await exec("su -c 'settings put global airplane_mode_on 0'");
                await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state false'");
                res.send({"status": "success"});
            } catch (err) {
                res.send({"status": "fail"});
            }
        } else if (req.body.attr === 'true') {
            try {
                await exec("su -c 'settings put global airplane_mode_on 1'");
                await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");
                res.send({"status": "success"});
            } catch (err) {
                res.send({"status": "fail"});
            }
        }
    });

    // =========== set btn action ===========

    app.get('/cellInfo', function(req, res) {
        try {
            androapi.termux_telephony_cellinfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/mobileDataInfo', function(req, res) {
        try {
            androapi.termux_telephony_deviceinfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/wifiInfo', function(req, res) {
        try {
            androapi.termux_wifi_connectioninfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/scanWifi', function(req, res) {
        try {
            androapi.termux_wifi_scaninfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });
}

const androidApi = async (call, input) => {
    // Battery Status //
    if (call === 'deviceBattery') {
        try {
            const request = await exec("termux-battery-status");
            const res = JSON.parse(request.stdout);
            return {"status": "ok", "percentage": res.percentage, "temperature": res.temperature.toFixed(0)};
        } catch (err) {
            return {"status": "fail", "percentage": "0", "temperature": "0"};
        }
    }

    if (call === 'deviceBtn') {
        try {
            let [mobileData, wifi, airplane] = await Promise.all([exec("su -c 'settings get global mobile_data'"), exec("su -c 'settings get global wifi_on'"), exec("su -c 'settings get global airplane_mode_on'")]);

            const btnData = JSON.parse(mobileData.stdout) === 0 ? 'off' : 'on';
            const btnWifi = JSON.parse(wifi.stdout) === 0 ? 'off' : 'on';
            const btnAirplane = JSON.parse(airplane.stdout) === 0 ? 'off' : 'on';
            return {"status": "ok", "btnData": btnData, "btnWifi": btnWifi, "btnAirplane": btnAirplane};
        } catch (err) {
            return {"status": "fail"};
        }
    }

    // Mobile Data //
    if (call === 'deviceBtnData') {
        try {
            const request = await exec("su -c 'settings get global mobile_data'");
            const res = JSON.parse(request.stdout);
            const rp = res === 0 ? 'off' : 'on';
            return {"status": "ok", "res": rp};
        } catch (err) {
            return {"status": "fail", "res": "off"};
        }
    }

    if (call === 'setDeviceBtnData') {
        try {
            const command = input === 'on' ? "su -c 'svc data enable'" : "su -c 'svc data disable'";
            await exec(command);
            return {"status": "ok"};
        } catch (err) {
            return {"status": "fail"};
        }
    }

    // Wifi //
    if (call === 'deviceBtnWifi') {
        try {
            const request = await exec("su -c 'settings get global wifi_on'");
            const res = JSON.parse(request.stdout);
            return {"status": "ok", "res": res};
        } catch (err) {
            return {"status": "fail", "res": "0"};
        }
    }

    if (call === 'setDeviceBtnWifi') {
        try {
            const command = input === 'on' ? "su -c 'svc data enable'" : "su -c 'svc data disable'";
            await exec(command);
            return {"status": "ok"};
        } catch (err) {
            return {"status": "fail"};
        }
    }

    if (call === 'deviceBtnAirplane') {
        try {
            const request = await exec("su -c 'settings get global airplane_mode_on'");
            const res = JSON.parse(request.stdout);
            return {"status": "ok", "res": res};
        } catch (err) {
            return {"status": "fail", "res": "0"};
        }
    }
}

( async () => {
    const tes = await androidApi('deviceBtn');
    console.log(tes);
})();

serverOn();
