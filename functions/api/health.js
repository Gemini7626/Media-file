export function onRequestGet({env}) {return Response.json({ok:true,mode:'GPU HTTP adapter',gpuConfigured:!!(env.GPU_API_URL&&env.GPU_API_TOKEN)});}
