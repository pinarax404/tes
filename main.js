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

    app.get('/battery', function(req, res) {
        try {
            androapi.termux_battery_status((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/sms_list', function(req, res) {
        try {
            androapi.termux_sms_list('all', 50, 'all', (response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/cellinfo', function(req, res) {
        try {
            androapi.termux_telephony_cellinfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/deviceinfo', async function(req, res) {
        try {
            const termux_telephony_deviceinfo = await androapi.termux_telephony_deviceinfo((response) => {return response});
            res.send(termux_telephony_deviceinfo);
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

    app.get('/wifiinfo', function(req, res) {
        try {
            androapi.termux_wifi_connectioninfo((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });
}

serverOn();
