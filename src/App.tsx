import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X, Heart, MessageSquare, ChevronLeft, Loader, AlertCircle, MapPin, RefreshCw } from "lucide-react";

const API = "https://roomy-listings-136208599777.asia-south1.run.app";

// Real image URLs from your dataset
const IMGS = [
  "https://www.bhg.com/thmb/W76y53a3FyL4m_rJ1djtG_71KMo=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/renovated-neutral-colored-living-room-2f194807-3856ba1a2ea04e269ea42e93021fda64.jpg",
  "https://www.bhg.com/thmb/QArHugkkoJfA1V1vpHZxBBKL1yw=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/armchair-fireplace-c426f88f-7ea8acfac7de43e2acb1f40e98040fd3.jpg",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
];

interface Listing {
  post_id: string;
  timestamp?: string;
  city?: string;
  locality?: string;
  price?: number;
  bhk_type?: string;
  accommodation_type?: string;
  furnishing?: string;
  owner_preference?: string;
  contact_details?: string | null;
  map_link?: string | null;
  fb_post_url?: string | null;
  additional_description?: string;
  image_urls?: string;
}

// Preview data using your real rows — shown while live data loads or if fetch fails
const PREVIEW = [
  { post_id:"FB_KOL_001", timestamp:"2026-02-04T01:48:00Z", city:"Kolkata", locality:"Kasba", price:16861, bhk_type:"Studio", accommodation_type:"Private Room", furnishing:"Semi-Furnished", owner_preference:"No Restrictions", contact_details:"Rahul: +91 7006206502", map_link:"https://www.google.com/maps/search/?api=1&query=22.578093667787986,88.38753061978939", fb_post_url:"https://www.facebook.com/share/v/17iWH8FsvA/", additional_description:"Near Metro station. Gas connection ready. Please DM for more details." },
  { post_id:"FB_BAN_002", timestamp:"2026-02-11T05:48:00Z", city:"Bangalore", locality:"Electronic City", price:12464, bhk_type:"3BHK", accommodation_type:"Private Room", furnishing:"Fully Furnished", owner_preference:"Bachelors Only", contact_details:"Amit: +91 9548491111", map_link:null, fb_post_url:"https://www.facebook.com/share/p/1Ki1bpz8Dw/", additional_description:"Gated society with security. Gas connection ready. Please DM for more details." },
  { post_id:"FB_CHE_003", timestamp:"2026-02-04T08:48:00Z", city:"Chennai", locality:"OMR", price:23475, bhk_type:"1RK", accommodation_type:"Private Room", furnishing:"Fully Furnished", owner_preference:"Family Only", contact_details:"Sneha: +91 9048031753", map_link:"https://www.google.com/maps/search/?api=1&query=13.099703921647372,80.24684580203171", fb_post_url:"https://www.facebook.com/share/p/1Do9ga43AL/", additional_description:"Walking distance to IT park. No brokerage involved. Please DM for more details." },
  { post_id:"FB_PUN_004", timestamp:"2026-01-25T01:48:00Z", city:"Pune", locality:"Kharadi", price:22411, bhk_type:"2BHK", accommodation_type:"Private Room", furnishing:"Fully Furnished", owner_preference:"Working Professionals", contact_details:null, map_link:"https://www.google.com/maps/search/?api=1&query=18.49369090390949,73.86451234345141", fb_post_url:"https://www.facebook.com/share/p/17wq3pJhiT/", additional_description:"Near Metro station. WiFi and Maid available. Please DM for more details." },
  { post_id:"FB_DEL_005", timestamp:"2026-02-04T16:48:00Z", city:"Delhi", locality:"Hauz Khas", price:30027, bhk_type:"2BHK", accommodation_type:"Private Room", furnishing:"Semi-Furnished", owner_preference:"No Restrictions", contact_details:"+91 7577434615", map_link:null, fb_post_url:"https://www.facebook.com/share/p/1DMEXJrzV7/", additional_description:"Gated society with security. Gas connection ready. Please DM for more details." },
  { post_id:"FB_KOL_006", timestamp:"2026-02-03T18:48:00Z", city:"Kolkata", locality:"Lake Town", price:5330, bhk_type:"1RK", accommodation_type:"Private Room", furnishing:"Semi-Furnished", owner_preference:"Working Professionals", contact_details:"+91 9694898061", map_link:null, fb_post_url:"https://www.facebook.com/share/v/17iWH8FsvA/", additional_description:"Gated society with security. Lift and Parking available. Please DM for more details." },
  { post_id:"FB_BAN_007", timestamp:"2026-02-14T02:48:00Z", city:"Bangalore", locality:"JP Nagar", price:53326, bhk_type:"1RK", accommodation_type:"Shared Room", furnishing:"Semi-Furnished", owner_preference:"Family Only", contact_details:null, map_link:"https://www.google.com/maps/search/?api=1&query=12.942010925538371,77.60333927998674", fb_post_url:"https://www.facebook.com/share/p/1Ki1bpz8Dw/", additional_description:"Gated society with security. WiFi and Maid available. Please DM for more details." },
  { post_id:"FB_CHE_008", timestamp:"2026-01-18T15:48:00Z", city:"Chennai", locality:"Velachery", price:27204, bhk_type:"3BHK", accommodation_type:"Shared Room", furnishing:"Fully Furnished", owner_preference:"Family Only", contact_details:null, map_link:"https://www.google.com/maps/search/?api=1&query=13.053396653419288,80.24785025064615", fb_post_url:"https://www.facebook.com/share/p/1Do9ga43AL/", additional_description:"Gated society with security. WiFi and Maid available. Please DM for more details." },
  { post_id:"FB_PUN_009", timestamp:"2026-01-28T16:48:00Z", city:"Pune", locality:"Wakad", price:13683, bhk_type:"1BHK", accommodation_type:"Entire Flat", furnishing:"Fully Furnished", owner_preference:"Bachelors Only", contact_details:"+91 7558036968", map_link:null, fb_post_url:"https://www.facebook.com/share/p/1AuUVaK5Yz/", additional_description:"Near Metro station. WiFi and Maid available. Please DM for more details." },
  { post_id:"FB_DEL_010", timestamp:"2026-02-12T22:48:00Z", city:"Delhi", locality:"Greater Kailash", price:45999, bhk_type:"Shared Room", accommodation_type:"Shared Room", furnishing:"Semi-Furnished", owner_preference:"Bachelors Only", contact_details:"Pooja: +91 9426614901", map_link:null, fb_post_url:"https://www.facebook.com/share/p/184YZajveT/", additional_description:"Near Metro station. Lift and Parking available. Please DM for more details." },
  { post_id:"FB_KOL_011", timestamp:"2026-02-08T09:48:00Z", city:"Kolkata", locality:"Lake Town", price:23396, bhk_type:"Studio", accommodation_type:"Entire Flat", furnishing:"Fully Furnished", owner_preference:"Females Only", contact_details:null, map_link:"https://www.google.com/maps/search/?api=1&query=22.59319246533573,88.38678161394063", fb_post_url:"https://www.facebook.com/share/p/1CaqKDXD9F/", additional_description:"Walking distance to IT park. No brokerage involved. Please DM for more details." },
];

