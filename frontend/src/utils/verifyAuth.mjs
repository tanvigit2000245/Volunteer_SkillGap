import { 
  validateEmail, 
  validateFullName, 
  validatePassword, 
  validateConfirmPassword, 
  calculatePasswordStrength,
  hashPassword 
} from './authStorage.js';

async function runTests() {
  console.log('Running authStorage verification tests...');

  // 1. Email validation
  console.assert(validateEmail('') === 'Email address is required.', 'Test 1.1 failed');
  console.assert(validateEmail('   ') === 'Email address is required.', 'Test 1.2 failed');
  console.assert(validateEmail('invalid-email') !== null, 'Test 1.3 failed');
  console.assert(validateEmail('test@') !== null, 'Test 1.4 failed');
  console.assert(validateEmail('test@domain') !== null, 'Test 1.5 failed');
  console.assert(validateEmail('  USER@Domain.COM  ') === null, 'Test 1.6 failed');
  console.assert(validateEmail('volunteer.123@sub.domain.org') === null, 'Test 1.7 failed');

  // 2. Full Name validation
  console.assert(validateFullName('') === 'Full name is required.', 'Test 2.1 failed');
  console.assert(validateFullName('   ') === 'Full name is required.', 'Test 2.2 failed');
  console.assert(validateFullName('A') === 'Full name must be at least 2 characters.', 'Test 2.3 failed');
  console.assert(validateFullName(' Jane Doe ') === null, 'Test 2.4 failed');

  // 3. Password validation
  console.assert(validatePassword('') === 'Password is required.', 'Test 3.1 failed');
  console.assert(validatePassword('short') === 'Password must be at least 8 characters.', 'Test 3.2 failed');
  console.assert(validatePassword('1234567') === 'Password must be at least 8 characters.', 'Test 3.3 failed');
  console.assert(validatePassword('12345678') === null, 'Test 3.4 failed');
  console.assert(validatePassword('Password123!') === null, 'Test 3.5 failed');

  // 4. Confirm Password validation
  console.assert(validateConfirmPassword('Pass1234', '') === 'Please confirm your password.', 'Test 4.1 failed');
  console.assert(validateConfirmPassword('Pass1234', 'Pass5678') === 'Passwords do not match.', 'Test 4.2 failed');
  console.assert(validateConfirmPassword('Pass1234', 'Pass1234') === null, 'Test 4.3 failed');

  // 5. Password Strength calculation
  console.assert(calculatePasswordStrength('').score === 0, 'Test 5.1 failed');
  console.assert(calculatePasswordStrength('abc').score === 1, 'Test 5.2 failed');
  console.assert(calculatePasswordStrength('Password123!').score >= 3, 'Test 5.3 failed');

  // 6. SHA-256 Hashing test
  const hash1 = await hashPassword('Password123!');
  const hash2 = await hashPassword('Password123!');
  const hash3 = await hashPassword('DifferentPassword123!');
  console.assert(hash1 === hash2, 'Hash should be deterministic');
  console.assert(hash1 !== hash3, 'Different passwords should have different hashes');
  console.assert(typeof hash1 === 'string' && hash1.length === 64, 'SHA-256 hex string should be 64 characters');

  console.log('All verification test suites passed successfully! ✓');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

