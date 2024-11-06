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

    app.get('/networkButton', async function(req, res) {
        const request = await androidApi('deviceBtn', '', '');
        res.send(request);
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
}

serverOn();
