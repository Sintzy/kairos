import { atualizarViagem } from '@/lib/AtualizarViagem';
import logsapi from '@/lib/Logs';

export async function POST() {
  await atualizarViagem();
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
