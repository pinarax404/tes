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

    app.get('/batteryInfo', function(req, res) {
        try {
            androapi.termux_battery_status((response) => {
                res.send(response);
            });
        } catch (err) {
            res.send({"status": "fail"});
        }
    });

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

    app.post('/buttonWifi', function(req, res) {
        try {
            await androapi.termux_wifi_enable(req.body.attr);
            res.send({"status": "success"});
        } catch (err) {
            res.send({"status": "fail"});
        }
    });
}

serverOn();