const getRelativeTime = (ts: string | null | undefined): string => {
  if (!ts) return "Recently";
  const d = new Date(ts), diff = Date.now() - d.getTime();
  if (isNaN(d.getTime())) return "Recently";
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), dy = Math.floor(diff/86400000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`; return `${dy}d ago`;
};

const getImg = (item: any) => {
  // Use first image from image_urls field if available
  if (item.image_urls) {
    const first = item.image_urls.split(",")[0].trim();
    if (first.startsWith("http")) return first;
  }
  let h = 0; const s = item.post_id || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return IMGS[h % IMGS.length];
};

const PRICE_OPTIONS = [
  { label: "Upto ₹2,500",       min: 0,     max: 2500  },
  { label: "₹2,500 – ₹5,000",   min: 2500,  max: 5000  },
  { label: "₹5,000 – ₹10,000",  min: 5000,  max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { label: "₹20,000 Plus",       min: 20000, max: null  },
];

interface NLPResult {
  cityQuery?: string;
  bhk?: string;
  furnishing?: string;
  preference?: string;
  minPrice?: number;
  maxPrice?: number;
}

const parseNLP = (q: string): NLPResult => {
  if (!q) return {};
  const s = q.toLowerCase();
  const r: NLPResult = {};

  const cityMatch = s.match(/\bin\s+([a-z\s]+?)(?:\s+under|\s+below|\s+above|\s+upto|\s+fully|\s+semi|\s+un|,|$)/);
  if (cityMatch) r.cityQuery = cityMatch[1].trim();

  ['studio','1rk','1bhk','2bhk','3bhk','4bhk','shared room'].forEach(t => {
    if (s.includes(t)) r.bhk = t === 'shared room' ? 'Shared Room' : t.toUpperCase();
  });

  if (s.includes('fully furnished')) r.furnishing = 'Fully Furnished';
  else if (s.includes('semi furnished') || s.includes('semi-furnished')) r.furnishing = 'Semi-Furnished';
  else if (s.includes('unfurnished')) r.furnishing = 'Unfurnished';

  if (s.includes('female') || s.includes('women') || s.includes('ladies')) r.preference = 'Females Only';
  if (s.includes('bachelor')) r.preference = 'Bachelors Only';
  if (s.includes('family')) r.preference = 'Family Only';
  if (s.includes('working professional')) r.preference = 'Working Professionals';
  if (s.includes('vegetarian')) r.preference = 'Vegetarians Only';
  if (s.includes('no restriction')) r.preference = 'No Restrictions';

  const underMatch = s.match(/(?:under|below|upto|up to|within)\s*₹?\s*(\d+)\s*k?/);
  if (underMatch) {
    const val = parseInt(underMatch[1]) * (s[underMatch.index! + underMatch[0].length - 1] === 'k' || parseInt(underMatch[1]) < 500 ? 1000 : 1);
    r.maxPrice = val;
  }
  const aboveMatch = s.match(/(?:above|over|more than|minimum)\s*₹?\s*(\d+)\s*k?/);
  if (aboveMatch) {
    const val = parseInt(aboveMatch[1]) * (parseInt(aboveMatch[1]) < 500 ? 1000 : 1);
    r.minPrice = val;
  }

  if (s.includes('budget') && !r.maxPrice) r.maxPrice = 10000;
  if (s.includes('affordable') && !r.maxPrice) r.maxPrice = 15000;
  if (s.includes('luxury') || s.includes('premium')) r.minPrice = r.minPrice || 20000;

  return r;
};

const FilterPill = ({ label, options, value, onChange }) => (
  <select value={value||""} onChange={e=>onChange(e.target.value)}
    style={{appearance:'none',background:'#1a1a1a',border:`1px solid ${value?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:'9999px',padding:'6px 16px',fontSize:'10px',fontWeight:700,color:value?'#a5b4fc':'#71717a',cursor:'pointer',minWidth:'90px'}}>
    <option value="">{label}</option>
    {options.map(o=><option key={o} value={o} style={{background:'#121212'}}>{o}</option>)}
  </select>
);

