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

    app.get('/network', async function(req, res) {
        const request = await androidApi('networkInfo', '', '');
        res.send(request);
    });

    app.get('/scanWifi', async function(req, res) {
        const request = await androidApi('scanWifi', '', '');
        res.send(request);
    });

    app.get('/shell', async function(req, res) {
        const request = await androidApi('shell', '', req.body.input);
        res.send(request);
    });

    app.post('/switchButton', async function(req, res) {
        const request = await androidApi('setDeviceBtn', req.body.name, req.body.state);
        res.send(request);
    });
}

serverOn();
