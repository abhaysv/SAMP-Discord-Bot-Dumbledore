//======================================================================================
/*
	This is a Dicord Bot for SAMP Servers written in Node.js
	Bot Version: 2.1
	Author: Abhay SV Aka DuskFawn Aka Perfectboy. 
*/
//=======================================================================================

//______________________[Discord JS and SAMP Query Library]______________________________
const Discord = require('discord.js');
const client = new Discord.Client();

var query = require('samp-query');

//_____________________________[BOT Configuration]_________________________________________
//@audit Settings

const botChar = "/"; // Bot prefix character
let Samp_IP = "51.178.138.254";
let Samp_Port = 7777;
let Community_Tag ="WG";

let userToSubmitApplicationsTo = '710195458680684695';//Default Channel Id for User Applications
let reportChannelID = '714432112031170562'; // Channel for the ingam reports
let adminCmdsChannelID = '710195250911641741'; // Admin Cmds channel
let Bot_debug_mode = false;

//_______________________________[APPLICATIONS]______________________________________________
let applicationQuestions = require("./application-questions.js"); //This .js file has the default questions
let usersApplicationStatus = [];
let appNewForm = [];
let isSettingFormUp = false;

//______________________________[SAMP Server MySQL Connection]________________________________
const mysql = require("mysql");
var db = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
});


//_______________________________[BOT Startup]_________________________________________________
//@audit-ok Client Ready
client.on('ready', () => {

    console.log('Dumbledore Woke Up from sleep!');
	console.log(`Logged in as ${client.user.tag}!`);
	setTimeout(getLastReportId, 1000);
	setInterval(ReportSync, 20000);
	

});
//-----------------------------[Debug]-----------------------------------
function toggle_debug() 
{
	if (Bot_debug_mode) 
	{
	  Bot_debug_mode = false;
	  console.log(`[DEBUG]: Debug Mode Disabled`);
	} 
	else 
	{
	  Bot_debug_mode = true;
	  console.log(`[DEBUG]: Debug Mode Enabled`);
	}
}

