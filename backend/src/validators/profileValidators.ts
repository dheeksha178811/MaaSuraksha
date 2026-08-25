const MOTHER_STAGES = ['pregnancy', 'postpartum', 'infant_care'];
const HOSPITAL_FACILITY_TYPES = ['Government PHC', 'District Hospital', 'Private Maternity Center'];
const HOSPITAL_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CURRENT_YEAR = new Date().getFullYear();

type ProfileInput = Record<string, unknown>;

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isISODateString(value: unknown): boolean {
  return isString(value) && !Number.isNaN(Date.parse(value));
}

function isClinicTimingsArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        isString((entry as Record<string, unknown>).day) &&
        isString((entry as Record<string, unknown>).hours)
    )
  );
}

export function validateMotherProfile(profile: ProfileInput): string[] {
  const errors: string[] = [];

  if (profile.age !== undefined && (!isFiniteNumber(profile.age) || profile.age < 0 || profile.age > 120)) {
    errors.push('profile.age must be a number between 0 and 120.');
  }
  if (profile.stage !== undefined && (!isString(profile.stage) || !MOTHER_STAGES.includes(profile.stage))) {
    errors.push(`profile.stage must be one of: ${MOTHER_STAGES.join(', ')}.`);
  }
  if (
    profile.pregnancyWeek !== undefined &&
    (!isFiniteNumber(profile.pregnancyWeek) || profile.pregnancyWeek < 0 || profile.pregnancyWeek > 45)
  ) {
    errors.push('profile.pregnancyWeek must be a number between 0 and 45.');
  }
  if (profile.deliveryDate !== undefined && !isISODateString(profile.deliveryDate)) {
    errors.push('profile.deliveryDate must be a valid date.');
  }
  if (profile.bloodGroup !== undefined && !isString(profile.bloodGroup)) {
    errors.push('profile.bloodGroup must be a string.');
  }
  if (profile.location !== undefined && !isString(profile.location)) {
    errors.push('profile.location must be a string.');
  }

  return errors;
}

export function validateDoctorProfile(profile: ProfileInput): string[] {
  const errors: string[] = [];

  if (profile.specialization !== undefined && !isString(profile.specialization)) {
    errors.push('profile.specialization must be a string.');
  }
  if (profile.qualification !== undefined && !isString(profile.qualification)) {
    errors.push('profile.qualification must be a string.');
  }
  if (profile.hospitalId !== undefined && (!isString(profile.hospitalId) || !UUID_REGEX.test(profile.hospitalId))) {
    errors.push('profile.hospitalId must be a valid UUID.');
  }
  if (
    profile.experienceYears !== undefined &&
    (!isFiniteNumber(profile.experienceYears) || profile.experienceYears < 0)
  ) {
    errors.push('profile.experienceYears must be a non-negative number.');
  }
  if (profile.availableDays !== undefined && !isStringArray(profile.availableDays)) {
    errors.push('profile.availableDays must be an array of strings.');
  }
  if (profile.location !== undefined && !isString(profile.location)) {
    errors.push('profile.location must be a string.');
  }
  if (profile.bio !== undefined && !isString(profile.bio)) {
    errors.push('profile.bio must be a string.');
  }
  if (profile.languagesSpoken !== undefined && !isStringArray(profile.languagesSpoken)) {
    errors.push('profile.languagesSpoken must be an array of strings.');
  }
  if (profile.consultationModes !== undefined && !isStringArray(profile.consultationModes)) {
    errors.push('profile.consultationModes must be an array of strings.');
  }
  if (profile.clinicTimings !== undefined && !isClinicTimingsArray(profile.clinicTimings)) {
    errors.push('profile.clinicTimings must be an array of { day, hours } objects.');
  }
  if (profile.achievements !== undefined && !isStringArray(profile.achievements)) {
    errors.push('profile.achievements must be an array of strings.');
  }

  return errors;
}

