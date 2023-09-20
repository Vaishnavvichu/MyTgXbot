FROM node:14
RUN git clone https://github.com/Vaishnavvichu/MyTgXbot /vercel/Nora07
WORKDIR /vercel/Nora07
COPY package*.json ./
COPY . .
RUN npm install node-telegram-bot-api axios dotenv
EXPOSE 3000
CMD ["node", "server.js"]
