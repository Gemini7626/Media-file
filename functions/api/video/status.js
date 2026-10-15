const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequestGet({request,env}){
 if(!env.STUDIO_ACCESS_TOKEN||request.headers.get('Authorization')!==`Bearer ${env.STUDIO_ACCESS_TOKEN}`)return reply({error:'Unauthorized'},401);
 const u=new URL(request.url),provider=u.searchParams.get('provider'),id=u.searchParams.get('id');
 if(!id||!/^[\w-]{1,128}$/.test(id))return reply({error:'Invalid job id'},400);
 let endpoint,token;
 if(provider==='replicate'){endpoint=`https://api.replicate.com/v1/predictions/${id}`;token=env.REPLICATE_API_TOKEN}
 else if(provider==='gpu'&&env.GPU_STATUS_BASE_URL){const base=new URL(env.GPU_STATUS_BASE_URL);if(base.protocol!=='https:')return reply({error:'HTTPS required'},400);endpoint=base.toString().replace(/\/$/,'')+'/'+encodeURIComponent(id);token=env.GPU_API_TOKEN}
 else return reply({error:'Provider not configured'},400);
 if(!token)return reply({error:'Provider token missing'},503);
 const r=await fetch(endpoint,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json().catch(()=>({error:'Invalid provider response'}));
 return reply({provider,id,status:d.status,output:d.output,error:d.error||d.detail},r.ok?200:r.status);
}
