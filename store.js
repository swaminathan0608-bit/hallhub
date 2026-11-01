// localStorage-backed data layer. Swap these functions for Firebase/Supabase calls later.
const K='hallhub_v1';
const day=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const H=(id,name,building,cap,proj,mic,ac,inch)=>({id,name,building,cap,proj,mic,ac,inch,maint:false,img:`https://picsum.photos/seed/${id}/600/360`});
const seed=()=>({
 halls:[H('h1','Main Auditorium','Tech Park',3000,1,1,1,'u3'),H('h2','Mini Hall 1','Admin Block',300,1,1,1,'u3'),H('h3','Mini Hall 2','Admin Block',250,1,1,1,'u4'),
 H('h4','Faraday Hall','Science Block',600,1,1,1,'u4'),H('h5','G. D. Naidu Hall','Engineering Block',300,1,1,0,'u3'),H('h6','Turing Hall','CS Block',120,1,0,1,'u4'),
 H('h7','Conference Hall','Admin Block',60,1,0,1,'u3'),H('h8','Seminar Hall','Library Block',120,1,1,0,'u4')],
 users:[{id:'u1',name:'Admin User',email:'admin@college.edu',pw:'admin123',role:'admin'},{id:'u2',name:'Priya (Faculty)',email:'faculty@college.edu',pw:'faculty123',role:'user'},
 {id:'u3',name:'Karthik (In-charge)',email:'incharge@college.edu',pw:'incharge123',role:'incharge'},{id:'u4',name:'Meena (In-charge)',email:'incharge2@college.edu',pw:'incharge123',role:'incharge'}],
 bookings:[{id:'b1',title:'Tech Symposium',dept:'CSE',desc:'Annual symposium',hall:'h1',date:day(2),start:'09:00',end:'13:00',pax:1200,fac:['Projector','Mic'],by:'u2',status:'Approved',ready:false},
 {id:'b2',title:'Guest Lecture: AI',dept:'IT',desc:'Industry talk',hall:'h6',date:day(0),start:'10:00',end:'12:00',pax:100,fac:['Projector'],by:'u2',status:'Approved',ready:false},
 {id:'b3',title:'Faculty Meeting',dept:'ECE',desc:'Review',hall:'h7',date:day(1),start:'14:00',end:'15:30',pax:40,fac:['AC'],by:'u2',status:'Pending',ready:false}],
 notes:[],issues:[]});
export const load=()=>{try{return JSON.parse(localStorage.getItem(K))||seed()}catch{return seed()}};
export const save=(d)=>{try{localStorage.setItem(K,JSON.stringify(d))}catch{}};
export const reset=()=>{localStorage.removeItem(K)};
export const toMin=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
export const conflicts=(bks,b)=>bks.filter(x=>x.id!==b.id&&x.hall===b.hall&&x.date===b.date&&['Approved','Pending'].includes(x.status)&&toMin(b.start)<toMin(x.end)&&toMin(x.start)<toMin(b.end));
export const uid=()=>Math.random().toString(36).slice(2,9);
export const today=()=>day(0);
