import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { supabase } from './supabaseClient'
import { CheckCircle, Globe, ShieldAlert, Navigation, Locate, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

// --- ICONS ---
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  critical: createIcon('red'),
  moderate: createIcon('orange'),
  low: createIcon('blue'),
  default: createIcon('blue')
};

const DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"
];

const TRANSLATIONS = {
  en: {
    title: "SL Flood Relief",
    requestBtn: "Request Help",
    formTitle: "Request Help",
    name: "Your Name",
    phone: "Mobile Number",
    district: "District",
    town: "Town / Village",
    needs: "What is needed?",
    needsPlaceholder: "Ex: Food, Boat, Medicine...",
    severity: "Severity",
    sevCritical: "Critical (Life Threatening)",
    sevModerate: "Moderate (Trapped/Need Food)",
    sevLow: "Low (Property Damage)",
    locLabel: "Set Location",
    locDesc: "Tap 'GPS' or Drag marker",
    submit: "Submit Request",
    cancel: "Cancel",
    markHelped: "Mark as Helped",
    verifyTitle: "Verification",
    verifyDesc: "Type 'SAVED' to complete:",
    confirm: "Confirm",
    language: "සිංහල",
    statusUpdated: "Status Updated!",
    requestAdded: "Request Added!",
    getGps: "Use My GPS",
    navGoogle: "Open in Maps",
    locFound: "Location Found!"
  },
  si: {
    title: "ගංවතුර සහන",
    requestBtn: "ආධාර ඉල්ලන්න",
    formTitle: "ආධාර ඉල්ලුම් පත්‍රය",
    name: "ඔබගේ නම",
    phone: "දුරකථන අංකය",
    district: "දිස්ත්‍රික්කය",
    town: "නගරය / ගම්මානය",
    needs: "අවශ්‍ය දේ",
    needsPlaceholder: "උදා: ආහාර, බෝට්ටු, බෙහෙත්...",
    severity: "තත්වයේ බරපතලකම",
    sevCritical: "අතිශය බරපතල (ජීවිත අවදානම්)",
    sevModerate: "බරපතල (ආහාර/ජලය අවශ්‍ය)",
    sevLow: "සාමාන්‍ය (දේපල හානි)",
    locLabel: "ස්ථානය",
    locDesc: "'GPS' ඔබන්න හෝ සලකුණ අදින්න",
    submit: "ඉල්ලීම යොමු කරන්න",
    cancel: "එපා",
    markHelped: "උදව් ලැබුණි",
    verifyTitle: "තහවුරු කිරීම",
    verifyDesc: "'SAVED' ලෙස ටයිප් කරන්න:",
    confirm: "තහවුරු කරන්න",
    language: "English",
    statusUpdated: "තත්වය යාවත්කාලීන කරන ලදී!",
    requestAdded: "ඉල්ලීම ඇතුලත් කරන ලදී!",
    getGps: "මගේ ස්ථානය (GPS)",
    navGoogle: "Google Maps යන්න",
    locFound: "ස්ථානය හමු විය!"
  }
};

// --- HELPER: AUTO DETECT DISTRICT ---
const fetchDistrict = async (lat, lng, setFormData) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    if (data && data.address) {
      const detectedName = data.address.state || data.address.district || data.address.city;
      const match = DISTRICTS.find(d => detectedName?.includes(d));
      if (match) setFormData(prev => ({ ...prev, district: match }));
    }
  } catch (e) { /* ignore */ }
};

// --- COMPONENT: MAP PICKER ---
function LocationPicker({ position, setPosition, setFormData, t }) {
  const map = useMap();
  const markerRef = useRef(null);

  const handleGPS = () => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 14);
      fetchDistrict(e.latlng.lat, e.latlng.lng, setFormData);
    });
  };

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        fetchDistrict(newPos.lat, newPos.lng, setFormData);
      }
    },
  }), [setPosition]);

  return (
    <>
      <div className="absolute top-3 right-3 z-[999]">
        <button type="button" onClick={handleGPS} className="bg-blue-600 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold px-3 hover:bg-blue-700 active:scale-95 transition">
          <Locate size={16} /> {t.getGps}
        </button>
      </div>
      {position && (
        <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={icons.default}>
          <Popup>{t.locLabel}</Popup>
        </Marker>
      )}
    </>
  );
}

