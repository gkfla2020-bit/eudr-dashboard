import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, LayersControl } from 'react-leaflet'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, BarChart, Bar } from 'recharts'
import { COMPANY, PLOTS, NDVI_TIMESERIES, FAO_CRITERIA } from './data'
import './App.css'

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024]

function App() {
  const [selected, setSelected] = useState(PLOTS[1])
  const [year, setYear] = useState(2020)
  const [compareYear, setCompareYear] = useState(2024)
  const [sliderPos, setSliderPos] = useState(50)
  const sliderRef = useRef(null)

  const compliant = PLOTS.filter(p => p.compliant).length
  const total = PLOTS.length

  const handleSliderMove = (e) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setSliderPos(x)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon" />
            <div>
              <h1>EUDR Forest Monitor</h1>
              <span className="header-sub">{COMPANY.name} — {COMPANY.subsidiary}</span>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="hs-value green">{compliant}</span>
              <span className="hs-label">Compliant</span>
            </div>
            <div className="header-stat">
              <span className="hs-value red">{total - compliant}</span>
              <span className="hs-label">Non-Compliant</span>
            </div>
            <div className="header-stat">
              <span className="hs-value">{COMPANY.cutoff}</span>
              <span className="hs-label">EUDR Cut-off</span>
            </div>
          </div>
        </div>
      </header>

      <div className="content">
        {/* Left: Image Comparison */}
        <section className="comparison-section">
          <div className="comparison-header">
            <h2>Satellite Imagery Comparison</h2>
            <p className="comparison-sub">Sentinel-2 Cloudless Mosaic — {selected?.name || 'Select a plot'}</p>
          </div>

          {/* Year Selector */}
          <div className="year-selectors">
            <div className="year-select-group">
              <label>Before</label>
              <div className="year-pills">
                {YEARS.filter(y => y <= 2020).map(y => (
                  <button key={y} className={`year-pill ${year === y ? 'active' : ''}`} onClick={() => setYear(y)}>{y}</button>
                ))}
              </div>
            </div>
            <div className="year-select-group">
              <label>After</label>
              <div className="year-pills">
                {YEARS.filter(y => y > 2020).map(y => (
                  <button key={y} className={`year-pill after ${compareYear === y ? 'active' : ''}`} onClick={() => setCompareYear(y)}>{y}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Slider Comparison */}
          <div
            className="image-slider"
            ref={sliderRef}
            onMouseMove={(e) => { if (e.buttons === 1) handleSliderMove(e) }}
            onClick={handleSliderMove}
          >
            <div className="slider-image-wrapper">
              <img src={`/tiles/${compareYear}.jpg`} alt={`${compareYear}`} className="slider-img" />
              <div className="slider-clip" style={{ width: `${sliderPos}%` }}>
                <img src={`/tiles/${year}.jpg`} alt={`${year}`} className="slider-img" />
              </div>
              <div className="slider-line" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle" />
              </div>
              <div className="slider-label left">{year}</div>
              <div className="slider-label right">{compareYear}</div>
            </div>

            {/* Boundary Overlay */}
            <svg className="boundary-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="8" y="8" width="84" height="84" fill="none" stroke="#4ade80" strokeWidth="0.4" strokeDasharray="1.5 1" opacity="0.6" />
            </svg>
          </div>

          <div className="comparison-info">
            <span className="info-tag">Concession: {selected?.license}</span>
            <span className="info-tag">Area: {selected?.area_ha.toLocaleString()} ha</span>
            <span className="info-tag">Coord: {selected?.lat.toFixed(4)}, {selected?.lon.toFixed(4)}</span>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="right-panel">
          {/* Plot List */}
          <div className="panel-section">
            <h3 className="panel-title">Concessions</h3>
            <div className="plot-list">
              {PLOTS.map(p => (
                <div
                  key={p.id}
                  className={`plot-item ${selected?.id === p.id ? 'active' : ''}`}
                  onClick={() => setSelected(p)}
                >
                  <div className={`plot-status ${p.risk.toLowerCase()}`} />
                  <div className="plot-info">
                    <span className="plot-name">{p.name}</span>
                    <span className="plot-meta">{p.area_ha.toLocaleString()} ha · {p.license}</span>
                  </div>
                  <span className={`plot-verdict ${p.compliant ? 'pass' : 'fail'}`}>
                    {p.compliant ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Detail */}
          {selected && (
            <div className="panel-section assessment">
              <h3 className="panel-title">EUDR Assessment</h3>

              <div className={`assessment-result ${selected.compliant ? 'pass' : 'fail'}`}>
                <span className="ar-icon">{selected.compliant ? '✓' : '✗'}</span>
                <span className="ar-text">{selected.compliant ? 'Deforestation-Free' : 'Non-Compliant'}</span>
              </div>

              <div className="metrics">
                <div className="metric-row">
                  <span>Forest (2020, Art.2§4)</span>
                  <span className="metric-val">{selected.forest_2020 ? 'Yes' : 'No'}</span>
                </div>
                <div className="metric-row">
                  <span>Canopy Cover 2020</span>
                  <span className="metric-val">{selected.cover_2020}%</span>
                </div>
                <div className="metric-row">
                  <span>Canopy Cover 2025</span>
                  <span className={`metric-val ${selected.cover_2025 < selected.cover_2020 * 0.8 ? 'red' : ''}`}>{selected.cover_2025}%</span>
                </div>
                <div className="metric-row">
                  <span>Agri. Conversion (Art.2§3)</span>
                  <span className={`metric-val ${selected.agricultural_conversion ? 'red' : 'green'}`}>
                    {selected.agricultural_conversion ? 'Detected' : 'None'}
                  </span>
                </div>
                {selected.loss_year && (
                  <div className="metric-row">
                    <span>Loss Year</span>
                    <span className="metric-val red">{selected.loss_year}</span>
                  </div>
                )}
              </div>

              <p className="verdict-text">{selected.verdict}</p>
            </div>
          )}

          {/* NDVI Chart */}
          <div className="panel-section chart-panel">
            <h3 className="panel-title">NDVI Trend (2018–2025)</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={NDVI_TIMESERIES} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} domain={[0.5, 0.85]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 6, fontSize: 11 }} />
                <ReferenceLine x={2020} stroke="#fbbf24" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="mean" stroke="#4ade80" fill="url(#g)" strokeWidth={2} dot={{ r: 3, fill: '#4ade80' }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span className="cl-item"><span className="cl-dot green" />NDVI Mean</span>
              <span className="cl-item"><span className="cl-line yellow" />2020 Cutoff</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Map */}
      <section className="map-section">
        <div className="map-header">
          <h2>Concession Boundaries — Hansen Forest Loss Overlay</h2>
          <span className="map-source">Base: Esri Satellite · Overlay: Hansen/UMD v1.11 (2000–2023)</span>
        </div>
        <div className="map-wrapper">
          <MapContainer
            center={[-0.5, 116.0]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <TileLayer
              url="https://storage.googleapis.com/earthenginepartners-hansen/tiles/gfc_v1.11/loss_year/{z}/{x}/{y}.png"
              opacity={0.55}
            />
            {PLOTS.map(plot => (
              <Polygon
                key={plot.id}
                positions={plot.boundary}
                pathOptions={{
                  color: plot.compliant ? '#4ade80' : '#ef4444',
                  weight: selected?.id === plot.id ? 3 : 1.5,
                  fillColor: plot.compliant ? '#4ade80' : '#ef4444',
                  fillOpacity: selected?.id === plot.id ? 0.15 : 0.05,
                }}
                eventHandlers={{ click: () => setSelected(plot) }}
              >
                <Popup>
                  <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                    <strong>{plot.name}</strong><br />
                    {plot.license} · {plot.area_ha.toLocaleString()} ha<br />
                    <span style={{ color: plot.compliant ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {plot.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </span>
                  </div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
        </div>
      </section>

      <footer className="footer">
        <span>EUDR Reg. 2023/1115 Art.2(3)(4) · FAO Forest Definition · Data: MODIS MOD13Q1, Sentinel-2 (EOX), Hansen/UMD/Google/USGS/NASA</span>
      </footer>
    </div>
  )
}

export default App
