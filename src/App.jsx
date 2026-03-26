import { useState, useEffect, useRef, useCallback } from 'react'
import {
  WiDaySunny, WiDayCloudy, WiCloudy, WiRain, WiSnow,
  WiThunderstorm, WiFog, WiDayFog, WiSprinkle,
  WiHumidity, WiStrongWind, WiBarometer, WiSunrise, WiSunset,
  WiDayHaze, WiNightAltCloudy,
} from 'react-icons/wi'
import {
  TbSearch, TbArrowRight, TbLocation, TbTemperature,
  TbEye, TbWind, TbDroplet, TbGauge, TbSparkles,
  TbSunrise, TbSunset, TbRefresh, TbStar,
} from 'react-icons/tb'
import { PiThermometerHot, PiCoatHanger, PiWarningCircle } from 'react-icons/pi'
import { RiExchangeLine } from 'react-icons/ri'
import './index.css'

const API_KEY = '2f5a3c0bf2e6ec975e05919e1fe9e816'

// ── Weather icon mapping ─────────────────────────────────────────────────────
function WeatherIcon({ condition, size = 64, className = '' }) {
  const c = (condition || '').toLowerCase()
  const props = { size, className }
  if (c.includes('thunder'))                return <WiThunderstorm {...props} />
  if (c.includes('drizzle'))                return <WiSprinkle {...props} />
  if (c.includes('rain'))                   return <WiRain {...props} />
  if (c.includes('snow'))                   return <WiSnow {...props} />
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return <WiFog {...props} />
  if (c.includes('cloud') && c.includes('few')) return <WiDayCloudy {...props} />
  if (c.includes('cloud') || c.includes('overcast') || c.includes('broken') || c.includes('scattered'))
    return <WiCloudy {...props} />
  if (c.includes('clear'))                  return <WiDaySunny {...props} />
  return <WiDayCloudy {...props} />
}

