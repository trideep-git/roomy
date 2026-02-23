import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search, SlidersHorizontal, X, Heart, MessageSquare,
  ChevronLeft, Loader, AlertCircle, MapPin, ArrowUp, Info
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

// ── Types ──────────────────────────────────────────────────────────────────────

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

const EMPTY: FiltersState = {
  city: "", bhk: "", furnishing: "",
  preference: "", priceRange: "", minPrice: "", maxPrice: "",
};

// ── Static data ────────────────────────────────────────────────────────────────

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
  { label: "Upto Rs.2,500",       min: 0,     max: 2500  },
  { label: "Rs.2,500 - Rs.5,000",   min: 2500,  max: 5000  },
  { label: "Rs.5,000 - Rs.10,000",  min: 5000,  max: 10000 },
  { label: "Rs.10,000 - Rs.15,000", min: 10000, max: 15000 },
  { label: "Rs.15,000 - Rs.20,000", min: 15000, max: 20000 },
  { label: "Rs.20,000 Plus",        min: 20000, max: null  },
];

const HINT_CHIPS = [
  "1BHK in Kolkata",
  "2BHK Delhi fully furnished",
  "Studio Bangalore under 15k",
  "Family flat in Pune",
  "Shared room Chennai",
];

const KNOWN_CITIES = ["kolkata","bangalore","bengaluru","delhi","mumbai","pune","chennai","hyderabad","ahmedabad","jaipur"];
const KNOWN_BHK: Record<string, string> = {
  "studio": "Studio", "1rk": "1RK", "1bhk": "1BHK",
  "2bhk": "2BHK", "3bhk": "3BHK", "4bhk": "4BHK",
  "shared room": "Shared Room", "shared": "Shared Room",
};

// ── NLP ────────────────────────────────────────────────────────────────────────

interface ParsedQuery {
  city: string; bhk: string; furnishing: string;
  preference: string; minPrice: number | null; maxPrice: number | null;
}

function parseQuery(raw: string): ParsedQuery {
  const out: ParsedQuery = { city: "", bhk: "", furnishing: "", preference: "", minPrice: null, maxPrice: null };
  if (!raw.trim()) return out;
  const s = " " + raw.toLowerCase().replace(/,/g, " ") + " ";
  for (const c of KNOWN_CITIES) {
    if (new RegExp("\\b" + c + "\\b").test(s)) { out.city = c === "bengaluru" ? "bangalore" : c; break; }
  }
  const keys = Object.keys(KNOWN_BHK).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (new RegExp("\\b" + k.replace(/\s+/g, "\\s+") + "\\b").test(s)) { out.bhk = KNOWN_BHK[k]; break; }
  }
  if (/\bfully[\s-]?furnished\b/.test(s))     out.furnishing = "Fully Furnished";
  else if (/\bsemi[\s-]?furnished\b/.test(s)) out.furnishing = "Semi-Furnished";
  else if (/\bunfurnished\b/.test(s))          out.furnishing = "Unfurnished";
  if (/\b(female|women|ladies|girl)\b/.test(s)) out.preference = "Females Only";
  else if (/\bbachelor/.test(s))                out.preference = "Bachelors Only";
  else if (/\bfamily\b/.test(s))                out.preference = "Family Only";
  else if (/\bworking\s+professional/.test(s))  out.preference = "Working Professionals";
  const toN = (d: string) => { const n = parseInt(d, 10); return n < 500 ? n * 1000 : n; };
  const um = s.match(/\b(?:under|below|upto|up\s+to|within|max)\s*(?:rs\.?)?\s*(\d+)\s*k?\b/);
  if (um) out.maxPrice = toN(um[1]);
  const am = s.match(/\b(?:above|over|more\s+than|minimum|min)\s*(?:rs\.?)?\s*(\d+)\s*k?\b/);
  if (am) out.minPrice = toN(am[1]);
  if (/\bbudget\b/.test(s) && !out.maxPrice)     out.maxPrice = 10000;
  if (/\baffordable\b/.test(s) && !out.maxPrice) out.maxPrice = 15000;
  if (/\b(luxury|premium)\b/.test(s) && !out.minPrice) out.minPrice = 20000;
  return out;
}

