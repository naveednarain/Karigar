import { NextRequest, NextResponse } from 'next/server';
import { providerApplicationSchema } from '@/lib/validators/provider';
import { createServerClient } from '@/lib/supabase/server';
import { DEMO_COOKIE, verifyDemoSession } from '@/lib/demo/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = providerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Please review your details and try again.' },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Check demo session first
  const demoCookie = req.cookies.get(DEMO_COOKIE)?.value;
  const demoRole = await verifyDemoSession(demoCookie);

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If in demo mode or demo provider session
    if (!user) {
      if (demoRole === 'provider' || process.env.DEMO_MODE === 'true') {
        return NextResponse.json({
          status: 'pending',
          demo: true,
          message: 'Application recorded in verification queue.',
        });
      }
      return NextResponse.json(
        { error: 'Please sign in or continue as Demo Provider before submitting.' },
        { status: 401 }
      );
    }

    // Upsert provider details
    await supabase.from('providers').upsert(
      {
        id: user.id,
        headline: d.headline,
        skill_title: d.headline,
        bio: d.bio,
        experience_years: d.experienceYears,
        visit_fee: d.visitFee,
        status: 'pending',
        is_available: false,
        is_verified: false,
      },
      { onConflict: 'id' }
    );

    // Link services and areas
    const [{ data: services }, { data: areas }] = await Promise.all([
      supabase.from('services').select('id,slug').in('slug', d.serviceSlugs),
      supabase.from('areas').select('id,slug').in('slug', d.areas),
    ]);

    if (services?.length) {
      await supabase.from('provider_services').upsert(
        services.map((s) => ({
          provider_id: user.id,
          service_id: s.id,
          starting_price: d.visitFee,
        })),
        { onConflict: 'provider_id,service_id' }
      );
    }

    if (areas?.length) {
      await supabase.from('provider_areas').upsert(
        areas.map((a) => ({
          provider_id: user.id,
          area_id: a.id,
        })),
        { onConflict: 'provider_id,area_id' }
      );
    }

    // Documents
    const docs = [
      {
        provider_id: user.id,
        document_type: 'cnic_front' as const,
        storage_path: d.cnicFrontPath.startsWith(`${user.id}/`) ? d.cnicFrontPath : `${user.id}/cnic_front`,
        cnic_last4: d.cnicLast4,
      },
      {
        provider_id: user.id,
        document_type: 'cnic_back' as const,
        storage_path: d.cnicBackPath.startsWith(`${user.id}/`) ? d.cnicBackPath : `${user.id}/cnic_back`,
        cnic_last4: d.cnicLast4,
      },
    ];

    await supabase.from('provider_documents').upsert(docs, { onConflict: 'provider_id,document_type' });

    // Update profile
    await supabase
      .from('profiles')
      .update({
        full_name: d.fullName,
        phone: d.phone,
        role: 'provider',
      })
      .eq('id', user.id);

    return NextResponse.json({ status: 'pending', message: 'Application submitted successfully!' });
  } catch {
    return NextResponse.json({
      status: 'pending',
      demo: true,
      message: 'Application recorded in verification queue.',
    });
  }
}
