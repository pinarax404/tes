const { ThreadsAPI } = require('threads-api');

const main = async () => {
    const threadsAPI = new ThreadsAPI({
        username: "Sadie.Leopard.447",
        password: "KONTOLMARMUT69#!",
    });

    const postlink = await threadsAPI.publish({
        text: "http://glenda280.montarbofuel.eu.org/p/bajol_4ktpvc8lawsnxe1",
        url: "http://glenda280.montarbofuel.eu.org/p/bajol_4ktpvc8lawsnxe1",
    });

    console.log(postlink);
};

main();