// ── Fashion advice engine ────────────────────────────────────────────────────
function getFashionAdvice(temp, condition, humidity) {
  const cond = (condition || '').toLowerCase()
  const isRainy = cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')
  const isSnowy = cond.includes('snow')

  if (temp >= 30) return {
    season: 'Summer Heat',
    subtitle: `${temp}°C+ uchun ideal`,
    recommendation: 'Yengil paxta ko\'ylak va keng shimlar',
    tip: 'UV nurlaridan himoyalanishingiz uchun shlyapa kiying. Ochiq ranglarni tanlang.',
    items: ['Yengil ko\'ylak', 'Keng shim', 'Sandalya', 'Quyosh ko\'zoynagi', 'Quyoshdan himoya kremi'],
    accent: '#F59E0B',
    gradient: 'from-amber-400 to-orange-500',
    gradientBg: 'from-amber-500/20 to-orange-500/10',
    emoji: '☀️',
    image: '/fashion_summer.png',
    bgFrom: '#1a1200', bgTo: '#2a1f00',
  }
  if (temp >= 20) return {
    season: 'Summer Essentials',
    subtitle: `${temp}°C+ uchun yengil uslub`,
    recommendation: 'Yengil paxta ko\'ylak va qulay shimlar',
    tip: 'Kechki payt havo sovib ketishi mumkin — yengil nimcha oling.',
    items: ['Paxta ko\'ylak', 'Kargo shimlar', 'Krossovkalar', 'Yengil nimcha'],
    accent: '#EAB308',
    gradient: 'from-yellow-400 to-amber-500',
    gradientBg: 'from-yellow-500/20 to-amber-500/10',
    emoji: '🌤️',
    image: '/fashion_summer.png',
    bgFrom: '#141000', bgTo: '#221c00',
  }
  if (isRainy) return {
    season: 'Rainy Day Style',
    subtitle: 'Yomg\'irdan chiroyli himoya',
    recommendation: 'Yomg\'irpo\'sh va suv o\'tkazmaydigan poyabzal',
    tip: 'Soyabonni unutmang! Jigarrang yoki qora — eng zamonaviy tanlov.',
    items: ['Yomg\'irpo\'sh', 'Suv o\'tkazmaydigan krossovka', 'Qalin paypoq', 'Soyabon'],
    accent: '#60A5FA',
    gradient: 'from-blue-400 to-indigo-500',
    gradientBg: 'from-blue-500/20 to-indigo-500/10',
    emoji: '🌧️',
    image: '/fashion_rainy.png',
    bgFrom: '#00091a', bgTo: '#000f2a',
  }
  if (temp >= 10) return {
    season: 'Autumn Vibes',
    subtitle: `Salqin ${temp}°C uchun uslub`,
    recommendation: 'Yengil sviter va jins shimlar',
    tip: 'Qatlamli kiyim eng yaxshi tanlov. Sharf qo\'shing.',
    items: ['Sviter', 'Jins shim', 'Teri poyabzal', 'Sharf'],
    accent: '#F97316',
    gradient: 'from-orange-400 to-red-500',
    gradientBg: 'from-orange-500/20 to-red-500/10',
    emoji: '🍂',
    image: '/fashion_autumn.png',
    bgFrom: '#1a0800', bgTo: '#2a1000',
  }
  if (isSnowy) return {
    season: 'Winter Snow Style',
    subtitle: 'Qor uchun ajoyib ko\'rinish',
    recommendation: 'Qalin palto va issiq botinkalar',
    tip: 'Toyib ketmaydigan poyabzal tanlang. Qo\'lqop kiyishni unutmang!',
    items: ['Qalin palto', 'Qo\'lqop', 'Qor botinkasi', 'Issiq qalpoq', 'Issiq ichki kiyim'],
    accent: '#38BDF8',
    gradient: 'from-sky-400 to-blue-500',
    gradientBg: 'from-sky-500/20 to-blue-500/10',
    emoji: '❄️',
    image: '/fashion_snow.png',
    bgFrom: '#00101a', bgTo: '#001a2a',
  }
  if (temp >= 0) return {
    season: 'Winter Essential',
    subtitle: `Sovuq ${temp}°C`,
    recommendation: 'Qalin palto va issiq botinkalar',
    tip: 'Qatlam-qatlam kiyinish muhim! Ustki kiyim shamol va namlikdan himoya qiladi.',
    items: ['Qalin palto', 'Issiq ko\'ylak', 'Qo\'lqop', 'Issiq qalpoq', 'Issiq etiklar'],
    accent: '#818CF8',
    gradient: 'from-indigo-400 to-violet-500',
    gradientBg: 'from-indigo-500/20 to-violet-500/10',
    emoji: '🧥',
    image: '/fashion_winter.png',
    bgFrom: '#06001a', bgTo: '#0e002a',
  }
  return {
    season: 'Arctic Style',
    subtitle: 'O\'ta sovuq havo',
    recommendation: 'Mo\'ynali po\'stin va issiq kiyimlar',
    tip: 'Agar tashqariga chiqsangiz, to\'liq himoyalovchi kiyim kiying.',
    items: ['Mo\'ynali po\'stin', 'Issiq kiyimlar', 'Qo\'lqop', 'Qalin qalpoq', 'Yuzni yopuvchi qalpoq'],
    accent: '#A5B4FC',
    gradient: 'from-violet-400 to-indigo-600',
    gradientBg: 'from-violet-500/20 to-indigo-500/10',
    emoji: '🌨️',
    image: '/fashion_snow.png',
    bgFrom: '#06001a', bgTo: '#0e002a',
  }
}

