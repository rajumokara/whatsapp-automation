const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    puppeteer: {
        headless: false, // Open browser to view activity
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    logLevel: 'debug', // Enable debug logs
});

client.on('qr', (qr) => {
    console.log('QR Code received. Scan it with your WhatsApp app:');
    qrcode.generate(qr, { small: true });
});

client.once('ready', async () => {
    console.log('Client is ready!');

    setTimeout(async () => {
        try {
            console.log('Fetching all chats...');
            const chats = await client.getChats();
            console.log('Chats fetched successfully:', chats.length);

            if (chats.length === 0) {
                console.log('No chats found. Ensure your WhatsApp account has active chats or groups.');
                return;
            }

            console.log('Listing all group chats:');

            chats.forEach(chat => {
                console.log('Chat details:', chat);
                if (chat.isGroup) {
                    console.log(`Group Chat Found: ${chat.name}`);
                }
            });
            

            const targetGroupName = 'wp1'; // Replace with your group name
            const group = chats.find(chat => chat.isGroup && chat.name === targetGroupName);

            if (group) {
                console.log(`Found group: ${group.name}`);
                await client.sendMessage(group.id._serialized, 'Hello group! This is a test message.');
                console.log('Message sent successfully.');
            } else {
                console.log(`Group "${targetGroupName}" not found.`);
            }
        } catch (error) {
            console.error('Error while fetching chats or sending message:', error);
        }
    }, 2000);
});

client.on('message_create', (message) => {
    if (message.body.toLowerCase() === 'hello') {
        client.sendMessage(message.from, 'Hello! How can I assist you today?');
    }
});

client.initialize();