//________________________[Inagme Report Sync]_____________________________
//@audit-info Report Sys
var last_report = 0;
function getLastReportId()
{
    db.query("SELECT * FROM `log_reports` ORDER BY `log_reports`.`id` DESC LIMIT 1",
     [], function(err,row) {
		if(row)
		{ 
			last_report = parseInt(row[0].id);
			if(Bot_debug_mode)
				console.log(`[DEBUG]Last Report id:${last_report}`);
		}
		else 
			console.log(`[ERROR]SQL Error(GetLastReportId):${err}`);
	
	});

}
function ReportSync()
{
    db.query(`SELECT * FROM log_reports WHERE id > ${last_report}`,
     [], function(err,row) {
		if(row)
		{ 
			for (var i = 0; i < row.length; i++) 
			{
				last_report = parseInt(row[i].id);
				const embedColor = 0xff0000;
			
				const logMessage = {
					embed: {
						title: row[i].report,
						color: embedColor,
						fields: [
							{ name: 'Time:', value: row[i].time, inline: true },
						],
					}
				};
				client.channels.cache.get(reportChannelID).send(logMessage);
			
			}
			if(!row.length && Bot_debug_mode)
				console.log(`[DEBUG] No New Reports Found Using ${last_report}`)
		}
		else 
			console.log(`[ERROR]SQL Error(GetLastReportId):${err}`);
	
	});

}
//________________________[Inagme Functions]_____________________________
function GetPlayersOnline(msg) 
{
	var options = {
		host: Samp_IP,
		port: Samp_Port
	}
	//console.log(options.host)
	query(options, function (error, response) {
		if(error)
		{
			console.log(error)
			const embedColor = 0xff0000;
			
			const logMessage = {
				embed: {
					title: 'I wasent expecting that , Please try again later',
					color: embedColor,
					fields: [
						{ name: 'Error:', value: error, inline: true },
					],
				}
			}
			msg.channel.send(logMessage)
			
		}    
		else
		{   
			var str = "Server Info";
			var value = str.concat(' IP: ',response['address'],' Players Online: ',response['online'],'/',response['maxplayers']); 
			const embedColor = 0x00ff00;

			const logMessage = {
				embed: {
					title: 'Server Information',
					color: embedColor,
					fields: [
						{ name: 'Server IP', value: response['address'], inline: true },
						{ name: 'Players Online', value: response['online'], inline: true },
						{ name: 'Max Players', value: response['maxplayers'], inline: true },
					],
				}
			}
			msg.channel.send(logMessage)
			if(Bot_debug_mode)
				console.log(value)
		}    
	})

}
//@audit-info Online Admins
function get_online_admins(msg)
{
	permcheck = (msg.channel.id === adminCmdsChannelID) ? true : false;
	if (permcheck) 
    {
		var sqlq;
		
		sqlq = "SELECT `id`,`Nick`,`Online`,`Admin` FROM `Accounts` WHERE `Admin` > 0 AND `Online` = 1 AND `hidden_admin` = 0 ORDER BY `Accounts`.`Admin` DESC";
		

		db.query(sqlq,
		[], function(err,row) {
		   if(row)
		   { 	if(Bot_debug_mode)
					console.log(sqlq);
				if(row.length)
				{
					let i = 0, admins = "";

					for (; i < row.length; i++) {
						admins += `${row[i].Nick}: ${row[i].Admin}\n`;
					}
					
	
					const embedColor = 0xffff00;
			
					const logMessage = {
						embed: {
							title: `List of In-game Admins`,
							color: embedColor,
							fields: [
								{ name: 'Admins', value: admins, inline: true },
							],
						}
					}
					client.channels.cache.get(adminCmdsChannelID).send(logMessage);
				}
				else
				client.channels.cache.get(adminCmdsChannelID).send("No admins online !!!");   
		   }
		   else 
			   console.log(`[ERROR]SQL Error(ADMcheck):${err}`);
	   
	   	});
  
	} else if (!permcheck) {
		msg.reply("This command can only be used the admin bot channel.");
	} else {
		msg.channel.send("Usage : /sban [BAN-ID/InGame-Name].");
	}
	
}
//@audit-info BAN Functions
function sBAN(msg,params)
{
	permcheck = (msg.channel.id === adminCmdsChannelID) ? true : false;
	if (params && permcheck) 
    {
		var sqlq;
		if(!isNaN(params))
			sqlq = `SELECT * FROM banlog WHERE name = '${params}' OR id = '${params}' LIMIT 1`;
		else sqlq = `SELECT * FROM banlog WHERE name = '${params}' LIMIT 1`;

		db.query(sqlq,
		[], function(err,row) {
		   if(row)
		   { 	if(Bot_debug_mode)
					console.log(sqlq);
				if(row.length)
				{
					if(Bot_debug_mode)
						console.log(`[DEBUG]Ban ID:${parseInt(row[0].id)}`);
					const embedColor = 0xffff00;
					const date = new Date(row[0].bantime * 1000);
					const logMessage = {
						embed: {
							title: `Active Ban Forund on Account ${row[0].name}`,
							color: embedColor,
							fields: [
								{ name: 'Ban ID', value: row[0].id, inline: true },
								{ name: 'Admin', value: row[0].admin, inline: true },
								{ name: 'Reason', value: row[0].reason, inline: true },
								{ name: 'Expiry(EPOCH)', value: date, inline: true },
							],
						}
					}
					client.channels.cache.get(adminCmdsChannelID).send(logMessage);
				}
				else
				client.channels.cache.get(adminCmdsChannelID).send("No ban found !!!");   
		   }
		   else 
			   console.log(`[ERROR]SQL Error(sBAN):${err}`);
	   
	   	});
  
	} else if (!permcheck) {
		msg.reply("This command can only be used the admin bot channel.");
	} else {
		msg.channel.send("Usage : /sban [BAN-ID/InGame-Name].");
	}
	
}

