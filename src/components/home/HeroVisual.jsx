/**
 * HeroVisual — right-side "software engineering showcase"  (Round 4)
 *
 * NO real mockup/project images — EVER.
 * The laptop cycles 4 generic CSS mini-template screens only.
 *
 * LAYOUT STRATEGY
 * ───────────────
 * The stage is a fixed 500 × 520 px logical box rendered at 100% container
 * width via `transform: scale(containerW / 500)` with `transform-origin`
 * top-left.  Every element is placed at fixed pixel coordinates so positions
 * are deterministic regardless of viewport.  No percentage-based offsets.
 *
 * Explicit non-overlapping grid (px, W=500 H=520):
 *   Core 88×88    centre   (206,141)–(294,229)   z=10
 *   Laptop 240×175         (130,328)–(370,503)   z=15  — 99 px gap below core
 *   CodeCard 188×112        (  8, 10)–(196,122)   z=20
 *   ChatCard 170×112        (322, 16)–(492,128)   z=20
 *   DashCard 152× 90        (  8,392)–(160,482)   z=22  — clears laptop left (130)
 *   MobileCard 76×120       (416,382)–(492,502)   z=22  — clears laptop right (370)
 *
 * Z-layers (back→front):
 *   z-1   Ambient shapes
 *   z-2   SVG orbit rings + connection lines
 *   z-5   Orbit nodes
 *   z-10  Glass core
 *   z-15  Laptop (focal point)
 *   z-20  Code card, Chat card  (behind laptop)
 *   z-22  Dashboard, Mobile app (in front at bottom corners, don't cross laptop)
 *   z-30  Pointer spotlight
 *
 * Shared component changes: NONE — this file is hero-only.
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import { useReducedMotion } from '@/hooks/useMotionPreference';
import { getIcon } from '@/utils/iconMap';
import { BarChart2, MessageSquare } from 'lucide-react';
import { SPMark } from '@/components/ui/Logo';
import Sparkle from '@/components/ui/Sparkle';

/* ─── stage dimensions (logical px) ────────────────────────────────────── */
const SW = 500;   // stage width
const SH = 520;   // stage height

/* ─── orbit / animation constants ──────────────────────────────────────── */
const ORBIT_DURATION_1  = 28;
const ORBIT_DURATION_2  = 44;
const TEMPLATE_CYCLE_MS = 3500;

/* ─── core position (px) ────────────────────────────────────────────────── */
const CX = SW / 2;      // 250
const CY = 185;          // 185px from top  — well above laptop top (328)
const R1  = 100;
const R2  = 158;

/* ─── helpers ───────────────────────────────────────────────────────────── */

function iconForService(service) {
  const str = `${service?.slug || ''} ${service?.title_en || service?.title || ''}`.toLowerCase();
  if (/web|site|front/.test(str))          return 'Globe';
  if (/mobile|app|ios|android/.test(str))  return 'Smartphone';
  if (/erp|enterprise|system/.test(str))   return 'LayoutGrid';
  if (/crm|customer|relation/.test(str))   return 'Users';
  if (/ai|chatbot|chat|bot|nlp/.test(str)) return 'MessageSquare';
  if (/data|analytic|bi|report/.test(str)) return 'BarChart2';
  if (/cloud|infra|devops|deploy/.test(str))return 'Cloud';
  if (/design|ui|ux/.test(str))            return 'Layers';
  if (/security|auth/.test(str))           return 'Shield';
  if (/api|backend|server/.test(str))      return 'Code2';
  return 'Cpu';
}

const FALLBACK_NODES = [
  { id: 'f1', label: 'Web Apps',      icon: 'Globe'         },
  { id: 'f2', label: 'Mobile',        icon: 'Smartphone'    },
  { id: 'f3', label: 'AI & Chatbots', icon: 'MessageSquare' },
  { id: 'f4', label: 'Analytics',     icon: 'BarChart2'     },
  { id: 'f5', label: 'Cloud',         icon: 'Cloud'         },
  { id: 'f6', label: 'ERP / CRM',     icon: 'LayoutGrid'    },
];

function buildNodes(services) {
  const src = services && services.length > 0
    ? services.slice(0, 6).map(s => ({
        id:    s.id || s.slug,
        label: s.title_en || s.title || 'Service',
        icon:  iconForService(s),
      }))
    : FALLBACK_NODES;
  while (src.length < 3) src.push(FALLBACK_NODES[src.length]);
  return src;
}

function nodePositions(count, radiusPx) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return { x: radiusPx * Math.cos(angle), y: radiusPx * Math.sin(angle) };
  });
}

