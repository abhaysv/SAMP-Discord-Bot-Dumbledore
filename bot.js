const Discord = require('discord.js');

const client = new Discord.Client();

var query = require('samp-query')



client.on('ready', () => {

    console.log('I am ready!');


});





client.on('message', message => {

    if (message.content === 'dumbledore') 
    {

       message.reply('Hi Im Dumbledore WG Bot');

    }

    if (message.content === '/ip') 
    {

        message.reply('Server IP: 51.178.138.254:7777');
 
    }  

    if (message.content === '/players') 
    {

        var options = {
            host: '51.178.138.254'
        }
        query(options, function (error, response) {
            if(error)
                console.log(error)
            else
            {   
                var str = "Server Info";
                var value = str.concat(' IP:',response['address'],' Players Online:',response['online'],'/50'); 
                message.reply(value);
                console.log(value)
            }    
        })
        
 
    }  

});

 

// THIS  MUST  BE  THIS  WAY

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret