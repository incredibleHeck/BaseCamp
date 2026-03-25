import type { UserData } from '../components/Header';

export type EnterpriseRole = UserData['role'];

export interface EnterpriseNavFlags {
  showHeatmap: boolean;
  showPlaybooks: boolean;
  showSenInbox: boolean;
}

export function enterpriseNavForRole(role: EnterpriseRole): EnterpriseNavFlags {
  switch (role) {
    case 'teacher':
      return {
        showHeatmap: false,
        showPlaybooks: false,
        showSenInbox: false,
      };
    case 'headteacher':
      return {
        showHeatmap: false,
        showPlaybooks: true,
        showSenInbox: false,
      };
    case 'district':
      return {
        showHeatmap: true,
        showPlaybooks: true,
        showSenInbox: false,
      };
    case 'circuit_supervisor':
      return {
        showHeatmap: true,
        showPlaybooks: false,
        showSenInbox: false,
      };
    case 'sen_coordinator':
      return {
        showHeatmap: true,
        showPlaybooks: false,
        showSenInbox: true,
      };
    case 'super_admin':
      return {
        showHeatmap: true,
        showPlaybooks: true,
        showSenInbox: true,
      };
    default:
      return {
        showHeatmap: false,
        showPlaybooks: false,
        showSenInbox: false,
      };
  }
}

export function defaultViewForRole(role: EnterpriseRole): string {
  switch (role) {
    case 'teacher':
      return 'class-roster';
    case 'headteacher':
      return 'school-overview';
    case 'district':
      return 'district-overview';
    case 'circuit_supervisor':
      return 'district-heatmap';
    case 'sen_coordinator':
      return 'sen-inbox';
    case 'super_admin':
      return 'district-overview';
    default:
      return 'class-roster';
  }
}
