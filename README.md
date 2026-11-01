# HallHub – Smart Hall & Venue Management System
## Run
    npm install
    npm run dev      # http://localhost:5173
## Demo logins
- Admin: admin@college.edu / admin123
- Faculty: faculty@college.edu / faculty123
- Hall in-charge: incharge@college.edu / incharge123 (assigned to Main Auditorium, Mini Hall 1, G. D. Naidu Hall, Conference Hall)
## Notes
- Data is stored in localStorage (src/store.js). Replace load/save with Firebase/Supabase calls to go live.
- Tables for a backend: users(id,name,email,role), halls(id,name,building,cap,proj,mic,ac,inch,maint), bookings(id,title,dept,desc,hall,date,start,end,pax,fac,by,status,ready), notes(id,to,msg,read), issues(id,hall,t,done).
- Conflict detection: src/store.js `conflicts()`; the booking form warns live, admin approval blocks overlaps.
