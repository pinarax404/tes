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

    app.get('/', function(req, res) {
        await exec("su -c 'settings put global airplane_mode_on 1'");
        await exec("su -c 'am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true'");
        console.log('Connected');
        res.send('Done');
    });
}

serverOn();
