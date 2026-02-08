import { redirect } from 'next/navigation';
import { getUser } from '@/lib/actions/auth';
import { DashboardNav } from '@/components/dashboard/nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen flex">
      <DashboardNav user={user} />
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
