import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'node:buffer';
import { marketProviders } from '../src/lib/ai/rank';
import type { Database } from '../src/lib/supabase/database.types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;
if (!url || !serviceKey || !password) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DEMO_PASSWORD before seeding.');
const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const DEMO = [
  { email:'demo.user@karigar.pk', name:'Ayesha Khan', role:'user' },
  { email:'demo.provider@karigar.pk', name:'Ustad Bilal Ahmed', role:'provider' },
  { email:'demo.admin@karigar.pk', name:'Karigar Ops Lead', role:'admin' },
] as const;
const providerData = marketProviders;
const areas = ['Latifabad','Qasimabad','Jamshoro','Kotri','Hirabad','Saddar','Autobhan'];
const statuses = ['completed','accepted','on_the_way','in_progress','cancelled','requested'] as const;
const uu = (n:number) => `10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
async function must<T=any>(result:PromiseLike<any>):Promise<T>{const {data,error}=await result;if(error)throw new Error(error.message);if(data===null)throw new Error('Supabase returned no data');return data as T;}
async function main(){
  const usersByEmail = new Map<string,{id:string}>();
  const listed = await must(supabase.auth.admin.listUsers({page:1,perPage:1000}));
  for(const user of listed.users)if(user.email)usersByEmail.set(user.email,{id:user.id});
  async function ensureUser(email:string,name:string,role:'user'|'provider'|'admin'){
    let user=usersByEmail.get(email);
    if(!user){const {data,error}=await supabase.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{role,full_name:name}});if(error||!data.user)throw new Error(error?.message||`Could not create ${email}`);user={id:data.user.id};usersByEmail.set(email,user);}
    await must(supabase.from('profiles').upsert({id:user.id,role,full_name:name,language:'en',is_demo:true},{onConflict:'id'}).select('id'));
    return user.id;
  }
  const demoIds:Record<string,string>={};for(const account of DEMO)demoIds[account.role]=await ensureUser(account.email,account.name,account.role);
  const serviceRows=await must(supabase.from('services').select('id,slug'));const serviceIds=new Map<string,number>(serviceRows.map((row:{id:number;slug:string}):[string,number]=>[row.slug,row.id]));
  const areaRows=await must(supabase.from('areas').select('id,slug,name_en'));const areaIds=new Map<string,number>(areaRows.map((row:{id:number;slug:string;name_en:string}):[string,number]=>[row.name_en.toLowerCase(),row.id]));
  const profileIds:string[]=[];
  for(let i=0;i<providerData.length;i++){
    const p=providerData[i]!;const email=i===0?DEMO[1].email:`demo.pro.${String(i+1).padStart(2,'0')}@karigar.pk`;const name=i===0?DEMO[1].name:p.name;
    const id=i===0?demoIds.provider:await ensureUser(email,name,'provider');profileIds.push(id);
    const areaId=areaIds.get(p.area.toLowerCase());const areaLabel=areas.includes(p.area)?p.area:'Latifabad';
    const providerRow={id,headline:`Trusted ${p.skill.toLowerCase()} in ${p.area}`,skill_title:p.skill,bio:`Serving ${p.area} and nearby neighbourhoods. Clear estimates, careful work, and respectful service.`,experience_years:Math.max(2,Math.round(p.jobs/12)),status:'approved',is_available:p.available,is_verified:true,rating_avg:p.rating,rating_count:p.reviews,jobs_completed:p.jobs,response_minutes:p.responseMinutes,visit_fee:p.price};
    await must(supabase.from('providers').upsert(providerRow,{onConflict:'id'}).select('id'));
    const resolvedArea=areaId??areaIds.get(areaLabel.toLowerCase());
    if(resolvedArea)await must(supabase.from('provider_areas').upsert({provider_id:id,area_id:resolvedArea},{onConflict:'provider_id,area_id'}).select());
    for(const slug of p.services){const serviceId=serviceIds.get(slug);if(serviceId)await must(supabase.from('provider_services').upsert({provider_id:id,service_id:serviceId??null,starting_price:p.price},{onConflict:'provider_id,service_id'}).select());}
  }
  const pendingNames=['Rashid Hussain','Farzana Bibi','Kashif Brohi','Muneer Ahmed','Saima Qureshi'];
  const pendingSkills=['Electrician','Home cleaning professional','AC technician','Solar installer','Pest control specialist'];
  for(let i=0;i<pendingNames.length;i++){
    const id=await ensureUser(`demo.pending.${i+1}@karigar.pk`,pendingNames[i]!,'provider');
    await must(supabase.from('providers').upsert({id,headline:pendingSkills[i],skill_title:pendingSkills[i],bio:'Application ready for admin review.',status:'pending',is_available:false,is_verified:false,experience_years:4,visit_fee:1000},{onConflict:'id'}).select('id'));
    const safeDoc=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450" viewBox="0 0 720 450"><rect width="720" height="450" rx="28" fill="#f0fdf4"/><rect x="28" y="28" width="664" height="394" rx="20" fill="white" stroke="#b7dec2" stroke-width="3"/><text x="60" y="95" font-family="Arial" font-size="25" font-weight="700" fill="#0b3d2e">KARIGAR · DEMO DOCUMENT</text><text x="60" y="170" font-family="Arial" font-size="20" fill="#496555">${pendingNames[i]}</text><text x="60" y="225" font-family="Arial" font-size="18" fill="#718078">Private verification preview</text><text x="60" y="330" font-family="Arial" font-size="26" font-weight="700" fill="#b42318">NOT A REAL IDENTITY DOCUMENT</text></svg>`);
    for(const side of ['front','back'] as const){const path=`${id}/demo-cnic-${side}.svg`;const{error:uploadError}=await supabase.storage.from('documents').upload(path,safeDoc,{contentType:'image/svg+xml',upsert:true});if(uploadError)throw new Error(uploadError.message);await must(supabase.from('provider_documents').upsert({provider_id:id,document_type:side==='front'?'cnic_front':'cnic_back',storage_path:path,cnic_last4:side==='front'?'0000':null,review_status:'pending'},{onConflict:'provider_id,document_type'}).select('id'));}
  }
  const customer=demoIds.user;const provider=demoIds.provider;const addressId=uu(900);
  await must(supabase.from('addresses').upsert({id:addressId,user_id:customer,label:'Home',full_address:'House 42, Qasimabad Phase 2, Hyderabad',is_default:true},{onConflict:'id'}).select('id'));
  const serviceId=serviceIds.get('plumbing');
  const bookings:Array<Database['public']['Tables']['bookings']['Insert']>=[
    {id:uu(201),code:'KRG-2041',user_id:customer,provider_id:profileIds[0],service_id:serviceId??null,address_id:addressId,description:'Kitchen sink is leaking under the cabinet.',status:'completed',estimated_price:1500,final_price:1700,scheduled_at:new Date(Date.now()-86400000*4).toISOString(),completed_at:new Date(Date.now()-86400000*4).toISOString()},
    {id:uu(202),code:'KRG-2042',user_id:customer,provider_id:provider,service_id:serviceId??null,address_id:addressId,description:'Check the bathroom water pressure.',status:'accepted',estimated_price:1200,scheduled_at:new Date(Date.now()+86400000).toISOString()},
    {id:uu(203),code:'KRG-2043',user_id:customer,provider_id:provider,service_id:serviceId??null,address_id:addressId,description:'Replace a worn kitchen tap.',status:'on_the_way',estimated_price:1800,scheduled_at:new Date().toISOString()},
    {id:uu(204),code:'KRG-2044',user_id:customer,provider_id:profileIds[4],service_id:serviceId??null,address_id:addressId,description:'Repair the water line near the washing area.',status:'in_progress',estimated_price:2200,scheduled_at:new Date().toISOString()},
    {id:uu(205),code:'KRG-2045',user_id:customer,provider_id:profileIds[1],service_id:serviceId??null,address_id:addressId,description:'Geyser fitting check.',status:'cancelled',estimated_price:1000,scheduled_at:new Date(Date.now()-86400000*2).toISOString()},
    {id:uu(206),code:'KRG-2084',user_id:customer,provider_id:provider,service_id:serviceId??null,address_id:addressId,description:'Kitchen sink drain is blocked.',status:'requested',estimated_price:1400,scheduled_at:new Date(Date.now()+3600000*3).toISOString()},
  ];
  for(const booking of bookings)await must(supabase.from('bookings').upsert(booking,{onConflict:'id'}).select('id'));
  await must(supabase.from('bookings').upsert({id:uu(218),code:'KRG-2073',user_id:customer,provider_id:provider,service_id:serviceIds.get('electrical'),address_id:addressId,description:'Install a ceiling fan in the lounge.',status:'completed',estimated_price:1200,final_price:1200,commission:120,scheduled_at:new Date(Date.now()-86400000).toISOString(),completed_at:new Date(Date.now()-86400000).toISOString()},{onConflict:'id'}).select('id'));
  const availableService=serviceIds.get('ac_service');
  const requestBase=bookings.length+210;
  for(let i=0;i<2;i++)await must(supabase.from('bookings').upsert({id:uu(216+i),code:`KRG-${2085+i}`,user_id:customer,provider_id:provider,service_id:i===0?availableService:serviceIds.get('electrical'),address_id:addressId,description:i===0?'AC is running but not cooling.':'Ceiling fan needs installation.',status:'requested',estimated_price:i===0?2500:1200,scheduled_at:new Date(Date.now()+3600000*(i+4)).toISOString()},{onConflict:'id'}).select('id'));
  await must(supabase.from('reviews').upsert({booking_id:uu(201),user_id:customer,provider_id:profileIds[0],rating:5,comment:'Arrived on time, explained the repair, and left everything tidy.'},{onConflict:'booking_id'}).select('id'));
  await must(supabase.from('messages').upsert([{id:uu(301),booking_id:uu(202),sender_id:customer,body:'Could you please call when you are nearby?',created_at:new Date(Date.now()-3600000).toISOString()},{id:uu(302),booking_id:uu(202),sender_id:provider,body:'Of course. I will message before I leave.',created_at:new Date(Date.now()-1800000).toISOString()}],{onConflict:'id'}).select('id'));
  await must(supabase.from('notifications').upsert([{id:uu(401),user_id:customer,title:'Ahsan accepted your request',body:'Your bathroom water pressure check is confirmed for tomorrow.',type:'booking',is_read:false},{id:uu(402),user_id:provider,title:'New plumbing request',body:'A kitchen sink drain needs attention in Qasimabad.',type:'booking',is_read:false},{id:uu(403),user_id:demoIds.admin,title:'Provider application received',body:'Five local professionals are waiting for verification.',type:'verification',is_read:false}],{onConflict:'id'}).select('id'));
  await must(supabase.from('complaints').upsert({id:uu(501),booking_id:uu(201),raised_by:customer,reason:'Please review the final invoice details.',status:'open'},{onConflict:'id'}).select('id'));
  console.log(`Seeded 3 demo accounts, ${providerData.length} approved pros, 5 pending applications and 8 sample bookings.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});

