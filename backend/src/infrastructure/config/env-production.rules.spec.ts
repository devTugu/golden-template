import {
  isPlaceholderSecret,
  jwtSecretsMustDiffer,
} from './env-production.rules';

describe('env production rules', () => {
  it('detects change_me placeholder secrets', () => {
    expect(isPlaceholderSecret('change_me_access_secret_min_32_chars')).toBe(
      true,
    );
    expect(isPlaceholderSecret('real_production_secret_value_32chars')).toBe(
      false,
    );
  });

  it('requires JWT secrets to differ', () => {
    expect(
      jwtSecretsMustDiffer(
        'same_secret_32_chars_minimum!!',
        'same_secret_32_chars_minimum!!',
      ),
    ).toBe(false);
    expect(
      jwtSecretsMustDiffer(
        'access_secret_32_chars_minimum!!',
        'refresh_secret_32_chars_minimum!',
      ),
    ).toBe(true);
  });
});
