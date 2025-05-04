import { getDB } from '@/lib/Mongo';
import logsapi  from '@/lib/Logs';


export async function POST(req) {
  const { lat, lng } = await req.json();

  if (!lat || !lng) {
    await logsapi.track({
      event: 'Nova Localização',
      description: 'Ocorreu um erro ao atulizar a localizacao... Lat e Lng são obrigatórios',
      tags: {
        status: 400,
      }
    });
    return new Response(JSON.stringify({ error: 'lat e lng são obrigatórios' }), { status: 400 });
  }

  const pontoAtual = `${lat},${lng}`;
  const db = await getDB();

  await db.collection('viagens').updateOne({}, {
    $set: { pontoAtual, updatedAt: new Date() }
  });
  return new Response(JSON.stringify({ success: true, pontoAtual }), { status: 200 });

}
