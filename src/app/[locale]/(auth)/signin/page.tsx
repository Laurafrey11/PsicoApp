import { redirect } from 'next/navigation';
import { Brain } from 'lucide-react';
import { SignInForm } from '@/components/auth';
import { getUser } from '@/lib/actions/auth';

export default async function SignInPage() {
  const user = await getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <Brain className="w-8 h-8 text-cyan-500" />
        <span className="text-2xl font-bold gradient-text">Ego-Core</span>
      </div>

      <SignInForm />
    </main>
  );
}
