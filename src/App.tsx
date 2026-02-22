import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search, SlidersHorizontal, X, Heart, MessageSquare,
  ChevronLeft, Loader, AlertCircle, MapPin, RefreshCw
} from "lucide-react";

const API = "https://roomy-listings-136208599777.asia-south1.run.app";

const IMGS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  "https://www.bhg.com/thmb/W76y53a3FyL4m_rJ1djtG_71KMo=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/renovated-neutral-colored-living-room-2f194807-3856ba1a2ea04e269ea42e93021fda64.jpg",
  "https://www.bhg.com/thmb/QArHugkkoJfA1V1vpHZxBBKL1yw=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/armchair-fireplace-c426f88f-7ea8acfac7de43e2acb1f40e98040fd3.jpg",
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

interface FiltersState {
  city: string;
  bhk: string;
  furnishing: string;
  preference: string;
  priceRange: string;
  minPrice: number | string;
  maxPrice: number | string;
}

const EMPTY_FILTERS: FiltersState = {
  city: "", bhk: "", furnishing: "",
  preference: "", priceRange: "", minPrice: "", maxPrice: "",
};

const PREVIEW: Listing[] = [
  { post_id: "FB_KOL_001", timestamp: "2026-02-04T01:48:00Z", city: "Kolkata", locality: "Kasba", price: 16861, bhk_type: "Studio", accommodation_type: "Private Room", furnishing: "Semi-Furnished", owner_preference: "No Restrictions", contact_details: "Rahul: +91 7006206502", map_link: "https://www.google.com/maps/search/?api=1&query=22.578,88.387", fb_post_url: "https://www.facebook.com/share/v/17iWH8FsvA/", additional_description: "Near Metro station. Gas connection ready." },
  { post_id: "FB_BAN_002", timestamp: "2026-02-11T05:48:00Z", city: "Bangalore", locality: "Electronic City", price: 12464, bhk_type: "3BHK", accommodation_type: "Private Room", furnishing: "Fully Furnished", owner_preference: "Bachelors Only", contact_details: "Amit: +91 9548491111", map_link: null, fb_post_url: "https://www.facebook.com/share/p/1Ki1bpz8Dw/", additional_description: "Gated society with security." },
  { post_id: "FB_CHE_003", timestamp: "2026-02-04T08:48:00Z", city: "Chennai", locality: "OMR", price: 23475, bhk_type: "1RK", accommodation_type: "Private Room", furnishing: "Fully Furnished", owner_preference: "Family Only", contact_details: "Sneha: +91 9048031753", map_link: "https://www.google.com/maps/search/?api=1&query=13.099,80.246", fb_post_url: "https://www.facebook.com/share/p/1Do9ga43AL/", additional_description: "Walking distance to IT park. No brokerage." },
  { post_id: "FB_PUN_004", timestamp: "2026-01-25T01:48:00Z", city: "Pune", locality: "Kharadi", price: 22411, bhk_type: "2BHK", accommodation_type: "Private Room", furnishing: "Fully Furnished", owner_preference: "Working Professionals", contact_details: null, map_link: "https://www.google.com/maps/search/?api=1&query=18.493,73.864", fb_post_url: "https://www.facebook.com/share/p/17wq3pJhiT/", additional_description: "Near Metro station. WiFi and Maid available." },
  { post_id: "FB_DEL_005", timestamp: "2026-02-04T16:48:00Z", city: "Delhi", locality: "Hauz Khas", price: 30027, bhk_type: "2BHK", accommodation_type: "Private Room", furnishing: "Semi-Furnished", owner_preference: "No Restrictions", contact_details: "+91 7577434615", map_link: null, fb_post_url: "https://www.facebook.com/share/p/1DMEXJrzV7/", additional_description: "Gated society with security." },
  { post_id: "FB_KOL_006", timestamp: "2026-02-03T18:48:00Z", city: "Kolkata", locality: "Lake Town", price: 5330, bhk_type: "1RK", accommodation_type: "Private Room", furnishing: "Semi-Furnished", owner_preference: "Working Professionals", contact_details: "+91 9694898061", map_link: null, fb_post_url: "https://www.facebook.com/share/v/17iWH8FsvA/", additional_description: "Lift and Parking available." },
  { post_id: "FB_BAN_007", timestamp: "2026-02-14T02:48:00Z", city: "Bangalore", locality: "JP Nagar", price: 53326, bhk_type: "1RK", accommodation_type: "Shared Room", furnishing: "Semi-Furnished", owner_preference: "Family Only", contact_details: null, map_link: "https://www.google.com/maps/search/?api=1&query=12.942,77.603", fb_post_url: "https://www.facebook.com/share/p/1Ki1bpz8Dw/", additional_description: "Gated society with security." },
  { post_id: "FB_CHE_008", timestamp: "2026-01-18T15:48:00Z", city: "Chennai", locality: "Velachery", price: 27204, bhk_type: "3BHK", accommodation_type: "Shared Room", furnishing: "Fully Furnished", owner_preference: "Family Only", contact_details: null, map_link: "https://www.google.com/maps/search/?api=1&query=13.053,80.247", fb_post_url: "https://www.facebook.com/share/p/1Do9ga43AL/", additional_description: "WiFi and Maid available." },
  { post_id: "FB_PUN_009", timestamp: "2026-01-28T16:48:00Z", city: "Pune", locality: "Wakad", price: 13683, bhk_type: "1BHK", accommodation_type: "Entire Flat", furnishing: "Fully Furnished", owner_preference: "Bachelors Only", contact_details: "+91 7558036968", map_link: null, fb_post_url: "https://www.facebook.com/share/p/1AuUVaK5Yz/", additional_description: "Near Metro station. WiFi and Maid available." },
  { post_id: "FB_DEL_010", timestamp: "2026-02-12T22:48:00Z", city: "Delhi", locality: "Greater Kailash", price: 45999, bhk_type: "Shared Room", accommodation_type: "Shared Room", furnishing: "Semi-Furnished", owner_preference: "Bachelors Only", contact_details: "Pooja: +91 9426614901", map_link: null, fb_post_url: "https://www.facebook.com/share/p/184YZajveT/", additional_description: "Near Metro station. Lift and Parking available." },
  { post_id: "FB_KOL_011", timestamp: "2026-02-08T09:48:00Z", city: "Kolkata", locality: "Lake Town", price: 23396, bhk_type: "Studio", accommodation_type: "Entire Flat", furnishing: "Fully Furnished", owner_preference: "Females Only", contact_details: null, map_link: "https://www.google.com/maps/search/?api=1&query=22.593,88.386", fb_post_url: "https://www.facebook.com/share/p/1CaqKDXD9F/", additional_description: "Walking distance to IT park. No brokerage." },
];

