'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFeatureFlagEnabled } from '@posthog/react';
import { useSession } from 'next-auth/react';
import { ACTIONS, EVENTS, Joyride, STATUS, type EventData, type Step } from 'react-joyride';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
    PLANNER_TOUR_SESSION_KEY,
    PLANNER_TOUR_STORAGE_KEY,
    plannerTourSteps,
    setPreferenceStep,
    type PlannerTourStep,
} from '@/components/plannerTourSteps';

const getStoredStepIndex = () => {
    if (typeof window === 'undefined') return null;

    const stored = window.sessionStorage.getItem(PLANNER_TOUR_SESSION_KEY);
    if (!stored) return null;

    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const isTourDone = () => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem(PLANNER_TOUR_STORAGE_KEY) === 'done';
};

export default function PlannerOnboardingTour() {
    const router = useRouter();
    const pathname = usePathname();
    const { status: authStatus } = useSession();

    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(true);
    const [serverCompletion, setServerCompletion] = useState<boolean | null>(null);

    const isCourseUpdateAlertEnabled = useFeatureFlagEnabled(FEATURE_FLAGS.courseUpdateAlert) ?? false;
    const [alertDismissed, setAlertDismissed] = useState(false);

    useEffect(() => {
        const handleDismiss = () => {
            setAlertDismissed(true);
        };
        window.addEventListener('course_update_alert_dismissed', handleDismiss);
        return () => {
            window.removeEventListener('course_update_alert_dismissed', handleDismiss);
        };
    }, []);

    const steps = useMemo<PlannerTourStep[]>(() => {
        const schoolStep: PlannerTourStep = {
            route: '/preferences',
            target: '[data-tour="preferences-step-school"]',
            title: 'Select School',
            content: 'Select your school (e.g. SCOPE, SENSE) to filter courses by department, or use the "Skip & Search All Subjects" button to view the entire catalog directly.',
            placement: 'right',
            preferenceStep: 0,
            before: () => setPreferenceStep(0),
        };

        const newSteps = [...plannerTourSteps];
        newSteps.splice(1, 0, schoolStep);
        return newSteps;
    }, []);
    const currentStep = steps[stepIndex];
    const isStepAllowed = useCallback((step: PlannerTourStep) => {
        if (!step.auth) return true;
        if (step.auth === 'authenticated') return authStatus === 'authenticated';
        return authStatus === 'unauthenticated';
    }, [authStatus]);

    const findAllowedStepIndex = useCallback((fromIndex: number, direction: 1 | -1) => {
        let nextIndex = fromIndex;

        while (nextIndex >= 0 && nextIndex < steps.length) {
            if (isStepAllowed(steps[nextIndex])) {
                return nextIndex;
            }
            nextIndex += direction;
        }

        return nextIndex;
    }, [isStepAllowed, steps]);

    const persistActiveStep = useCallback((index: number) => {
        window.sessionStorage.setItem(PLANNER_TOUR_SESSION_KEY, index.toString());
    }, []);

    const finishTour = useCallback(() => {
        window.localStorage.setItem(PLANNER_TOUR_STORAGE_KEY, 'done');
        window.sessionStorage.removeItem(PLANNER_TOUR_SESSION_KEY);
        setRun(false);
        setIsComplete(true);

        if (authStatus === 'authenticated') {
            setServerCompletion(true);
            void fetch('/api/user/onboarding-tour', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            }).catch(() => {
                setServerCompletion(null);
            });
        }
    }, [authStatus]);

    const moveToStep = useCallback((nextIndex: number) => {
        if (nextIndex < 0) {
            setStepIndex(0);
            persistActiveStep(0);
            return;
        }

        const direction = nextIndex < stepIndex ? -1 : 1;
        const allowedNextIndex = findAllowedStepIndex(nextIndex, direction);

        if (allowedNextIndex < 0) {
            setStepIndex(0);
            persistActiveStep(0);
            return;
        }

        if (allowedNextIndex >= steps.length) {
            finishTour();
            return;
        }

        const nextStep = steps[allowedNextIndex];
        setRun(false);
        setStepIndex(allowedNextIndex);
        persistActiveStep(allowedNextIndex);

        if (nextStep.route !== pathname) {
            router.push(nextStep.route);
            return;
        }

        window.setTimeout(() => setRun(true), 80);
    }, [findAllowedStepIndex, finishTour, pathname, persistActiveStep, router, stepIndex, steps]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (authStatus === 'loading') {
                setRun(false);
                setIsComplete(true);
                return;
            }

            if (authStatus === 'authenticated' && serverCompletion === null) {
                setRun(false);
                setIsComplete(true);
                return;
            }

            const isCourseUpdateAlertActive = isCourseUpdateAlertEnabled && (typeof window !== 'undefined' ? localStorage.getItem('course_update_alert_dismissed') !== 'true' : false);
            if (isCourseUpdateAlertActive) {
                setRun(false);
                setIsComplete(true);
                return;
            }

            const completed = authStatus === 'authenticated' ? serverCompletion : isTourDone();
            if (completed) {
                setRun(false);
                setIsComplete(true);
                return;
            }

            setIsComplete(false);
            const storedStepIndex = getStoredStepIndex();
            const nextIndex = findAllowedStepIndex(storedStepIndex ?? 0, 1);
            const nextStep = steps[nextIndex];

            if (!nextStep) {
                finishTour();
                return;
            }

            if (storedStepIndex === null && pathname !== '/preferences') {
                setRun(false);
                return;
            }

            setStepIndex(nextIndex);
            persistActiveStep(nextIndex);

            if (nextStep.route !== pathname) {
                router.push(nextStep.route);
                return;
            }

            setRun(true);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [authStatus, findAllowedStepIndex, finishTour, pathname, persistActiveStep, router, serverCompletion, steps, isCourseUpdateAlertEnabled, alertDismissed]);

    useEffect(() => {
        if (authStatus !== 'authenticated') {
            setServerCompletion(null);
            return;
        }

        let cancelled = false;

        async function loadServerCompletion() {
            try {
                const response = await fetch('/api/user/onboarding-tour', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error('Unable to load onboarding state');
                }

                const data = await response.json() as { completed?: boolean };
                if (cancelled) return;

                if (data.completed) {
                    window.localStorage.setItem(PLANNER_TOUR_STORAGE_KEY, 'done');
                    window.sessionStorage.removeItem(PLANNER_TOUR_SESSION_KEY);
                    setServerCompletion(true);
                    return;
                }

                if (isTourDone()) {
                    setServerCompletion(true);
                    void fetch('/api/user/onboarding-tour', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    }).catch(() => {
                        setServerCompletion(false);
                    });
                    return;
                }

                setServerCompletion(false);
            } catch {
                if (!cancelled) {
                    setServerCompletion(false);
                }
            }
        }

        void loadServerCompletion();

        return () => {
            cancelled = true;
        };
    }, [authStatus]);

    const handleJoyrideEvent = useCallback((data: EventData) => {
        const { action, index, status, type } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.SKIP) {
            finishTour();
            return;
        }

        if (type !== EVENTS.STEP_AFTER && type !== EVENTS.TARGET_NOT_FOUND) {
            return;
        }

        const direction = action === ACTIONS.PREV ? -1 : 1;
        moveToStep(index + direction);
    }, [finishTour, moveToStep]);

    if (isComplete || !currentStep || currentStep.route !== pathname) {
        return null;
    }

    return (
        <Joyride
            continuous
            run={run}
            stepIndex={stepIndex}
            steps={steps as Step[]}
            onEvent={handleJoyrideEvent}
            scrollToFirstStep
            options={{
                buttons: ['back', 'skip', 'primary'],
                closeButtonAction: 'skip',
                dismissKeyAction: 'replay',
                overlayClickAction: false,
                overlayColor: 'rgba(8, 10, 20, 0.58)',
                primaryColor: '#3B5BDB',
                arrowColor: '#FFF8E7',
                backgroundColor: '#FFF8E7',
                scrollOffset: 96,
                showProgress: true,
                skipBeacon: true,
                spotlightPadding: 8,
                spotlightRadius: 12,
                targetWaitTimeout: 2200,
                width: 360,
                zIndex: 900,
            }}
            locale={{
                back: 'Back',
                close: 'Skip',
                last: 'Done',
                next: 'Next',
                nextWithProgress: 'Next ({current} of {total})',
                skip: 'Skip Tour',
            }}
            styles={{
                tooltip: {
                    backgroundColor: '#FFF8E7',
                    border: '1px solid #eadcc5',
                    borderRadius: 16,
                    boxShadow: '0 24px 70px rgba(74, 54, 30, 0.22)',
                    color: '#111827',
                    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
                    padding: 12,
                },
                arrow: {
                    color: '#FFF8E7',
                },
                tooltipContainer: {
                    backgroundColor: '#FFF8E7',
                },
                tooltipTitle: {
                    color: '#111827',
                    fontSize: 18,
                    fontWeight: 900,
                    lineHeight: 1.2,
                },
                tooltipContent: {
                    color: '#4b5563',
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    padding: '12px 8px 16px',
                },
                buttonPrimary: {
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '10px 16px',
                },
                buttonBack: {
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 800,
                    marginRight: 8,
                },
                buttonSkip: {
                    color: '#6b7280',
                    fontSize: 13,
                    fontWeight: 800,
                },
            }}
        />
    );
}