function uBAN(msg,params)
{
	permcheck = (msg.channel.id === adminCmdsChannelID) ? true : false;
	if (params && permcheck) 
    {
		var sqlq;
		if(!isNaN(params))
			sqlq = `SELECT * FROM banlog WHERE name = '${params}' OR id = '${params}' LIMIT 1`;
		else sqlq = `SELECT * FROM banlog WHERE name = '${params}' LIMIT 1`;

		db.query(sqlq,
		[], function(err,row) {
		   if(row)
		   { 	if(Bot_debug_mode)
					console.log(sqlq);
				if(row.length)
				{
					if(Bot_debug_mode)
						console.log(`[DEBUG]BAN id:${parseInt(row[0].id)}`);
					uBAN_Process(row[0].id)
					
				}
				else
				client.channels.cache.get(adminCmdsChannelID).send("No ban found !!!");   
		   }
		   else 
			   console.log(`[ERROR]SQL Error(uBAN):${err}`);
	   
	   	});
  
	} else if (!permcheck) {
		msg.reply("This command can only be used the admin bot channel.");
	} else {
		msg.channel.send("Usage : /unban [BAN-ID/InGame-Name].");
	}
	
}
function uBAN_Process(banid)
{

	var sqlq;
	sqlq = `DELETE FROM banlog WHERE id = '${banid}'`;
		
	db.query(sqlq,
	[], function(err,row) {
		if(row)
		{ 	
			if(Bot_debug_mode)
				console.log(sqlq);
			client.channels.cache.get(adminCmdsChannelID).send(`The user has been unbanned`); 
		}
		else 
			console.log(`[ERROR]SQL Error(uBAN_Process):${err}`);
	   
	});
  
	
}


//_____________________[APPLICATION SYSTEM FUCNTIONS]_____________________________________

const applicationFormCompleted = (data) => {
	let i = 0, answers = "";

	for (; i < applicationQuestions.length; i++) {
		answers += `${applicationQuestions[i]}: ${data.answers[i]}\n`;
	}

    const embedColor = 0xffff00;

    const logMessage = {
        embed: {
            title: `${Community_Tag} APPLICATION SUBMISSION BY ${data.user.username}`,
            color: embedColor,
            fields: [
                { name: 'Application Content', value: answers, inline: true },
            ],
        }
    }
    client.channels.cache.get(userToSubmitApplicationsTo).send(logMessage);
};

const addUserToRole = (msg, roleName) => {
	if (roleName === "Admin") {
		msg.reply("Stop trying to commit mutiny.")
		return;
	}

	if (roleName && msg.guild) {
		const role = msg.guild.roles.find("name", roleName);

		if (!role) {
			msg.member.roles.add(role);

			msg.reply(`Added you to role: '${roleName}'`);
		} else {
			msg.reply(`Role '${roleName}' does not exist.`);
		}
	} else if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
	} else {
		msg.reply("Please specify a role.");
	}
};

const sendUserApplyForm = (msg, appName) => {
	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

    if (appName && msg.guild) 
    {
		
        if (!user) {
            msg.author.send(`Application commands: \`\`\`${botChar}cancel to cancel the app, ${botChar}redo to restart the app process\`\`\``);
            msg.author.send(applicationQuestions[0]);
            usersApplicationStatus.push({id: msg.author.id, currentStep: 0, answers: [], user: msg.author});
            msg.channel.send(`You Application process is started in DM.`);
        } else if(applicationQuestions[user.currentStep]) {
            msg.author.send(applicationQuestions[user.currentStep]);
        } else {
            msg.channel.send(`You Application is already sumbitted and is under review.`);
        }

	} else if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
	} else {
		msg.reply(`Usage : $apply [Application Type]. \n Application Open are ${Community_Tag}-TAG \n Example Usage: $apply ${Community_Tag}-TAG `);
	}
    
    

};
//@tsd
const cancelUserApplicationForm = (msg, isRedo = false) => {
	const user = usersApplicationStatus.find(user => user.id === msg.author.id);

	if (user) {
		usersApplicationStatus = usersApplicationStatus.filter(el => el.id !== user.id)
		msg.reply("Application canceled.");
	} else if (!isRedo) {
		msg.reply("You have not started an application form yet.");
	}
};