const Card = ({ item, onClick, liked, onLike }) => (
  <div onClick={()=>onClick(item)}
    style={{background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'16px',overflow:'hidden',cursor:'pointer',transition:'all 0.2s',display:'flex',flexDirection:'column'}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,0.4)';e.currentTarget.style.transform='translateY(-2px)';}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';e.currentTarget.style.transform='translateY(0)';}}>
    <div style={{position:'relative',height:'175px',overflow:'hidden',flexShrink:0}}>
      <img src={getImg(item)} alt="room" style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy"
        onError={e=>{e.target.src=IMGS[2];}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%)'}}/>
      <div style={{position:'absolute',bottom:'10px',left:'10px',right:'10px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'6px'}}>
        {item.bhk_type && <span style={{background:'rgba(99,102,241,0.9)',backdropFilter:'blur(6px)',padding:'3px 10px',borderRadius:'9999px',fontSize:'9px',fontWeight:900,color:'white',textTransform:'uppercase'}}>{item.bhk_type}</span>}
        <span style={{marginLeft:'auto',background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',padding:'2px 7px',borderRadius:'9999px',fontSize:'9px',color:'#a1a1aa'}}>{getRelativeTime(item.timestamp)}</span>
      </div>
      <button onClick={e=>{e.stopPropagation();onLike(item.post_id);}}
        style={{position:'absolute',top:'10px',right:'10px',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',border:'none',borderRadius:'9999px',width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <Heart size={13} fill={liked?'#e11d48':'none'} color={liked?'#e11d48':'#71717a'}/>
      </button>
    </div>
    <div style={{padding:'13px 14px',display:'flex',flexDirection:'column',gap:'7px',flex:1}}>
      <div>
        <p style={{fontSize:'17px',fontWeight:900,color:'white',margin:0,lineHeight:1}}>
          ₹{(item.price||0).toLocaleString()}<span style={{fontSize:'10px',color:'#52525b',fontWeight:600}}>/mo</span>
        </p>
        <p style={{fontSize:'11px',color:'#71717a',margin:'3px 0 0',fontWeight:600,display:'flex',alignItems:'center',gap:'3px'}}>
          <MapPin size={9}/>{[item.locality,item.city].filter(Boolean).join(', ')||'Location N/A'}
        </p>
      </div>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
        {[item.furnishing,item.accommodation_type].filter(Boolean).map(t=>(
          <span key={t} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',padding:'2px 7px',borderRadius:'9999px',fontSize:'9px',color:'#71717a',fontWeight:700}}>{t}</span>
        ))}
      </div>
      {item.additional_description && (
        <p style={{fontSize:'10px',color:'#52525b',margin:0,fontStyle:'italic',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',lineHeight:1.5}}>"{item.additional_description}"</p>
      )}
      <button style={{width:'100%',padding:'9px',background:'#e11d48',color:'white',border:'none',borderRadius:'9px',fontSize:'10px',fontWeight:900,letterSpacing:'0.08em',textTransform:'uppercase',cursor:'pointer',marginTop:'auto'}}>
        View Room
      </button>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState('home');
  const [allData, setAllData] = useState<Listing[]>(PREVIEW);
  const [loadState, setLoadState] = useState('preview'); // preview | loading | done | error
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [results, setResults] = useState<Listing[]>(PREVIEW);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [filters, setFilters] = useState<{
  city: string;
  bhk: string;
  furnishing: string;
  preference: string;
  priceRange: string;
  minPrice: number | string;
  maxPrice: number | string;
}>({city:'',bhk:'',furnishing:'',preference:'',priceRange:'',minPrice:'',maxPrice:''});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [navVisible, setNavVisible] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE = 24;
  const lastY = useRef(0);

  const loadLive = useCallback(() => {
    setLoadState('loading');
    fetch(API)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error("Empty response");
        setAllData(data); setResults(data); setLoadState('done');
      })
      .catch(e => {
        // Fallback: keep preview data, show soft error
        setLoadState('error');
      });
  }, []);

  // Try live fetch on mount
  useEffect(() => { loadLive(); }, []);

  useEffect(() => {
    const fn = () => { const y = window.scrollY; setNavVisible(y<=10||y<lastY.current); lastY.current=y; };
    window.addEventListener('scroll', fn, {passive:true});
    return ()=>window.removeEventListener('scroll',fn);
  }, []);

  const opts = useMemo(()=>({
    cities: [...new Set(allData.map(d=>d.city).filter(Boolean))].sort(),
    types: [...new Set(allData.map(d=>d.bhk_type).filter(Boolean))].sort(),
    furnishings: [...new Set(allData.map(d=>d.furnishing).filter(Boolean))].sort(),
    preferences: [...new Set(allData.map(d=>d.owner_preference).filter(Boolean))].sort(),
  }),[allData]);

  const doSearch = useCallback((q=searchQuery, f=filters) => {
    setView('search'); setPage(1);
    const nlp = parseNLP(q);
    // NLP overrides dropdowns only when dropdown isn't already set
    const merged = {
      ...f,
      ...(nlp.bhk && !f.bhk ? {bhk:nlp.bhk} : {}),
      ...(nlp.furnishing && !f.furnishing ? {furnishing:nlp.furnishing} : {}),
      ...(nlp.preference && !f.preference ? {preference:nlp.preference} : {}),
      ...(nlp.minPrice && !f.minPrice ? {minPrice:nlp.minPrice} : {}),
      ...(nlp.maxPrice && !f.maxPrice ? {maxPrice:nlp.maxPrice} : {}),
    };
    let out = allData.filter(i => {
      if (merged.city && i.city?.toLowerCase() !== merged.city.toLowerCase()) return false;
      if (nlp.cityQuery && !merged.city && !i.city?.toLowerCase().includes(nlp.cityQuery) && !i.locality?.toLowerCase().includes(nlp.cityQuery)) return false;
      if (merged.bhk && i.bhk_type?.toUpperCase() !== merged.bhk.toUpperCase()) return false;
      if (merged.furnishing && i.furnishing?.toLowerCase() !== merged.furnishing.toLowerCase()) return false;
      if (merged.preference && i.owner_preference?.toLowerCase() !== merged.preference.toLowerCase()) return false;
      const minP = merged.minPrice !== '' && merged.minPrice != null ? parseInt(merged.minPrice) : null;
      const maxP = merged.maxPrice !== '' && merged.maxPrice != null ? parseInt(merged.maxPrice) : null;
      if (minP !== null && i.price < minP) return false;
      if (maxP !== null && i.price > maxP) return false;
      return true;
    });
    setResults(out); setFilterOpen(false); window.scrollTo(0,0);
  },[searchQuery, filters, allData]);

  const openRoom = (r) => { setSelected(r); setView('details'); setShowContact(false); window.scrollTo(0,0); };
  const toggleLike = (id) => setLiked(l=>({...l,[id]:!l[id]}));
  const reset = () => { setView('home'); setFilters({city:'',bhk:'',furnishing:''}); setSearchQuery(''); setResults(allData); };
  const paged = results.slice(0, page*PAGE);

  const statusBanner = () => {
    if (loadState==='loading') return (
      <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'9999px',padding:'6px 16px',fontSize:'10px',color:'#818cf8',fontWeight:700}}>
        <Loader size={11} style={{animation:'spin 1s linear infinite'}}/> Connecting to BigQuery…
      </div>
    );
    if (loadState==='done') return (
      <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'9999px',padding:'4px 14px',fontSize:'10px',fontWeight:700,color:'#10b981'}}>
        ✓ {allData.length} live listings across {opts.cities.length} cities
      </div>
    );
    if (loadState==='error') return (
      <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'9999px',padding:'5px 14px',fontSize:'10px',color:'#fbbf24',fontWeight:700}}>
        <AlertCircle size={11}/> Showing preview — open in browser for all {' '}
        <button onClick={loadLive} style={{background:'none',border:'none',color:'#fbbf24',cursor:'pointer',textDecoration:'underline',fontSize:'10px',fontWeight:700,padding:0,display:'flex',alignItems:'center',gap:'3px'}}>
          <RefreshCw size={10}/> Retry
        </button>
      </div>
    );
    return (
      <div style={{display:'flex',alignItems:'center',gap:'6px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'9999px',padding:'4px 14px',fontSize:'10px',fontWeight:700,color:'#818cf8'}}>
        Preview · {allData.length} sample listings
      </div>
    );
  };

  return (
    <div style={{background:'#080808',minHeight:'100vh',color:'#e4e4e7',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',overflowX:'hidden'}}>
      <nav style={{position:'fixed',top:0,width:'100%',zIndex:50,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)',height:'56px',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 20px',transition:'transform 0.3s',transform:navVisible?'translateY(0)':'translateY(-100%)'}}>
        <div onClick={reset} style={{fontSize:'22px',fontWeight:900,letterSpacing:'-0.05em',cursor:'pointer',color:'white'}}>roomy</div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          {loadState==='done' && <span style={{fontSize:'9px',fontWeight:700,color:'#10b981',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',padding:'3px 10px',borderRadius:'9999px'}}>● {allData.length} live</span>}
          {loadState==='loading' && <span style={{fontSize:'9px',color:'#818cf8',display:'flex',alignItems:'center',gap:'4px'}}><Loader size={10} style={{animation:'spin 1s linear infinite'}}/>Loading…</span>}
          {loadState==='error' && <span style={{fontSize:'9px',color:'#fbbf24',background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)',padding:'3px 10px',borderRadius:'9999px'}}>Preview mode</span>}
          <div style={{display:'flex',gap:'20px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#52525b'}}>
            <span onClick={reset} style={{cursor:'pointer',color:view==='home'?'white':'#52525b'}}>Discover</span>
            <span style={{cursor:'pointer'}}>List</span>
          </div>
        </div>
      </nav>

      <main style={{paddingTop:'56px'}}>
        {view==='home' && (
          <div style={{minHeight:'88vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
            <div style={{maxWidth:'680px',width:'100%',textAlign:'center',display:'flex',flexDirection:'column',gap:'22px',alignItems:'center'}}>
              {statusBanner()}
              <h1 style={{fontSize:'clamp(38px,8vw,76px)',fontWeight:900,letterSpacing:'-0.04em',lineHeight:1,color:'white',margin:0}}>
                Find your next <span style={{color:'#6366f1'}}>home.</span>
              </h1>
              <p style={{color:'#52525b',fontSize:'14px',fontWeight:500,margin:0}}>Search listings across Kolkata, Bangalore, Delhi, Pune, Chennai and more</p>

              <div style={{background:'#111',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'9999px',padding:'5px',display:'flex',alignItems:'center',gap:'6px',width:'100%',maxWidth:'580px',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
                <Search size={15} style={{marginLeft:'12px',color:'#52525b',flexShrink:0}}/>
                <input autoFocus
                  style={{background:'transparent',border:'none',outline:'none',flex:1,fontSize:'14px',color:'white',padding:'9px 4px'}}
                  placeholder="2BHK in Delhi, fully furnished…"
                  value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&doSearch()}/>
                <button onClick={()=>setFilterOpen(f=>!f)} style={{background:'none',border:'none',cursor:'pointer',padding:'7px',color:filterOpen?'#818cf8':'#52525b'}}>
                  <SlidersHorizontal size={17}/>
                </button>
                <button onClick={()=>doSearch()}
                  style={{background:'white',color:'black',border:'none',borderRadius:'9999px',padding:'9px 22px',fontSize:'10px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer',whiteSpace:'nowrap'}}>
                  Search
                </button>
              </div>

              {filterOpen && (
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
                  <FilterPill label="City" options={opts.cities} value={filters.city} onChange={v=>setFilters(f=>({...f,city:v}))}/>
                  <FilterPill label="Type" options={opts.types} value={filters.bhk} onChange={v=>setFilters(f=>({...f,bhk:v}))}/>
                  <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={v=>setFilters(f=>({...f,furnishing:v}))}/>
                  <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={v=>setFilters(f=>({...f,preference:v}))}/>
                  <select value={filters.priceRange||''} onChange={e=>{
                      const opt = PRICE_OPTIONS.find(o=>o.label===e.target.value);
                      setFilters(f=>({...f,priceRange:e.target.value,minPrice:opt?.min??'',maxPrice:opt?.max??''}));
                    }}
                    style={{appearance:'none',background:'#1a1a1a',border:`1px solid ${filters.priceRange?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:'9999px',padding:'6px 16px',fontSize:'10px',fontWeight:700,color:filters.priceRange?'#a5b4fc':'#71717a',cursor:'pointer'}}>
                    <option value="">Price Range</option>
                    {PRICE_OPTIONS.map(o=><option key={o.label} value={o.label} style={{background:'#121212'}}>{o.label}</option>)}
                  </select>
                </div>
              )}

              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center'}}>
                {opts.cities.map(c=>(
                  <button key={c} onClick={()=>doSearch(`in ${c}`,{...filters,city:c ?? ''})}
                    style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'9999px',padding:'5px 14px',fontSize:'11px',color:'#71717a',cursor:'pointer',fontWeight:600,transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='white';(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.2)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='#71717a';(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.07)';}}
                    {c}
                  </button>
                ))}
              </div>

              {/* Info box about live data */}
              {loadState==='error' && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'12px 16px',fontSize:'11px',color:'#52525b',maxWidth:'480px',lineHeight:1.7}}>
                  💡 <strong style={{color:'#71717a'}}>For live data:</strong> Open this app outside Claude (copy the code to a React environment) — the browser will fetch all 800 listings directly from your BigQuery API.
                </div>
              )}
            </div>
          </div>
        )}

        {view==='search' && (
          <div style={{maxWidth:'1200px',margin:'0 auto',padding:'16px 16px 80px'}}>
            <div style={{position:'sticky',top:'62px',zIndex:40,marginBottom:'20px'}}>
              <div style={{background:'rgba(12,12,12,0.96)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'5px 10px',display:'flex',alignItems:'center',gap:'7px'}}>
                <Search size={12} style={{color:'#52525b'}}/>
                <input style={{background:'transparent',border:'none',outline:'none',flex:1,fontSize:'12px',fontWeight:700,color:'white'}} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}/>
                {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{background:'none',border:'none',cursor:'pointer',color:'#52525b'}}><X size={12}/></button>}
                <div style={{width:'1px',height:'14px',background:'rgba(255,255,255,0.05)'}}/>
                <SlidersHorizontal size={12} style={{color:'#52525b',cursor:'pointer'}} onClick={()=>setFilterOpen(f=>!f)}/>
                <button onClick={()=>doSearch()} style={{background:'#6366f1',border:'none',color:'white',borderRadius:'7px',padding:'4px 12px',fontSize:'9px',fontWeight:900,cursor:'pointer',textTransform:'uppercase'}}>Go</button>
              </div>
              {filterOpen && (
                <div style={{display:'flex',gap:'7px',flexWrap:'wrap',padding:'8px 2px 0',alignItems:'center'}}>
                  <FilterPill label="City" options={opts.cities} value={filters.city} onChange={(v: string)=>{const nf={...filters,city:v};setFilters(nf);doSearch(searchQuery,nf);}}/>
                  <FilterPill label="Type" options={opts.types} value={filters.bhk} onChange={(v: string)=>{const nf={...filters,bhk:v};setFilters(nf);doSearch(searchQuery,nf);}}/>
                  <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={(v: string)=>{const nf={...filters,furnishing:v};setFilters(nf);doSearch(searchQuery,nf);}}/>
                  <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={(v: string)=>{const nf={...filters,preference:v};setFilters(nf);doSearch(searchQuery,nf);}}/>
                  <select value={filters.priceRange||''} onChange={e=>{
                      const opt = PRICE_OPTIONS.find(o=>o.label===e.target.value);
                      const nf={...filters,priceRange:e.target.value,minPrice:opt?.min??'',maxPrice:opt?.max??''};
                      setFilters(nf); doSearch(searchQuery,nf);
                    }}
                    style={{appearance:'none',background:'#1a1a1a',border:`1px solid ${filters.priceRange?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.1)'}`,borderRadius:'9999px',padding:'4px 12px',fontSize:'10px',fontWeight:700,color:filters.priceRange?'#a5b4fc':'#71717a',cursor:'pointer'}}>
                    <option value="">Price Range</option>
                    {PRICE_OPTIONS.map(o=><option key={o.label} value={o.label} style={{background:'#121212'}}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <span style={{fontSize:'10px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:'#52525b'}}>{results.length} listings{loadState==='error'?' (preview)':''}</span>
              <button onClick={reset} style={{background:'none',border:'none',fontSize:'10px',color:'#818cf8',fontWeight:700,cursor:'pointer',textDecoration:'underline',textTransform:'uppercase'}}>Reset</button>
            </div>
            {results.length > 0 ? (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:'14px'}}>
                  {paged.map(item=><Card key={item.post_id} item={item} onClick={openRoom} liked={!!liked[item.post_id]} onLike={toggleLike}/>)}
                </div>
                {paged.length < results.length && (
                  <div style={{textAlign:'center',marginTop:'28px'}}>
                    <button onClick={()=>setPage(p=>p+1)}
                      style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'#a1a1aa',borderRadius:'9999px',padding:'10px 28px',fontSize:'10px',fontWeight:700,cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.1em'}}>
                      Load more · {results.length - paged.length} remaining
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{textAlign:'center',padding:'80px 0',color:'#3f3f46'}}>
                <p style={{fontSize:'14px',margin:'0 0 8px'}}>No listings found</p>
                <p style={{fontSize:'11px',color:'#27272a'}}>Try different filters or search terms</p>
              </div>
            )}
          </div>
        )}

        {view==='details' && selected && (
          <div style={{maxWidth:'780px',margin:'0 auto',padding:'16px 16px 80px'}}>
            <button onClick={()=>setView('search')} style={{background:'none',border:'none',color:'#71717a',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',marginBottom:'14px'}}>
              <ChevronLeft size={13}/> Back
            </button>
            <div style={{background:'#0f0f0f',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',overflow:'hidden'}}>
              <div style={{position:'relative',height:'260px'}}>
                <img src={getImg(selected)} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="room" onError={e=>(e.currentTarget as HTMLImageElement).src=IMGS[2]}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(15,15,15,1) 0%,rgba(15,15,15,0.15) 55%,transparent 100%)'}}/>
                <div style={{position:'absolute',bottom:'20px',left:'22px',right:'60px'}}>
                  <p style={{fontSize:'30px',fontWeight:900,color:'white',margin:0,lineHeight:1}}>
                    ₹{(selected.price||0).toLocaleString()}<span style={{fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,0.45)'}}>/mo</span>
                  </p>
                  <p style={{fontSize:'12px',color:'rgba(255,255,255,0.55)',margin:'4px 0 0',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>
                    <MapPin size={10}/>{[selected.bhk_type,selected.locality,selected.city].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button onClick={()=>toggleLike(selected.post_id)}
                  style={{position:'absolute',top:'14px',right:'14px',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',border:'none',borderRadius:'9999px',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <Heart size={15} fill={liked[selected.post_id]?'#e11d48':'none'} color={liked[selected.post_id]?'#e11d48':'white'}/>
                </button>
              </div>
              <div style={{padding:'22px'}}>
                <div style={{display:'flex',gap:'7px',flexWrap:'wrap',marginBottom:'18px'}}>
                  {[selected.furnishing,selected.accommodation_type,selected.owner_preference].filter(Boolean).map(t=>(
                    <span key={t} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',padding:'4px 11px',borderRadius:'9999px',fontSize:'10px',color:'#818cf8',fontWeight:700}}>{t}</span>
                  ))}
                </div>
                {selected.additional_description && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'14px',marginBottom:'20px'}}>
                    <p style={{fontSize:'8px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.2em',color:'#52525b',margin:'0 0 7px'}}>About this place</p>
                    <p style={{fontSize:'13px',color:'#a1a1aa',lineHeight:1.7,fontStyle:'italic',margin:0}}>"{selected.additional_description}"</p>
                  </div>
                )}
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'20px'}}>
                  {selected.map_link && (
                    <a href={selected.map_link} target="_blank" rel="noopener noreferrer"
                      style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'9999px',padding:'7px 14px',fontSize:'10px',color:'#71717a',textDecoration:'none',fontWeight:700}}>
                      <MapPin size={11}/> View on Maps
                    </a>
                  )}
                  {selected.fb_post_url && (
                    <a href={selected.fb_post_url} target="_blank" rel="noopener noreferrer"
                      style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'9999px',padding:'7px 14px',fontSize:'10px',color:'#60a5fa',textDecoration:'none',fontWeight:700}}>
                      Facebook post ↗
                    </a>
                  )}
                </div>
                {!showContact ? (
                  <button onClick={()=>setShowContact(true)}
                    style={{width:'100%',padding:'14px',background:'#e11d48',color:'white',border:'none',borderRadius:'12px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer'}}>
                    Reveal Contact
                  </button>
                ) : (
                  <div style={{background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'12px',padding:'14px 18px',textAlign:'center'}}>
                    <p style={{fontSize:'8px',fontWeight:900,textTransform:'uppercase',color:'#52525b',margin:'0 0 5px',letterSpacing:'0.15em'}}>Owner Contact</p>
                    <p style={{fontSize:'15px',fontWeight:800,color:'#818cf8',margin:0}}>{selected.contact_details||'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <button style={{position:'fixed',bottom:'22px',right:'22px',width:'46px',height:'46px',background:'#6366f1',border:'none',borderRadius:'9999px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 8px 28px rgba(99,102,241,0.45)',zIndex:60}}>
        <MessageSquare size={19} color="white"/>
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