/* ─── 4 CSS mini-template screens — no real content ────────────────────── */
const CSS_TEMPLATES = [
  /* 0: Classic landing */
  ({ animate }) => (
    <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(180deg,#01120F 0%,#022820 100%)' }}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 flex-shrink-0">
        <div style={{ width:24,height:8,borderRadius:3,background:'rgba(13,158,130,0.60)' }} />
        {[40,32,36].map((w,i)=><div key={i} style={{width:w,height:6,borderRadius:3,background:'rgba(255,255,255,0.10)'}} />)}
        <div style={{marginLeft:'auto',width:36,height:14,borderRadius:6,background:'rgba(13,158,130,0.45)'}} />
      </div>
      <div className="px-3 py-2.5 flex-shrink-0" style={{background:'rgba(13,158,130,0.07)'}}>
        <div style={{width:'75%',height:10,borderRadius:4,background:'rgba(13,158,130,0.55)',marginBottom:6}} />
        <div style={{width:'55%',height:6,borderRadius:3,background:'rgba(255,255,255,0.14)',marginBottom:10}} />
        <div className="flex gap-1.5">
          <div style={{width:48,height:16,borderRadius:6,background:'rgba(13,158,130,0.60)'}} />
          <div style={{width:44,height:16,borderRadius:6,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(13,158,130,0.30)'}} />
        </div>
      </div>
      <div className="flex gap-2 px-3 py-2 flex-1 overflow-hidden">
        {[65,80,55].map((h,i)=>(
          <div key={i} className="flex-1 flex flex-col gap-1 p-1.5 rounded" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(13,158,130,0.12)'}}>
            <div style={{width:'100%',height:`${h}%`,maxHeight:28,borderRadius:3,background:'rgba(13,158,130,0.22)'}} />
            <div style={{width:'80%',height:5,borderRadius:3,background:'rgba(255,255,255,0.12)'}} />
            <div style={{width:'55%',height:4,borderRadius:3,background:'rgba(255,255,255,0.07)'}} />
          </div>
        ))}
      </div>
    </div>
  ),
  /* 1: Dashboard / SaaS */
  ({ animate }) => (
    <div className="w-full h-full flex" style={{background:'#011810'}}>
      <div className="flex-shrink-0 py-2 px-1.5 flex flex-col gap-1.5" style={{width:32,background:'rgba(13,158,130,0.08)',borderRight:'1px solid rgba(13,158,130,0.12)'}}>
        <div style={{width:20,height:20,borderRadius:5,background:'rgba(13,158,130,0.45)',margin:'0 auto 4px'}} />
        {[1,2,3,4].map(i=><div key={i} style={{width:20,height:14,borderRadius:4,background:i===1?'rgba(13,158,130,0.35)':'rgba(255,255,255,0.06)',margin:'0 auto'}} />)}
      </div>
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          {[['Sessions','#26B59A'],['Conv.','#55C8B1'],['Revenue','#0D9E82']].map(([l,c],i)=>(
            <div key={i} className="flex-1 p-1.5 rounded" style={{background:'rgba(13,158,130,0.10)',border:`1px solid ${c}25`}}>
              <div style={{width:'60%',height:4,borderRadius:2,background:'rgba(255,255,255,0.15)',marginBottom:4}} />
              <div style={{width:'40%',height:8,borderRadius:3,background:c,opacity:0.7}} />
            </div>
          ))}
        </div>
        <div className="flex-1 rounded p-1.5 flex flex-col" style={{background:'rgba(13,158,130,0.06)',border:'1px solid rgba(13,158,130,0.12)'}}>
          <div style={{width:48,height:5,borderRadius:2,background:'rgba(255,255,255,0.15)',marginBottom:6}} />
          <div className="flex items-end gap-1 flex-1">
            {[35,55,45,70,60,80,65].map((h,i)=>(
              <div key={i} className="flex-1 rounded-t-sm" style={{
                height:`${h}%`,background:'linear-gradient(to top,#06796A,#26B59A)',opacity:0.75,
                transformOrigin:'bottom',
                ...(animate?{animation:`bar-grow 0.5s ease-out ${0.3+i*0.07}s both`}:{}),
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  /* 2: E-commerce */
  ({ animate }) => (
    <div className="w-full h-full flex flex-col" style={{background:'#011810'}}>
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5 flex-shrink-0">
        <div style={{width:20,height:7,borderRadius:2,background:'rgba(13,158,130,0.55)'}} />
        <div style={{flex:1,height:10,borderRadius:4,background:'rgba(255,255,255,0.06)'}} />
        <div style={{width:20,height:10,borderRadius:10,background:'rgba(13,158,130,0.30)'}} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2 flex-1">
        {[1,2,3,4,5,6].map(i=>(
          <div key={i} className="flex flex-col rounded overflow-hidden" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(13,158,130,0.10)'}}>
            <div style={{height:28,background:`linear-gradient(135deg,rgba(13,158,130,${0.15+(i%3)*0.08}),rgba(4,77,64,${0.10+(i%2)*0.06}))`}} />
            <div className="p-1">
              <div style={{width:'75%',height:4,borderRadius:2,background:'rgba(255,255,255,0.14)',marginBottom:3}} />
              <div style={{width:'50%',height:5,borderRadius:2,background:'rgba(13,158,130,0.45)'}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  /* 3: Corporate */
  ({ animate }) => (
    <div className="w-full h-full flex flex-col" style={{background:'linear-gradient(180deg,#022018 0%,#011210 100%)'}}>
      <div className="flex items-center px-2 py-1.5 gap-1.5 flex-shrink-0 border-b border-white/5">
        <div style={{width:22,height:8,borderRadius:2,background:'rgba(13,158,130,0.55)'}} />
        {[1,2,3].map(i=><div key={i} style={{width:28,height:5,borderRadius:2,background:'rgba(255,255,255,0.09)'}} />)}
      </div>
      <div className="px-2 py-2 flex-shrink-0 flex items-center gap-2" style={{background:'rgba(13,158,130,0.06)'}}>
        <div className="flex-1">
          <div style={{width:'80%',height:8,borderRadius:3,background:'rgba(13,158,130,0.60)',marginBottom:4}} />
          <div style={{width:'55%',height:5,borderRadius:2,background:'rgba(255,255,255,0.14)',marginBottom:6}} />
          <div style={{width:42,height:13,borderRadius:5,background:'rgba(13,158,130,0.55)'}} />
        </div>
        <div style={{width:36,height:36,borderRadius:6,background:'rgba(13,158,130,0.18)',border:'1px solid rgba(13,158,130,0.30)'}} />
      </div>
      <div className="flex gap-1.5 px-2 py-1.5 flex-1">
        {[0,1,2].map(i=>(
          <div key={i} className="flex-1 p-1.5 rounded flex flex-col gap-1" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(13,158,130,0.10)'}}>
            <div style={{width:16,height:16,borderRadius:4,background:'rgba(13,158,130,0.30)'}} />
            <div style={{width:'80%',height:5,borderRadius:2,background:'rgba(255,255,255,0.14)'}} />
            <div style={{width:'60%',height:4,borderRadius:2,background:'rgba(255,255,255,0.08)'}} />
          </div>
        ))}
      </div>
    </div>
  ),
];

/* ─── LaptopFrame — always CSS templates, never real images ─────────────── */
const LaptopFrame = ({ animate }) => {
  const [tplIdx, setTplIdx] = useState(0);
  const [fade,   setFade]   = useState(true);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setTplIdx(i => (i + 1) % CSS_TEMPLATES.length); setFade(true); }, 320);
    }, TEMPLATE_CYCLE_MS);
    return () => clearInterval(id);
  }, [animate]);

  const Template = CSS_TEMPLATES[tplIdx];

  return (
    <div style={{ width: 240, position: 'relative' }} aria-hidden="true">
      {/* Screen bezel */}
      <div
        style={{
          background: '#01120F',
          border: '2px solid rgba(13,158,130,0.42)',
          boxShadow: '0 0 50px rgba(13,158,130,0.22), 0 20px 48px rgba(0,0,0,0.65)',
          borderRadius: '12px 12px 2px 2px',
          aspectRatio: '16/10',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Browser chrome */}
        <div style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 8px',background:'rgba(2,35,30,0.95)',borderBottom:'1px solid rgba(13,158,130,0.15)' }}>
          <div style={{ width:7,height:7,borderRadius:'50%',background:'rgba(239,68,68,0.60)' }} />
          <div style={{ width:7,height:7,borderRadius:'50%',background:'rgba(234,179,8,0.60)' }} />
          <div style={{ width:7,height:7,borderRadius:'50%',background:'rgba(34,197,94,0.60)' }} />
          <div style={{ marginLeft:6,flex:1,height:11,borderRadius:3,display:'flex',alignItems:'center',padding:'0 6px',background:'rgba(13,158,130,0.12)',fontSize:7,fontFamily:'monospace',color:'rgba(255,255,255,0.35)' }}>
            sentivra.com
          </div>
        </div>
        {/* Template content with fade transition */}
        <div style={{ width:'100%', height:'calc(100% - 23px)', opacity: fade ? 1 : 0, transition:'opacity 0.3s ease' }}>
          <Template animate={animate} />
        </div>
      </div>
      {/* Hinge */}
      <div style={{ height:5,width:'100%',background:'linear-gradient(to right,#01120F,rgba(13,158,130,0.30),#01120F)' }} />
      {/* Base */}
      <div style={{ margin:'0 20px',height:7,borderRadius:'0 0 8px 8px',background:'rgba(13,158,130,0.18)',boxShadow:'0 6px 20px rgba(0,0,0,0.50)' }} />
      {/* Floor glow */}
      <div style={{ position:'absolute',bottom:-12,left:'50%',transform:'translateX(-50%)',width:'85%',height:18,background:'radial-gradient(ellipse,rgba(13,158,130,0.25) 0%,transparent 70%)',filter:'blur(8px)',pointerEvents:'none' }} />
    </div>
  );
};

/* ─── Glass core ─────────────────────────────────────────────────────────── */
const GlassCore = ({ size = 88, animate }) => (
  <div style={{
    width: size, height: size,
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(13,158,130,0.28), rgba(4,77,64,0.38))',
    border: '1.5px solid rgba(13,158,130,0.52)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 0 40px rgba(13,158,130,0.32), inset 0 1px 0 rgba(255,255,255,0.14)',
  }}>
    {[1,2].map(i => (
      <div key={i} style={{
        position:'absolute', inset:0, borderRadius:16,
        border:'1.5px solid rgba(13,158,130,0.25)',
        ...(animate ? { animation:`pulse-ring 2.6s ease-out ${i*0.9}s infinite`, willChange:'transform,opacity' } : { opacity:0 }),
      }} />
    ))}
    <SPMark size={Math.round(size * 0.50)} markColor="#FFFFFF" showBg={false} />
    <div style={{ position:'absolute', top:-7, right:-7 }}>
      <Sparkle size={15} color="#B2F0E0" glow animate={animate} />
    </div>
  </div>
);

/* ─── Service orbit node ─────────────────────────────────────────────────── */
const ServiceNode = ({ node, hovered, onHover, animate }) => {
  const Icon = getIcon(node.icon, getIcon('Cpu'));
  const hi   = hovered === node.id;
  return (
    <div
      style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'default' }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="listitem"
      aria-label={node.label}
    >
      <div style={{
        width:40, height:40, borderRadius:10,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.25s',
        background: hi
          ? 'linear-gradient(135deg,rgba(13,158,130,0.52),rgba(4,77,64,0.62))'
          : 'linear-gradient(135deg,rgba(13,158,130,0.18),rgba(4,77,64,0.26))',
        border: `1.5px solid ${hi ? 'rgba(13,158,130,0.72)' : 'rgba(13,158,130,0.30)'}`,
        backdropFilter:'blur(12px)',
        boxShadow: hi ? '0 0 22px rgba(13,158,130,0.38)' : 'none',
        transform: hi ? 'scale(1.14)' : 'scale(1)',
      }}>
        <Icon style={{ width:18,height:18,color:'#55C8B1' }} aria-hidden="true" />
      </div>
      {/* Tooltip */}
      <span style={{
        position:'absolute', top:'calc(100% + 5px)',
        padding:'2px 6px', borderRadius:5, fontSize:9, fontWeight:700, whiteSpace:'nowrap',
        pointerEvents:'none', transition:'all 0.2s',
        background:'rgba(2,35,30,0.92)',
        border:'1px solid rgba(13,158,130,0.35)',
        color:'#B2F0E0',
        opacity: hi ? 1 : 0,
        transform: hi ? 'translateY(0)' : 'translateY(-4px)',
      }}>
        {node.label}
      </span>
    </div>
  );
};

/* ─── SVG connection lines ───────────────────────────────────────────────── */
const OrbitLines = ({ nodes, positions, cx, cy, hovered, animate }) => (
  <svg
    style={{ position:'absolute', inset:0, width:SW, height:SH, overflow:'visible', pointerEvents:'none' }}
    aria-hidden="true"
  >
    {nodes.map((node, i) => {
      const p  = positions[i];
      const nx = cx + p.x;
      const ny = cy + p.y;
      const hi = hovered === node.id;
      return (
        <g key={node.id}>
          <line x1={cx} y1={cy} x2={nx} y2={ny}
            stroke={hi ? 'rgba(13,158,130,0.65)' : 'rgba(13,158,130,0.22)'}
            strokeWidth={hi ? 1.5 : 1}
            strokeDasharray="4 6"
            style={{ transition:'stroke 0.3s,stroke-width 0.3s' }}
          />
          {animate && (
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke="rgba(178,240,224,0.80)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="8 200"
              style={{ animation:`pulse-travel ${2+i*0.4}s linear ${i*0.6}s infinite`, willChange:'stroke-dashoffset' }}
            />
          )}
        </g>
      );
    })}
  </svg>
);

/* ─── Code card ─────────────────────────────────────────────────────────── */
const CodeCard = ({ animate }) => {
  const lines = [
    [{ t:'const ', c:'#55C8B1' },{ t:'app', c:'#E0F4EF' },{ t:' = {', c:'#B2F0E0' }],
    [{ t:'  build:', c:'#B2F0E0' },{ t:' "web"', c:'#26B59A' }],
    [{ t:'  deploy:', c:'#B2F0E0' },{ t:' true', c:'#55C8B1' }],
    [{ t:'  version:', c:'#B2F0E0' },{ t:' "2.0"', c:'#26B59A' }],
    [{ t:'}', c:'#E0F4EF' }],
    [{ t:'export ', c:'#55C8B1' },{ t:'default', c:'#55C8B1' },{ t:' app', c:'#E0F4EF' }],
  ];
  return (
    <div style={{
      width:188, background:'rgba(1,18,15,0.93)',
      border:'1px solid rgba(13,158,130,0.38)',
      backdropFilter:'blur(14px)',
      boxShadow:'0 10px 32px rgba(0,0,0,0.42)',
      borderRadius:10, overflow:'hidden',
    }} aria-hidden="true">
      {/* Window chrome */}
      <div style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {[['rgba(239,68,68,0.70)'],['rgba(234,179,8,0.70)'],['rgba(34,197,94,0.70)']].map(([c],i)=>(
          <div key={i} style={{ width:9,height:9,borderRadius:'50%',background:c }} />
        ))}
        <span style={{ marginLeft:6,fontFamily:'monospace',fontSize:9,color:'rgba(255,255,255,0.30)' }}>app.ts</span>
      </div>
      {/* Code lines */}
      <div style={{ padding:'8px 10px', fontFamily:'monospace', fontSize:10, lineHeight:1.65 }}>
        {lines.map((tokens, li) => (
          <div key={li}>
            {tokens.map((tk,ti)=><span key={ti} style={{color:tk.c}}>{tk.t}</span>)}
            {li === lines.length-1 && (
              <span style={{
                display:'inline-block',width:6,height:12,background:'#26B59A',marginLeft:2,verticalAlign:'text-bottom',
                ...(animate?{animation:'caret-blink 1.1s step-end infinite'}:{opacity:1}),
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Dashboard card ────────────────────────────────────────────────────── */
const DashboardCard = ({ animate }) => {
  const bars = [42,65,50,82,60,76];
  return (
    <div style={{
      width:148, padding:'9px 9px 7px',
      background:'rgba(3,40,32,0.90)',
      border:'1px solid rgba(13,158,130,0.36)',
      backdropFilter:'blur(14px)',
      boxShadow:'0 10px 28px rgba(0,0,0,0.42)',
      borderRadius:10, overflow:'hidden',
    }} aria-hidden="true">
      {/* Header row */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7 }}>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          <BarChart2 size={11} style={{ color:'#55C8B1' }} />
          <span style={{ fontSize:9,fontWeight:700,color:'#B2F0E0',textTransform:'uppercase',letterSpacing:'0.08em' }}>Analytics</span>
        </div>
        {/* Live chip — corner-only, tight */}
        <div style={{ display:'flex',alignItems:'center',gap:3,padding:'1px 5px',borderRadius:20,background:'rgba(13,158,130,0.22)',fontSize:8,fontWeight:700,color:'#55C8B1' }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:'#26B59A',display:'inline-block',
            ...(animate?{animation:'live-pulse 1.4s ease-in-out infinite'}:{opacity:1}) }} />
          Live
        </div>
      </div>
      {/* Day labels */}
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
        {['M','T','W','T','F','S'].map((d,i)=>(
          <span key={i} style={{ fontSize:8,color:'rgba(255,255,255,0.35)',width:'14%',textAlign:'center' }}>{d}</span>
        ))}
      </div>
      {/* Bar chart */}
      <div style={{ display:'flex',alignItems:'flex-end',gap:3,height:36 }}>
        {bars.map((h,i)=>(
          <div key={i} style={{
            flex:1, borderRadius:'2px 2px 0 0',
            height:`${h}%`, background:'linear-gradient(to top,#06796A,#26B59A)',
            opacity:0.80+(i%2)*0.14, transformOrigin:'bottom',
            ...(animate?{animation:`bar-grow 0.5s cubic-bezier(0.4,0,0.2,1) ${0.8+i*0.08}s both`}:{}),
          }} />
        ))}
      </div>
    </div>
  );
};

/* ─── Chat card ─────────────────────────────────────────────────────────── */
const ChatCard = ({ animate }) => (
  <div style={{
    width:166, padding:'8px 10px 10px',
    background:'rgba(2,28,22,0.92)',
    border:'1px solid rgba(13,158,130,0.32)',
    backdropFilter:'blur(14px)',
    boxShadow:'0 10px 28px rgba(0,0,0,0.42)',
    borderRadius:10, overflow:'hidden',
  }} aria-hidden="true">
    {/* Header */}
    <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:8 }}>
      <div style={{ width:20,height:20,borderRadius:7,background:'rgba(13,158,130,0.30)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
        <MessageSquare size={11} style={{ color:'#55C8B1' }} />
      </div>
      <span style={{ fontSize:10,fontWeight:700,color:'#B2F0E0',letterSpacing:'0.03em' }}>AI Assistant</span>
      <span style={{ marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#26B59A',
        ...(animate?{animation:'live-pulse 2s ease-in-out infinite'}:{opacity:1}) }} />
    </div>
    {/* Message bubble */}
    <div style={{ background:'rgba(13,158,130,0.18)',borderRadius:'0 8px 8px 8px',padding:'5px 8px',maxWidth:'88%',marginBottom:7 }}>
      <span style={{ fontSize:11,color:'rgba(255,255,255,0.90)',lineHeight:1.4 }}>How can I help you?</span>
    </div>
    {/* Typing dots */}
    <div style={{ display:'inline-flex',alignItems:'center',gap:4,background:'rgba(13,158,130,0.12)',borderRadius:'0 8px 8px 8px',padding:'5px 10px' }}>
      {[0,1,2].map(i=>(
        <span key={i} style={{ width:6,height:6,borderRadius:'50%',background:'#55C8B1',
          ...(animate?{animation:`typing-dot 1.4s ease-in-out ${i*0.2}s infinite`}:{opacity:1}) }} />
      ))}
    </div>
  </div>
);

/* ─── Mobile app card ────────────────────────────────────────────────────── */
const MobileAppCard = ({ animate }) => (
  <div style={{
    width:72, background:'rgba(3,40,32,0.87)',
    border:'1px solid rgba(13,158,130,0.30)',
    backdropFilter:'blur(12px)',
    boxShadow:'0 8px 24px rgba(0,0,0,0.40)',
    borderRadius:10, overflow:'hidden',
  }} aria-hidden="true">
    {/* Notch */}
    <div style={{ display:'flex',justifyContent:'center',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width:24,height:4,borderRadius:10,background:'rgba(255,255,255,0.10)' }} />
    </div>
    {/* Screen */}
    <div style={{ height:66,overflow:'hidden',position:'relative' }}>
      <div style={animate?{animation:'scroll-up-slow 6s linear 1s infinite',willChange:'transform'}:{}}>
        {[...Array(12)].map((_,i)=>(
          <div key={i} style={{ padding:'3px 6px',borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ height:4,borderRadius:3,background:'rgba(13,158,130,0.42)',width:`${56+(i%3)*14}%`,marginBottom:3 }} />
            <div style={{ height:3,borderRadius:3,background:'rgba(255,255,255,0.09)',width:`${36+(i%4)*10}%` }} />
          </div>
        ))}
      </div>
    </div>
    {/* Home bar */}
    <div style={{ display:'flex',justifyContent:'center',padding:'3px 0' }}>
      <div style={{ width:18,height:3,borderRadius:10,background:'rgba(255,255,255,0.18)' }} />
    </div>
  </div>
);

/* ─── Ambient shapes ─────────────────────────────────────────────────────── */
const AmbientShapes = ({ animate }) => {
  const shapes = [
    { type:'ring',   left:30,  top:40,  size:16, delay:0,   dur:7  },
    { type:'ring',   left:432, top:360, size:12, delay:1.2, dur:9  },
    { type:'square', left:388, top:48,  size:9,  delay:0.5, dur:8  },
    { type:'plus',   left:48,  top:400, size:10, delay:2,   dur:10 },
    { type:'dot',    left:306, top:30,  size:4,  delay:0.8, dur:6  },
    { type:'dot',    left:112, top:230, size:3,  delay:1.5, dur:7  },
    { type:'ring',   left:260, top:468, size:13, delay:3,   dur:11 },
    { type:'square', left:18,  top:272, size:7,  delay:2.5, dur:9  },
  ];
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:1 }} aria-hidden="true">
      {shapes.map((s,i) => (
        <div key={i} style={{
          position:'absolute', left:s.left, top:s.top, opacity:0.07,
          ...(animate?{animation:`float-delayed ${s.dur}s ease-in-out ${s.delay}s infinite`}:{}),
        }}>
          {s.type==='ring'   && <div style={{width:s.size,height:s.size,borderRadius:'50%',border:'1.5px solid #26B59A'}} />}
          {s.type==='square' && <div style={{width:s.size,height:s.size,borderRadius:2,border:'1.5px solid #26B59A',transform:'rotate(15deg)'}} />}
          {s.type==='plus'   && <svg width={s.size} height={s.size} viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="#26B59A" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          {s.type==='dot'    && <div style={{width:s.size,height:s.size,borderRadius:'50%',background:'#26B59A'}} />}
        </div>
      ))}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
// mockupImages prop intentionally absent — visual never shows real images
export default function HeroVisual({ services = [], isRTL = false }) {
  const shouldReduceMotion = useReducedMotion();
  const saveData = typeof navigator !== 'undefined' &&
    (navigator.connection?.saveData || navigator.connection?.effectiveType === 'slow-2g');
  const lowPower = shouldReduceMotion || saveData;
  const animate  = !shouldReduceMotion;
  const full     = !lowPower;

  const containerRef = useRef(null);
  const stageRef     = useRef(null);

  /* Responsive scale: stage is 500px wide logically; scale to container width */
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.min(w / SW, 1.1)); // cap at 1.1× to avoid too-large
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const [paused,    setPaused]    = useState(false);
  const [hovered,   setHovered]   = useState(null);
  const [tilt,      setTilt]      = useState({ rx:0, ry:0 });
  const [spotlight, setSpotlight] = useState({ x:50, y:50 });

  /* Pause on visibility / off-screen */
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    if (!stageRef.current) return;
    const obs = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold:0.1 });
    obs.observe(stageRef.current);
    return () => { document.removeEventListener('visibilitychange', onVis); obs.disconnect(); };
  }, []);

  /* Pointer tilt + spotlight */
  const onMouseMove = useCallback((e) => {
    if (!full || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    setTilt({ rx:(y-0.5)*-6, ry:(x-0.5)*6 });
    setSpotlight({ x:x*100, y:y*100 });
  }, [full]);
  const onMouseLeave = useCallback(() => setTilt({ rx:0, ry:0 }), []);

  /* Build nodes */
  const nodes      = useMemo(() => buildNodes(services), [services]);
  const innerNodes = nodes.slice(0, Math.min(3, nodes.length));
  const outerNodes = nodes.slice(3);
  const innerPos   = nodePositions(innerNodes.length, R1);
  const outerPos   = nodePositions(outerNodes.length, R2);

  const playState = paused && animate ? 'paused' : 'running';

  /* Stage height preserves aspect ratio */
  const stageH = SH * scale;

  return (
    /* Outer: fills the right hero column, centres the stage */
    <div
      ref={containerRef}
      className="relative w-full select-none flex items-center justify-center"
      style={{ minHeight: 400 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Stage: fixed logical size, scaled via transform */}
      <div
        ref={stageRef}
        style={{
          width:  SW,
          height: SH,
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          /* perspective for tilt */
          perspective: '1200px',
        }}
        role="img"
        aria-label="Software engineering illustration"
      >
        {/* L1: Ambient shapes */}
        {full && <AmbientShapes animate={animate && !paused} />}

        {/* L2: SVG orbit rings + connection lines — exact stage dimensions */}
        <svg
          style={{ position:'absolute',inset:0,width:SW,height:SH,overflow:'visible',pointerEvents:'none',zIndex:2 }}
          aria-hidden="true"
        >
          {/* Inner ring */}
          <circle cx={CX} cy={CY} r={R1} fill="none" stroke="rgba(13,158,130,0.15)" strokeWidth={1} strokeDasharray="3 8"
            style={animate?{ transformOrigin:`${CX}px ${CY}px`, animation:`orbit-cw ${ORBIT_DURATION_1*2}s linear infinite`, animationPlayState:playState }:{}} />
          {/* Outer ring */}
          <circle cx={CX} cy={CY} r={R2} fill="none" stroke="rgba(13,158,130,0.10)" strokeWidth={1} strokeDasharray="4 12"
            style={animate?{ transformOrigin:`${CX}px ${CY}px`, animation:`orbit-ccw ${ORBIT_DURATION_2*2}s linear infinite`, animationPlayState:playState }:{}} />
          <OrbitLines
            nodes={[...innerNodes,...outerNodes]}
            positions={[...innerPos,...outerPos]}
            cx={CX} cy={CY}
            hovered={hovered}
            animate={animate && !paused}
          />
        </svg>

        {/* Tiltable inner stage — only transform, never affects layout */}
        <div style={{
          position:'absolute', inset:0,
          transform: full ? `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` : 'none',
          transition: 'transform 0.2s ease-out',
        }}>
          {/* L3: Inner orbit nodes
              transformOrigin must be CX,CY relative to the stage, not 0,0 */}
          <div style={{
            position:'absolute', left:CX, top:CY, width:0, height:0,
            transformOrigin:'0 0',
            zIndex:5,
            ...(animate?{ animation:`orbit-cw ${ORBIT_DURATION_1}s linear infinite`, animationPlayState:playState, willChange:'transform' }:{}),
          }}>
            {innerNodes.map((node,i) => (
              <div key={node.id} style={{
                position:'absolute',
                transform:`translate(${innerPos[i].x}px,${innerPos[i].y}px)`,
                marginLeft:-20, marginTop:-20,
                ...(animate?{ animation:`counter-cw ${ORBIT_DURATION_1}s linear infinite`, animationPlayState:playState }:{}),
              }}>
                <ServiceNode node={node} hovered={hovered} onHover={setHovered} animate={animate} />
              </div>
            ))}
          </div>

          {/* L3: Outer orbit nodes */}
          {outerNodes.length > 0 && (
            <div style={{
              position:'absolute', left:CX, top:CY, width:0, height:0,
              transformOrigin:'0 0',
              zIndex:5,
              ...(animate?{ animation:`orbit-ccw ${ORBIT_DURATION_2}s linear infinite`, animationPlayState:playState, willChange:'transform' }:{}),
            }}>
              {outerNodes.map((node,i) => (
                <div key={node.id} style={{
                  position:'absolute',
                  transform:`translate(${outerPos[i].x}px,${outerPos[i].y}px)`,
                  marginLeft:-20, marginTop:-20,
                  ...(animate?{ animation:`counter-ccw ${ORBIT_DURATION_2}s linear infinite`, animationPlayState:playState }:{}),
                }}>
                  <ServiceNode node={node} hovered={hovered} onHover={setHovered} animate={animate} />
                </div>
              ))}
            </div>
          )}

          {/* L10: Glass core — exact pixel centre */}
          <div style={{ position:'absolute', left:CX-44, top:CY-44, zIndex:10 }}>
            <GlassCore size={88} animate={animate && !paused} />
          </div>

          {/* L15: Laptop — bottom-centre, 99 px gap below core bottom (CY+44=229, laptop top=328) */}
          <div style={{
            position:'absolute', left:130, top:328, zIndex:15,
            ...(animate && !paused ? { animation:'float 9s ease-in-out 0s infinite', willChange:'transform' } : {}),
          }}>
            <LaptopFrame animate={animate && !paused} />
          </div>

          {/* L20: Code card — top-left corner (8,10), bottom=122, clear of orbit bottom CY+R2=347 */}
          <div style={{
            position:'absolute', left:8, top:10, zIndex:20,
            ...(animate && !paused ? { animation:'float 6s ease-in-out 0.3s infinite', willChange:'transform' } : {}),
          }}>
            <CodeCard animate={animate && !paused} />
          </div>

          {/* L20: Chat card — top-right (326,16), right edge 492 */}
          <div style={{
            position:'absolute', right:8, top:16, zIndex:20,
            ...(animate && !paused ? { animation:'float 7.5s ease-in-out 0.9s infinite', willChange:'transform' } : {}),
          }}>
            <ChatCard animate={animate && !paused} />
          </div>

          {/* L22: Dashboard — bottom-left (8,392), clear of laptop left=130, clear of code card bottom=122 */}
          <div style={{
            position:'absolute', left:8, top:392, zIndex:22,
            ...(animate && !paused ? { animation:'float-delayed 8s ease-in-out 1.4s infinite', willChange:'transform' } : {}),
          }}>
            <DashboardCard animate={animate && !paused} />
          </div>

          {/* L22: Mobile — bottom-right (420,382), clear of laptop right=370, clear of chat card bottom=128 */}
          <div style={{
            position:'absolute', right:8, top:382, zIndex:22,
            ...(animate && !paused ? { animation:'float-delayed 5.5s ease-in-out 2.1s infinite', willChange:'transform' } : {}),
          }}>
            <MobileAppCard animate={animate && !paused} />
          </div>

        </div>{/* /tiltable */}

        {/* L30: Pointer spotlight */}
        {full && (
          <div
            style={{
              position:'absolute', inset:0, pointerEvents:'none', borderRadius:16, zIndex:30,
              background:`radial-gradient(circle 180px at ${spotlight.x}% ${spotlight.y}%, rgba(178,240,224,0.07) 0%, transparent 70%)`,
              transition:'background 0.1s',
            }}
            aria-hidden="true"
          />
        )}
      </div>
      {/* Spacer to maintain layout height after scale */}
      <div style={{ height: stageH, width:1, position:'absolute', pointerEvents:'none' }} aria-hidden="true" />
    </div>
  );
}