function App() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];
  const [verifyId, setVerifyId] = useState(null);
  const [verifyText, setVerifyText] = useState("");
  const [formData, setFormData] = useState({
    name: '', contact_number: '', needs: '', district: 'Colombo', town: '', severity: 'moderate'
  });
  const [newLocation, setNewLocation] = useState(null);

  useEffect(() => {
    fetchRequests();
    const channel = supabase.channel('realtime requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aid_requests' }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchRequests() {
    const { data } = await supabase.from('aid_requests').select('*').eq('status', 'active');
    if (data) setRequests(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLocation) { alert("Please select location on map"); return; }
    const { error } = await supabase.from('aid_requests').insert([{ ...formData, latitude: newLocation.lat, longitude: newLocation.lng }]);
    if (error) { alert("Error: " + error.message); }
    else { alert(t.requestAdded); setShowForm(false); setFormData({ name: '', contact_number: '', needs: '', district: 'Colombo', town: '', severity: 'moderate' }); setNewLocation(null); }
  };

  const handleVerifySubmit = async () => {
    if (verifyText.toUpperCase() === 'SAVED') {
      const { error } = await supabase.from('aid_requests').update({ status: 'completed' }).eq('id', verifyId);
      if (!error) { alert(t.statusUpdated); setVerifyId(null); setVerifyText(""); }
    } else { alert("Incorrect code"); }
  };

  const SL_BOUNDS = [[5.8, 79.5], [9.9, 82.0]];

  return (
    <div className="h-screen w-screen flex flex-col relative font-sans overflow-hidden bg-slate-50">

      {/* --- HEADER --- */}
      <div className="bg-slate-900 p-3 text-white z-20 flex justify-between items-center shadow-md h-16 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-bold text-lg flex items-center gap-2 text-red-500">
            <ShieldAlert size={20} /> {t.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'si' : 'en')} className="bg-slate-700 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-600">
            <Globe size={18} />
          </button>
          <button onClick={() => { setShowForm(!showForm); if (!showForm) setNewLocation({ lat: 7.8731, lng: 80.7718 }); }}
            className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-red-700 text-sm transition active:scale-95">
            {t.requestBtn}
          </button>
        </div>
      </div>

      {/* --- MAP --- */}
      <div className="flex-1 z-0 relative">
        <MapContainer center={[7.8731, 80.7718]} zoom={8} className="h-full w-full" maxBounds={SL_BOUNDS} minZoom={7}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {requests.map((req) => (
            <Marker key={req.id} position={[req.latitude, req.longitude]} icon={icons[req.severity] || icons.moderate}>
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className={`text-[10px] font-bold uppercase mb-1 px-2 py-0.5 rounded w-fit text-white ${req.severity === 'critical' ? 'bg-red-600' : req.severity === 'low' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {req.severity}
                  </div>
                  <h3 className="font-bold text-base text-gray-800 leading-tight">{req.needs}</h3>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{req.name}</p>
                  <p className="text-gray-600 text-xs mb-2">{req.district} - {req.town}</p>

                  <div className="flex gap-2 mb-2">
                    <a href={`tel:${req.contact_number}`} className="flex-1 bg-green-100 text-green-800 py-1.5 rounded text-center text-xs font-bold no-underline border border-green-200">
                      📞 Call
                    </a>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`} target="_blank" rel="noreferrer"
                      className="flex-1 bg-blue-100 text-blue-800 py-1.5 rounded text-center text-xs font-bold no-underline border border-blue-200 flex justify-center items-center gap-1">
                      <Navigation size={12} /> Map
                    </a>
                  </div>
                  <button onClick={() => setVerifyId(req.id)} className="w-full bg-slate-800 text-white py-1.5 rounded text-xs hover:bg-black flex justify-center items-center gap-2">
                    <CheckCircle size={14} /> {t.markHelped}
                  </button>
                  <div className="text-[10px] text-gray-400 mt-1 text-right">{new Date(req.created_at).toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* --- VERIFICATION MODAL --- */}
      {verifyId && (
        <div className="absolute inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-xl w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-2">{t.verifyTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.verifyDesc}</p>
            <input type="text" placeholder="SAVED" className="w-full border-2 border-gray-300 p-3 rounded-lg mb-4 uppercase text-center tracking-[0.5em] font-bold text-xl focus:border-red-500 outline-none"
              value={verifyText} onChange={(e) => setVerifyText(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setVerifyId(null)} className="flex-1 py-3 text-gray-500 font-bold">{t.cancel}</button>
              <button onClick={handleVerifySubmit} className="flex-1 bg-red-600 text-white rounded-lg font-bold shadow-lg">{t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- REQUEST FORM MODAL (MOBILE OPTIMIZED) --- */}
      {showForm && (
        <div className="absolute inset-0 bg-white z-[9999] flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header for Mobile */}
          <div className="md:hidden bg-slate-100 p-3 flex justify-between items-center border-b shrink-0">
            <h2 className="font-bold text-gray-800">{t.formTitle}</h2>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 p-1 rounded-full"><X size={20} /></button>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/3 h-[60%] md:h-full overflow-y-auto bg-gray-50 md:border-r shadow-2xl flex flex-col">
            <div className="p-5 space-y-4 flex-1">
              <h2 className="hidden md:block text-2xl font-bold mb-4 text-gray-800">{t.formTitle}</h2>
              <form id="aid-form" onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.severity}</label>
                  <select className="w-full p-3 border rounded-lg bg-white font-medium shadow-sm focus:ring-2 ring-red-200 outline-none"
                    value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                    <option value="critical">🔴 {t.sevCritical}</option>
                    <option value="moderate">🟠 {t.sevModerate}</option>
                    <option value="low">🔵 {t.sevLow}</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><input required type="text" placeholder={t.name} className="w-full p-3 border rounded-lg shadow-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                  <div><input required type="tel" placeholder={t.phone} className="w-full p-3 border rounded-lg shadow-sm" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="w-full p-3 border rounded-lg bg-white shadow-sm" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input required type="text" placeholder={t.town} className="w-full p-3 border rounded-lg shadow-sm" value={formData.town} onChange={e => setFormData({ ...formData, town: e.target.value })} />
                </div>
                <textarea required rows="3" placeholder={t.needsPlaceholder} className="w-full p-3 border rounded-lg shadow-sm" value={formData.needs} onChange={e => setFormData({ ...formData, needs: e.target.value })}></textarea>

                <div className="md:hidden text-xs text-center text-blue-600 bg-blue-50 p-2 rounded">
                  ⬇️ {t.locDesc}
                </div>
              </form>
            </div>
            {/* Sticky Footer for Buttons */}
            <div className="p-4 border-t bg-white flex gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">{t.cancel}</button>
              <button form="aid-form" type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-red-700 active:scale-95 transition">{t.submit}</button>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full md:w-2/3 h-[40%] md:h-full relative border-t md:border-t-0">
            <MapContainer center={[7.8731, 80.7718]} zoom={9} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={newLocation} setPosition={setNewLocation} setFormData={setFormData} t={t} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  )
}
export default App