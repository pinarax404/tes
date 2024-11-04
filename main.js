const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const serverOn = async () => {
    server.listen(3000, () => {
        console.log('Server Running...');
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, './www')));

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, './www', 'index.html'));
    });

    app.get('/phone_config', async function(req, res) {
        let dump = {mobile_data: '', wifi: '', airplane_mode: '', battery: ''};

        const tes = await exec("getprop gsm.sim.operator.alpha");
        console.log(tes);

        
        const a = await exec("su -c 'settings get global mobile_data'");
        const mobile_data = a.stdout.split('\n');
        dump['mobile_data'] = mobile_data[0];

        const b = await exec("su -c 'settings get global wifi_on'");
        const wifi_on = b.stdout.split('\n');
        dump['wifi'] = wifi_on[0];

        const c = await exec("su -c 'settings get global airplane_mode_on'");
        const airplane_mode_on = c.stdout.split('\n');
        dump['airplane_mode'] = airplane_mode_on[0];

        const d = await exec("cat /sys/class/power_supply/battery/capacity");
        const battery = d.stdout.split('\n');
        dump['battery'] = battery[0];

        console.log(dump);
        res.send(dump);
    });
}

serverOn();
