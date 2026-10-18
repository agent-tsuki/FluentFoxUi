/** ISO 3166-1 alpha-2 codes; names come from the browser (Intl.DisplayNames). */
const COUNTRY_CODES = (
  'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ ' +
  'DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ ' +
  'OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ ' +
  'UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'
).split(' ')

let displayNames: Intl.DisplayNames | null | undefined

function names(): Intl.DisplayNames | null {
  if (displayNames === undefined) {
    try {
      displayNames = new Intl.DisplayNames(undefined, { type: 'region' })
    } catch {
      displayNames = null
    }
  }
  return displayNames
}

/** "JP" → "Japan"; falls back to the code itself. */
export function countryName(code: string | null | undefined): string {
  if (!code) return ''
  return names()?.of(code) ?? code
}

export interface CountryOption {
  code: string
  name: string
}

let options: CountryOption[] | null = null

/** All countries, sorted by their name in the user's language. */
export function countryOptions(): CountryOption[] {
  options ??= COUNTRY_CODES
    .map(code => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return options
}

/** "Tokyo, Japan" from whichever parts are known. */
export function placeLabel(city: string | null | undefined, countryCode: string | null | undefined): string {
  return [city, countryName(countryCode)].filter(Boolean).join(', ')
}
