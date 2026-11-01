import React,{useState,useEffect,useMemo} from 'react';
import {load,save,reset,conflicts,uid,today,toMin} from './store.js';
const FAC=['Projector','Mic','AC'];
const hasF=(h,f)=>f==='Projector'?h.proj:f==='Mic'?h.mic:h.ac;
const badge={Approved:'bg-green-100 text-green-700',Pending:'bg-amber-100 text-amber-700',Rejected:'bg-red-100 text-red-700',Cancelled:'bg-slate-200 text-slate-600'};
const Badge=({s})=><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge[s]||'bg-slate-100'}`}>{s}</span>;

export default function App(){
 const [db,setDb]=useState(load);const [me,setMe]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('me'))}catch{return null}});
 const [page,setPage]=useState('home');const [toast,setToast]=useState(null);const [confirm,setConfirm]=useState(null);const [pre,setPre]=useState(null);const [menu,setMenu]=useState(false);
 useEffect(()=>save(db),[db]);
 useEffect(()=>{sessionStorage.setItem('me',JSON.stringify(me))},[me]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(null),3000);return()=>clearTimeout(t)}},[toast]);
 const upd=fn=>setDb(d=>fn(structuredClone(d)));
 const notify=(d,uid_,msg)=>d.notes.unshift({id:uid(),to:uid_,msg,at:new Date().toLocaleString(),read:false});
 const ctx={db,upd,me,setMe,go:p=>{setPage(p);setMenu(false)},say:(m,err)=>setToast({m,err}),ask:(msg,fn)=>setConfirm({msg,fn}),notify,pre,setPre};
 const nav=[['home','Home'],['halls','Halls'],['calendar','Calendar'],...(me?[['book','Book'],['mine','My Bookings']]:[]),...(me?.role==='admin'?[['admin','Admin']]:[]),...(me?.role==='incharge'?[['incharge','My Hall']]:[])];
 const unread=me?db.notes.filter(n=>n.to===me.id&&!n.read).length:0;
 const Page={home:Home,halls:Halls,calendar:Calendar,book:Book,mine:Mine,admin:Admin,incharge:Incharge,login:Auth,notes:Notes}[page]||Home;
 const guarded=['book','mine','notes'].includes(page)&&!me?Auth:page==='admin'&&me?.role!=='admin'?Home:page==='incharge'&&me?.role!=='incharge'?Home:Page;
 const View=guarded;
 return <div className="min-h-screen">
  <header className="bg-navy-900 text-white sticky top-0 z-20"><div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
   <div className="flex items-center gap-2 cursor-pointer" onClick={()=>ctx.go('home')}><div className="w-9 h-9 rounded-lg bg-white text-navy-900 grid place-items-center font-bold">LOGO</div><b>HallHub</b></div>
   <button className="md:hidden ml-auto btn2 !text-navy-900" onClick={()=>setMenu(!menu)}>Menu</button>
   <nav className={`${menu?'flex':'hidden'} md:flex absolute md:static top-full left-0 right-0 bg-navy-900 flex-col md:flex-row gap-1 p-3 md:p-0 md:ml-6 md:flex-1`}>
    {nav.map(([k,l])=><button key={k} onClick={()=>ctx.go(k)} className={`px-3 py-1.5 rounded-lg text-sm text-left ${page===k?'bg-white/20':'hover:bg-white/10'}`}>{l}</button>)}
    <div className="md:ml-auto flex gap-2 items-center">
     {me?<><button className="text-sm px-2" onClick={()=>ctx.go('notes')}>🔔{unread>0&&<span className="ml-1 bg-red-500 rounded-full px-1.5 text-xs">{unread}</span>}</button><span className="text-xs opacity-80">{me.name}</span><button className="btn2 !text-navy-900" onClick={()=>{setMe(null);ctx.go('home')}}>Logout</button></>
     :<><button className="btn2 !text-navy-900" onClick={()=>ctx.go('login')}>Login</button><button className="btn" style={{background:'#3b63b0'}} onClick={()=>{ctx.setPre('reg');ctx.go('login')}}>Register</button></>}
    </div></nav></div></header>
  <main className="max-w-6xl mx-auto px-4 py-6"><View {...ctx}/></main>
  {toast&&<div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg ${toast.err?'bg-red-600':'bg-navy-700'}`}>{toast.m}</div>}
  {confirm&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-30"><div className="card max-w-sm w-full"><p className="mb-4">{confirm.msg}</p><div className="flex gap-2 justify-end"><button className="btn2" onClick={()=>setConfirm(null)}>No</button><button className="btn" onClick={()=>{confirm.fn();setConfirm(null)}}>Yes</button></div></div></div>}
 </div>;
}

