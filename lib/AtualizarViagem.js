import { getDB } from './Mongo';
import axios from 'axios';


const ORS_API_KEY = process.env.ORS_API_KEY;

export async function atualizarViagem() {
  const db = await getDB();
  const viagem = await db.collection('viagens').findOne({ ativa: true });

  if (!viagem || !viagem.pontoAtual || !viagem.destino) return;

  try {
    const [lat1, lng1] = viagem.pontoAtual.split(',').map(Number);
    const [lat2, lng2] = viagem.destinoCoordenadas.split(',').map(Number);


    const res = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
      params: {
        api_key: ORS_API_KEY,
        start: `${lng1},${lat1}`,
        end: `${lng2},${lat2}`
      }
    });

    const { distance, duration } = res.data.features[0].properties.summary;

    const tempoMinutos = Math.round(duration / 60);
    const distanciaKm = (distance / 1000).toFixed(1);

    await db.collection('viagens').updateOne({ ativa: true }, {
      $set: {
        tempoRestante: `${tempoMinutos} min`,
        distanciaRestante: `${distanciaKm}`,
        updatedAt: new Date()
      }
    });

    console.log(`📍 Atualizado: ${tempoMinutos} min | ${distanciaKm} km`);

  } catch (err) {
    console.error('❌ Erro ORS:', err.message);
  }
}