const PRICE_OPTIONS = [
  { label: "Upto ₹2,500",       min: 0,     max: 2500  },
  { label: "₹2,500 – ₹5,000",   min: 2500,  max: 5000  },
  { label: "₹5,000 – ₹10,000",  min: 5000,  max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { label: "₹20,000 Plus",      min: 20000, max: null  },
];

const KNOWN_CITIES = ["kolkata","bangalore","bengaluru","delhi","mumbai","pune","chennai","hyderabad","ahmedabad","jaipur"];
const KNOWN_BHK: Record<string, string> = {
  "studio": "Studio", "1rk": "1RK", "1bhk": "1BHK",
  "2bhk": "2BHK", "3bhk": "3BHK", "4bhk": "4BHK",
  "shared room": "Shared Room", "shared": "Shared Room",
};

interface ParsedQuery {
  city: string; bhk: string; furnishing: string;
  preference: string; minPrice: number | null; maxPrice: number | null;
}

function parseQuery(raw: string): ParsedQuery {
  const result: ParsedQuery = { city: "", bhk: "", furnishing: "", preference: "", minPrice: null, maxPrice: null };
  if (!raw.trim()) return result;
  const s = " " + raw.toLowerCase().replace(/,/g, " ") + " ";

  for (const city of KNOWN_CITIES) {
    if (new RegExp(`\\b${city}\\b`).test(s)) {
      result.city = city === "bengaluru" ? "bangalore" : city;
      break;
    }
  }

  const bhkKeys = Object.keys(KNOWN_BHK).sort((a, b) => b.length - a.length);
  for (const key of bhkKeys) {
    if (new RegExp(`\\b${key.replace(/\s+/g, "\\s+")}\\b`).test(s)) {
      result.bhk = KNOWN_BHK[key];
      break;
    }
  }

  if (/\bfully[\s-]?furnished\b/.test(s))     result.furnishing = "Fully Furnished";
  else if (/\bsemi[\s-]?furnished\b/.test(s)) result.furnishing = "Semi-Furnished";
  else if (/\bunfurnished\b/.test(s))          result.furnishing = "Unfurnished";

  if (/\b(female|women|ladies|girl)\b/.test(s)) result.preference = "Females Only";
  else if (/\bbachelor/.test(s))                result.preference = "Bachelors Only";
  else if (/\bfamily\b/.test(s))                result.preference = "Family Only";
  else if (/\bworking\s+professional/.test(s))  result.preference = "Working Professionals";
  else if (/\bvegetarian/.test(s))              result.preference = "Vegetarians Only";
  else if (/\bno\s+restriction/.test(s))        result.preference = "No Restrictions";

  const toNum = (d: string) => { const n = parseInt(d, 10); return n < 500 ? n * 1000 : n; };
  const underM = s.match(/\b(?:under|below|upto|up\s+to|within|max|maximum)\s*[₹]?\s*(\d+)\s*k?\b/);
  if (underM) result.maxPrice = toNum(underM[1]);
  const aboveM = s.match(/\b(?:above|over|more\s+than|minimum|min)\s*[₹]?\s*(\d+)\s*k?\b/);
  if (aboveM) result.minPrice = toNum(aboveM[1]);
  if (/\bbudget\b/.test(s) && result.maxPrice === null)     result.maxPrice = 10000;
  if (/\baffordable\b/.test(s) && result.maxPrice === null) result.maxPrice = 15000;
  if (/\b(luxury|premium)\b/.test(s) && result.minPrice === null) result.minPrice = 20000;

  return result;
}

function applyFilters(data: Listing[], parsed: ParsedQuery, dropdowns: FiltersState): Listing[] {
  const n = (s: string) => s.toLowerCase().trim();
  const alias = (c: string) => (c === "bengaluru" ? "bangalore" : c);
  const city       = alias(n(dropdowns.city       || parsed.city));
  const bhk        = n(dropdowns.bhk               || parsed.bhk);
  const furnishing = n(dropdowns.furnishing        || parsed.furnishing);
  const preference = n(dropdowns.preference        || parsed.preference);
  const minP = dropdowns.minPrice !== "" ? Number(dropdowns.minPrice) : parsed.minPrice;
  const maxP = dropdowns.maxPrice !== "" ? Number(dropdowns.maxPrice) : parsed.maxPrice;

  return data.filter(item => {
    if (city       && alias(n(item.city             ?? "")) !== city)      return false;
    if (bhk        && n(item.bhk_type               ?? "") !== bhk)        return false;
    if (furnishing && n(item.furnishing             ?? "") !== furnishing)  return false;
    if (preference && n(item.owner_preference       ?? "") !== preference)  return false;
    const price = item.price ?? 0;
    if (minP !== null && price < (minP as number)) return false;
    if (maxP !== null && price > (maxP as number)) return false;
    return true;
  });
}

const getRelativeTime = (ts: string | null | undefined): string => {
  if (!ts) return "Recently";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "Recently";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`; return `${dy}d ago`;
};

const getImg = (item: Listing): string => {
  if (item.image_urls) {
    const first = item.image_urls.split(",")[0].trim();
    if (first.startsWith("http")) return first;
  }
  let h = 0; const s = item.post_id || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return IMGS[h % IMGS.length];
};

const FilterPill = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <select value={value || ""} onChange={e => onChange(e.target.value)}
    style={{ appearance: "none", background: "#1a1a1a", border: `1px solid ${value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "9999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700, color: value ? "#a5b4fc" : "#71717a", cursor: "pointer", flex: "1 1 auto", minWidth: "0" }}>
    <option value="">{label}</option>
    {options.map(o => <option key={o} value={o} style={{ background: "#121212" }}>{o}</option>)}
  </select>
);

const Card = ({ item, onClick, liked, onLike }: {
  item: Listing; onClick: (i: Listing) => void; liked: boolean; onLike: (id: string) => void;
}) => (
  <div onClick={() => onClick(item)}
    style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column" }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
    <div style={{ position: "relative", height: "180px", overflow: "hidden", flexShrink: 0 }}>
      <img src={getImg(item)} alt="room" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy"
        onError={e => { (e.currentTarget as HTMLImageElement).src = IMGS[2]; }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%)" }} />
      <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "44px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
        {item.bhk_type && <span style={{ background: "rgba(99,102,241,0.92)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: "9999px", fontSize: "9px", fontWeight: 900, color: "white", textTransform: "uppercase", whiteSpace: "nowrap" }}>{item.bhk_type}</span>}
        <span style={{ marginLeft: "auto", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", padding: "2px 7px", borderRadius: "9999px", fontSize: "9px", color: "#a1a1aa", whiteSpace: "nowrap" }}>{getRelativeTime(item.timestamp)}</span>
      </div>
      <button onClick={e => { e.stopPropagation(); onLike(item.post_id); }}
        style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", border: "none", borderRadius: "9999px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <Heart size={14} fill={liked ? "#e11d48" : "none"} color={liked ? "#e11d48" : "#a1a1aa"} />
      </button>
    </div>
    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
      <div>
        <p style={{ fontSize: "18px", fontWeight: 900, color: "white", margin: 0, lineHeight: 1 }}>
          ₹{(item.price || 0).toLocaleString("en-IN")}
          <span style={{ fontSize: "11px", color: "#52525b", fontWeight: 600 }}>/mo</span>
        </p>
        <p style={{ fontSize: "12px", color: "#71717a", margin: "4px 0 0", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={10} />{[item.locality, item.city].filter(Boolean).join(", ") || "Location N/A"}
        </p>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {[item.furnishing, item.accommodation_type].filter(Boolean).map(t => (
          <span key={t} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: "9999px", fontSize: "10px", color: "#71717a", fontWeight: 700 }}>{t}</span>
        ))}
      </div>
      {item.additional_description && (
        <p style={{ fontSize: "11px", color: "#52525b", margin: 0, fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>
          "{item.additional_description}"
        </p>
      )}
      <button style={{ width: "100%", padding: "10px", background: "#e11d48", color: "white", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", marginTop: "auto" }}>
        View Room
      </button>
    </div>
  </div>
);

export default function App() {
  const [view, setView]               = useState<"home" | "search" | "details">("home");
  const [allData, setAllData]         = useState<Listing[]>(PREVIEW);
  const [loadState, setLoadState]     = useState<"preview" | "loading" | "done" | "error">("preview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen]   = useState(false);
  const [results, setResults]         = useState<Listing[]>(PREVIEW);
  const [selected, setSelected]       = useState<Listing | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [filters, setFilters]         = useState<FiltersState>(EMPTY_FILTERS);
  const [liked, setLiked]             = useState<Record<string, boolean>>({});
  const [navVisible, setNavVisible]   = useState(true);
  const [page, setPage]               = useState(1);
  const PAGE = 24;
  const lastY = useRef(0);

  const loadLive = useCallback(() => {
    setLoadState("loading");
    fetch(API)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Listing[]) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error("Empty");
        setAllData(data); setResults(data); setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(() => { loadLive(); }, [loadLive]);

  useEffect(() => {
    const fn = () => { const y = window.scrollY; setNavVisible(y <= 10 || y < lastY.current); lastY.current = y; };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const opts = useMemo(() => ({
    cities:      [...new Set(allData.map(d => d.city).filter((c): c is string => Boolean(c)))].sort(),
    types:       [...new Set(allData.map(d => d.bhk_type).filter((t): t is string => Boolean(t)))].sort(),
    furnishings: [...new Set(allData.map(d => d.furnishing).filter((f): f is string => Boolean(f)))].sort(),
    preferences: [...new Set(allData.map(d => d.owner_preference).filter((p): p is string => Boolean(p)))].sort(),
  }), [allData]);

  const doSearch = useCallback((q: string = searchQuery, f: FiltersState = filters, dataset: Listing[] = allData) => {
    setView("search"); setPage(1);
    setResults(applyFilters(dataset, parseQuery(q), f));
    setFilterOpen(false); window.scrollTo(0, 0);
  }, [searchQuery, filters, allData]);

  const openRoom   = (r: Listing) => { setSelected(r); setView("details"); setShowContact(false); window.scrollTo(0, 0); };
  const toggleLike = (id: string) => setLiked(l => ({ ...l, [id]: !l[id] }));
  const reset      = () => { setView("home"); setFilters(EMPTY_FILTERS); setSearchQuery(""); setResults(allData); };
  const paged      = results.slice(0, page * PAGE);

  const StatusBanner = () => {
    const base: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px", borderRadius: "9999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700, flexWrap: "wrap", justifyContent: "center" };
    if (loadState === "loading") return <div style={{ ...base, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8" }}><Loader size={11} style={{ animation: "spin 1s linear infinite" }} /> Connecting to BigQuery…</div>;
    if (loadState === "done")    return <div style={{ ...base, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>✓ {allData.length} live listings across {opts.cities.length} cities</div>;
    if (loadState === "error")   return <div style={{ ...base, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}><AlertCircle size={11} /> Showing preview — <button onClick={loadLive} style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", textDecoration: "underline", fontSize: "11px", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: "3px" }}><RefreshCw size={10} /> Retry</button></div>;
    return <div style={{ ...base, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#818cf8" }}>Preview · {allData.length} sample listings</div>;
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#e4e4e7", fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', overflowX: "hidden" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input, select, button { font-family: inherit; }
        @media (max-width: 600px) {
          .search-bar { flex-wrap: wrap !important; gap: 8px !important; border-radius: 16px !important; padding: 10px !important; }
          .search-bar input { width: 100% !important; font-size: 15px !important; padding: 4px 0 !important; }
          .search-bar .search-actions { display: flex !important; width: 100% !important; gap: 8px !important; }
          .search-btn { flex: 1 !important; border-radius: 10px !important; }
          .filter-grid { grid-template-columns: 1fr 1fr !important; }
          .result-grid { grid-template-columns: 1fr !important; }
          .detail-tags { gap: 6px !important; }
        }
        @media (min-width: 600px) {
          .result-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important; }
          .search-actions { display: contents !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", height: "52px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", transition: "transform 0.3s", transform: navVisible ? "translateY(0)" : "translateY(-100%)" }}>
        <div onClick={reset} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.05em", cursor: "pointer", color: "white" }}>roomy</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {loadState === "done"    && <span style={{ fontSize: "9px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "3px 10px", borderRadius: "9999px", whiteSpace: "nowrap" }}>● {allData.length} live</span>}
          {loadState === "loading" && <span style={{ fontSize: "9px", color: "#818cf8", display: "flex", alignItems: "center", gap: "4px" }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} />Loading…</span>}
          {loadState === "error"   && <span style={{ fontSize: "9px", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "3px 10px", borderRadius: "9999px" }}>Preview</span>}
          <span onClick={reset} style={{ cursor: "pointer", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: view === "home" ? "white" : "#52525b" }}>Discover</span>
        </div>
      </nav>

      <main style={{ paddingTop: "52px" }}>

        {/* ══ HOME ══ */}
        {view === "home" && (
          <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px 48px" }}>
            <div style={{ width: "100%", maxWidth: "620px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", textAlign: "center" }}>

              <StatusBanner />

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h1 style={{ fontSize: "clamp(36px,9vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "white", margin: 0 }}>
                  Find your next
                </h1>
                <h1 style={{ fontSize: "clamp(36px,9vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#6366f1", margin: 0 }}>
                  home.
                </h1>
              </div>

              <p style={{ color: "#52525b", fontSize: "14px", fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                Search listings across Kolkata, Bangalore, Delhi, Pune, Chennai and more
              </p>

              {/* Search bar — mobile-first */}
              <div className="search-bar" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "6px 6px 6px 16px", display: "flex", alignItems: "center", gap: "8px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                <Search size={16} style={{ color: "#52525b", flexShrink: 0 }} />
                <input
                  autoFocus
                  style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "14px", color: "white", minWidth: 0, padding: "8px 0" }}
                  placeholder="1BHK in Kolkata…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                />
                <div className="search-actions" style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                  <button onClick={() => setFilterOpen(f => !f)} style={{ background: filterOpen ? "rgba(99,102,241,0.15)" : "none", border: "none", cursor: "pointer", padding: "8px", color: filterOpen ? "#818cf8" : "#52525b", borderRadius: "9999px", display: "flex", alignItems: "center" }}>
                    <SlidersHorizontal size={18} />
                  </button>
                  <button className="search-btn" onClick={() => doSearch()} style={{ background: "white", color: "black", border: "none", borderRadius: "9999px", padding: "10px 20px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Search
                  </button>
                </div>
              </div>

              {/* Filters */}
              {filterOpen && (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="filter-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <FilterPill label="City"       options={opts.cities}      value={filters.city}       onChange={(v: string) => setFilters(f => ({ ...f, city: v }))} />
                    <FilterPill label="Type"       options={opts.types}       value={filters.bhk}        onChange={(v: string) => setFilters(f => ({ ...f, bhk: v }))} />
                    <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={(v: string) => setFilters(f => ({ ...f, furnishing: v }))} />
                    <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={(v: string) => setFilters(f => ({ ...f, preference: v }))} />
                  </div>
                  <select value={filters.priceRange}
                    onChange={e => { const opt = PRICE_OPTIONS.find(o => o.label === e.target.value); setFilters(f => ({ ...f, priceRange: e.target.value, minPrice: opt?.min ?? "", maxPrice: opt?.max ?? "" })); }}
                    style={{ appearance: "none", background: "#1a1a1a", border: `1px solid ${filters.priceRange ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", fontWeight: 700, color: filters.priceRange ? "#a5b4fc" : "#71717a", cursor: "pointer", width: "100%" }}>
                    <option value="">Price Range</option>
                    {PRICE_OPTIONS.map(o => <option key={o.label} value={o.label} style={{ background: "#121212" }}>{o.label}</option>)}
                  </select>
                  <button onClick={() => doSearch()} style={{ width: "100%", padding: "12px", background: "#6366f1", color: "white", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer", letterSpacing: "0.08em" }}>
                    Apply Filters
                  </button>
                </div>
              )}

              {/* City quick-links */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {opts.cities.map(c => (
                  <button key={c}
                    onClick={() => { const nf = { ...EMPTY_FILTERS, city: c }; setFilters(nf); setSearchQuery(""); doSearch("", nf); }}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9999px", padding: "7px 16px", fontSize: "12px", color: "#71717a", cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#71717a"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ SEARCH ══ */}
        {view === "search" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 12px 80px" }}>

            {/* Sticky mini search */}
            <div style={{ position: "sticky", top: "52px", zIndex: 40, marginBottom: "16px" }}>
              <div style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Search size={14} style={{ color: "#52525b", flexShrink: 0 }} />
                <input
                  style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "13px", fontWeight: 700, color: "white", minWidth: 0 }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                  placeholder="Search listings…"
                />
                {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: "2px", display: "flex" }}><X size={13} /></button>}
                <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                <button style={{ background: "none", border: "none", cursor: "pointer", color: filterOpen ? "#818cf8" : "#52525b", padding: "4px", display: "flex" }} onClick={() => setFilterOpen(f => !f)}>
                  <SlidersHorizontal size={15} />
                </button>
                <button onClick={() => doSearch()} style={{ background: "#6366f1", border: "none", color: "white", borderRadius: "8px", padding: "6px 14px", fontSize: "10px", fontWeight: 900, cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>Go</button>
              </div>

              {filterOpen && (
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="filter-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <FilterPill label="City"       options={opts.cities}      value={filters.city}       onChange={(v: string) => { const nf = { ...filters, city: v };        setFilters(nf); doSearch(searchQuery, nf); }} />
                    <FilterPill label="Type"       options={opts.types}       value={filters.bhk}        onChange={(v: string) => { const nf = { ...filters, bhk: v };         setFilters(nf); doSearch(searchQuery, nf); }} />
                    <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={(v: string) => { const nf = { ...filters, furnishing: v };  setFilters(nf); doSearch(searchQuery, nf); }} />
                    <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={(v: string) => { const nf = { ...filters, preference: v };  setFilters(nf); doSearch(searchQuery, nf); }} />
                  </div>
                  <select value={filters.priceRange}
                    onChange={e => { const opt = PRICE_OPTIONS.find(o => o.label === e.target.value); const nf = { ...filters, priceRange: e.target.value, minPrice: opt?.min ?? "", maxPrice: opt?.max ?? "" }; setFilters(nf); doSearch(searchQuery, nf); }}
                    style={{ appearance: "none", background: "#1a1a1a", border: `1px solid ${filters.priceRange ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", fontWeight: 700, color: filters.priceRange ? "#a5b4fc" : "#71717a", cursor: "pointer", width: "100%" }}>
                    <option value="">Price Range</option>
                    {PRICE_OPTIONS.map(o => <option key={o.label} value={o.label} style={{ background: "#121212" }}>{o.label}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 2px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#52525b" }}>
                {results.length} listing{results.length !== 1 ? "s" : ""}{loadState === "error" ? " (preview)" : ""}
              </span>
              <button onClick={reset} style={{ background: "none", border: "none", fontSize: "11px", color: "#818cf8", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textTransform: "uppercase" }}>Reset</button>
            </div>

            {results.length > 0 ? (
              <>
                <div className="result-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
                  {paged.map(item => <Card key={item.post_id} item={item} onClick={openRoom} liked={!!liked[item.post_id]} onLike={toggleLike} />)}
                </div>
                {paged.length < results.length && (
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button onClick={() => setPage(p => p + 1)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa", borderRadius: "9999px", padding: "12px 28px", fontSize: "11px", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Load more · {results.length - paged.length} remaining
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "#3f3f46" }}>
                <p style={{ fontSize: "16px", margin: "0 0 8px" }}>No listings found</p>
                <p style={{ fontSize: "12px", color: "#27272a" }}>Try different filters or a broader search</p>
              </div>
            )}
          </div>
        )}

        {/* ══ DETAILS ══ */}
        {view === "details" && selected && (
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "12px 12px 80px" }}>
            <button onClick={() => setView("search")} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px", padding: "4px 0" }}>
              <ChevronLeft size={14} /> Back to results
            </button>
            <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ position: "relative", height: "220px" }}>
                <img src={getImg(selected)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="room"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = IMGS[2]; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(15,15,15,1) 0%,rgba(15,15,15,0.1) 50%,transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: "18px", left: "18px", right: "56px" }}>
                  <p style={{ fontSize: "28px", fontWeight: 900, color: "white", margin: 0, lineHeight: 1 }}>
                    ₹{(selected.price || 0).toLocaleString("en-IN")}
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "5px 0 0", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    <MapPin size={10} />{[selected.bhk_type, selected.locality, selected.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button onClick={() => toggleLike(selected.post_id)}
                  style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "none", borderRadius: "9999px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Heart size={16} fill={liked[selected.post_id] ? "#e11d48" : "none"} color={liked[selected.post_id] ? "#e11d48" : "white"} />
                </button>
              </div>

              <div style={{ padding: "18px" }}>
                <div className="detail-tags" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
                  {[selected.furnishing, selected.accommodation_type, selected.owner_preference].filter(Boolean).map(t => (
                    <span key={t} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "5px 12px", borderRadius: "9999px", fontSize: "11px", color: "#818cf8", fontWeight: 700 }}>{t}</span>
                  ))}
                </div>

                {selected.additional_description && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginBottom: "18px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#52525b", margin: "0 0 8px" }}>About this place</p>
                    <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>"{selected.additional_description}"</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
                  {selected.map_link && (
                    <a href={selected.map_link} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", color: "#71717a", textDecoration: "none", fontWeight: 700 }}>
                      <MapPin size={12} /> View on Maps
                    </a>
                  )}
                  {selected.fb_post_url && (
                    <a href={selected.fb_post_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", color: "#60a5fa", textDecoration: "none", fontWeight: 700 }}>
                      Facebook post ↗
                    </a>
                  )}
                </div>

                {!showContact ? (
                  <button onClick={() => setShowContact(true)}
                    style={{ width: "100%", padding: "16px", background: "#e11d48", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>
                    Reveal Contact
                  </button>
                ) : (
                  <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", color: "#52525b", margin: "0 0 6px", letterSpacing: "0.15em" }}>Owner Contact</p>
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#818cf8", margin: 0, wordBreak: "break-all" }}>{selected.contact_details || "Not provided"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <button style={{ position: "fixed", bottom: "20px", right: "16px", width: "48px", height: "48px", background: "#6366f1", border: "none", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 28px rgba(99,102,241,0.5)", zIndex: 60 }}>
        <MessageSquare size={20} color="white" />
      </button>
    </div>
  );
}
