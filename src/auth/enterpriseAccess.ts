import type { UserData } from '../components/layout/Header';

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
    case 'org_admin':
      return {
        showHeatmap: true,
        showPlaybooks: true,
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
    case 'org_admin':
      return 'org-admin-overview';
    case 'sen_coordinator':
      return 'sen-inbox';
    case 'super_admin':
      return 'school-directory';
    default:
      return 'class-roster';
  }
}

