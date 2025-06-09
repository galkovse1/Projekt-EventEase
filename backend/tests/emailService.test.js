const { sendReminderEmail } = require('../utils/emailService');

describe('sendReminderEmail', () => {
  it('should be defined', () => {
    expect(sendReminderEmail).toBeDefined();
  });
});
