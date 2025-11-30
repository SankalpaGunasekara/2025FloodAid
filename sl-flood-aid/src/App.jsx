import { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { supabase } from './supabaseClient'
import { CheckCircle, Globe, ShieldAlert, Navigation, Locate, X, Info, Activity, AlertTriangle, Plus, Users } from 'lucide-react'
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
    locDesc: "Tap 'GPS' or Tap on Map",
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
    locFound: "Location Found!",
    howToTitle: "How to Use",
    disclaimerTitle: "⚠️ Important Warning",
    disclaimerText: "This is a humanitarian tool for saving lives. Do NOT submit fake requests.",
    agree: "I Understand",
    stats: "Live Stats",
    completed: "Saved",
    active: "Active Needs",
    critical: "Critical",
    moderate: "Moderate",
    low: "Low",
    savedTitle: "Saved Lives",
    noSaved: "No saved requests yet.",
    savedBtn: "Saved",

    step1Title: "Tap \"Request Help\"",
    step1Desc: "Click the red button at the top right of the screen.",
    step2Title: "Pin Location (Important!)",
    step2Desc: "Click \"Use My GPS\" or drag the marker to the exact roof/house location.",
    step3Title: "Fill Details",
    step3Desc: "Enter a phone number and select Severity (Critical if life threatening).",
    step4Title: "Mark as Helped",
    step4Desc: "If you are a rescuer, click a pin, call the number, and once saved, click \"Mark as Helped\".",
    footerBuiltFor: "Built for Sri Lanka Flood Relief 2025.",
    footerMisuse: "Do not misuse.",
    footerCredit: "Created by Sankalpa Gunasekara with Love❤️"
  },

  si: {
    title: "ගංවතුර සහන සේවය",
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
    locDesc: "'GPS' ඔබන්න හෝ සලකුණු කරන්න.",
    submit: "ඉල්ලීම යොමු කරන්න",
    cancel: "අවලංගු කරන්න",
    markHelped: "උදව් ලැබුණි",
    verifyTitle: "තහවුරු කිරීම",
    verifyDesc: "'SAVED' ලෙස ටයිප් කරන්න:",
    confirm: "තහවුරු කරන්න",
    language: "English",
    statusUpdated: "තත්වය යාවත්කාලීන කරන ලදී!",
    requestAdded: "ඉල්ලීම ඇතුලත් කරන ලදී!",
    getGps: "මගේ ස්ථානය (GPS)",
    navGoogle: "Google Maps යන්න",
    locFound: "ස්ථානය හමු විය!",
    howToTitle: "භාවිතා කරන ආකාරය",
    disclaimerTitle: "⚠️ වැදගත් නිවේදනයයි",
    disclaimerText: "මෙය ජීවිත බේරා ගැනීම සඳහා වූ මෙවලමකි. කරුණාකර අසත්‍ය තොරතුරු ඇතුළත් නොකරන්න.",
    agree: "මම එකඟ වෙමි",
    stats: "සජීවී දත්ත",
    completed: "බේරාගන්නා ලද",
    active: "ක්‍රියාකාරී ඉල්ලීම්",
    critical: "අවදානම්",
    moderate: "බරපතල",
    low: "සාමාන්‍ය",
    savedTitle: "බේරාගත් ජීවිත",
    noSaved: "තවම දත්ත නොමැත.",
    savedBtn: "බේරාගත්",

    step1Title: "\"ආධාර ඉල්ලන්න\" බොත්තම ඔබන්න",
    step1Desc: "තිරයේ ඉහළ දකුණු කෙළවරේ ඇති රතු බොත්තම ක්ලික් කරන්න.",
    step2Title: "ස්ථානය සලකුණු කරන්න (වැදගත්!)",
    step2Desc: "\"Use My GPS\" ඔබන්න හෝ සලකුණ (marker) නිවැරදිම ස්ථානයට ඇද දමන්න.",
    step3Title: "තොරතුරු ඇතුලත් කරන්න",
    step3Desc: "දුරකථන අංකය ඇතුළත් කර අවදානම් මට්ටම තෝරන්න (ජීවිත තර්ජනයක් නම් \"Critical\" තෝරන්න).",
    step4Title: "බේරාගත් බව සලකුණු කරන්න",
    step4Desc: "ඔබ සහන සේවකයෙක් නම්, ස්ථානයක් මත ඔබා, අදාළ අංකය අමතන්න. බේරාගත් පසු \"Mark as Helped\" ක්ලික් කරන්න.",
    footerBuiltFor: "2025 ශ්‍රී ලංකා ගංවතුර සහන සේවාව සඳහා නිර්මාණය කරන ලද්දකි.",
    footerMisuse: "අවභාවිතා නොකරන්න.",
    footerCredit: "සංකල්ප ගුණසේකර විසින් ආදරයෙන් නිර්මාණය කරන ලදී ❤️"

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

  // Sync map view when position changes (e.g. from form GPS button)
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { animate: true });
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetchDistrict(e.latlng.lat, e.latlng.lng, setFormData);
    },
  });

  const handleGPS = () => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
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
  }), [setPosition, setFormData]);

  return (
    <>
      <div className="absolute top-3 right-3 z-[999]">
        {/* <button type="button" onClick={handleGPS} className="bg-blue-600 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold px-3 hover:bg-blue-700 active:scale-95 transition">
          <Locate size={16} /> {t.getGps}
        </button> */}
      </div>
      {position && (
        <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={icons.default}>
          <Popup>{t.locLabel}</Popup>
        </Marker>
      )}
    </>
  );
}

