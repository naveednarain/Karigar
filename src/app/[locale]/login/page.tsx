import { DemoLogin } from '@/components/demo-login';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  return <DemoLogin nextPath={searchParams?.next} />;
}
