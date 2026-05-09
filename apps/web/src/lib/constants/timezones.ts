export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
}

export const CURATED_TIMEZONES: TimezoneOption[] = [
  // North America
  {
    value: 'America/New_York',
    label: 'Eastern Time (ET)',
    region: 'North America',
  },
  {
    value: 'America/Chicago',
    label: 'Central Time (CT)',
    region: 'North America',
  },
  {
    value: 'America/Denver',
    label: 'Mountain Time (MT)',
    region: 'North America',
  },
  {
    value: 'America/Phoenix',
    label: 'Arizona (no DST)',
    region: 'North America',
  },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time (PT)',
    region: 'North America',
  },
  { value: 'America/Anchorage', label: 'Alaska Time', region: 'North America' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto (ET)', region: 'North America' },
  {
    value: 'America/Vancouver',
    label: 'Vancouver (PT)',
    region: 'North America',
  },
  {
    value: 'America/Edmonton',
    label: 'Edmonton (MT)',
    region: 'North America',
  },
  // South America
  {
    value: 'America/Sao_Paulo',
    label: 'São Paulo (BRT)',
    region: 'South America',
  },
  {
    value: 'America/Buenos_Aires',
    label: 'Buenos Aires (ART)',
    region: 'South America',
  },
  { value: 'America/Bogota', label: 'Bogotá (COT)', region: 'South America' },
  {
    value: 'America/Mexico_City',
    label: 'Mexico City (CST)',
    region: 'North America',
  },
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', region: 'Europe' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', region: 'Europe' },
  {
    value: 'Europe/Amsterdam',
    label: 'Amsterdam (CET/CEST)',
    region: 'Europe',
  },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)', region: 'Europe' },
  {
    value: 'Europe/Stockholm',
    label: 'Stockholm (CET/CEST)',
    region: 'Europe',
  },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)', region: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', region: 'Europe' },
  // Middle East & Africa
  { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Middle East' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)', region: 'Middle East' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)', region: 'Middle East' },
  { value: 'Asia/Bahrain', label: 'Bahrain (AST)', region: 'Middle East' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', region: 'Africa' },
  {
    value: 'Africa/Johannesburg',
    label: 'Johannesburg (SAST)',
    region: 'Africa',
  },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', region: 'Africa' },
  // Asia Pacific
  { value: 'Asia/Kolkata', label: 'India (IST)', region: 'Asia' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (SLST)', region: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', region: 'Asia' },
  { value: 'Asia/Karachi', label: 'Pakistan (PKT)', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'China (CST)', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', region: 'Asia' },
  // Pacific
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', region: 'Pacific' },
  {
    value: 'Australia/Melbourne',
    label: 'Melbourne (AEST/AEDT)',
    region: 'Pacific',
  },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', region: 'Pacific' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', region: 'Pacific' },
  {
    value: 'Pacific/Auckland',
    label: 'Auckland (NZST/NZDT)',
    region: 'Pacific',
  },
  { value: 'UTC', label: 'UTC', region: 'Other' },
];

export function getAllTimezones(): string[] {
  try {
    return (
      Intl as unknown as { supportedValuesOf(_: string): string[] }
    ).supportedValuesOf('timeZone');
  } catch {
    return CURATED_TIMEZONES.map(tz => tz.value);
  }
}