function applyFilters(data: Listing[], parsed: ParsedQuery, drops: FiltersState): Listing[] {
  const n = (s: string) => s.toLowerCase().trim();
  const al = (c: string) => (c === "bengaluru" ? "bangalore" : c);
  const city = al(n(drops.city || parsed.city));
  const bhk  = n(drops.bhk     || parsed.bhk);
  const furn = n(drops.furnishing || parsed.furnishing);
  const pref = n(drops.preference || parsed.preference);
  const minP = drops.minPrice !== "" ? Number(drops.minPrice) : parsed.minPrice;
  const maxP = drops.maxPrice !== "" ? Number(drops.maxPrice) : parsed.maxPrice;
  return data.filter(item => {
    if (city && al(n(item.city ?? "")) !== city) return false;
    if (bhk  && n(item.bhk_type ?? "") !== bhk)  return false;
    if (furn && n(item.furnishing ?? "") !== furn) return false;
    if (pref && n(item.owner_preference ?? "") !== pref) return false;
    const p = item.price ?? 0;
    if (minP !== null && p < (minP as number)) return false;
    if (maxP !== null && p > (maxP as number)) return false;
    return true;
  });
}

function hasIntent(q: string, f: FiltersState) {
  return q.trim().length > 0 || !!(f.city || f.bhk || f.furnishing || f.preference || f.priceRange);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function relTime(ts: string | null | undefined): string {
  if (!ts) return "Recently";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "Recently";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  if (h < 24) return h + "h ago";
  return dy + "d ago";
}

function getImg(item: Listing): string {
  if (item.image_urls) {
    const f = item.image_urls.split(",")[0].trim();
    if (f.startsWith("http")) return f;
  }
  let h = 0; const s = item.post_id || "";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return IMGS[h % IMGS.length];
}

function fmtPrice(n: number) {
  return "Rs." + n.toLocaleString("en-IN");
}

// ── Reusable pill select ───────────────────────────────────────────────────────

function FilterPill({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ appearance: "none", background: "#1a1a1a", border: "1px solid " + (value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "9999px", padding: "7px 14px", fontSize: "11px", fontWeight: 700, color: value ? "#a5b4fc" : "#71717a", cursor: "pointer", flex: "1 1 auto", minWidth: 0 }}
    >
      <option value="">{label}</option>
      {options.map(o => <option key={o} value={o} style={{ background: "#121212" }}>{o}</option>)}
    </select>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────

function Card({ item, onClick, liked, onLike }: {
  item: Listing; onClick: (i: Listing) => void; liked: boolean; onLike: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(item)}
      style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column" }}
      onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "rgba(99,102,241,0.4)"; d.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = "rgba(255,255,255,0.06)"; d.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "relative", height: "180px", overflow: "hidden", flexShrink: 0 }}>
        <img src={getImg(item)} alt="room" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy"
          onError={e => { (e.currentTarget as HTMLImageElement).src = IMGS[2]; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "44px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
          {item.bhk_type && <span style={{ background: "rgba(99,102,241,0.92)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: "9999px", fontSize: "9px", fontWeight: 900, color: "white", textTransform: "uppercase", whiteSpace: "nowrap" }}>{item.bhk_type}</span>}
          <span style={{ marginLeft: "auto", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", padding: "2px 7px", borderRadius: "9999px", fontSize: "9px", color: "#a1a1aa", whiteSpace: "nowrap" }}>{relTime(item.timestamp)}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onLike(item.post_id); }}
          style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", border: "none", borderRadius: "9999px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Heart size={14} fill={liked ? "#e11d48" : "none"} color={liked ? "#e11d48" : "#a1a1aa"} />
        </button>
      </div>
      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div>
          <p style={{ fontSize: "18px", fontWeight: 900, color: "white", margin: 0, lineHeight: 1 }}>
            {fmtPrice(item.price || 0)}<span style={{ fontSize: "11px", color: "#52525b", fontWeight: 600 }}>/mo</span>
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
            {'"'}{item.additional_description}{'"'}
          </p>
        )}
        <button style={{ width: "100%", padding: "10px", background: "#e11d48", color: "white", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", marginTop: "auto" }}>
          View Room
        </button>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]           = useState<"home" | "search" | "details">("home");
  const [allData, setAllData]     = useState<Listing[]>(PREVIEW);
  const [loadState, setLoadState] = useState<"preview" | "loading" | "done" | "error">("preview");
  const [query, setQuery]         = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [results, setResults]     = useState<Listing[]>([]);
  const [selected, setSelected]   = useState<Listing | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [filters, setFilters]     = useState<FiltersState>(EMPTY);
  const [liked, setLiked]         = useState<Record<string, boolean>>({});
  const [navVisible, setNavVisible] = useState(true);
  const [showTop, setShowTop]     = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [page, setPage]           = useState(1);
  const PAGE = 24;
  const lastY = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadLive = useCallback(() => {
    setLoadState("loading");
    fetch(API)
      .then(r => { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then((data: Listing[]) => {
        if (!Array.isArray(data) || !data.length) throw new Error("empty");
        setAllData(data); setLoadState("done");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(() => { loadLive(); }, [loadLive]);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setNavVisible(y <= 10 || y < lastY.current);
      setShowTop(y > 400);
      lastY.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const opts = useMemo(() => ({
    cities:      [...new Set(allData.map(d => d.city).filter((c): c is string => Boolean(c)))].sort(),
    types:       [...new Set(allData.map(d => d.bhk_type).filter((t): t is string => Boolean(t)))].sort(),
    furnishings: [...new Set(allData.map(d => d.furnishing).filter((f): f is string => Boolean(f)))].sort(),
    preferences: [...new Set(allData.map(d => d.owner_preference).filter((p): p is string => Boolean(p)))].sort(),
  }), [allData]);

  const runSearch = useCallback((q: string, f: FiltersState, data: Listing[]) => {
    setView("search"); setPage(1);
    setResults(applyFilters(data, parseQuery(q), f));
    setFilterOpen(false); window.scrollTo(0, 0);
  }, []);

  const trySearch = useCallback(() => {
    if (!hasIntent(query, filters)) {
      setShowNudge(true);
      setTimeout(() => setShowNudge(false), 3500);
      inputRef.current?.focus();
      return;
    }
    runSearch(query, filters, allData);
  }, [query, filters, allData, runSearch]);

  const searchCity = (city: string) => {
    const f = { ...EMPTY, city };
    setFilters(f); setQuery("");
    runSearch("", f, allData);
  };

  const searchHint = (hint: string) => {
    setQuery(hint);
    runSearch(hint, EMPTY, allData);
  };

  const openRoom   = (r: Listing) => { setSelected(r); setView("details"); setShowContact(false); window.scrollTo(0, 0); };
  const toggleLike = (id: string) => setLiked(l => ({ ...l, [id]: !l[id] }));
  const reset      = () => { setView("home"); setFilters(EMPTY); setQuery(""); setResults([]); setShowNudge(false); };
  const paged      = results.slice(0, page * PAGE);
  const scrollTop  = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // status badge
  const navBadge = () => {
    if (loadState === "loading") return <span style={{ fontSize: "9px", color: "#818cf8", display: "flex", alignItems: "center", gap: "4px" }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} />Loading</span>;
    if (loadState === "done")    return <span style={{ fontSize: "9px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "3px 10px", borderRadius: "9999px" }}>{allData.length} live</span>;
    if (loadState === "error")   return <span style={{ fontSize: "9px", color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "3px 10px", borderRadius: "9999px" }}>Preview</span>;
    return null;
  };

  // status hero banner
  const heroBanner = () => {
    const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "9999px", padding: "6px 14px", fontSize: "11px", fontWeight: 700 };
    if (loadState === "loading") return <div style={{ ...base, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8" }}><Loader size={11} style={{ animation: "spin 1s linear infinite" }} /> Connecting...</div>;
    if (loadState === "done")    return <div style={{ ...base, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>Live: {allData.length} listings across {opts.cities.length} cities</div>;
    if (loadState === "error")   return <div style={{ ...base, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}><AlertCircle size={11} /> Preview mode <button onClick={loadLive} style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", textDecoration: "underline", fontSize: "11px", fontWeight: 700, padding: 0 }}>Retry</button></div>;
    return <div style={{ ...base, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#818cf8" }}>Preview: {allData.length} listings</div>;
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#e4e4e7", fontFamily: "system-ui,sans-serif", overflowX: "hidden" }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes nudgeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        input, select, button { font-family: inherit; }
        @media (max-width: 600px) {
          .sbar { flex-wrap: wrap !important; border-radius: 16px !important; padding: 10px !important; }
          .sbar input { width: 100% !important; }
          .sbar .sa { width: 100% !important; justify-content: space-between !important; }
          .sbtn { flex: 1 !important; border-radius: 10px !important; }
          .fg { grid-template-columns: 1fr 1fr !important; }
          .rg { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 600px) {
          .rg { grid-template-columns: repeat(auto-fill,minmax(280px,1fr)) !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(8,8,8,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", height: "52px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", transition: "transform 0.3s", transform: navVisible ? "translateY(0)" : "translateY(-100%)" }}>
        <div onClick={reset} style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.05em", cursor: "pointer", color: "white" }}>roomy</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {navBadge()}
          <span onClick={reset} style={{ cursor: "pointer", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: view === "home" ? "white" : "#52525b" }}>Discover</span>
        </div>
      </nav>

      <main style={{ paddingTop: "52px" }}>

        {/* HOME */}
        {view === "home" && (
          <div style={{ minHeight: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px 48px" }}>
            <div style={{ width: "100%", maxWidth: "620px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", textAlign: "center" }}>

              {heroBanner()}

              <div>
                <h1 style={{ fontSize: "clamp(36px,9vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "white", margin: 0 }}>Find your next</h1>
                <h1 style={{ fontSize: "clamp(36px,9vw,72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#6366f1", margin: 0 }}>home.</h1>
              </div>

              <p style={{ color: "#52525b", fontSize: "14px", fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                Search listings across Kolkata, Bangalore, Delhi, Pune, Chennai and more
              </p>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* search bar */}
                <div className="sbar" style={{ background: "#111", border: "1px solid " + (showNudge ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "9999px", padding: "6px 6px 6px 16px", display: "flex", alignItems: "center", gap: "8px", width: "100%", boxShadow: showNudge ? "0 0 0 3px rgba(99,102,241,0.12)" : "0 20px 60px rgba(0,0,0,0.6)", transition: "border-color 0.2s,box-shadow 0.2s" }}>
                  <Search size={16} style={{ color: showNudge ? "#818cf8" : "#52525b", flexShrink: 0 }} />
                  <input
                    ref={inputRef}
                    autoFocus
                    style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "14px", color: "white", minWidth: 0, padding: "8px 0" }}
                    placeholder="Try 1BHK in Kolkata or 2BHK Delhi furnished"
                    value={query}
                    onChange={e => { setQuery(e.target.value); if (showNudge) setShowNudge(false); }}
                    onKeyDown={e => { if (e.key === "Enter") trySearch(); }}
                  />
                  <div className="sa" style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <button onClick={() => setFilterOpen(f => !f)} style={{ background: filterOpen ? "rgba(99,102,241,0.15)" : "none", border: "none", cursor: "pointer", padding: "8px", color: filterOpen ? "#818cf8" : "#52525b", borderRadius: "9999px", display: "flex" }}>
                      <SlidersHorizontal size={18} />
                    </button>
                    <button className="sbtn" onClick={trySearch} style={{ background: "white", color: "black", border: "none", borderRadius: "9999px", padding: "10px 20px", fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Search
                    </button>
                  </div>
                </div>

                {/* nudge */}
                {showNudge && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 16px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "12px", animation: "nudgeIn 0.25s ease", textAlign: "left" }}>
                    <Info size={15} style={{ flexShrink: 0, color: "#818cf8", marginTop: "2px" }} />
                    <span style={{ fontSize: "13px", color: "#a5b4fc", fontWeight: 500, lineHeight: 1.55 }}>
                      Let us know what you are looking for - a city, BHK type, or budget. We will find the best matches for you.
                    </span>
                  </div>
                )}

                {/* hint chips */}
                {!query && !showNudge && (
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", justifyContent: "center" }}>
                    {HINT_CHIPS.map(h => (
                      <button key={h} onClick={() => searchHint(h)}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "9999px", padding: "5px 13px", fontSize: "11px", color: "#52525b", cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}
                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#a5b4fc"; b.style.borderColor = "rgba(99,102,241,0.3)"; b.style.background = "rgba(99,102,241,0.06)"; }}
                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#52525b"; b.style.borderColor = "rgba(255,255,255,0.07)"; b.style.background = "rgba(255,255,255,0.04)"; }}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* filter panel */}
              {filterOpen && (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="fg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <FilterPill label="City"       options={opts.cities}      value={filters.city}       onChange={v => setFilters(f => ({ ...f, city: v }))} />
                    <FilterPill label="Type"       options={opts.types}       value={filters.bhk}        onChange={v => setFilters(f => ({ ...f, bhk: v }))} />
                    <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={v => setFilters(f => ({ ...f, furnishing: v }))} />
                    <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={v => setFilters(f => ({ ...f, preference: v }))} />
                  </div>
                  <select value={filters.priceRange}
                    onChange={e => { const o = PRICE_OPTIONS.find(x => x.label === e.target.value); setFilters(f => ({ ...f, priceRange: e.target.value, minPrice: o?.min ?? "", maxPrice: o?.max ?? "" })); }}
                    style={{ appearance: "none", background: "#1a1a1a", border: "1px solid " + (filters.priceRange ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", fontWeight: 700, color: filters.priceRange ? "#a5b4fc" : "#71717a", cursor: "pointer", width: "100%" }}>
                    <option value="">Price Range</option>
                    {PRICE_OPTIONS.map(o => <option key={o.label} value={o.label} style={{ background: "#121212" }}>{o.label}</option>)}
                  </select>
                  <button onClick={trySearch} style={{ width: "100%", padding: "12px", background: "#6366f1", color: "white", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer" }}>
                    Apply Filters
                  </button>
                </div>
              )}

              {/* city chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {opts.cities.map(c => (
                  <button key={c} onClick={() => searchCity(c)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9999px", padding: "7px 16px", fontSize: "12px", color: "#71717a", cursor: "pointer", fontWeight: 600, transition: "all 0.15s" }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "white"; b.style.borderColor = "rgba(255,255,255,0.25)"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#71717a"; b.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH */}
        {view === "search" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 12px 100px" }}>

            {/* inline search edit */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <Search size={13} style={{ color: "#52525b", flexShrink: 0 }} />
                <input
                  style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "13px", fontWeight: 600, color: "white", minWidth: 0 }}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") runSearch(query, filters, allData); }}
                  placeholder="Refine your search..."
                />
                {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: "2px", display: "flex", flexShrink: 0 }}><X size={13} /></button>}
              </div>
              <button onClick={() => setFilterOpen(f => !f)}
                style={{ background: filterOpen ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid " + (filterOpen ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"), borderRadius: "10px", padding: "9px 12px", cursor: "pointer", color: filterOpen ? "#818cf8" : "#71717a", display: "flex", alignItems: "center", flexShrink: 0 }}>
                <SlidersHorizontal size={15} />
              </button>
              <button onClick={() => runSearch(query, filters, allData)}
                style={{ background: "#6366f1", border: "none", color: "white", borderRadius: "10px", padding: "9px 16px", fontSize: "11px", fontWeight: 900, cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>
                Go
              </button>
            </div>

            {filterOpen && (
              <div style={{ marginBottom: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="fg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <FilterPill label="City"       options={opts.cities}      value={filters.city}       onChange={v => { const f = { ...filters, city: v };        setFilters(f); runSearch(query, f, allData); }} />
                  <FilterPill label="Type"       options={opts.types}       value={filters.bhk}        onChange={v => { const f = { ...filters, bhk: v };         setFilters(f); runSearch(query, f, allData); }} />
                  <FilterPill label="Furnishing" options={opts.furnishings} value={filters.furnishing} onChange={v => { const f = { ...filters, furnishing: v };  setFilters(f); runSearch(query, f, allData); }} />
                  <FilterPill label="Preference" options={opts.preferences} value={filters.preference} onChange={v => { const f = { ...filters, preference: v };  setFilters(f); runSearch(query, f, allData); }} />
                </div>
                <select value={filters.priceRange}
                  onChange={e => { const o = PRICE_OPTIONS.find(x => x.label === e.target.value); const f = { ...filters, priceRange: e.target.value, minPrice: o?.min ?? "", maxPrice: o?.max ?? "" }; setFilters(f); runSearch(query, f, allData); }}
                  style={{ appearance: "none", background: "#1a1a1a", border: "1px solid " + (filters.priceRange ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"), borderRadius: "9999px", padding: "8px 16px", fontSize: "11px", fontWeight: 700, color: filters.priceRange ? "#a5b4fc" : "#71717a", cursor: "pointer", width: "100%" }}>
                  <option value="">Price Range</option>
                  {PRICE_OPTIONS.map(o => <option key={o.label} value={o.label} style={{ background: "#121212" }}>{o.label}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#52525b" }}>
                {results.length} listing{results.length !== 1 ? "s" : ""}{loadState === "error" ? " (preview)" : ""}
              </span>
              <button onClick={reset} style={{ background: "none", border: "none", fontSize: "11px", color: "#818cf8", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textTransform: "uppercase" }}>Reset</button>
            </div>

            {results.length > 0 ? (
              <>
                <div className="rg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "12px" }}>
                  {paged.map(item => <Card key={item.post_id} item={item} onClick={openRoom} liked={!!liked[item.post_id]} onLike={toggleLike} />)}
                </div>
                {paged.length < results.length && (
                  <div style={{ textAlign: "center", marginTop: "28px" }}>
                    <button onClick={() => setPage(p => p + 1)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa", borderRadius: "9999px", padding: "12px 28px", fontSize: "11px", fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                      Load more - {results.length - paged.length} remaining
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 24px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "9999px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Search size={22} color="#6366f1" />
                </div>
                <p style={{ fontSize: "17px", fontWeight: 800, color: "#e4e4e7", margin: "0 0 8px" }}>No listings matched your search</p>
                <p style={{ fontSize: "13px", color: "#52525b", margin: "0 0 24px", lineHeight: 1.6 }}>
                  Try broadening your search - remove a filter, try a nearby city, or adjust your budget.
                </p>
                <button onClick={reset} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: "9999px", padding: "10px 24px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  Start over
                </button>
              </div>
            )}
          </div>
        )}

        {/* DETAILS */}
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
                    {fmtPrice(selected.price || 0)}<span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>/mo</span>
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "5px 0 0", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                    <MapPin size={10} />{[selected.bhk_type, selected.locality, selected.city].filter(Boolean).join(" - ")}
                  </p>
                </div>
                <button onClick={() => toggleLike(selected.post_id)}
                  style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "none", borderRadius: "9999px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Heart size={16} fill={liked[selected.post_id] ? "#e11d48" : "none"} color={liked[selected.post_id] ? "#e11d48" : "white"} />
                </button>
              </div>

              <div style={{ padding: "18px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
                  {[selected.furnishing, selected.accommodation_type, selected.owner_preference].filter(Boolean).map(t => (
                    <span key={t} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "5px 12px", borderRadius: "9999px", fontSize: "11px", color: "#818cf8", fontWeight: 700 }}>{t}</span>
                  ))}
                </div>

                {selected.additional_description && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginBottom: "18px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#52525b", margin: "0 0 8px" }}>About this place</p>
                    <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                      {'"'}{selected.additional_description}{'"'}
                    </p>
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
                      Facebook post
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

      {/* Chat FAB */}
      <button style={{ position: "fixed", bottom: "20px", right: "16px", width: "48px", height: "48px", background: "#6366f1", border: "none", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 28px rgba(99,102,241,0.5)", zIndex: 60 }}>
        <MessageSquare size={20} color="white" />
      </button>

      {/* Scroll-to-top FAB */}
      {view === "search" && (
        <button onClick={scrollTop}
          style={{ position: "fixed", bottom: "80px", right: "16px", width: "48px", height: "48px", background: "rgba(20,20,20,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 60, opacity: showTop ? 1 : 0, transform: showTop ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.25s,transform 0.25s", pointerEvents: showTop ? "auto" : "none" }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(99,102,241,0.15)"; b.style.borderColor = "rgba(99,102,241,0.4)"; }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(20,20,20,0.95)"; b.style.borderColor = "rgba(255,255,255,0.12)"; }}>
          <ArrowUp size={18} color="#a1a1aa" />
        </button>
      )}
    </div>
  );
}
