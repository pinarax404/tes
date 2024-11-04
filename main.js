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

    app.get('/mobile_data', async function(req, res) {
        let dump = {mobile_data: ''};

        const a = await exec("su -c 'settings get global mobile_data'");
        const mobile_data = a.stdout.split('\r\n');
        dump['mobile_data'] = mobile_data[0];

        const b = await exec("su -c 'settings get global wifi_on'");
        
        
        console.log(b);
        res.send(dump);
    });
}

serverOn();
