const {exec} = require('child_process');

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
