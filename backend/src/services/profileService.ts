import { PoolClient } from 'pg';
import { pool } from '../config/db';

type ProfileInput = Record<string, unknown>;

async function createMotherProfile(client: PoolClient, userId: string, profile: ProfileInput) {
  const result = await client.query(
    `INSERT INTO mother_profiles (id, age, stage, pregnancy_week, delivery_date, blood_group, location)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      profile.age ?? null,
      profile.stage ?? null,
      profile.pregnancyWeek ?? null,
      profile.deliveryDate ?? null,
      profile.bloodGroup ?? null,
      profile.location ?? null,
    ]
  );
  return result.rows[0];
}

async function createDoctorProfile(client: PoolClient, userId: string, profile: ProfileInput) {
  const result = await client.query(
    `INSERT INTO doctor_profiles (
       id, specialization, qualification, hospital_id, experience_years,
       available_days, location, bio, languages_spoken, consultation_modes,
       clinic_timings, achievements
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      userId,
      profile.specialization ?? null,
      profile.qualification ?? null,
      profile.hospitalId ?? null,
      profile.experienceYears ?? null,
      profile.availableDays ?? null,
      profile.location ?? null,
      profile.bio ?? null,
      profile.languagesSpoken ?? null,
      profile.consultationModes ?? null,
      profile.clinicTimings !== undefined ? JSON.stringify(profile.clinicTimings) : null,
      profile.achievements ?? null,
    ]
  );
  return result.rows[0];
}

async function createHospitalProfile(client: PoolClient, userId: string, profile: ProfileInput) {
  const result = await client.query(
    `INSERT INTO hospital_profiles (
       id, facility_name, facility_type, license_number, address, city, state,
       postal_code, contact_number, total_beds, neonatal_icu_available, status,
       tagline, established_year, accreditations, visiting_hours,
       emergency_contact_number, ambulance_available
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      userId,
      profile.facilityName,
      profile.facilityType ?? null,
      profile.licenseNumber ?? null,
      profile.address ?? null,
      profile.city ?? null,
      profile.state ?? null,
      profile.postalCode ?? null,
      profile.contactNumber ?? null,
      profile.totalBeds ?? 0,
      profile.neonatalIcuAvailable ?? false,
      profile.status ?? 'ACTIVE',
      profile.tagline ?? null,
      profile.establishedYear ?? null,
      profile.accreditations ?? null,
      profile.visitingHours ?? null,
      profile.emergencyContactNumber ?? null,
      profile.ambulanceAvailable ?? false,
    ]
  );
  return result.rows[0];
}

async function createAdminProfile(client: PoolClient, userId: string, profile: ProfileInput) {
  const result = await client.query(
    `INSERT INTO admin_profiles (id, title, jurisdiction_level)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, profile.title ?? null, profile.jurisdictionLevel ?? null]
  );
  return result.rows[0];
}

export async function createProfileForRole(
  client: PoolClient,
  userId: string,
  role: string,
  profile: ProfileInput
) {
  switch (role) {
    case 'mother':
      return createMotherProfile(client, userId, profile);
    case 'doctor':
      return createDoctorProfile(client, userId, profile);
    case 'hospital':
      return createHospitalProfile(client, userId, profile);
    case 'admin':
      return createAdminProfile(client, userId, profile);
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
}

/**
 * Read-side counterpart to createProfileForRole. The role is switched over
 * (never interpolated into SQL) so the table name is always one of the four
 * literals below, regardless of what a caller passes in.
 */
export async function getProfileForRole(
  userId: string,
  role: string
): Promise<Record<string, unknown> | null> {
  let result;
  switch (role) {
    case 'mother':
      result = await pool.query('SELECT * FROM mother_profiles WHERE id = $1', [userId]);
      break;
    case 'doctor':
      result = await pool.query('SELECT * FROM doctor_profiles WHERE id = $1', [userId]);
      break;
    case 'hospital':
      result = await pool.query('SELECT * FROM hospital_profiles WHERE id = $1', [userId]);
      break;
    case 'admin':
      result = await pool.query('SELECT * FROM admin_profiles WHERE id = $1', [userId]);
      break;
    default:
      return null;
  }
  return result.rows[0] ?? null;
}
