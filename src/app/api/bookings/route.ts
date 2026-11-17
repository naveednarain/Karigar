import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { DEMO_COOKIE,verifyDemoSession } from '@/lib/demo/session';
const schema=z.object({providerId:z.string().min(3).max(80),service:z.string().min(2).max(50),description:z.string().trim().min(8).max(1000),urgency:z.enum(['emergency','today','scheduled','flexible']),scheduledAt:z.string().datetime({offset:true}),area:z.string().min(2).max(100),address:z.string().trim().min(8).max(300)});
const demo=globalThis as typeof globalThis&{karigarDemoBookings?:Map<string,Record<string,unknown>>};
export async function POST(request:NextRequest){const input=schema.safeParse(await request.json().catch(()=>null));if(!input.success)return NextResponse.json({error:'Review the job details and try again.'},{status:400});
 const role=await verifyDemoSession(request.cookies.get(DEMO_COOKIE)?.value);if(role!=='user')return NextResponse.json({error:'Sign in as a customer to book a service.'},{status:401});
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){demo.karigarDemoBookings??=new Map();const id=crypto.randomUUID();const booking={id,code:`KRG-${Math.floor(Date.now()/1000)%100000}`,...input.data,status:'requested',created_at:new Date().toISOString()};demo.karigarDemoBookings.set(id,booking);return NextResponse.json({booking},{status:201});}
 try{const supabase=await createServerClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return NextResponse.json({error:'Your session expired. Sign in again to continue.'},{status:401});const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).single();if(profile?.role!=='user')return NextResponse.json({error:'Only customer accounts can place bookings.'},{status:403});
  const {data:provider}=await supabase.from('providers').select('id,status').eq('id',input.data.providerId).single();if(!provider||provider.status!=='approved')return NextResponse.json({error:'This professional is not available to book.'},{status:404});
  const {data:service}=await supabase.from('services').select('id,min_price').eq('slug',input.data.service).single();if(!service)return NextResponse.json({error:'Choose a valid service.'},{status:400});
  const {data:area}=await supabase.from('areas').select('id').ilike('name_en',input.data.area).limit(1).maybeSingle();
  const {data:address,error:addressError}=await supabase.from('addresses').insert({user_id:user.id,area_id:area?.id||null,label:'Home',full_address:input.data.address}).select('id').single();if(addressError||!address)return NextResponse.json({error:'Could not save this service address.'},{status:400});
  const {data:price}=await supabase.from('provider_services').select('starting_price').eq('provider_id',provider.id).eq('service_id',service.id).maybeSingle();
  const {data:booking,error}=await supabase.from('bookings').insert({user_id:user.id,provider_id:provider.id,service_id:service.id,address_id:address.id,description:input.data.description,urgency:input.data.urgency,scheduled_at:input.data.scheduledAt,estimated_price:price?.starting_price??service.min_price,status:'requested'}).select('id,code,status,created_at').single();if(error||!booking)return NextResponse.json({error:'Could not create the booking. Please try again.'},{status:400});return NextResponse.json({booking},{status:201});
 }catch{return NextResponse.json({error:'Booking service is temporarily unavailable.'},{status:503});}
}
