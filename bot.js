const Discord = require('discord.js');

const client = new Discord.Client();

 

client.on('ready', () => {

    console.log('I am ready!');

});

 

client.on('message', message => {

    if (message.content === 'ping') {

       message.reply('pong');

       }

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.NzEyNzYzNzY3NzY2OTA4OTg4.Xs4w_Q.nTU43q2qhyLq2l8RZxuyeJYbX7k);//BOT_TOKEN is the Client Secret