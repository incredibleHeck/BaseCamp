import type { UserData } from '../components/layout/Header';

export type EnterpriseRole = UserData['role'];

export interface EnterpriseNavFlags {
  showCampusGapAnalysis: boolean;
  showPlaybooks: boolean;
  showSenInbox: boolean;
}

export function enterpriseNavForRole(role: EnterpriseRole): EnterpriseNavFlags {
  switch (role) {
    case 'teacher':
      return {
        showCampusGapAnalysis: false,
        showPlaybooks: false,
        showSenInbox: false,
      };
    case 'headteacher':
      return {
        showCampusGapAnalysis: false,
        showPlaybooks: true,
        showSenInbox: false,
      };
    case 'org_admin':
      return {
        showCampusGapAnalysis: true,
        showPlaybooks: true,
        showSenInbox: false,
      };
    case 'sen_coordinator':
      return {
        showCampusGapAnalysis: true,
        showPlaybooks: false,
        showSenInbox: true,
      };
    case 'super_admin':
      return {
        showCampusGapAnalysis: true,
        showPlaybooks: true,
        showSenInbox: true,
      };
    default:
      return {
        showCampusGapAnalysis: false,
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
      return 'organization-directory';
    default:
      return 'class-roster';
  }
}