export function validateHospitalProfile(profile: ProfileInput): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(profile.facilityName)) {
    errors.push('profile.facilityName is required.');
  }
  if (
    profile.facilityType !== undefined &&
    (!isString(profile.facilityType) || !HOSPITAL_FACILITY_TYPES.includes(profile.facilityType))
  ) {
    errors.push(`profile.facilityType must be one of: ${HOSPITAL_FACILITY_TYPES.join(', ')}.`);
  }
  if (profile.licenseNumber !== undefined && !isString(profile.licenseNumber)) {
    errors.push('profile.licenseNumber must be a string.');
  }
  for (const field of ['address', 'city', 'state', 'postalCode', 'contactNumber', 'tagline', 'visitingHours', 'emergencyContactNumber']) {
    if (profile[field] !== undefined && !isString(profile[field])) {
      errors.push(`profile.${field} must be a string.`);
    }
  }
  if (profile.totalBeds !== undefined && (!isFiniteNumber(profile.totalBeds) || profile.totalBeds < 0)) {
    errors.push('profile.totalBeds must be a non-negative number.');
  }
  if (profile.neonatalIcuAvailable !== undefined && !isBoolean(profile.neonatalIcuAvailable)) {
    errors.push('profile.neonatalIcuAvailable must be a boolean.');
  }
  if (profile.status !== undefined && (!isString(profile.status) || !HOSPITAL_STATUSES.includes(profile.status))) {
    errors.push(`profile.status must be one of: ${HOSPITAL_STATUSES.join(', ')}.`);
  }
  if (
    profile.establishedYear !== undefined &&
    (!isFiniteNumber(profile.establishedYear) || profile.establishedYear < 1800 || profile.establishedYear > CURRENT_YEAR + 1)
  ) {
    errors.push(`profile.establishedYear must be a number between 1800 and ${CURRENT_YEAR + 1}.`);
  }
  if (profile.accreditations !== undefined && !isStringArray(profile.accreditations)) {
    errors.push('profile.accreditations must be an array of strings.');
  }
  if (profile.ambulanceAvailable !== undefined && !isBoolean(profile.ambulanceAvailable)) {
    errors.push('profile.ambulanceAvailable must be a boolean.');
  }

  return errors;
}

export function validateAdminProfile(profile: ProfileInput): string[] {
  const errors: string[] = [];

  if (profile.title !== undefined && !isString(profile.title)) {
    errors.push('profile.title must be a string.');
  }
  if (profile.jurisdictionLevel !== undefined && !isString(profile.jurisdictionLevel)) {
    errors.push('profile.jurisdictionLevel must be a string.');
  }

  return errors;
}

