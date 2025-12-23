/**
* Supported tax years
*/
export type TaxYear = 2025 | 2026

/**
 * Supported province/territory codes
 */
export type ProvinceCode =
  | 'AB' 
  | 'BC' 
  | 'MB' 
  | 'NB' 
  | 'NL' 
  | 'NS' 
  | 'NT' 
  | 'NU' 
  | 'ON' 
  | 'PE' 
  | 'QC' 
  | 'SK' 
  | 'YT'; 

/**
* Tax type: personal or corporate
*/
export interface TaxBracket {
    min: number;
    max: number | null; // null means no upper limit
    rate: number; 
}


