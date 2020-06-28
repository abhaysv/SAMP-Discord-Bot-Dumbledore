//============== ORIGINAL SAMP STUFF =======================
const Discord = require('discord.js');
const client = new Discord.Client();
var query = require('samp-query');

//========= NEW APP SYSTEM =====================================
//@audit Settings
let applicationQuestions = require("./application-questions.js");

const botChar = "/";
let usersApplicationStatus = [];
let appNewForm = [];
let isSettingFormUp = false;
let userToSubmitApplicationsTo = '710195458680684695';
let reportChannelID = '714432112031170562';
//==================== SAMP MYSQL ==================================
const mysql = require("mysql");
var db = mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: "test",
});

var last_report = 0;
//==================================================================



//========================  BOT WORKER INITIATD ==================
//@audit-ok Client Ready
client.on('ready', () => {

    console.log('Dumbledore Woke Up from sleep!');
	console.log(`Logged in as ${client.user.tag}!`);
	setTimeout(getLastReportId, 1000);
	setInterval(ReportSync, 20000);
	

});

//==================================================================

//________________________[SAMP GAME BOT]_____________________________
function getLastReportId()
{
    db.query("SELECT * FROM `log_reports` ORDER BY `log_reports`.`id` DESC LIMIT 1",
     [], function(err,row) {
		if(row)
		{ 
			last_report = parseInt(row[0].id);
			console.log(`[DEBUG]Last Report id:${last_report}`);
		}
		else 
			console.log(`[DEBUG]SQL Error(GetLastReportId):${err}`);
	
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
				client.channels.get(reportChannelID).send(logMessage);
			
			}
			//if(!row.length)
			//console.log(`[DEBUG] No New Reports Found Using ${last_report}`)
		}
		else 
			console.log(`[DEBUG]SQL Error(GetLastReportId):${err}`);
	
	});

}

function GetPlayersOnline(msg) 
{
	var options = {
		host: '51.178.138.254'
	}
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
			var value = str.concat(' IP: ',response['address'],' Players Online: ',response['online'],'/50'); 
			const embedColor = 0x00ff00;

			const logMessage = {
				embed: {
					title: 'Server Information',
					color: embedColor,
					fields: [
						{ name: 'Server IP', value: response['address'], inline: true },
						{ name: 'Players Online', value: response['online'], inline: true },
						{ name: 'Max Players', value: '100', inline: true },
					],
				}
			}
			msg.channel.send(logMessage)
			console.log(value)
		}    
	})

}





//_____________________[APP SYSTEM]_____________________________________

const applicationFormCompleted = (data) => {
	let i = 0, answers = "";

	for (; i < applicationQuestions.length; i++) {
		answers += `${applicationQuestions[i]}: ${data.answers[i]}\n`;
	}

    const embedColor = 0xffff00;

    const logMessage = {
        embed: {
            title: `WG TAG APPLICATION SUBMISSION BY ${data.user.username}`,
            color: embedColor,
            fields: [
                { name: 'Application Content', value: answers, inline: true },
            ],
        }
    }
    client.channels.get(userToSubmitApplicationsTo).send(logMessage);
};

const addUserToRole = (msg, roleName) => {
	if (roleName === "Admin") {
		msg.reply("Stop trying to commit mutiny.")
		return;
	}

	if (roleName && msg.guild) {
		const role = msg.guild.roles.find("name", roleName);

		if (!role) {
			msg.member.addRole(role);

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
		msg.reply("Usage : $apply [Application Type]. \n Application Open are WG-TAG \n Example Usage: $apply WG-TAG ");
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

const setApplicationSubmissions = (msg) => {
	if (!msg.guild) {
		msg.reply("This command can only be used in a guild.");
		return;
	}

	if (!msg.member.roles.find("name", "Admin")) {
		msg.reply("Only admins can do this.")
		return;
	}

	userToSubmitApplicationsTo = msg.author;
	msg.reply("Form submissions will now be sent to you.")
};

//______________________[APP-SYS END]___________________________________


//______________________[ SAMP CMDS]__________________________________
client.on('message', msg => {

    if (msg.content === 'dumbledore') 
    {

        msg.reply('Hi Im Dumbledore WG Bot');

    }

    if (msg.content === '/ip') 
    {

        msg.reply('Server IP: 51.178.138.254:7777');
 
    }  
    //------------------------------[APPLICATION STUFF]-------------------------------------------
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
			case "setsubmissions":
				setApplicationSubmissions(msg);
				break;
			case "help":
				msg.reply(`Available commands: \`\`\`${botChar}apply, ${botChar}players, ${botChar}ip, ${botChar}help\`\`\``);
                break;
            case "ip":
                break;
            case "players":
                break;      
			default:
				msg.reply("I do not know this command.");
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