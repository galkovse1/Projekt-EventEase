jest.mock('../models/Event');
jest.mock('../models/EventSignup');
jest.mock('../models/User');
jest.mock('../utils/emailService');

const Event = require('../models/Event');
const EventSignup = require('../models/EventSignup');
const User = require('../models/User');
const { sendReminderEmail } = require('../utils/emailService');
const runReminderJob = require('../reminderScheduler');

describe('runReminderJob', () => {
    it('should run without crashing', async () => {
        Event.findAll.mockResolvedValue([]);
        await expect(runReminderJob()).resolves.not.toThrow();
    });
});