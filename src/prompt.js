const inquirer = require('inquirer');

const modeCreate = async () => {
    const form_mode = {
        type: 'list',
        name: 'mode',
        message: 'Pilih Mode Create',
        choices: [
            '[1] Create Kosongan',
            '[2] Create + Profile',
            '[3] Create + Profile + Follow Followers',
        ],
    };

    try {
        const { mode } = await inquirer.prompt(form_mode);
        if (mode === '[1] Create Kosongan') {
            return 1;
        } else if (mode === '[2] Create + Profile') {
            return 2;
        } else if (mode === '[3] Create + Profile + Follow Followers') {
            return 3;
        }
    } catch (err) {
        return false;
    }
}

const prompt = async () => {
    const Create = await modeCreate();
    return {'modeCreate': Create};
}

module.exports = { prompt };
