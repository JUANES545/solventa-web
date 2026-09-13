import { AppRole } from '../models/domain.models';

export function homeRouteForRole(role: AppRole | null): string {
  return role === 'ADVISOR' ? '/advisor/dashboard' : '/app/dashboard';
}

export function postLoginRoute(role: AppRole | null, requested: string | null): string {
  const prefix = role === 'ADVISOR' ? '/advisor/' : '/app/';
  return requested?.startsWith(prefix) ? requested : homeRouteForRole(role);
}
