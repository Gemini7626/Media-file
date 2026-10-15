const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequestPost({request,env}) {
  if(!env.STUDIO_ACCESS_TOKEN) return reply({error:'Configure STUDIO_ACCESS_TOKEN secret before enabling paid generation'},503);
  if(request.headers.get('Authorization')!==`Bearer ${env.STUDIO_ACCESS_TOKEN}`) return reply({error:'Unauthorized'},401);
  let body;try{body=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
  const {provider,model,input}=body;
  if(!['replicate','gpu'].includes(provider)||!input||typeof input.prompt!=='string'||!input.prompt.trim())return reply({error:'Missing provider or prompt'},400);
  if(provider==='replicate'){
    if(!env.REPLICATE_API_TOKEN)return reply({error:'Missing REPLICATE_API_TOKEN'},503);
    if(!/^[\w-]+\/[\w.-]+$/.test(model||''))return reply({error:'Model must be owner/model'},400);
    const r=await fetch(`https://api.replicate.com/v1/models/${model}/predictions`,{method:'POST',headers:{Authorization:`Bearer ${env.REPLICATE_API_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({input})});
    const data=await r.json().catch(()=>({error:'Invalid provider response'}));
    return reply({provider,status:data.status,id:data.id,error:data.detail||data.error,output:data.output},r.ok?200:r.status);
  }
  if(!env.GPU_ENDPOINT_URL||!env.GPU_API_TOKEN)return reply({error:'Missing GPU configuration'},503);
  const u=new URL(env.GPU_ENDPOINT_URL);if(u.protocol!=='https:')return reply({error:'GPU endpoint must use HTTPS'},400);
  const r=await fetch(u.toString(),{method:'POST',headers:{Authorization:`Bearer ${env.GPU_API_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({model,input})});
  const data=await r.json().catch(()=>({error:'Invalid GPU response'}));return reply({provider,status:data.status,id:data.id,error:data.error,output:data.output},r.ok?200:r.status);
}
