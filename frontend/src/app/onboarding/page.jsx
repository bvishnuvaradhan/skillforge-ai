"use client";
import { OnboardingFlow } from '../../components/dashboard/OnboardingFlow';
import { useRouter } from 'next/navigation';

// Ensure the flow component is referenced for linting tools
void OnboardingFlow;

function OnboardingPage() {
  const router = useRouter();

  return (
    <OnboardingFlow onComplete={() => {
      // Mark onboarding as complete
      localStorage.setItem('skillforge_onboarding_complete', 'true');
      router.push('/dashboard');
    }} />
  );
}

export default OnboardingPage;
