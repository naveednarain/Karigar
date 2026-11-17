const memory=globalThis as typeof globalThis&{karigarRate?:Map<string,{started:number;count:number}>};
export async function rateLimit(key:string,limit=20,windowMs=60_000){
  if(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN){try{const response=await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`,{method:'POST',headers:{authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,'content-type':'application/json'},body:JSON.stringify([['INCR',key],['EXPIRE',key,Math.ceil(windowMs/1000)]]),cache:'no-store'});if(response.ok){const result=await response.json();return Number(result?.[0]?.result??0)<=limit;}}catch{/* Use the process-local limit if Redis is unavailable. */}}
  memory.karigarRate??=new Map();const now=Date.now();const previous=memory.karigarRate.get(key);if(!previous||now-previous.started>=windowMs){memory.karigarRate.set(key,{started:now,count:1});return true;}if(previous.count>=limit)return false;previous.count++;return true;
}
