"use client";
import { NowPlaying } from "@/lib/NowPlaying";
import { useEffect, useState } from "react";
import { FaMapPin } from "react-icons/fa";
import Relogio from "@/lib/Relogio";

export default function Home() {
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState(null);
    const [viagem, setViagem] = useState(null);

    // Atualiza relógio a cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Atualiza viagem a cada 30s
    useEffect(() => {
        async function fetchViagem() {
            try {
                await fetch("/api/viagem/atualizar", { method: "POST" });
                const res = await fetch("/api/viagem");
                const data = await res.json();
                if (data.ativa) {
                    setViagem(data);
                } else {
                    setViagem(null);
                }
            } catch (err) {
                console.error("Erro ao atualizar viagem:", err.message);
            }
        }

        fetchViagem();
        const interval = setInterval(fetchViagem, 30000);
        return () => clearInterval(interval);
    }, []);

    // Atualiza meteorologia a cada 30s, sempre
    useEffect(() => {
        async function fetchWeather(lat, lng) {
            try {
                // fallback para Lisboa se sem coords
                if (!lat || !lng) {
                    lat = 38.72393999495067,
                    lng = -9.235054329040397;
                }

                const meteoRes = await fetch(`/api/metereologia?lat=${lat}&lng=${lng}`);
                const meteoData = await meteoRes.json();
                setWeather(meteoData);
            } catch (err) {
                console.error("Erro ao obter meteorologia:", err);
            }
        }

        async function updateWeather() {
            let lat = null;
            let lng = null;

            try {
                const pontoRes = await fetch("/api/viagem/pontoAtual");
                const ponto = await pontoRes.json();
                lat = ponto.lat;
                lng = ponto.lng;
            } catch (_) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        fetchWeather(position.coords.latitude, position.coords.longitude);
                    });
                    return;
                }
            }
            await fetchWeather(lat, lng);
        }

        updateWeather();
        const interval = setInterval(updateWeather, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-white font-sans text-black">
            <div className="bg-cyan-600 text-white px-6 py-3 flex justify-between items-center text-2xl font-bold">
                <span>Campo de Férias Confia!</span>
                <Relogio/>
            </div>

            {weather && (
                <div className="p-6 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div
                            className="bg-cyan-600 text-white text-4xl font-bold w-16 h-16 flex items-center justify-center rounded">
                            <img src={weather.icon} alt="Weather icon"/>
                        </div>
                        <div>
                            <div className="text-4xl font-bold">{Math.round(weather.temperature)}ºC</div>
                            <div className="text-gray-600 text-2xl">em {weather.city}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl text-gray-700">Humidade</div>
                        <div className="text-5xl font-bold">{weather.humidity}%</div>
                    </div>
                </div>
            )}

            {viagem ? (
                <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-300 shadow-md p-4">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="bg-cyan-600 text-white text-4xl font-bold w-16 h-16 flex items-center justify-center rounded">
                                <FaMapPin/>
                            </div>
                            <div>
                                <div className="text-4xl font-bold">{viagem.tempoRestante}</div>
                                <div
                                    className="text-gray-600 text-2xl overflow-hidden whitespace-nowrap w-[calc(35ch)]">
                                    <div className="animate-slider">{viagem.destino}</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl">distância</div>
                            <div className="text-5xl font-bold">{Math.round(viagem.distanciaRestante)}km</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-300 shadow-md p-4">
                    <div className="flex justify-center items-center px-4">
                        <div className="ml-4">
                            <div className="text-2xl text-gray-600">Nenhuma viagem ativa no momento.</div>
                        </div>
                    </div>
                </div>
            )}

            <hr className="border-black"/>
            <NowPlaying/>
        </main>
    );
}