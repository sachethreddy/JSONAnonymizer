module.exports = {
  faker: {
    person: { fullName: () => 'Fake Name' },
    internet: { email: () => 'fake@email.com' },
    phone: { number: () => '555-555-5555' },
    location: { streetAddress: () => '123 Fake St' },
    finance: { creditCardNumber: () => '1111222233334444' },
    string: { uuid: () => 'fake-uuid' },
    lorem: { word: () => 'fake' }
  }
};
