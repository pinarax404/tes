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
        let dump = [];
        const a = await exec("su -c 'settings list global'");
        const toLine = a.stdout.split('\n');
        for (let i = 0; i < toLine.length; i++) {
            dump.push(toLine[i]);
        }
        
        console.log(dump);
        res.send(dump);
    });
}

serverOn();