export function validateProfileByRole(role: string, profile: unknown): string[] {
  const input: ProfileInput = profile && typeof profile === 'object' ? (profile as ProfileInput) : {};

  switch (role) {
    case 'mother':
      return validateMotherProfile(input);
    case 'doctor':
      return validateDoctorProfile(input);
    case 'hospital':
      return validateHospitalProfile(input);
    case 'admin':
      return validateAdminProfile(input);
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Update (PATCH) validators. Deliberately narrower than the create validators
// above: only fields the authenticated user is allowed to self-edit are
// accepted at all — anything else is rejected outright rather than silently
// ignored, so a client can never mass-assign an unlisted column (e.g. a
// doctor's specialization/qualification/hospitalId, which are credentialing
// fields managed by MaaSuraksha, not by the doctor).
// ---------------------------------------------------------------------------

const MOTHER_UPDATE_FIELDS = ['age', 'stage', 'pregnancyWeek', 'deliveryDate', 'bloodGroup', 'location'];
const DOCTOR_UPDATE_FIELDS = ['location', 'bio'];
const HOSPITAL_UPDATE_FIELDS = ['address', 'city', 'state', 'postalCode', 'contactNumber', 'totalBeds'];
const ADMIN_UPDATE_FIELDS = ['title', 'jurisdictionLevel'];

function unsupportedFieldErrors(profile: ProfileInput, allowed: string[]): string[] {
  const unknown = Object.keys(profile).filter((key) => !allowed.includes(key));
  return unknown.length > 0 ? [`Unsupported profile field(s): ${unknown.join(', ')}.`] : [];
}

export function validateMotherProfileUpdate(profile: ProfileInput): string[] {
  const errors = unsupportedFieldErrors(profile, MOTHER_UPDATE_FIELDS);

  if (profile.age !== undefined && (!isFiniteNumber(profile.age) || profile.age < 0 || profile.age > 120)) {
    errors.push('profile.age must be a number between 0 and 120.');
  }
  if (profile.stage !== undefined && (!isString(profile.stage) || !MOTHER_STAGES.includes(profile.stage))) {
    errors.push(`profile.stage must be one of: ${MOTHER_STAGES.join(', ')}.`);
  }
  if (
    profile.pregnancyWeek !== undefined &&
    (!isFiniteNumber(profile.pregnancyWeek) || profile.pregnancyWeek < 0 || profile.pregnancyWeek > 45)
  ) {
    errors.push('profile.pregnancyWeek must be a number between 0 and 45.');
  }
  if (profile.deliveryDate !== undefined && !isISODateString(profile.deliveryDate)) {
    errors.push('profile.deliveryDate must be a valid date.');
  }
  if (profile.bloodGroup !== undefined && !isString(profile.bloodGroup)) {
    errors.push('profile.bloodGroup must be a string.');
  }
  if (profile.location !== undefined && !isString(profile.location)) {
    errors.push('profile.location must be a string.');
  }

  return errors;
}

export function validateDoctorProfileUpdate(profile: ProfileInput): string[] {
  const errors = unsupportedFieldErrors(profile, DOCTOR_UPDATE_FIELDS);

  if (profile.location !== undefined && !isString(profile.location)) {
    errors.push('profile.location must be a string.');
  }
  if (profile.bio !== undefined && !isString(profile.bio)) {
    errors.push('profile.bio must be a string.');
  }

  return errors;
}

export function validateHospitalProfileUpdate(profile: ProfileInput): string[] {
  const errors = unsupportedFieldErrors(profile, HOSPITAL_UPDATE_FIELDS);

  for (const field of ['address', 'city', 'state', 'postalCode', 'contactNumber']) {
    if (profile[field] !== undefined && !isString(profile[field])) {
      errors.push(`profile.${field} must be a string.`);
    }
  }
  if (profile.totalBeds !== undefined && (!isFiniteNumber(profile.totalBeds) || profile.totalBeds < 0)) {
    errors.push('profile.totalBeds must be a non-negative number.');
  }

  return errors;
}

export function validateAdminProfileUpdate(profile: ProfileInput): string[] {
  const errors = unsupportedFieldErrors(profile, ADMIN_UPDATE_FIELDS);

  if (profile.title !== undefined && !isString(profile.title)) {
    errors.push('profile.title must be a string.');
  }
  if (profile.jurisdictionLevel !== undefined && !isString(profile.jurisdictionLevel)) {
    errors.push('profile.jurisdictionLevel must be a string.');
  }

  return errors;
}

export function validateProfileUpdateByRole(role: string, profile: unknown): string[] {
  const input: ProfileInput =
    profile && typeof profile === 'object' && !Array.isArray(profile) ? (profile as ProfileInput) : {};

  switch (role) {
    case 'mother':
      return validateMotherProfileUpdate(input);
    case 'doctor':
      return validateDoctorProfileUpdate(input);
    case 'hospital':
      return validateHospitalProfileUpdate(input);
    case 'admin':
      return validateAdminProfileUpdate(input);
    default:
      return Object.keys(input).length > 0 ? ['No profile fields are editable for this role.'] : [];
  }
}
