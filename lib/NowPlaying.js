import 'dotenv/config'
import React, { useEffect, useState } from 'react';
import querystring from 'querystring';
import { Buffer } from 'buffer';
import { AiOutlinePauseCircle } from 'react-icons/ai';
import { BiErrorCircle } from 'react-icons/bi';
import { HiOutlineStatusOffline } from 'react-icons/hi';
import { FaMusic } from "react-icons/fa";
import { IoMdMusicalNote } from "react-icons/io";


const NOW_PLAYING_ENDPOINT = process.env.NEXT_PUBLIC_NOW_PLAYING_ENDPOINT || 'https://api.spotify.com/v1/me/player/currently-playing';
const QUEUE_ENDPOINT = process.env.NEXT_PUBLIC_QUEUE_ENDPOINT || 'https://api.spotify.com/v1/me/player/queue';
const TOKEN_ENDPOINT = process.env.NEXT_PUBLIC_TOKEN_ENDPOINT || 'https://accounts.spotify.com/api/token';

const client_id = process.env.NEXT_PUBLIC_CLIENT_ID;
const client_secret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
const refresh_token = process.env.NEXT_PUBLIC_REFRESH_TOKEN;

async function getAccessToken() {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token,
        }),
    });
    const { access_token } = await response.json();
    return access_token;
}

async function fetchNowPlayingData() {
    const token = await getAccessToken();

    // Faz ambas as chamadas em paralelo
    const [nowRes, queueRes] = await Promise.all([
        fetch(NOW_PLAYING_ENDPOINT, {
            headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(QUEUE_ENDPOINT, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    ]);

    // Trata erros da música atual
    if (nowRes.status === 204) {
        throw new Error('Nenhuma musica está a ser reproduzida.');
    }
    if (nowRes.status > 400) {
        throw new Error('Unable to Fetch Song');
    }
    const nowJson = await nowRes.json();
    const item = nowJson.item;
    const now = {
        albumImageUrl: item.album.images[0].url,
        artist: item.artists.map(a => a.name).join(', '),
        artistUrl: item.artists[0].external_urls.spotify,
        isPlaying: nowJson.is_playing,
        songUrl: item.external_urls.spotify,
        title: item.name,
        timePlayed: nowJson.progress_ms,
        timeTotal: item.duration_ms,
    };

    let nextTracks = [];
    if (queueRes.status === 403) {
        console.warn('a conta utilizada nao tem premium. ou está com o scope incorreto.');
    } else if (queueRes.ok) {
        const queueJson = await queueRes.json();
        if (Array.isArray(queueJson.queue)) {
            nextTracks = queueJson.queue.slice(0, 5).map(track => ({
                id: track.id,
                title: track.name,
                artists: track.artists.map(a => a.name).join(', '),
            }));
        }
    } else {
        console.warn('Erro ao buscar a fila:', queueRes.status);
    }

    return { now, nextTracks };
}

export const NowPlaying = () => {
    const [playing, setPlaying] = useState(null);
    const [upcoming, setUpcoming] = useState([]);

    useEffect(() => {
        const tick = async () => {
            try {
                const { now, nextTracks } = await fetchNowPlayingData();
                setPlaying(now);
                setUpcoming(nextTracks);
            } catch (err) {
                setPlaying({ error: err.message });
                setUpcoming([]);
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!playing) return null;

    const {
        isPlaying = false,
        albumImageUrl = 'https://r2.fivemanage.com/icFvuIKk9ch17iXgkGhC0/campoconfialogo.jpg',
        title = '',
        artist = '',
        timePlayed = 0,
        timeTotal = 0,
        songUrl = '#',
        artistUrl = '#',
        error,
    } = playing;

    let displayState;
    if (error === 'Nada a ser reproduxzido') displayState = 'OFFLINE';
    else if (error) displayState = 'ERROR';
    else if (isPlaying) displayState = 'PLAY';
    else displayState = 'PAUSE';

    const secP = Math.floor(timePlayed / 1000),
        minP = Math.floor(secP / 60),
        sP = secP % 60;
    const secT = Math.floor(timeTotal / 1000),
        minT = Math.floor(secT / 60),
        sT = secT % 60;
    const pad = n => (n < 10 ? `0${n}` : n);

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Bloco principal */}
            <div className="flex items-center gap-6">
                <div className="w-32 h-32 flex-shrink-0">
                    {(displayState === 'PLAY' || displayState === 'PAUSE') ? (
                        <a href={songUrl}>
                            <img
                                src={albumImageUrl}
                                alt="Album"
                                className="border-2 border-dashed border-gray-400 rounded-lg w-full h-full object-cover"
                            />
                        </a>
                    ) : (
                        <img
                            src={albumImageUrl}
                            alt="Album"
                            className="border-2 border-dashed border-gray-400 rounded-lg w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="flex-grow">
                    <div className={`text-2xl font-semibold ${title.length > 15 ? 'animate-marquee' : ''}`}>
                        {(displayState === 'PLAY' || displayState === 'PAUSE')
                            ? <a href={songUrl} className="text-black no-underline">{title}</a>
                            : error ? 'Nenhuma musica está a ser reproduzida.' : title
                        }
                    </div>
                    <div className="text-gray-600 text-xl">
                        {(displayState === 'PLAY' || displayState === 'PAUSE')
                            ? <a href={artistUrl} className="text-black no-underline">{artist}</a>
                            : error ? '' : artist
                        }
                    </div>
                    {(displayState === 'PLAY' || displayState === 'PAUSE') && (
                        <>
                            <div className="text-sm text-gray-700 mt-1">
                                {pad(minP)}:{pad(sP)} / {pad(minT)}:{pad(sT)}
                            </div>
                            <div className="w-full bg-gray-300 h-1 rounded mt-2">
                                <div
                                    className="bg-cyan-600 h-1 rounded"
                                    style={{ width: `${((minP * 60 + sP) / (minT * 60 + sT)) * 100}%` }}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="text-3xl text-gray-700">
                    {displayState === 'PLAY' ? <FaMusic size={30} /> :
                        displayState === 'PAUSE' ? <AiOutlinePauseCircle size={30} /> :
                            displayState === 'OFFLINE' ? <HiOutlineStatusOffline size={30} /> :
                                <BiErrorCircle size={30} />}
                </div>
            </div>

            {/*proximas 5 musicas*/}
            {upcoming.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Up Next</h3>
                    <ul className="space-y-2">
                        {upcoming.map((track, index) => (
                            <li
                                key={track.id}
                                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                {/* Badge com o número da faixa */}
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                                    {index + 1}
                                </div>

                                {/* Título e artista */}
                                <div className="ml-4 flex-grow overflow-hidden">
                                    <p className="font-medium text-gray-800 truncate">{track.title}</p>
                                    <p className="text-sm text-gray-500 truncate">{track.artists}</p>
                                </div>

                                {/* Ícone de música */}
                                <IoMdMusicalNote />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
};
