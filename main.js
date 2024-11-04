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

    app.get('/top_button', async function(req, res) {
        let dump = {mobile_data: {power: 'off'}, wifi: {power: 'off'}, airplane: {power: 'off'}};

        const a = await exec("su -c 'settings list global'");
        const toLine = a.stdout.split('\n');

        for (let i = 0; i < toLine.length; i++) {
            toLine[i].includes('mobile_data=1') === !0 ? dump['mobile_data']['power'] = 'on' :  dump['mobile_data']['power'] = 'off';
            toLine[i].includes('wifi_on=1') === !0 ? dump['wifi']['power'] = 'on' :  dump['wifi']['power'] = 'off';
            toLine[i].includes('airplane_mode_on=1') === !0 ? dump['airplane']['power'] = 'on' :  dump['airplane']['power'] = 'off';
        }

        console.log(dump);
        res.send(dump);
    });
}

serverOn();
