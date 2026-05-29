import { OnboardingFlow } from '../components/dashboard/OnboardingFlow';

// Ensure the flow component is referenced for linting tools
void OnboardingFlow;

export function OnboardingPage({ onComplete }) {
  return (
    <OnboardingFlow onComplete={() => {
      // Mark onboarding as complete
      localStorage.setItem('skillforge_onboarding_complete', 'true');
      onComplete?.();
    }} />
  );
}

export default OnboardingPage;
