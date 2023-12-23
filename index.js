const { IgApiClient } = require("instagram-private-api");
const ig = new IgApiClient();

const main = async () => {
    ig.state.generateDevice("lloydhunter_18kj");
    const login = await ig.account.login("lloydhunter_18kj", "badakweslepas");
    console.log(login);
};

main();
