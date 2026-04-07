const { faker } = require('@faker-js/faker');

// Enable deterministic faking based on string values if needed by setting a seed.
// For now, we will just use random faking unless deterministic feature requires seeding.

export function fake(type?: 'name' | 'email' | 'phone' | 'address' | 'creditCard' | 'uuid', seedValue?: string): string {
  if (seedValue) {
    // Generate a simple number seed from the string value to make it deterministic
    let seed = 0;
    for (let i = 0; i < seedValue.length; i++) {
        seed = (seed << 5) - seed + seedValue.charCodeAt(i);
        seed |= 0;
    }
    faker.seed(seed);
  }

  const result = (() => {
    switch(type as string) {
        case 'name': return faker.person.fullName();
        case 'email': return faker.internet.email();
        case 'phone': return faker.phone.number();
        case 'address': return faker.location.streetAddress();
        case 'city': return faker.location.city();
        case 'state': return faker.location.state();
        case 'zip': return faker.string.numeric(5);
        case 'country': return faker.location.country();
        case 'date': return faker.date.past().toISOString().split('T')[0];
        case 'creditCard': return faker.finance.creditCardNumber();
        case 'uuid': return faker.string.uuid();
        default: return faker.lorem.word();
    }
  })();

  if (seedValue) {
      // Reset seed to avoid affecting other fake generations
      faker.seed();
  }

  return result;
}
