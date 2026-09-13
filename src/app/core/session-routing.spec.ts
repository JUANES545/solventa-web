import { homeRouteForRole, postLoginRoute } from './session-routing';

describe('role-based session routing', () => {
  it('redirects each role to its own dashboard', () => {
    expect(homeRouteForRole('CLIENT')).toBe('/app/dashboard');
    expect(homeRouteForRole('ADVISOR')).toBe('/advisor/dashboard');
  });

  it('keeps only return URLs allowed for the authenticated role', () => {
    expect(postLoginRoute('ADVISOR', '/advisor/clients')).toBe('/advisor/clients');
    expect(postLoginRoute('ADVISOR', '/app/policies')).toBe('/advisor/dashboard');
    expect(postLoginRoute('CLIENT', '/advisor/dashboard')).toBe('/app/dashboard');
  });
});
