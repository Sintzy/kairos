import { NextResponse } from 'next/server';
import axios from 'axios';
import logsapi from '@/lib/Logs';

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let lat = searchParams.get('lat');
  let lng = searchParams.get('lng');

  if (!lat || !lng) {
    lat = 38.7167;
    lng = -9.1333;
  }

  try {
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon: lng,
        units: 'metric',
        lang: 'pt',
        appid: API_KEY
      }
    });

    const data = res.data;

    const meteo = {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      city: data.name,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    };

    return NextResponse.json(meteo, { status: 200 });
  } catch (err) {
    await logsapi.track({
      event: 'Meteorologia',
      description: 'Ocorreu um erro ao obter a meteorologia.',
      tags: {
        erro: err.message,
      }
    });
    return NextResponse.json({ error: 'Erro ao obter meteorologia' }, { status: 500 });
  }
}
