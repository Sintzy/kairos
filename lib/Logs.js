import { LogSnag } from 'logsnag';

const logsnag = new LogSnag({
    token: process.env.LOGSNAG_TOKEN,
    project: 'kairos'
});

const logsapi = {
    track: async ({ event, description, icon = '🚌', channel = 'api', tags = {} }) => {
        try {
            await logsnag.track({
                channel,
                event,
                description,
                icon,
                tags
            });
        } catch (err) {
            console.error('erro ao enviar logs: ', err.message);
        }
    }
};

export default logsapi;
