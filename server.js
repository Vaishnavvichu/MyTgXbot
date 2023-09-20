const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config({ path: 'env.env' });
const axios = require('axios');
const token = "6357409038:AAGEawR6-xAmDkUyQjOXrCAUpgeLZSHPxMI";
const bot = new TelegramBot(token, { polling: true });
bot.on('message', (msg) => {
  let query = msg.text;
  if(query === "/alive") {
   return bot.sendMessage(msg.chat.id, "I'm Alive");
}
   if(query === "/help") {
   return bot.sendMessage(msg.chat.id, "Help - - - - - - - \n '/xvd your_query' - search videos\n '/alive' - Bot is alive or not\n\n");
  } 

  if(query === "/start") {
   return bot.sendMessage(msg.chat.id, 
`⚠️ - - - - - - - - - - - - - - - - - - - - - - - - - - ⚠️
 𝙒𝙖𝙧𝙣𝙞𝙣𝙜 𝙩𝙝𝙞𝙨 𝙛𝙤𝙧 𝙤𝙣𝙡𝙮 𝙖𝙙𝙪𝙡𝙩 & 𝙞𝙩'𝙨 𝙢𝙖𝙙𝙚 𝙛𝙤𝙧 𝙤𝙣𝙡𝙮 𝙚𝙙𝙪𝙘𝙖𝙩𝙞𝙤𝙣𝙖𝙡 𝙥𝙪𝙧𝙥𝙤𝙨𝙚𝙨.

𝙈𝙚 𝙖𝙣𝙙 𝙈𝙮 𝘼𝙙𝙢𝙞𝙣 𝙞𝙨 𝙣𝙤𝙩 𝙧𝙚𝙨𝙥𝙤𝙣𝙨𝙞𝙗𝙡𝙚 𝙛𝙤𝙧 𝙘𝙝𝙞𝙡𝙙'𝙨 𝙖𝙣𝙙 𝙞𝙧𝙧𝙚𝙨𝙥𝙤𝙣𝙨𝙞𝙗𝙡𝙚 𝙥𝙚𝙤𝙥𝙡𝙚'𝙨 𝙪𝙨𝙞𝙣𝙜.

𝘿𝙤𝙣'𝙩 𝙩𝙖𝙠𝙚 𝙞𝙩 𝙖𝙨 𝙞𝙡𝙡𝙚𝙜𝙖𝙡

Send '/help' to get more context 

🔞 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 🔞
 `);
}

if(query.startsWith("/xvd")) {
  query = query.split("/xvd ")[1];
  buttonMessage(msg.chat.id, query);
}
});

// Simulated external database to store lengthy URLs
const database = new Map();

const resultsPerPage = 5; // Number of results per page
let currentPage = 1; // Current page number
let totalResults = 0; // Total number of results

async function buttonMessage(chatId, query) {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;

  const res = (await axios(`https://raganork-network.vercel.app/api/xvideos/search?query=${query}`)).data;
  totalResults = res.result.length;
  const paginatedResults = res.result.slice(startIndex, endIndex);

  const results = [];

  for (const [index, video] of paginatedResults.entries()) {
    const videoIndex = startIndex + index + 1;

    results.push({
      title: video.title,
      uniqueId: `video_${videoIndex}`
    });

    // Store the lengthy URL in the external database
    database.set(`video_${videoIndex}`, video.url);
  }

  const buttonsPerRow = 2; // Number of buttons per row
  const buttonGroups = [];
  let currentGroup = [];

  for (const video of results) {
    currentGroup.push({
      text: video.title,
      callback_data: video.uniqueId // Use the unique identifier as callback_data
    });

    if (currentGroup.length === buttonsPerRow) {
      buttonGroups.push(currentGroup);
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    buttonGroups.push(currentGroup);
  }

  const options = {
    reply_markup: {
      inline_keyboard: buttonGroups.concat([
        [
          {
            text: 'Next Page',
            callback_data: 'next_page'
          }
        ]
      ])
    }
  };

  bot.sendMessage(chatId, `Page ${currentPage}/${Math.ceil(totalResults / resultsPerPage)} - Please select a video:`, options);
}


bot.on('callback_query', async (query) => {
  const uniqueId = query.data;
  const chatId = query.message.chat.id;

  if (uniqueId === 'next_page') {
    currentPage += 1;
    if (currentPage > Math.ceil(totalResults / resultsPerPage)) {
      currentPage = 1;
    }
    buttonMessage(chatId);
    // Edit the original message
    } else {
    await bot.answerCallbackQuery(query.id, { text: '_Downloading video.._' });

    // Retrieve the lengthy URL from the external database
    const link = database.get(uniqueId);
    if (link) {
      const { url } = (await axios(`https://raganork-network.vercel.app/api/xvideos/download?url=${link}`)).data;
      bot.sendVideo(chatId, url);
    } else {
      bot.sendMessage(chatId, 'Error: Video not found.');
    }
  }
});

bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error}`);
});

    module.exports = buttonMessage;
