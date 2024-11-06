const {exec} = require('child_process');

async function termux_battery_status(callback) {
    await execut('termux-battery-status', (e) => {
        callback(JSON?.parse(e))
    });
}

const deviceBattery = async () => {
    const req = await execut('termux-battery-status', (e) => {return JSON?.parse(e)});
    return req;
}



async function execut(command_line, callback) {
    return new Promise((resolve, reject) => {
        try {
            exec(command_line, (err, stdout, stderr) => {
                if (err) callback ? callback(err) : resolve(err)
                else if (stderr) callback ? callback(stderr) : resolve(stderr)
                else callback ? callback(stdout ? stdout : true) : resolve(stdout ? stdout : true)
            });
        } catch (error) {
            if (callback) {
                callback(error)
            } else reject(error);
        }
    });
}

deviceBattery();