const applicationFormSetup = (msg) => {
	if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
		return;
	}

	if (!msg.member.roles.find("name", "Admin")) {
		msg.reply("This command can only be used by an admin.");
		return;
	}

	if (isSettingFormUp) {
		msg.reply("Someone else is already configuring the form.");
		return;
	}

	appNewForm = [];
	isSettingFormUp = msg.author.id;

	msg.author.send(`Enter questions and enter \`${botChar}endsetup\` when done.`);
};

const endApplicationFormSetup = (msg) => {
	if (isSettingFormUp !== msg.author.id) {
		msg.reply("You are not the one setting the form up.");
		return;
	}

	isSettingFormUp = false;
	applicationQuestions = appNewForm;
};


//______________________[APP-SYS END]___________________________________

//_______________________[GENERAL UTILITY CMDS]______________________________
//@audit-info Utility Cmds
const Clear_Messages = (msg,amount) => {

	if (!msg.guild) return msg.reply("This command can only be used in a guild.");

	if (!amount) return msg.channel.send("Usage: /clear [no of messages to clear]");
	
	if (isNaN(amount)) return msg.reply('The amount parameter isn`t a number!'); 

	if (amount > 100) return msg.reply('You can`t delete more than 100 messages at once!'); 
	if (amount < 1) return msg.reply('You have to delete at least 1 message!'); 


	if (!msg.guild.member(msg.author).hasPermission("MANAGE_MESSAGES")) 
	{
        msg.channel.sendMessage("Sorry, you don't have the permission to execute the command \""+msg.content+"\"");
        return;
	} else if (!msg.guild.member(client.user).hasPermission("MANAGE_MESSAGES")) 
	{
        msg.channel.sendMessage("Sorry, I don't have the permission to execute the command \""+msg.content+"\"");
        return;
    }

    
    if (msg.channel.type == 'text') {
        msg.channel.messages.fetch({limit : amount})
          .then(messages => {
            msg.channel.bulkDelete(messages);
            messagesDeleted = messages.array().length;

            msg.channel.sendMessage("Deletion of messages successful. Total messages deleted: "+messagesDeleted);
            console.log('Deletion of messages successful. Total messages deleted: '+messagesDeleted)
          })
          .catch(err => {
            console.log('Error while doing Bulk Delete');
            console.log(err);
        });
    }
	msg.channel.send(`No of messaes deleted ${amount}`)
};
const setChannel = (msg,param) => {
	if (!msg.guild) 
	{
		msg.reply("This command can only be used in a guild.");
		return;
	}

	if (!msg.member.roles.find("name", "Admin")) 
	{
		msg.reply("Only Members with Role **Admin** can do this.")
		return;
	}

	if(!param)
	{
		msg.channel.send("Usage: /setchannel [options] \n Avaliabe Options: reports apps adminchannel")
		return;
	}

	if(param == "reports")
	{
	reportChannelID = msg.channel.id;
	msg.channel.send("Ingame Reports will now be sent to this channel.")
	}
	if(param == "apps")
	{
	userToSubmitApplicationsTo = msg.channel.id;
	msg.channel.send("Form submissions will now be sent to this channel.")
	}
	if(param == "adminchannel")
	{
	adminCmdsChannelID = msg.channel.id;
	msg.channel.send("Admins can now use this channel for admin cmds.")
	}
};
const setSampIP = (msg,param) => {
	if (!msg.guild) 
	{
		msg.reply("This command can only be used in a guild.");
		return;
	}

	if (!msg.member.roles.find("name", "Admin")) 
	{
		msg.reply("Only Members with Role **Admin** can do this.")
		return;
	}

	if(!param)
	{
		msg.channel.send("Usage: /setip [ip without port] \n Example: /setip 127.0.0.1")
		return;
	}

	Samp_IP = param;
	msg.channel.send(`Server IP Set To : ${Samp_IP}`);

};
const setSampPort = (msg,param) => {
	if (!msg.guild) 
	{
		msg.reply("This command can only be used in a guild.");
		return;
	}

	if (!msg.member.roles.find("name", "Admin")) 
	{
		msg.reply("Only Members with Role **Admin** can do this.")
		return;
	}

	if(!param)
	{
		msg.channel.send("Usage: /setport [port] \n Example: /setport 7777")
		return;
	}
	if(!isNaN(param))
	{
		Samp_Port = Number(param);
		msg.channel.send(`Server Port Set To : ${Samp_Port}`);
	}	
	

};
const helpinfo = (msg) => {
	if (!msg.guild) 
	{
		msg.reply("This command can only be used in a guild.");
		return;
	}
	const embedColor = 0xffff00;
	pcmds = `\`\`\`${botChar}apply, ${botChar}players, ${botChar}ip, ${botChar}help\`\`\``;
	acmds = `\`\`\`${botChar}setip, ${botChar}setport, ${botChar}setchannel, ${botChar}setup, ${botChar}sban, ${botChar}unban, ${botChar}clear\`\`\``;

    const logMessage = {
        embed: {
            title: `Discord Bot DumbleDore Help Info`,
            color: embedColor,
            fields: [
				{ name: 'Player Cmds', value: pcmds, inline: true },
				{ name: 'Admin Cmds', value: acmds, inline: true },
            ],
        }
    }

	msg.channel.send(logMessage);

};


