const { IgApiClient } = require("instagram-private-api");
const ig = new IgApiClient();

const main = async () => {
    ig.state.generateDevice("lloydhunter_18kj");
    const login = await ig.account.login("finleyhoffman_u20", "Huwaei00");
    console.log(login);
    console.log('====================================');
    const me = await ig.account.currentUser();
    console.log(me);
};

main();
