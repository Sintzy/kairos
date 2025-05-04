import { getDB } from "@/lib/Mongo";
import logsapi from "@/lib/Logs";

export async function GET() {
  const db = await getDB();
  const viagem = await db.collection("viagens").findOne({ ativa: true });

  if (!viagem || !viagem.pontoAtual) {
    await logsapi.track({
      event: 'Ponto Atual',
      description: 'Não foi possível encontrar a viagem ou o ponto atual.',
      tags: {
        status: 200,
        lat: null,
        lng: null
      }
    });
    return new Response(JSON.stringify({ lat: null, lng: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [lat, lng] = viagem.pontoAtual.split(",").map(Number);
  return new Response(JSON.stringify({ lat, lng }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