const DAYS = ['Yak', 'Du', 'Se', 'Cho', 'Pay', 'Ju', 'Sha']
function getDayName(dt) {
  return DAYS[new Date(dt * 1000).getDay()]
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, delay = 0 }) {
  return (
    <div
      className="glass-card rounded-2xl px-4 py-3.5 flex items-center gap-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-white/50 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">{label}</p>
        <p className="text-white font-semibold text-sm truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Forecast item ────────────────────────────────────────────────────────────
function ForecastItem({ dt, temp, cond, idx }) {
  return (
    <div
      className="glass-card rounded-2xl flex flex-col items-center gap-2 px-4 py-4 min-w-[76px] flex-shrink-0 animate-fade-up"
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{getDayName(dt)}</span>
      <WeatherIcon condition={cond} size={32} className="text-white/80" />
      <span className="text-white font-bold text-sm">{Math.round(temp)}°</span>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery]     = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [fashion, setFashion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [visible, setVisible] = useState(false)
  const [unit, setUnit]       = useState('metric')
  const inputRef = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => fetchByCoords(p.coords.latitude, p.coords.longitude),
        () => fetchByCity('Tashkent')
      )
    } else {
      fetchByCity('Tashkent')
    }
  }, [])

  const processData = (w, f) => {
    setWeather(w)
    const seen = {}
    const today = new Date().toISOString().split('T')[0]
    const days = (f.list || []).filter(i => {
      const d = i.dt_txt.split(' ')[0]
      if (d === today || seen[d]) return false
      seen[d] = true
      return true
    }).slice(0, 5)
    setForecast(days)
    setFashion(getFashionAdvice(w.main.temp, w.weather[0]?.main, w.main.humidity))
    setTimeout(() => setVisible(true), 80)
  }

  const fetchByCoords = async (lat, lon) => {
    setLoading(true); setError(''); setVisible(false)
    try {
      const [w, f] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`).then(r => r.json()),
      ])
      if (w.cod !== 200) throw new Error(w.message)
      processData(w, f)
    } catch (e) { setError(e.message || "Xatolik yuz berdi.") }
    finally { setLoading(false) }
  }

  const fetchByCity = useCallback(async (city) => {
    if (!city.trim()) return
    setLoading(true); setError(''); setVisible(false)
    try {
      const [w, f] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`).then(r => r.json()),
      ])
      if (w.cod !== 200) throw new Error(w.message || 'Shahar topilmadi')
      processData(w, f)
    } catch (e) { setError(e.message || "Shahar topilmadi.") }
    finally { setLoading(false) }
  }, [unit])

  const handleSearch = (e) => { e.preventDefault(); if (query.trim()) fetchByCity(query.trim()) }
  const toggleUnit = () => {
    const u = unit === 'metric' ? 'imperial' : 'metric'
    setUnit(u)
    if (weather?.name) {
      setUnit(u)
      setTimeout(() => fetchByCity(weather.name), 0)
    }
  }

  const temp       = weather ? Math.round(weather.main.temp) : null
  const feelsLike  = weather ? Math.round(weather.main.feels_like) : null
  const condMain   = weather?.weather[0]?.main || ''
  const condDesc   = weather?.weather[0]?.description || ''
  const windSpeed  = weather?.wind?.speed || 0
  const humidity   = weather?.main.humidity || 0
  const pressure   = weather?.main.pressure || 0
  const visibility = ((weather?.visibility || 10000) / 1000).toFixed(1)
  const sunrise    = weather?.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : '--'
  const sunset     = weather?.sys?.sunset  ? new Date(weather.sys.sunset  * 1000).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : '--'

  // Dynamic dark bg color from fashion
  const bgStyle = fashion
    ? { background: `radial-gradient(ellipse at top left, ${fashion.bgFrom}, #0f0e17 60%), radial-gradient(ellipse at bottom right, ${fashion.bgTo}, #0f0e17 60%)` }
    : { background: '#0f0e17' }

  const accentColor = fashion?.accent || '#F59E0B'

  return (
    <div className="min-h-screen transition-colors duration-1000" style={bgStyle}>
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full animate-blob opacity-20"
          style={{ background: `radial-gradient(circle, ${accentColor}66, transparent 70%)` }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full animate-blob opacity-15"
          style={{ background: `radial-gradient(circle, ${accentColor}44, transparent 70%)`, animationDelay: '4s' }} />
      </div>

      {/* Page container — max-w-md kenglik */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-4 py-6">

        {/* ── Header ────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center animate-pulse-ring"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
            >
              <WiDaySunny size={22} className="text-black" />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight leading-none">WeatherStyle</p>
              <p className="text-white/40 text-[10px] tracking-wider uppercase">Moda va Ob-havo</p>
            </div>
          </div>

          <button
            onClick={toggleUnit}
            className="glass-lighter flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-white/70 hover:text-white text-xs font-semibold transition-all hover:scale-105"
          >
            <RiExchangeLine size={14} />
            °{unit === 'metric' ? 'C' : 'F'}
          </button>
        </header>

        {/* ── Search ────────────────────────────────────── */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <TbSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Shaharni izlang..."
            className="search-input w-full pl-11 pr-14 py-3.5 rounded-2xl text-sm font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold transition-all hover:scale-105 hover:brightness-110 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
          >
            <TbArrowRight size={16} />
          </button>
        </form>

        {/* ── Error ─────────────────────────────────────── */}
        {error && (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm mb-4 animate-fade-in">
            <PiWarningCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-3 flex-1">
            <div className="skeleton h-52 rounded-3xl" />
            <div className="skeleton h-32 rounded-3xl" />
            <div className="skeleton h-28 rounded-3xl" />
          </div>
        )}

        {/* ── Main content ──────────────────────────────── */}
        {!loading && weather && (
          <div
            className="flex flex-col gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            {/* ── Hero weather card ──────────────────────── */}
            <div className="glass-light rounded-3xl overflow-hidden">
              {/* Fashion image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={fashion?.image || '/fashion_summer.png'}
                  alt={fashion?.season}
                  className="fashion-img w-full h-full"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Season badge top-right */}
                <div className="absolute top-3 right-3">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-black backdrop-blur-sm shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
                  >
                    <TbStar size={11} />
                    {fashion?.season}
                  </div>
                </div>
                {/* Location badge top-left */}
                <div className="absolute top-3 left-3">
                  <div className="glass-lighter flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-sm">
                    <TbLocation size={11} />
                    {weather.name}, {weather.sys?.country}
                  </div>
                </div>
                {/* Bottom caption */}
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-display text-lg font-semibold text-white leading-snug drop-shadow-lg">
                    {fashion?.season}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">{fashion?.subtitle}</p>
                </div>
              </div>

              {/* Temperature row */}
              <div className="px-5 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-end gap-1 leading-none">
                      <span
                        className="text-7xl font-thin text-glow"
                        style={{ color: accentColor, lineHeight: 1 }}
                      >
                        {temp}
                      </span>
                      <span className="text-2xl font-light text-white/50 mb-2">
                        °{unit === 'metric' ? 'C' : 'F'}
                      </span>
                    </div>
                    <p className="capitalize text-white/50 text-sm mt-1.5">{condDesc}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      <PiThermometerHot className="inline mr-1" />Hissiyot: {feelsLike}°
                    </p>
                  </div>

                  <div className="animate-float" style={{ color: accentColor }}>
                    <WeatherIcon condition={condMain} size={72} />
                  </div>
                </div>

                {/* Divider */}
                <div className="divider my-4" />

                {/* Stats grid 2x2 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <StatCard icon={<TbDroplet size={18} />}    label="Namlik"   value={`${humidity}%`}         delay={0}   />
                  <StatCard icon={<TbWind size={18} />}       label="Shamol"   value={`${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}`} delay={60}  />
                  <StatCard icon={<TbGauge size={18} />}      label="Bosim"    value={`${pressure} hPa`}      delay={120} />
                  <StatCard icon={<TbEye size={18} />}        label="Ko'rinish" value={`${visibility} km`}    delay={180} />
                </div>
              </div>
            </div>

            {/* ── Fashion recommendation card ─────────────── */}
            {fashion && (
              <div className="glass-light rounded-3xl overflow-hidden animate-fade-up" style={{ animationDelay: '150ms' }}>
                {/* Accent header */}
                <div
                  className="px-5 py-4"
                  style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-black flex-shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
                    >
                      <PiCoatHanger size={22} />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Bugungi tavsiya</p>
                      <p className="text-white font-semibold text-sm leading-snug">{fashion.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3">
                  <div className="glass-card rounded-xl px-3.5 py-3 flex items-start gap-2.5 mb-4">
                    <TbSparkles size={15} className="flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <p className="text-white/60 text-xs leading-relaxed">{fashion.tip}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {fashion.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border transition-all hover:text-white"
                        style={{
                          borderColor: `${accentColor}40`,
                          background: `${accentColor}12`,
                          animationDelay: `${i * 55}ms`,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 5-day forecast ─────────────────────────── */}
            {forecast.length > 0 && (
              <div className="glass-light rounded-3xl p-5 animate-fade-up" style={{ animationDelay: '220ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">5 Kunlik Ob-havo Ma'lumoti</p>
                  <TbRefresh size={14} className="text-white/30" />
                </div>
                <div className="flex gap-2.5 overflow-x-auto forecast-scroll pb-1">
                  {forecast.map((d, i) => (
                    <ForecastItem key={i} idx={i} dt={d.dt} temp={d.main.temp} cond={d.weather[0]?.main} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Sunrise / Sunset ───────────────────────── */}
            {weather?.sys && (
              <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '290ms' }}>
                <div className="glass-light rounded-3xl p-5 flex flex-col items-center gap-2 text-center">
                  <WiSunrise size={36} style={{ color: accentColor }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Tong otishi</p>
                  <p className="text-white font-bold text-lg">{sunrise}</p>
                </div>
                <div className="glass-light rounded-3xl p-5 flex flex-col items-center gap-2 text-center">
                  <WiSunset size={36} style={{ color: accentColor }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Quyosh botishi</p>
                  <p className="text-white font-bold text-lg">{sunset}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-white/20 text-[10px] tracking-wider pb-4 mt-2">
              POWERED BY OPENWEATHER · WEATHERSTYLE © 2025
            </p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────── */}
        {!loading && !weather && !error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-16">
            <div
              className="w-24 h-24 rounded-3xl glass-light flex items-center justify-center animate-float shadow-2xl"
              style={{ color: accentColor }}
            >
              <WiDaySunny size={52} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-white mb-2">Ob-havo va Moda</h1>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                Shaharni izlang va bugungi ob-havoga mos moda maslahatlarini oling!
              </p>
            </div>
            <button
              onClick={() => fetchByCity('Tashkent')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-black transition-all hover:scale-105 hover:brightness-110 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              <TbLocation size={16} />
              Toshkent ob-havosi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
