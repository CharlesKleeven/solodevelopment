// Backend: jamController.ts - Uses database instead of config file
import { getCurrentJamFromDB } from './jamManagementController';

// Simply forward to the new database-based implementation
export const getCurrentJam = getCurrentJamFromDB;