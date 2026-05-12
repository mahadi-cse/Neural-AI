'use client';

import React from 'react';
import { 
  Cloud, Sun, CloudRain, CloudLightning, CloudFog, Snowflake, 
  Wind, Droplets, Thermometer, MapPin, Clock, Navigation, Activity
} from 'lucide-react';

interface WeatherData {
  agent: string;
  intent: string;
  location: string;
  time: string;
  summary: string;
  weather: {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    rainChance: number;
    hourly?: { time: string; temp: number; condition: string; }[];
  };
  visualization: {
    scene: string;
    animation: string;
    lighting: string;
    particles: number;
    camera: {
      position: string;
      rotation: string;
    };
  };
}

export const WeatherBlock = ({ data }: { data: WeatherData }) => {
  const getIcon = (scene: string) => {
    switch (scene) {
      case 'sunny': return <Sun className="text-yellow-400 w-16 h-16 animate-pulse" />;
      case 'cloudy': return <Cloud className="text-slate-400 w-16 h-16 animate-bounce" style={{ animationDuration: '3s' }} />;
      case 'rainy': return <CloudRain className="text-blue-400 w-16 h-16 animate-bounce" />;
      case 'storm': return <CloudLightning className="text-purple-500 w-16 h-16 animate-pulse" />;
      case 'snowy': return <Snowflake className="text-cyan-200 w-16 h-16 animate-spin" style={{ animationDuration: '5s' }} />;
      case 'foggy': return <CloudFog className="text-gray-300 w-16 h-16 animate-pulse" />;
      case 'night_clear': return <Sun className="text-indigo-200 w-16 h-16 opacity-50" />;
      default: return <Sun className="text-yellow-400 w-16 h-16" />;
    }
  };

  const getBackground = (scene: string) => {
    switch (scene) {
      case 'sunny': return 'from-blue-400 to-blue-600';
      case 'cloudy': return 'from-slate-400 to-slate-600';
      case 'rainy': return 'from-indigo-600 to-blue-900';
      case 'storm': return 'from-purple-900 to-black';
      case 'snowy': return 'from-cyan-700 to-blue-900';
      case 'foggy': return 'from-gray-400 to-gray-600';
      case 'night_clear': return 'from-indigo-900 to-black';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  return (
    <div className="my-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-700 max-w-4xl mx-auto">
      {/* Visual Header */}
      <div className={`relative h-64 bg-gradient-to-br ${getBackground(data.visualization.scene)} flex items-center justify-center overflow-hidden`}>
        {/* Animated Particles/Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full" 
              style={{
                width: Math.random() * 4 + 'px',
                height: Math.random() * 4 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `float ${Math.random() * 5 + 5}s linear infinite`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-white">
          {getIcon(data.visualization.scene)}
          <h2 className="text-6xl font-black mt-4 tracking-tighter">{data.weather.temperature}°</h2>
          <p className="text-lg font-bold opacity-80 uppercase tracking-widest">{data.weather.condition}</p>
        </div>

        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-white/60" />
              <span className="text-xl font-bold tracking-tight">{data.location}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
              <Clock size={12} />
              <span>{data.time}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">Feels Like</span>
            <p className="text-2xl font-bold">{data.weather.feelsLike}°</p>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      {data.weather.hourly && data.weather.hourly.length > 0 && (
        <div className="bg-[#0f0f0f] px-8 py-6 border-b border-white/5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {data.weather.hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all min-w-[80px]">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h.time}</span>
                <div className="text-blue-400">
                  {h.condition.toLowerCase().includes('sun') ? <Sun size={16} className="text-yellow-400" /> : <Cloud size={16} className="text-slate-400" />}
                </div>
                <span className="text-sm font-black text-white">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="bg-[#0a0a0a] p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
          <Droplets className="text-blue-400" size={24} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Humidity</span>
            <span className="text-lg font-bold text-white">{data.weather.humidity}%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
          <Wind className="text-emerald-400" size={24} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Wind Speed</span>
            <span className="text-lg font-bold text-white">{data.weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
          <Navigation className="text-orange-400" size={24} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Rain Chance</span>
            <span className="text-lg font-bold text-white">{data.weather.rainChance}%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all">
          <Thermometer className="text-rose-400" size={24} />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Condition</span>
            <span className="text-lg font-bold text-white truncate max-w-full px-2">{data.weather.condition}</span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-[#050505] px-10 py-6 border-t border-white/5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
          <Activity size={20} />
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium pt-1">
          {data.summary}
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