//______________________[COMMAND PROCESSOR]__________________________________
//@audit-ok Commands

client.on('message', msg => {

	//------------------------------[Medthod 1 For cmds]--------------------------------
    if (msg.content === 'dumbledore') 
    {

        msg.reply(`Hi Im Dumbledore ${Community_Tag} Bot`);

    }

    if (msg.content === '/ip') 
    {

        msg.reply(`Server IP: ${Samp_IP}`);
 
    }  
    //------------------------------[Medthod 2]-------------------------------------------
    if (msg.content.charAt(0) === botChar) {
		const request = msg.content.substr(1);
		let command, parameters = [];

		if (request.indexOf(" ") !== -1) {
			command = request.substr(0, request.indexOf(" "));
			parameters = request.split(" ");
			parameters.shift();
		} else {
			command = request;
		}

		switch (command.toLowerCase()) {
			case "apply":
				sendUserApplyForm(msg, parameters.join(" "));
				break;
			case "players":
				GetPlayersOnline(msg);
				break;
			case "cancel":
				cancelUserApplicationForm(msg);
				break;
			case "redo":
				cancelUserApplicationForm(msg, true);
				sendUserApplyForm(msg);
				break;
			case "setup":
				applicationFormSetup(msg);
				break;
			case "endsetup":
				endApplicationFormSetup(msg);
				break;
			case "setchannel":
				setChannel(msg, parameters.join(" "));
				break;
			case "help":
				helpinfo(msg);
				break;
			case "sban":
				sBAN(msg, parameters.join(" "));
				break; 
			case "unban":
				uBAN(msg, parameters.join(" "));
				break; 
			case "clear":
					Clear_Messages(msg, parameters.join(" "));
					break;
			case "setip":
					setSampIP(msg, parameters.join(" "))
					break;
			case "setport":
					setSampPort(msg, parameters.join(" "))
					break;		 	
            case "ip":
					break;
			case "debug":
					toggle_debug()
					break;				
            case "admins":
					get_online_admins(msg)
					break;	
			default:
				
		}
	} else {
		if (msg.channel.type === "dm") {
			if (msg.author.id === isSettingFormUp) {
				appNewForm.push(msg.content);
			} else {
				const user = usersApplicationStatus.find(user => user.id === msg.author.id);

				if (user && msg.content) {
					user.answers.push(msg.content);
					user.currentStep++;

					if (user.currentStep >= applicationQuestions.length) {
						applicationFormCompleted(user);
						msg.author.send("Congratulations your application has been sent!");
					} else {
						msg.author.send(applicationQuestions[user.currentStep]);
					}
				}
			}
		}
	}  

});
//_____________________________________[END-SAMP CMDS]____________________________________________________________________
 

//====================== BOT TOKEN FROM ENV VAIABLE ===================================

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret

//=====================================================================================
