require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const https = require('https');
const { LogSnag } = require('logsnag');
const logsnag = new LogSnag({
    token: process.env.LOGSNAG_TOKEN,
    project: 'kairos',
});


const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    logsnag.track({
        channel: 'discord',
        event: 'Status Bot',
        description: `bot inciciado ${client.user.tag}`,
        icon: '🎛️',
    });
});

async function expandLink(shortUrl) {
    logsnag.track({
        channel: 'discord',
        event: 'Sistema Localização',
        description: `A expandir o link: ${shortUrl}`,
        icon: '📍',
    });
    return new Promise((resolve, reject) => {
        https.get(shortUrl, (res) => {
            const status = res.statusCode;

            if (status === 301 || status === 302) {
                resolve(res.headers.location);
            } else {
                reject(new Error(`link nao redirecionou: ${status}`));
                logsnag.track({
                    channel: 'discord',
                    event: 'Sistema Localização',
                    description: `O link não redirecionou ${status}`,
                    icon: '🚫',
                });
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() === 'terminar') {
        try {
            const response = await axios.post(`${process.env.API_URL}/terminar`);
            logsnag.track({
                channel: 'discord',
                event: 'Sistema Localização',
                description: `Viagem terminada com sucesso: ` + JSON.stringify(response.data, null, 2),
                icon: '📍',
            });
            message.reply('> **[📍] Viagem terminada com sucesso!**');
        } catch (error) {
            logsnag.track({
                channel: 'discord',
                event: 'Sistema Localização',
                description: `Ocorreu um erro ao terminar a viagem ${error}`,
                icon: '🚫',
            });
            message.reply('> **[🚫] Ocorreu um erro ao tentar terminar a viagem.**');
        }
        return;
    }
    const shortUrlRegex = /https:\/\/maps\.app\.goo\.gl\/[^\s]+/;
    const match = message.content.match(shortUrlRegex);

    if (!match) {
        return;
    }

    const shortUrl = match[0];

    try {
        const fullUrl = await expandLink(shortUrl);;

        let origin, destination;

        if (fullUrl.includes('/dir/?api=1')) {

            const urlParams = new URL(fullUrl).searchParams;
            origin = urlParams.get('origin');
            destination = urlParams.get('destination');
        } else if (fullUrl.includes('saddr=') && fullUrl.includes('daddr=')) {

            const urlParams = new URL(fullUrl).searchParams;
            origin = urlParams.get('saddr');
            destination = urlParams.get('daddr');
        } else {
            logsnag.track({
                channel: 'discord',
                event: 'Sistema Localização',
                description: `O link enviado nao tem as informacoes corretas... ${response.data}`,
                icon: '🚫',
            });
            return message.reply(
                '> **[⚠️] O link nao tem as informacoes corretas... Tens que colocar para calcular a viagem. Só ai é que partilhas o link.**'
            );
        }

        if (!origin || !destination) {
            logsnag.track({
                channel: 'discord',
                event: 'Sistema Localização',
                description: `A viagem não tem uma origem ou um destino ${response.data}`,
                icon: '🚫',
            });
            return message.reply('> **[🚫] A viagem não tem uma origem ou um destino.**');
        }


        const response = await axios.post(`${process.env.API_URL}`, {
            origem: origin,
            destino: destination
        });

        const embed = new EmbedBuilder()
            .setTitle('🚌 Viagem iniciada!')
            .setDescription(`**Origem:** ${decodeURIComponent(origin)}\n**Destino:** ${decodeURIComponent(destination)}`)
            .setColor('Green');

        await message.reply({ embeds: [embed] });
        await logsnag.track({
            channel: 'discord',
            event: 'Sistema Localização',
            description: `A viagem foi iniciada ${decodeURIComponent(origin)} para ${decodeURIComponent(destination)}`,
            icon: '💡',
        });

    } catch (error) {
        logsnag.track({
            channel: 'discord',
            event: 'Sistema Localização',
            description: `Ocorreu um erro: `+error,
            icon: '🚫',
        });
    }
});

client.login(process.env.TOKEN);
