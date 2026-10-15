(()=>{
const $=id=>document.getElementById(id), msg=s=>$('v6message').textContent=s;
let job=null;
const auth=()=>({'Authorization':'Bearer '+$('v6token').value,'Content-Type':'application/json'});
function result(d){if(d.error){msg('Lỗi: '+(typeof d.error==='string'?d.error:JSON.stringify(d.error)));return}msg('Trạng thái: '+(d.status||'đã gửi')+' | ID: '+(d.id||''));const output=Array.isArray(d.output)?d.output[0]:d.output;const url=typeof output==='string'?output:(output&&typeof output==='object'?(output.url||output.video||output.mp4):null);if(url&&/^https:\/\//.test(url)){$('v6video').src=url;$('v6video').style.display='block';$('v6download').href=url;$('v6download').style.display='inline'}}
$('v6create').onclick=async()=>{try{let input=JSON.parse($('v6input').value);if(!input||Array.isArray(input)||typeof input!=='object')throw Error('Input phải là JSON object');input.prompt=$('v6prompt').value.trim();if(!input.prompt)throw Error('Nhập prompt');msg('Đang gửi...');const r=await fetch('/api/video/create',{method:'POST',headers:auth(),body:JSON.stringify({provider:$('v6provider').value,model:$('v6model').value.trim(),input})});const d=await r.json();if(r.ok&&d.id)job={id:d.id,provider:d.provider};result(d)}catch(e){msg('Lỗi: '+e.message)}};
$('v6check').onclick=async()=>{if(!job)return msg('Chưa có tác vụ trong phiên này');try{msg('Đang kiểm tra...');const r=await fetch('/api/video/status?provider='+encodeURIComponent(job.provider)+'&id='+encodeURIComponent(job.id),{headers:auth()});result(await r.json())}catch(e){msg('Lỗi: '+e.message)}};
})();
