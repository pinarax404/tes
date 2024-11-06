const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');
const { androidApi } = require('./android/api.js');

const serverOn = async () => {
    server.listen(3000, () => {
        console.log('Server Running...');
    });

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static(path.join(__dirname, './www')));

    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, './www', 'index.html'));
    });

    app.get('/topButton', async function(req, res) {
        const request = await androidApi('deviceBtn', '', '');
        res.send(request);
    });

    app.get('/battery', async function(req, res) {
        const request = await androidApi('deviceBattery', '', '');
        res.send(request);
    });

    app.get('/network', async function(req, res) {
        const request = await androidApi('networkInfo', '', '');
        res.send(request);
    });

    app.get('/scanWifi', async function(req, res) {
        const request = await androidApi('scanWifi', '', '');
        res.send(request);
    });
}

serverOn();
