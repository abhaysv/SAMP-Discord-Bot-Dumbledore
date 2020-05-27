const Discord = require('discord.js');

const client = new Discord.Client();

var query = require('samp-query')

var options = {
	host: '51.178.138.254'
}

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

    if (message.content === '/serverinfo') 
    {

        query(options, function (error, response) {
            if(error)
                console.log(error)
            else 
                message.reply(response)
        })
 
    }  

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret