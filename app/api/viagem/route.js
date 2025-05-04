import { getDB } from '@/lib/Mongo';
import { atualizarViagem } from '@/lib/AtualizarViagem';
import axios from 'axios';
import logsapi from '@/lib/Logs';

const ORS_API_KEY = process.env.ORS_API_KEY;

async function resolverLocal(local) {
  const coordRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/; //REGEX PARA COORDENADAS
  if (coordRegex.test(local.trim())) {
    return local.trim();
  }
  
  const geoRes = await axios.get('https://api.openrouteservice.org/geocode/search', {
    params: {
      api_key: ORS_API_KEY,
      text: local,
      boundary_country: 'PT'
    }
  });

  if (!geoRes.data.features.length) {
    await logsapi.track({
      event: 'Criar Viagem (root)',
      description: 'Não foi possível encontrar coordenadas para o local.',
      tags: {
        local: local,
      }
    });
    throw new Error(`Não foi possível encontrar coordenadas para: ${local}`);
  }

  const [lng, lat] = geoRes.data.features[0].geometry.coordinates;
  return `${lat},${lng}`;
}

export async function POST(req) {
  const body = await req.json();
  const { origem, destino } = body;

  if (!origem || !destino) {
    return new Response(JSON.stringify({ error: 'Origem e destino obrigatórios' }), { status: 400 });
  }

  try {
    const db = await getDB();
    await db.collection('viagens').deleteMany({});
    const origemCoordenadas = await resolverLocal(origem);
    const destinoCoordenadas = await resolverLocal(destino);

    // ✅ Criar nova viagem
    const viagem = {
      ativa: true,
      origem, // nome ou texto original
      origemCoordenadas, // coordenadas reais
      destino,
      destinoCoordenadas,
      pontoAtual: origemCoordenadas,
      tempoRestante: null,
      distanciaRestante: null,
      updatedAt: new Date()
    };

    await db.collection('viagens').insertOne(viagem);

    // 🔁 Atualiza tempo/distância com base nas coordenadas
    await atualizarViagem();
    await logsapi.track({
      event: 'Criar Viagem (root) (post)',
      description: 'A viagem foi criada com sucesso!',
      tags: {
        status:200,
        origem: origem,
        origemCoordenadas: origemCoordenadas,
        destino: destino,
        destinoCoordenadas: destinoCoordenadas
      }
    });

    return new Response(JSON.stringify({
      success: true,
      origem,
      origemCoordenadas,
      destino,
      destinoCoordenadas,
      mensagem: 'Viagem criada com sucesso e atualizada.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    await logsapi.track({
      event: 'Criar Viagem (root) (post)',
      description: 'Erro ao criar a viagem',
      tags: {
        status:500,
        erro: err.message,
      }
    });
    return new Response(JSON.stringify({ error: err.message || 'Erro interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



export async function GET() {
  const db = await getDB();
  const viagem = await db.collection('viagens').findOne({ ativa: true });

  if (!viagem) {
    return new Response(JSON.stringify({ ativa: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { destino, tempoRestante, distanciaRestante } = viagem;
  return new Response(JSON.stringify({
    ativa: true,
    destino,
    tempoRestante,
    distanciaRestante
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
