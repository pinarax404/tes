const inquirer = require('inquirer');

const modeCreate = async () => {
    const form_mode = {
        type: 'list',
        name: 'mode',
        message: 'Pilih Mode Create',
        choices: [
            '[1] Create Kosongan',
            '[2] Create + Profile',
            '[3] Create + Profile + Follow',
        ],
    };

    try {
        const { mode } = await inquirer.prompt(form_mode);
        if (mode === '[1] Create Kosongan') {
            return 1;
        } else if (mode === '[2] Create + Profile') {
            return 2;
        } else if (mode === '[3] Create + Profile + Follow') {
            return 3;
        }
    } catch (err) {
        return false;
    }
}

const modeAgent = async () => {
    const form_agent = {
        type: 'list',
        name: 'userAgent',
        message: 'Pilih User Agent',
        choices: [
            '[1] Default',
            '[2] Random From System',
        ],
    };

    try {
        const { userAgent } = await inquirer.prompt(form_agent);
        if (userAgent === '[1] Default') {
            return 1;
        } else if (userAgent === '[2] Random From System') {
            return 2;
        }
    } catch (err) {
        return false;
    }
}

const prompt = async () => {
    const Create = await modeCreate();
    const Agent = await modeAgent();
    return {'modeCreate': Create, 'modeAgent': Agent};
}

module.exports = { prompt };
