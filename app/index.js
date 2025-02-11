// Require the necessary discord.js classes
// const Discord = require("discord.js");
// const { Client } = require('discord.js');
require("dotenv").config();
const { Client, Intents, Util } = require("discord.js");
// const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
// client.db = require("quick.db");
const { QuickDB } = require("quick.db");
client.db = new QuickDB();
client.request = new(require("rss-parser"))();
client.config = require("../config.json");


// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
    handleUpload();
});

function handleUpload() {
    if (client.db.get(`postedVideos`) === null) client.db.set(`postedVideos`, []);
    setInterval(async() => {
        const client_request = await client.request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${client.config.channel_id}`)
            // console.log(client_request)
            // .then(data => {
        const re = await client.db.get(`postedVideos`)
        console.log(re, "re"); // null
        if (re != null && re.includes(client_request.items[0].link)) return;
        else {
            await client.db.set(`videoData`, client_request.items[0]);
            await client.db.push("postedVideos", client_request.items[0].link);
            let parsed = await client.db.get(`videoData`);
            console.log("Parsed:", parsed);
            let channel = client.channels.cache.get(client.config.channel);
            if (!channel) return;
            if (parsed) {
                console.log("Release Discord:", parsed.title);
                let message = client.config.messageTemplate
                    .replace(/{author}/g, parsed.author)
                    .replace(/{title}/g, Util.escapeMarkdown(parsed.title))
                    .replace(/{url}/g, parsed.link);
                channel.send(message);
            }
        }
        // });
    }, client.config.watchInterval);
}

// Login to Discord with your client's token
client.login(process.env.TOKEN)