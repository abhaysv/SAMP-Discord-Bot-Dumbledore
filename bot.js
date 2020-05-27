const Discord = require('discord.js');

const client = new Discord.Client();

 

client.on('ready', () => {

    console.log('I am ready!');

});

 

client.on('message', message => {

    if (message.content === 'dumbledore') 
    {

       message.reply('Hi Im Dumbledore WG Bot');

    }

    if (message.content === '/server') 
    {

        message.reply('Server IP: 51.178.138.254:7777');
 
    }  

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret