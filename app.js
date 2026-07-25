const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const peso = n => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(n)||0);
const todayKey = () => new Date().toISOString().slice(0,10);
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);

let staff = JSON.parse(localStorage.getItem('aa_staff') || 'null') || [
  {id:uid(),employeeId:'AA-0001',name:'Annli Marquez',contact:'0917 857 5757',role:'Administrator',status:'Active',username:'annli',pin:'1234',salaryType:'Monthly',salaryRate:18000,photo:''}
];
let attendance = JSON.parse(localStorage.getItem('aa_attendance') || '[]');
let orders = JSON.parse(localStorage.getItem('aa_orders') || '[]');
let currentPhoto = '';

function saveAll(){
  localStorage.setItem('aa_staff',JSON.stringify(staff));
  localStorage.setItem('aa_attendance',JSON.stringify(attendance));
  localStorage.setItem('aa_orders',JSON.stringify(orders));
}
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }
function avatarHTML(person,size='medium'){
  return `<div class="avatar ${size}">${person.photo?`<img src="${person.photo}" alt="${person.name}">`:(person.name||'?').trim().charAt(0).toUpperCase()}</div>`;
}
function renderDashboard(){
  const active=staff.filter(s=>s.status==='Active');
  $('#activeStaff').textContent=active.length;
  $('#ordersToday').textContent=orders.filter(o=>o.date===todayKey()).length;
  $('#salesToday').textContent=peso(orders.filter(o=>o.date===todayKey()).reduce((a,b)=>a+Number(b.amount),0));
  $('#staffOverview').innerHTML = active.slice(0,4).map(s=>`<div class="overview-row">${avatarHTML(s)}<div class="meta"><strong>${s.name}</strong><small>${s.role}</small></div><span class="badge active">Active</span></div>`).join('') || '<p>No active staff yet.</p>';
}
function filteredStaff(){
  const q=$('#staffSearch').value.toLowerCase();
  const r=$('#roleFilter').value, st=$('#statusFilter').value;
  return staff.filter(s=>(!q||[s.name,s.employeeId,s.role].join(' ').toLowerCase().includes(q))&&(!r||s.role===r)&&(!st||s.status===st));
}
function renderStaff(){
  $('#staffTableBody').innerHTML=filteredStaff().map(s=>`<tr>
    <td><div class="staff-cell">${avatarHTML(s)}<div><strong>${s.name}</strong><small style="display:block;color:#6f7d91">@${s.username}</small></div></div></td>
    <td>${s.employeeId}</td><td>${s.role}</td><td>${s.contact||'—'}</td>
    <td>${s.salaryType} · ${peso(s.salaryRate)}</td>
    <td><span class="badge ${s.status.toLowerCase()}">${s.status}</span></td>
    <td><div class="action-row"><button class="action-btn" onclick="editStaff('${s.id}')">Edit</button><button class="action-btn delete" onclick="deleteStaff('${s.id}')">Delete</button></div></td>
  </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:40px">No staff found.</td></tr>';
  renderDashboard(); renderPayroll(); fillAttendanceStaff();
}
function nextEmployeeId(){
  const max=staff.reduce((m,s)=>Math.max(m,Number((s.employeeId||'').split('-')[1])||0),0);
  return `AA-${String(max+1).padStart(4,'0')}`;
}
function openStaff(person=null){
  $('#staffForm').reset(); currentPhoto=person?.photo||''; $('#staffEditId').value=person?.id||'';
  $('#staffModalTitle').textContent=person?'Edit Staff':'Add Staff';
  $('#staffName').value=person?.name||''; $('#staffContact').value=person?.contact||''; $('#staffRole').value=person?.role||'Laundry Staff';
  $('#staffStatus').value=person?.status||'Active'; $('#staffUsername').value=person?.username||''; $('#staffPin').value=person?.pin||'';
  $('#salaryType').value=person?.salaryType||'Daily'; $('#salaryRate').value=person?.salaryRate||'';
  updatePhotoPreview(); $('#staffDialog').showModal();
}
function updatePhotoPreview(){ $('#photoPreview').innerHTML=currentPhoto?`<img src="${currentPhoto}" alt="Profile photo">`:'👤'; }
window.editStaff=id=>openStaff(staff.find(s=>s.id===id));
window.deleteStaff=id=>{ if(confirm('Delete this staff record?')){staff=staff.filter(s=>s.id!==id);saveAll();renderStaff();toast('Staff deleted');} };

$('#staffForm').addEventListener('submit',e=>{
  e.preventDefault();
  const id=$('#staffEditId').value;
  const record={id:id||uid(),employeeId:id?staff.find(s=>s.id===id).employeeId:nextEmployeeId(),name:$('#staffName').value.trim(),contact:$('#staffContact').value.trim(),role:$('#staffRole').value,status:$('#staffStatus').value,username:$('#staffUsername').value.trim(),pin:$('#staffPin').value,salaryType:$('#salaryType').value,salaryRate:Number($('#salaryRate').value),photo:currentPhoto};
  if(id) staff=staff.map(s=>s.id===id?record:s); else staff.push(record);
  saveAll(); renderStaff(); $('#staffDialog').close(); toast(id?'Staff updated':'Staff added');
});
$('#photoInput').addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file)return;
  if(file.size>8*1024*1024){toast('Photo is too large');return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image(); img.onload=()=>{
      const c=document.createElement('canvas'), max=500, scale=Math.min(1,max/Math.max(img.width,img.height));
      c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      currentPhoto=c.toDataURL('image/jpeg',.78); updatePhotoPreview();
    }; img.src=ev.target.result;
  }; reader.readAsDataURL(file);
});
$('#removePhoto').onclick=()=>{currentPhoto='';updatePhotoPreview();};
$('#addStaffBtn').onclick=()=>openStaff();
$('#closeStaffDialog').onclick=$('#cancelStaff').onclick=()=>$('#staffDialog').close();
['staffSearch','roleFilter','statusFilter'].forEach(id=>$('#'+id).addEventListener('input',renderStaff));

function renderAttendance(){
  $('#attendanceBody').innerHTML=attendance.slice().reverse().map(a=>{
    const s=staff.find(x=>x.id===a.staffId);
    return `<tr><td>${a.date}</td><td>${s?s.name:'Deleted Staff'}</td><td>${a.timeIn}</td><td>${a.timeOut||'—'}</td><td><span class="badge present">${a.timeOut?'Completed':'Present'}</span></td><td>${a.timeOut?'—':`<button class="action-btn" onclick="timeOut('${a.id}')">Time Out</button>`}</td></tr>`;
  }).join('')||'<tr><td colspan="6" style="text-align:center;padding:40px">No attendance records yet.</td></tr>';
}
function fillAttendanceStaff(){
  $('#attendanceStaff').innerHTML=staff.filter(s=>s.status==='Active').map(s=>`<option value="${s.id}">${s.name} — ${s.role}</option>`).join('');
}
$('#timeInBtn').onclick=()=>{fillAttendanceStaff();$('#timeInDialog').showModal();};
$('#closeTimeIn').onclick=$('#cancelTimeIn').onclick=()=>$('#timeInDialog').close();
$('#timeInForm').addEventListener('submit',e=>{
  e.preventDefault(); const staffId=$('#attendanceStaff').value; const now=new Date();
  attendance.push({id:uid(),staffId,date:todayKey(),timeIn:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),timeOut:''});
  saveAll();renderAttendance();$('#timeInDialog').close();toast('Time in recorded');
});
window.timeOut=id=>{
  const now=new Date(); attendance=attendance.map(a=>a.id===id?{...a,timeOut:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}:a);
  saveAll();renderAttendance();toast('Time out recorded');
};
function renderPayroll(){
  const active=staff.filter(s=>s.status==='Active');
  $('#payrollEmployees').textContent=active.length;
  const total=active.reduce((sum,s)=>sum+(s.salaryType==='Monthly'?Number(s.salaryRate):Number(s.salaryRate)*26),0);
  $('#estimatedPayroll').textContent=peso(total);
  $('#payrollBody').innerHTML=staff.map(s=>`<tr><td><div class="staff-cell">${avatarHTML(s)}<strong>${s.name}</strong></div></td><td>${s.salaryType}</td><td>${peso(s.salaryRate)}</td><td><span class="badge ${s.status.toLowerCase()}">${s.status}</span></td></tr>`).join('');
}
$('#orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  orders.push({id:uid(),orderNo:'ORD-'+String(orders.length+1).padStart(5,'0'),date:todayKey(),customer:$('#orderCustomer').value.trim(),contact:$('#orderContact').value.trim(),service:$('#orderService').value,weight:Number($('#orderWeight').value),amount:Number($('#orderAmount').value),payment:$('#orderPayment').value});
  saveAll();e.target.reset();renderOrders();renderDashboard();toast('Order saved');
});
function renderOrders(){
  $('#ordersBody').innerHTML=orders.slice().reverse().map(o=>`<tr><td>${o.orderNo}</td><td>${o.date}</td><td>${o.customer}</td><td>${o.service}</td><td>${o.weight} kg</td><td>${peso(o.amount)}</td><td>${o.payment}</td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;padding:40px">No orders yet.</td></tr>';
}
const pageNames={dashboard:['Dashboard','Welcome back, Admin'],staff:['Staff Annli','Manage employees and profile photos'],attendance:['Attendance','Time in and time out'],payroll:['Payroll','Salary summary'],'new-order':['New Order','Create a laundry transaction'],orders:['Orders','View saved transactions'],settings:['Settings','Business preferences']};
function showPage(name){
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  $$('.page').forEach(p=>p.classList.remove('active'));
  const direct=$('#page-'+name);
  if(direct){direct.classList.add('active');const [t,s]=pageNames[name]||[name,''];$('#pageTitle').textContent=t;$('#pageSubtitle').textContent=s;}
  else{$('#page-placeholder').classList.add('active');const label=$(`.nav-item[data-page="${name}"] span`)?.textContent||name;$('#placeholderTitle').textContent=label;$('#pageTitle').textContent=label;$('#pageSubtitle').textContent='Coming in the next development phase';}
  if(innerWidth<760) $('.sidebar').classList.remove('open');
}
$$('.nav-item').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$$('[data-goto]').forEach(b=>b.onclick=()=>showPage(b.dataset.goto));
$('#menuToggle').onclick=()=>$('.sidebar').classList.toggle('open');
$('#saveSettings').onclick=()=>toast('Settings saved');
setInterval(()=>$('#clock').textContent=new Date().toLocaleString('en-PH',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),1000);
renderStaff();renderAttendance();renderOrders();renderDashboard();
