// ---------------------------------------------------------------------------
// Mother-side "My MaaSuraksha QR" module.
// Represents the issued digital care-identity card for a mother — kept
// separate from the core `MotherProfile` type so that is left untouched.
// Carries its own stable cardId plus the motherId it belongs to, so this can
// migrate directly to a `careCards` collection in MongoDB later. The QR
// payload itself is derived at render time from the mother/child/doctor/
// hospital records rather than stored, so it always reflects current data.
// ---------------------------------------------------------------------------

export interface MaternalCareCard {
  cardId: string;
  motherId: string;
  maaSurakshaId: string;
  issuedDate: string;
  validThrough: string;
}