// --- COMPONENT: STATS WIDGET ---
function StatsWidget({ requests, t }) {
  const completed = requests.filter(r => r.status === 'completed').length;
  const active = requests.filter(r => r.status === 'active').length;
  const critical = requests.filter(r => r.status === 'active' && r.severity === 'critical').length;
  const moderate = requests.filter(r => r.status === 'active' && r.severity === 'moderate').length;
  const low = requests.filter(r => r.status === 'active' && r.severity === 'low').length;

  return (
    <div className="bg-slate-800 text-white py-2 px-4 flex items-center shadow-inner z-10 text-xs shrink-0 border-t border-slate-700 overflow-hidden relative">
      <div className="flex items-center gap-2 font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-4 z-20 bg-slate-800 pr-2">
        <Activity size={14} /> {t.stats}
      </div>
      <div className="flex gap-6 shrink-0 animate-marquee md:animate-none whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-300">{t.active}:</span>
          <span className="font-bold">{active}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-400">{t.critical}:</span>
          <span className="font-bold bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-800">{critical}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-orange-400">{t.moderate}:</span>
          <span className="font-bold bg-orange-900/50 text-orange-200 px-2 py-0.5 rounded border border-orange-800">{moderate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-blue-400">{t.low}:</span>
          <span className="font-bold bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-800">{low}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
          <span className="font-bold text-green-400">{t.completed}:</span>
          <span className="font-bold text-green-400">{completed}</span>
        </div>
        {/* Duplicate for seamless loop - HIDDEN ON DESKTOP */}
        <div className="flex items-center gap-2 pl-8 md:hidden">
          <span className="font-semibold text-gray-300">{t.active}:</span>
          <span className="font-bold">{active}</span>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-bold text-red-400">{t.critical}:</span>
          <span className="font-bold bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-800">{critical}</span>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-bold text-orange-400">{t.moderate}:</span>
          <span className="font-bold bg-orange-900/50 text-orange-200 px-2 py-0.5 rounded border border-orange-800">{moderate}</span>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-bold text-blue-400">{t.low}:</span>
          <span className="font-bold bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-800">{low}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-600 pl-4 md:hidden">
          <span className="font-bold text-green-400">{t.completed}:</span>
          <span className="font-bold text-green-400">{completed}</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [lang, setLang] = useState('si');
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
    // Fetch ALL requests (active and completed) to calculate stats
    const { data } = await supabase.from('aid_requests').select('*');
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

  const handleBrowserGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setNewLocation({ lat: latitude, lng: longitude });
        fetchDistrict(latitude, longitude, setFormData);
      }, (err) => {
        alert("Could not get location. Please enable GPS.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const SL_BOUNDS = [[3.2, 75.5], [15.5, 85.5]];

  return (
    <div className="h-screen h-[100dvh] w-full flex flex-col relative font-sans overflow-hidden bg-slate-50 text-slate-900 supports-[height:100dvh]:h-[100dvh]">

      {/* --- HEADER --- */}
      <div className="bg-slate-900 p-3 text-white z-20 flex justify-between items-center shadow-md h-16 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-bold text-sm flex items-center gap-2 text-red-500">
            <ShieldAlert size={20} /> {t.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(!showForm); if (!showForm) setNewLocation({ lat: 7.8731, lng: 80.7718 }); }}
            className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-700 text-sm transition active:scale-95 flex items-center gap-2">
            <Plus size={18} /> {t.requestBtn}
          </button>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <StatsWidget requests={requests} t={t} />

      {/* --- FLOATING CONTROLS --- */}
      <div className="absolute top-40 right-4 z-[900] flex flex-col gap-3 pr-[env(safe-area-inset-right)]">
        <button onClick={() => setShowHelp(true)} className="bg-white text-slate-800 w-12 h-12 flex items-center justify-center rounded-full shadow-xl hover:bg-gray-50 active:scale-95 transition border border-gray-200">
          <Info size={24} />
        </button>
        <button onClick={() => setShowSaved(true)} className="bg-green-500 text-slate-800 w-12 h-12 flex items-center justify-center rounded-full shadow-xl hover:bg-green-50 active:scale-95 transition border border-green-200">
          <Users size={24} />
        </button>
        <button onClick={() => setLang(lang === 'en' ? 'si' : 'en')} className="bg-white text-slate-800 w-12 h-12 flex items-center justify-center rounded-full shadow-xl hover:bg-gray-50 active:scale-95 transition font-bold border border-gray-200 text-lg">
          {lang === 'en' ? 'සිං' : 'En'}
        </button>
      </div>

      {/* --- MAP --- */}
      <div className="flex-1 z-0 relative">
        <MapContainer center={[7.8731, 80.7718]} zoom={8} className="h-full w-full" maxBounds={SL_BOUNDS} minZoom={7}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Only show ACTIVE requests on map, but keep completed in stats */}
          {requests.filter(r => r.status === 'active').map((req) => (
            <Marker key={req.id} position={[req.latitude, req.longitude]} icon={icons[req.severity] || icons.moderate}>
              <Popup>
                <div className="p-1 min-w-[240px]">
                  <div className={`text-xs font-bold uppercase mb-2 px-2 py-1 rounded w-fit text-white ${req.severity === 'critical' ? 'bg-red-600' : req.severity === 'low' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                    {req.severity === 'critical' ? t.sevCritical : req.severity === 'low' ? t.sevLow : t.sevModerate}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{req.needs}</h3>
                  <p className="text-sm font-semibold text-gray-700">{req.name}</p>
                  <p className="text-gray-600 text-xs mb-3">{req.district} - {req.town}</p>

                  <div className="flex gap-2 mb-3">
                    <a href={`tel:${req.contact_number}`} className="flex-1 bg-green-100 text-green-800 py-2 rounded-lg text-center text-sm font-bold no-underline border border-green-200 hover:bg-green-200 transition">
                      📞 Call
                    </a>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`} target="_blank" rel="noreferrer"
                      className="flex-1 bg-blue-100 text-blue-800 py-2 rounded-lg text-center text-sm font-bold no-underline border border-blue-200 flex justify-center items-center gap-1 hover:bg-blue-200 transition">
                      <Navigation size={14} /> Map
                    </a>
                  </div>
                  <button onClick={() => setVerifyId(req.id)} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold hover:bg-black flex justify-center items-center gap-2 transition">
                    <CheckCircle size={16} /> {t.markHelped}
                  </button>
                  <div className="text-[10px] text-gray-400 mt-2 text-right">{new Date(req.created_at).toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {showForm && <LocationPicker position={newLocation} setPosition={setNewLocation} setFormData={setFormData} t={t} />}
        </MapContainer>
      </div>

      {/* --- WARNING MODAL --- */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm touch-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
            <AlertTriangle size={56} className="text-red-600 mx-auto mb-4" />
            <h3 className="font-bold text-2xl mb-3 text-gray-900">{t.disclaimerTitle}</h3>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              {t.disclaimerText}
            </p>
            <button onClick={() => setShowDisclaimer(false)} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 active:scale-95 transition">
              {t.agree}
            </button>
          </div>
        </div>
      )}

      {/* --- HOW TO USE PAGE --- */}
      {showHelp && (
        <div className="fixed inset-0 bg-white z-[9998] flex flex-col animate-in slide-in-from-right duration-300 h-[100dvh]">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-md shrink-0">
            <h2 className="font-bold text-xl flex items-center gap-2"><Info /> {t.howToTitle}</h2>
            <button onClick={() => setShowHelp(false)} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition"><X size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto space-y-8 pb-20">

            <div className="flex gap-4 items-start">
              <div className="bg-red-100 text-red-600 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg">1</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{t.step1Title}</h4>
                <p className="text-gray-600">{t.step1Desc}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-red-100 text-red-600 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg">2</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{t.step2Title}</h4>
                <p className="text-gray-600">{t.step2Desc}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-red-100 text-red-600 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg">3</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{t.step3Title}</h4>
                <p className="text-gray-600">{t.step3Desc}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-green-100 text-green-600 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg">4</div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{t.step4Title}</h4>
                <p className="text-gray-600">{t.step4Desc}</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-xl text-center text-sm text-gray-500 border border-slate-200">
              {t.footerBuiltFor} <br />
              {t.footerMisuse} <br />
              <a href="#" className="hover:underline">{t.footerCredit}</a>
            </div>
          </div>
        </div>
      )}

      {/* --- SAVED REQUESTS MODAL --- */}
      {showSaved && (
        <div className="fixed inset-0 bg-white z-[9998] flex flex-col animate-in slide-in-from-right duration-300 h-[100dvh]">
          <div className="bg-green-700 p-4 text-white flex justify-between items-center shadow-md shrink-0">
            <h2 className="font-bold text-xl flex items-center gap-2"><Users /> {t.savedTitle}</h2>
            <button onClick={() => setShowSaved(false)} className="bg-green-800 p-2 rounded-full hover:bg-green-600 transition"><X size={24} /></button>
          </div>
          <div className="p-4 overflow-y-auto pb-20 bg-slate-50 flex-1">
            {requests.filter(r => r.status === 'completed').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <CheckCircle size={48} className="mb-4 opacity-20" />
                <p>{t.noSaved}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.filter(r => r.status === 'completed').map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{req.name}</h3>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> {t.completed}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{req.needs}</p>
                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                      <span>{req.district} - {req.town}</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- VERIFICATION MODAL --- */}
      {verifyId && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="font-bold text-xl mb-3 text-gray-900">{t.verifyTitle}</h3>
            <p className="text-base text-gray-600 mb-6">{t.verifyDesc}</p>
            <input type="text" placeholder="SAVED" className="w-full border-2 border-gray-300 p-4 rounded-xl mb-6 uppercase text-center tracking-[0.5em] font-bold text-2xl focus:border-red-500 outline-none focus:ring-4 ring-red-100 transition"
              value={verifyText} onChange={(e) => setVerifyText(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setVerifyId(null)} className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
              <button onClick={handleVerifySubmit} className="flex-1 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition">{t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- REQUEST FORM MODAL (MOBILE OPTIMIZED) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-300 h-[100dvh]">
          {/* Header for Mobile */}
          <div className="md:hidden bg-slate-50 p-4 flex justify-between items-center border-b shrink-0 shadow-sm">
            <h2 className="font-bold text-lg text-gray-800">{t.formTitle}</h2>
            <button onClick={() => setShowForm(false)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"><X size={20} /></button>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/3 flex-1 md:h-full overflow-y-auto bg-white md:border-r shadow-2xl flex flex-col order-2 md:order-1 pb-[env(safe-area-inset-bottom)]">
            <div className="p-6 space-y-5 flex-1">
              <h2 className="hidden md:block text-2xl font-bold mb-6 text-gray-800">{t.formTitle}</h2>
              <form id="aid-form" onSubmit={handleSubmit} className="space-y-5">

                <button type="button" onClick={handleBrowserGPS} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition mb-4">
                  <Locate size={20} /> {t.getGps}
                </button>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <label className="block text-xs font-bold text-red-800 uppercase mb-2">{t.severity}</label>
                  <select className="w-full p-3 border-red-200 border rounded-lg bg-white font-bold text-gray-800 shadow-sm focus:ring-2 ring-red-200 outline-none h-12"
                    value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                    <option value="critical">🔴 {t.sevCritical}</option>
                    <option value="moderate">🟠 {t.sevModerate}</option>
                    <option value="low">🔵 {t.sevLow}</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.name}</label>
                    <input required type="text" maxLength={50} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 ring-blue-100 outline-none transition"
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phone}</label>
                    <input required type="tel" maxLength={10} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 ring-blue-100 outline-none transition"
                      value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.district}</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-blue-500 outline-none h-[50px]"
                      value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.town}</label>
                    <input maxLength={50} required type="text" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 outline-none h-[50px]"
                      value={formData.town} onChange={e => setFormData({ ...formData, town: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.needs}</label>
                  <textarea maxLength={270} required rows="3" placeholder={t.needsPlaceholder} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 ring-blue-100 outline-none transition text-lg"
                    value={formData.needs} onChange={e => setFormData({ ...formData, needs: e.target.value })}></textarea>
                </div>

                {/* <div className="md:hidden text-sm text-center text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100 font-medium">
                  ⬇️ {t.locDesc}
                </div> */}
              </form>
            </div>
            <div className="p-4 border-t bg-white flex gap-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
              <button form="aid-form" type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition text-lg">{t.submit}</button>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full md:w-2/3 h-[35vh] md:h-full relative border-b md:border-b-0 md:border-l border-gray-200 order-1 md:order-2 shrink-0">
            <MapContainer center={[7.8731, 80.7718]} zoom={9} className="h-full w-full" maxBounds={SL_BOUNDS} minZoom={7} >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={newLocation} setPosition={setNewLocation} setFormData={setFormData} t={t} />
            </MapContainer>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-[1000] text-sm font-bold text-gray-700 md:hidden pointer-events-none">
              📍 {t.locDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default App