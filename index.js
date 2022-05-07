require("dotenv").config();

const { Client, Intents } = require("discord.js");
const cron = require("node-cron");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES]});

client.once('ready', () => {
	console.log('Ready!');

	cron.schedule("*/15 * * * *", () => {
		const guilds = client.guilds.cache;
		console.log(`Checking ${guilds.map(g => g.memberCount).reduce((a, b) => a + b).toLocaleString()} users in ${guilds.size.toLocaleString()} servers for League of Legends players...`);
		guilds.forEach(async (guild) => {
			const members = await guild.members.list();
			members.forEach(member => {
				const channel = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
				const presence = member.presence;
				if(presence === null) {
					return;
				}
				if (presence.activities.length === 0) {
					return;
				}
				if(presence.activities[0].name === 'League of Legends') {
					const diff = Math.abs(new Date() - new Date(presence.activities[0].timestamps.start));
					const minutes = Math.floor((diff / 1000)/ 60);
					if(minutes >= 30) {
						if(member.bannable) {
							console.log(`${member.user.tag} has been banned!`);
							channel.send(`<@${member.id}> has been playing League of Legends and is now banned!`);
							member.send("You've been playing League of Legends for too long, get banned");
							return member.ban({reason: 'Playing League of Legends'});
						} else {
							console.log(`Unable to ban ${member.user.tag}!`);
							member.send("You've been playing League of Legends for too long but i cant ban you ):<");
							return channel.send(`<@${member.id}> has been playing League of Legends but can't be banned!`);
						}
					} else {
						return;
					}
				}
			});
		});
		console.log("Finished checking!");
	});
});

client.login(process.env.TOKEN);