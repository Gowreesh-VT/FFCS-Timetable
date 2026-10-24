// Flags that were fully rolled out are hardcoded as always-on below.
// Only flags that are still toggled remotely in PostHog live in FEATURE_FLAGS.
// (`maintenance-mode` is read directly in MaintenanceGuard.)
export const FEATURE_FLAGS = {
  courseUpdateAlert: 'course_update_alert',
} as const;

export type FeatureFlagName = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];
