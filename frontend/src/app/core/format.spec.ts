import { firstName, initials, roleLabel } from './format';

describe('format', () => {
  it('shows up to two initials of a name', () => {
    expect(initials('Maria Silva')).toBe('MS');
    expect(initials('  fernando de sonegheti ')).toBe('FD');
    expect(initials('')).toBe('');
  });

  it('shows the first name', () => {
    expect(firstName('Fernando Sonegheti')).toBe('Fernando');
    expect(firstName('')).toBe('');
  });

  it('labels the roles', () => {
    expect(roleLabel('ADMIN')).toBe('Administrator');
    expect(roleLabel('SELLER')).toBe('Seller');
  });
});