const hallStatus=(db,h,date=today())=>h.maint?'Maintenance':db.bookings.some(b=>b.hall===h.id&&b.date===date&&b.status==='Approved')?'Occupied today':'Available';
const stColor={Available:'text-green-600','Occupied today':'text-amber-600',Maintenance:'text-red-600'};

function Home({db,go}){
 const up=db.bookings.filter(b=>b.status==='Approved'&&b.date>=today()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
 const [q,setQ]=useState('');
 return <div className="space-y-8">
  <section className="bg-navy-700 text-white rounded-2xl p-8"><h1 className="text-3xl font-bold">Book campus venues in minutes</h1><p className="opacity-80 mt-2">Auditoriums, seminar halls and conference rooms across your college.</p>
   <div className="flex gap-2 mt-5 max-w-lg"><input className="inp !text-slate-800" placeholder="Search halls…" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn2 !text-navy-900" onClick={()=>{sessionStorage.setItem('q',q);go('halls')}}>Search</button></div></section>
  <section><h2 className="font-semibold text-lg mb-3">Featured venues</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{db.halls.slice(0,4).map(h=><div key={h.id} className="card !p-0 overflow-hidden"><img src={h.img} alt="" className="h-28 w-full object-cover"/><div className="p-3"><b>{h.name}</b><div className="text-xs text-slate-500">{h.cap} seats · {h.building}</div><div className={`text-xs mt-1 ${stColor[hallStatus(db,h)]}`}>{hallStatus(db,h)}</div></div></div>)}</div></section>
  <section><h2 className="font-semibold text-lg mb-3">Upcoming events</h2>{up.length?<div className="grid sm:grid-cols-2 gap-3">{up.map(b=><div key={b.id} className="card"><b>{b.title}</b><div className="text-sm text-slate-500">{db.halls.find(h=>h.id===b.hall)?.name} · {b.date} · {b.start}–{b.end}</div></div>)}</div>:<Empty t="No upcoming events"/>}</section>
 </div>;
}
const Empty=({t})=><div className="card text-center text-slate-500 py-8">{t}</div>;

function Halls({db,go,me,setPre,say}){
 const [q,setQ]=useState(sessionStorage.getItem('q')||'');const [cap,setCap]=useState('');const [fac,setFac]=useState([]);const [sel,setSel]=useState(null);
 useEffect(()=>sessionStorage.removeItem('q'),[]);
 const list=db.halls.filter(h=>(h.name+h.building).toLowerCase().includes(q.toLowerCase())&&h.cap>=(+cap||0)&&fac.every(f=>hasF(h,f)));
 const bookIt=h=>{if(!me){say('Please log in to book',1);return go('login')}setPre({hall:h.id});go('book')};
 return <div><div className="grid md:grid-cols-4 gap-2 mb-4"><input className="inp md:col-span-2" placeholder="Search by name or building" value={q} onChange={e=>setQ(e.target.value)}/><input className="inp" type="number" placeholder="Min capacity" value={cap} onChange={e=>setCap(e.target.value)}/>
  <div className="flex gap-2 items-center text-sm">{FAC.map(f=><label key={f}><input type="checkbox" checked={fac.includes(f)} onChange={e=>setFac(e.target.checked?[...fac,f]:fac.filter(x=>x!==f))}/> {f}</label>)}</div></div>
  {list.length?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map(h=><div key={h.id} className="card !p-0 overflow-hidden"><img src={h.img} alt={h.name} className="h-36 w-full object-cover"/><div className="p-4 space-y-1"><div className="flex justify-between"><b>{h.name}</b><span className={`text-xs ${stColor[hallStatus(db,h)]}`}>{hallStatus(db,h)}</span></div>
   <div className="text-sm text-slate-500">{h.building} · {h.cap} seats</div><div className="text-xs">{FAC.filter(f=>hasF(h,f)).join(' • ')||'Basic'}</div><div className="flex gap-2 pt-2"><button className="btn2" onClick={()=>setSel(h)}>View Details</button><button className="btn" disabled={h.maint} onClick={()=>bookIt(h)}>Book Now</button></div></div></div>)}</div>:<Empty t="No halls match your filters"/>}
  {sel&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-30 p-4" onClick={()=>setSel(null)}><div className="card max-w-md w-full" onClick={e=>e.stopPropagation()}><img src={sel.img} className="rounded-lg mb-3 w-full h-44 object-cover"/><h3 className="font-bold text-lg">{sel.name}</h3><p className="text-sm">Building: {sel.building}<br/>Capacity: {sel.cap}<br/>Projector: {sel.proj?'Yes':'No'} · Sound: {sel.mic?'Yes':'No'} · AC: {sel.ac?'Yes':'No'}<br/>In-charge: {db.users.find(u=>u.id===sel.inch)?.name||'Unassigned'}</p><button className="btn mt-3" onClick={()=>setSel(null)}>Close</button></div></div>}
 </div>;
}

function Book({db,upd,me,say,go,pre,setPre,notify}){
 const [f,setF]=useState({title:'',dept:'',desc:'',hall:pre?.hall||'',date:'',start:'',end:'',pax:'',fac:[]});const [err,setErr]=useState({});
 useEffect(()=>setPre(null),[]);
 const hall=db.halls.find(h=>h.id===f.hall);const set=(k,v)=>setF({...f,[k]:v});
 const rec=f.pax?db.halls.filter(h=>!h.maint&&h.cap>=+f.pax).sort((a,b)=>a.cap-b.cap).slice(0,3):[];
 const draft={...f,id:'new'};const clash=f.hall&&f.date&&f.start&&f.end&&toMin(f.end)>toMin(f.start)?conflicts(db.bookings,draft):[];
 const submit=e=>{e.preventDefault();const x={};
  if(f.title.trim().length<3)x.title='Title required';if(!f.dept)x.dept='Department required';if(!f.hall)x.hall='Select a hall';
  if(!f.date||f.date<today())x.date='Pick today or a future date';if(!f.start)x.start='Required';if(!f.end||toMin(f.end)<=toMin(f.start||'00:00'))x.end='End must be after start';
  if(!(+f.pax>0))x.pax='Enter participants';else if(hall&&+f.pax>hall.cap)x.pax=`Exceeds capacity (${hall.cap})`;
  if(hall?.maint)x.hall='Hall under maintenance';if(clash.length)x.hall='Time slot conflicts with an existing booking';
  setErr(x);if(Object.keys(x).length)return say('Please fix the form errors',1);
  upd(d=>{d.bookings.push({...f,pax:+f.pax,id:uid(),by:me.id,status:'Pending',ready:false});d.users.filter(u=>u.role==='admin').forEach(a=>notify(d,a.id,`New request: ${f.title}`));notify(d,me.id,`Request "${f.title}" submitted`)});
  say('Booking request submitted');go('mine')};
 const L=({k,l,children})=><label className="block text-sm"><span className="font-medium">{l}</span>{children}{err[k]&&<span className="text-red-600 text-xs">{err[k]}</span>}</label>;
 return <form onSubmit={submit} className="card max-w-2xl mx-auto space-y-3"><h2 className="font-bold text-xl">Hall booking request</h2>
  <L k="title" l="Event title"><input className="inp" value={f.title} onChange={e=>set('title',e.target.value)}/></L>
  <div className="grid sm:grid-cols-2 gap-3"><L k="dept" l="Department"><input className="inp" value={f.dept} onChange={e=>set('dept',e.target.value)}/></L>
  <L k="pax" l="Expected participants"><input type="number" className="inp" value={f.pax} onChange={e=>set('pax',e.target.value)}/></L></div>
  {rec.length>0&&<div className="text-xs bg-navy-50 p-2 rounded">Recommended: {rec.map(h=><button type="button" key={h.id} className="underline mr-2" onClick={()=>set('hall',h.id)}>{h.name} ({h.cap})</button>)}</div>}
  <L k="hall" l="Hall"><select className="inp" value={f.hall} onChange={e=>set('hall',e.target.value)}><option value="">Select…</option>{db.halls.map(h=><option key={h.id} value={h.id}>{h.name} – {h.cap}</option>)}</select></L>
  <div className="grid sm:grid-cols-3 gap-3"><L k="date" l="Date"><input type="date" min={today()} className="inp" value={f.date} onChange={e=>set('date',e.target.value)}/></L><L k="start" l="Start"><input type="time" className="inp" value={f.start} onChange={e=>set('start',e.target.value)}/></L><L k="end" l="End"><input type="time" className="inp" value={f.end} onChange={e=>set('end',e.target.value)}/></L></div>
  {clash.length>0&&<div className="text-sm bg-red-50 text-red-700 p-2 rounded">⚠ Conflict with "{clash[0].title}" ({clash[0].start}–{clash[0].end})</div>}
  <div className="text-sm">Facilities: {FAC.map(x=><label key={x} className="mr-3"><input type="checkbox" checked={f.fac.includes(x)} onChange={e=>set('fac',e.target.checked?[...f.fac,x]:f.fac.filter(y=>y!==x))}/> {x}</label>)}</div>
  <L k="desc" l="Description"><textarea className="inp" rows="3" value={f.desc} onChange={e=>set('desc',e.target.value)}/></L>
  <button className="btn">Submit request</button></form>;
}

function Mine({db,upd,me,ask,say,notify,go}){
 const mine=db.bookings.filter(b=>b.by===me.id).sort((a,b)=>b.date.localeCompare(a.date));
 return <div><h2 className="font-bold text-xl mb-3">My bookings</h2>{mine.length?<div className="space-y-2">{mine.map(b=><div key={b.id} className="card flex flex-wrap gap-2 justify-between items-center"><div><b>{b.title}</b> <Badge s={b.status}/><div className="text-sm text-slate-500">{db.halls.find(h=>h.id===b.hall)?.name} · {b.date} · {b.start}–{b.end}</div></div>
  {['Pending','Approved'].includes(b.status)&&<button className="btn2" onClick={()=>ask('Cancel this booking?',()=>{upd(d=>{d.bookings.find(x=>x.id===b.id).status='Cancelled';notify(d,me.id,`"${b.title}" cancelled`)});say('Booking cancelled')})}>Cancel</button>}</div>)}</div>:<div><Empty t="No bookings yet"/><button className="btn mt-3" onClick={()=>go('book')}>Make a booking</button></div>}</div>;
}

function Calendar({db}){
 const [m,setM]=useState(()=>today().slice(0,7));const [h,setH]=useState('all');const [d,setD]=useState(today());
 const [y,mo]=m.split('-').map(Number);const first=new Date(y,mo-1,1).getDay();const n=new Date(y,mo,0).getDate();
 const bks=db.bookings.filter(b=>['Approved','Pending'].includes(b.status)&&(h==='all'||b.hall===h));
 const shift=k=>{const t=new Date(y,mo-1+k,1);setM(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}`)};
 const day=bks.filter(b=>b.date===d).sort((a,b)=>a.start.localeCompare(b.start));
 return <div className="grid md:grid-cols-3 gap-4"><div className="card md:col-span-2"><div className="flex gap-2 mb-3 items-center"><button className="btn2" onClick={()=>shift(-1)}>‹</button><b className="flex-1 text-center">{new Date(y,mo-1).toLocaleString('en',{month:'long',year:'numeric'})}</b><button className="btn2" onClick={()=>shift(1)}>›</button>
  <select className="inp !w-40" value={h} onChange={e=>setH(e.target.value)}><option value="all">All halls</option>{db.halls.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
  <div className="grid grid-cols-7 gap-1 text-center text-xs">{'SMTWTFS'.split('').map((c,i)=><b key={i}>{c}</b>)}{Array(first).fill(0).map((_,i)=><div key={'e'+i}/>)}
  {Array.from({length:n},(_,i)=>{const ds=`${m}-${String(i+1).padStart(2,'0')}`;const bs=bks.filter(b=>b.date===ds);return <button key={i} onClick={()=>setD(ds)} className={`h-14 rounded-lg border text-sm ${d===ds?'border-navy-600 bg-navy-50':'border-slate-200'}`}>{i+1}<div className="flex justify-center gap-0.5">{bs.slice(0,3).map(b=><span key={b.id} className={`w-1.5 h-1.5 rounded-full ${b.status==='Approved'?'bg-green-500':'bg-amber-400'}`}/>)}</div></button>})}</div>
  <p className="text-xs mt-2 text-slate-500">● green approved · ● amber pending</p></div>
  <div className="card"><b>{d}</b>{day.length?day.map(b=><div key={b.id} className="border-b py-2 text-sm"><b>{b.start}–{b.end}</b> {b.title} <Badge s={b.status}/><div className="text-xs text-slate-500">{db.halls.find(x=>x.id===b.hall)?.name}</div></div>):<p className="text-sm text-slate-500 mt-2">All slots available</p>}</div></div>;
}

function Admin({db,upd,ask,say,notify}){
 const [tab,setTab]=useState('dash');const [eh,setEh]=useState(null);
 const B=db.bookings;const stat=[['Total halls',db.halls.length],['Total bookings',B.length],['Pending',B.filter(b=>b.status==='Pending').length],['Approved',B.filter(b=>b.status==='Approved').length],['Available halls',db.halls.filter(h=>hallStatus(db,h)==='Available').length],['Maintenance alerts',db.halls.filter(h=>h.maint).length+db.issues.filter(i=>!i.done).length]];
 const decide=(b,s)=>{if(s==='Approved'&&conflicts(B.filter(x=>x.status==='Approved'),b).length)return say('Double booking detected – cannot approve',1);
  upd(d=>{d.bookings.find(x=>x.id===b.id).status=s;notify(d,b.by,`Your booking "${b.title}" was ${s.toLowerCase()}`)});say(`Booking ${s.toLowerCase()}`)};
 const saveHall=e=>{e.preventDefault();upd(d=>{if(eh.id)Object.assign(d.halls.find(h=>h.id===eh.id),{...eh,cap:+eh.cap});else d.halls.push({...eh,id:uid(),cap:+eh.cap,maint:false,img:`https://picsum.photos/seed/${uid()}/600/360`})});setEh(null);say('Hall saved')};
 const csv=()=>{const r=[['Event','Hall','Date','Start','End','Status'],...B.map(b=>[b.title,db.halls.find(h=>h.id===b.hall)?.name,b.date,b.start,b.end,b.status])].map(x=>x.join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r]));a.download='bookings-report.csv';a.click()};
 const util=db.halls.map(h=>({n:h.name,v:B.filter(b=>b.hall===h.id&&b.status==='Approved').reduce((s,b)=>s+(toMin(b.end)-toMin(b.start))/60,0)}));const mx=Math.max(1,...util.map(u=>u.v));
 const T=[['dash','Dashboard'],['req','Requests'],['halls','Halls'],['users','Users'],['rep','Reports']];
 return <div className="grid md:grid-cols-5 gap-4"><aside className="card md:col-span-1 flex md:flex-col gap-1 h-fit overflow-x-auto">{T.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 rounded-lg text-sm text-left ${tab===k?'bg-navy-600 text-white':'hover:bg-slate-100'}`}>{l}</button>)}</aside>
 <section className="md:col-span-4 space-y-3">
 {tab==='dash'&&<><div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{stat.map(([l,v])=><div key={l} className="card"><div className="text-xs text-slate-500">{l}</div><div className="text-2xl font-bold text-navy-700">{v}</div></div>)}</div>
  <h3 className="font-semibold">Recent requests</h3>{B.slice(-5).reverse().map(b=><div key={b.id} className="card text-sm flex justify-between"><span>{b.title} · {b.date}</span><Badge s={b.status}/></div>)}</>}
 {tab==='req'&&(B.length?B.map(b=><div key={b.id} className="card flex flex-wrap justify-between gap-2 items-center"><div><b>{b.title}</b> <Badge s={b.status}/><div className="text-sm text-slate-500">{db.halls.find(h=>h.id===b.hall)?.name} · {b.date} · {b.start}–{b.end} · {b.pax} pax</div>{b.status==='Pending'&&conflicts(B.filter(x=>x.status==='Approved'),b).length>0&&<div className="text-xs text-red-600">⚠ Conflicts with approved booking</div>}</div>
  {b.status==='Pending'&&<div className="flex gap-2"><button className="btn" onClick={()=>decide(b,'Approved')}>Approve</button><button className="btn2" onClick={()=>ask('Reject this request?',()=>decide(b,'Rejected'))}>Reject</button></div>}</div>):<Empty t="No requests"/>)}
 {tab==='halls'&&<><button className="btn" onClick={()=>setEh({name:'',building:'',cap:'',proj:1,mic:1,ac:1,inch:''})}>+ Add hall</button>
  {db.halls.map(h=><div key={h.id} className="card flex flex-wrap gap-2 justify-between items-center"><div><b>{h.name}</b> <span className="text-xs text-slate-500">{h.building} · {h.cap}</span>{h.maint&&<span className="text-xs text-red-600 ml-2">Maintenance</span>}</div>
  <div className="flex gap-2 items-center"><select className="inp !w-40" value={h.inch||''} onChange={e=>{upd(d=>{d.halls.find(x=>x.id===h.id).inch=e.target.value});say('In-charge assigned')}}><option value="">Unassigned</option>{db.users.filter(u=>u.role==='incharge').map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>
  <button className="btn2" onClick={()=>{upd(d=>{const x=d.halls.find(y=>y.id===h.id);x.maint=!x.maint});say('Maintenance status updated')}}>{h.maint?'Clear maint.':'Maintenance'}</button><button className="btn2" onClick={()=>setEh(h)}>Edit</button>
  <button className="btn2" onClick={()=>ask(`Delete ${h.name}?`,()=>{upd(d=>{d.halls=d.halls.filter(x=>x.id!==h.id)});say('Hall deleted')})}>Delete</button></div></div>)}
  {eh&&<div className="fixed inset-0 bg-black/40 grid place-items-center z-30 p-4"><form onSubmit={saveHall} className="card max-w-sm w-full space-y-2"><b>{eh.id?'Edit':'Add'} hall</b>
  <input required className="inp" placeholder="Name" value={eh.name} onChange={e=>setEh({...eh,name:e.target.value})}/><input required className="inp" placeholder="Building" value={eh.building} onChange={e=>setEh({...eh,building:e.target.value})}/><input required type="number" min="1" className="inp" placeholder="Capacity" value={eh.cap} onChange={e=>setEh({...eh,cap:e.target.value})}/>
  <div className="text-sm">{[['proj','Projector'],['mic','Sound'],['ac','AC']].map(([k,l])=><label key={k} className="mr-3"><input type="checkbox" checked={!!eh[k]} onChange={e=>setEh({...eh,[k]:e.target.checked?1:0})}/> {l}</label>)}</div>
  <div className="flex gap-2 justify-end"><button type="button" className="btn2" onClick={()=>setEh(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}</>}
 {tab==='users'&&db.users.map(u=><div key={u.id} className="card flex justify-between items-center text-sm"><span><b>{u.name}</b> · {u.email}</span><select className="inp !w-32" value={u.role} onChange={e=>{upd(d=>{d.users.find(x=>x.id===u.id).role=e.target.value});say('Role updated')}}><option value="user">User</option><option value="incharge">In-charge</option><option value="admin">Admin</option></select></div>)}
 {tab==='rep'&&<><div className="card"><b>Hall utilization (approved hours)</b>{util.map(u=><div key={u.n} className="text-xs mt-2">{u.n}<div className="bg-slate-100 rounded h-3"><div className="bg-navy-600 h-3 rounded" style={{width:`${u.v/mx*100}%`}}/></div></div>)}</div><button className="btn" onClick={csv}>Download CSV report</button>
  <button className="btn2 ml-2" onClick={()=>ask('Reset all demo data?',()=>{reset();location.reload()})}>Reset demo data</button></>}
 </section></div>;
}

function Incharge({db,upd,me,say}){
 const h=db.halls.find(x=>x.inch===me.id);const [iss,setIss]=useState('');
 if(!h)return <Empty t="No hall assigned to you yet. Ask an admin."/>;
 const mine=db.bookings.filter(b=>b.hall===h.id&&b.status==='Approved').sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
 const wk=new Date();wk.setDate(wk.getDate()+7);const wkS=wk.toISOString().slice(0,10);
 return <div className="space-y-4"><div className="card"><h2 className="font-bold text-xl">{h.name}</h2><p className="text-sm text-slate-500">{h.building} · {h.cap} seats · <span className={stColor[hallStatus(db,h)]}>{hallStatus(db,h)}</span></p>
  <button className="btn2 mt-2" onClick={()=>{upd(d=>{const x=d.halls.find(y=>y.id===h.id);x.maint=!x.maint});say('Availability updated')}}>{h.maint?'Mark available':'Mark unavailable'}</button></div>
  <div className="card"><b>Today's bookings</b>{mine.filter(b=>b.date===today()).map(b=><Row key={b.id} b={b} upd={upd} say={say}/>)||null}{!mine.some(b=>b.date===today())&&<p className="text-sm text-slate-500">None today</p>}</div>
  <div className="card"><b>This week</b>{mine.filter(b=>b.date>today()&&b.date<=wkS).map(b=><Row key={b.id} b={b} upd={upd} say={say}/>)}{!mine.some(b=>b.date>today()&&b.date<=wkS)&&<p className="text-sm text-slate-500">No upcoming events</p>}</div>
  <form className="card flex gap-2" onSubmit={e=>{e.preventDefault();if(!iss.trim())return say('Describe the issue',1);upd(d=>d.issues.push({id:uid(),hall:h.id,t:iss,done:false}));setIss('');say('Issue reported to admin')}}><input className="inp" placeholder="Report maintenance issue" value={iss} onChange={e=>setIss(e.target.value)}/><button className="btn">Report</button></form>
  {db.issues.filter(i=>i.hall===h.id).map(i=><div key={i.id} className="card text-sm flex justify-between">{i.t}<button className="btn2" onClick={()=>upd(d=>{const x=d.issues.find(y=>y.id===i.id);x.done=!x.done})}>{i.done?'Reopen':'Mark fixed'}</button></div>)}</div>;
}
const Row=({b,upd,say})=><div className="flex justify-between items-center border-b py-2 text-sm"><span>{b.date} {b.start}–{b.end} · {b.title}</span><button className={b.ready?'btn':'btn2'} onClick={()=>{upd(d=>{const x=d.bookings.find(y=>y.id===b.id);x.ready=!x.ready});say('Readiness updated')}}>{b.ready?'✓ Ready':'Confirm ready'}</button></div>;

function Notes({db,upd,me}){
 const ns=db.notes.filter(n=>n.to===me.id);useEffect(()=>{upd(d=>d.notes.forEach(n=>{if(n.to===me.id)n.read=true}))},[]);
 return <div><h2 className="font-bold text-xl mb-3">Notifications</h2>{ns.length?ns.map(n=><div key={n.id} className="card mb-2 text-sm">{n.msg}<div className="text-xs text-slate-400">{n.at}</div></div>):<Empty t="You're all caught up"/>}</div>;
}

function Auth({db,upd,setMe,go,say,pre,setPre}){
 const [reg,setReg]=useState(pre==='reg');const [f,setF]=useState({name:'',email:'',pw:''});useEffect(()=>setPre(null),[]);
 const submit=e=>{e.preventDefault();const email=f.email.trim().toLowerCase();
  if(reg){if(!f.name.trim()||!/^\S+@\S+\.\S+$/.test(email)||f.pw.length<6)return say('Enter name, valid email, password (6+ chars)',1);
   if(db.users.some(u=>u.email===email))return say('Email already registered',1);const u={id:uid(),name:f.name,email,pw:f.pw,role:'user'};upd(d=>d.users.push(u));setMe(u);say('Welcome!');go('halls')}
  else{const u=db.users.find(x=>x.email===email&&x.pw===f.pw);if(!u)return say('Invalid credentials',1);setMe(u);say(`Welcome ${u.name}`);go(u.role==='admin'?'admin':u.role==='incharge'?'incharge':'halls')}};
 return <form onSubmit={submit} className="card max-w-sm mx-auto space-y-3"><h2 className="font-bold text-xl">{reg?'Register':'Login'}</h2>
  {reg&&<input className="inp" placeholder="Full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}
  <input className="inp" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><input className="inp" type="password" placeholder="Password" value={f.pw} onChange={e=>setF({...f,pw:e.target.value})}/>
  <button className="btn w-full">{reg?'Create account':'Login'}</button><button type="button" className="text-sm underline" onClick={()=>setReg(!reg)}>{reg?'Have an account? Login':'New here? Register'}</button>
  {!reg&&<div className="text-xs bg-navy-50 p-2 rounded">Demo: admin@college.edu / admin123<br/>faculty@college.edu / faculty123<br/>incharge@college.edu / incharge123</div>}</form>;
}
