import { getDB } from '@/lib/Mongo';
import logsapi from "@/lib/Logs";

export async function POST() {
    try {
        const db = await getDB();
        await db.collection('viagens').deleteMany({});
        return new Response(JSON.stringify({ sucesso: true, mensagem: 'Viagens terminadas com sucesso.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        await logsapi.track({
            event: 'Terminar Viagem',
            description: 'A viagem não foi terminada com sucesso',
            tags: {
                status: 500,
                erro: err.message,
            }
        });
        return new Response(JSON.stringify({ sucesso: false, mensagem: 'Erro ao terminar viagens.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}