import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from '../models/outreach.model';
import {
  mapHeadersToOutreachKeys,
  normalizeOutreachHeader,
  outreachToRow,
  rowToOutreach,
} from './outreach-row.mapper';

describe('outreach-row.mapper', () => {
  describe('normalizeOutreachHeader', () => {
    it('should map various column name variations correctly', () => {
      expect(normalizeOutreachHeader('Outreach ID')).toBe('id');
      expect(normalizeOutreachHeader('member_id')).toBe('memberId');
      expect(normalizeOutreachHeader('Contacted By')).toBe('contactedBy');
      expect(normalizeOutreachHeader('Contacted At')).toBe('contactedAt');
      expect(normalizeOutreachHeader('Contact Method')).toBe('contactMethod');
      expect(normalizeOutreachHeader('Status')).toBe('status');
      expect(normalizeOutreachHeader('Message')).toBe('message');
      expect(normalizeOutreachHeader('Response')).toBe('response');
      expect(normalizeOutreachHeader('Next Follow Up Date')).toBe(
        'nextFollowUpDate',
      );
      expect(normalizeOutreachHeader('Created At')).toBe('createdAt');
      expect(normalizeOutreachHeader('Updated At')).toBe('updatedAt');
      expect(normalizeOutreachHeader('random_header')).toBe('unknown');
    });
  });

  describe('rowToOutreach and outreachToRow', () => {
    const headers = [
      'Outreach ID',
      'Member ID',
      'Contacted By',
      'Contacted At',
      'Contact Method',
      'Status',
      'Message',
      'Response',
      'Next Follow Up Date',
      'Created At',
      'Updated At',
    ];
    const headerKeys = mapHeadersToOutreachKeys(headers);

    it('should map a full row to an Outreach domain model', () => {
      const row = [
        'out-101',
        'mem-001',
        'Coach Musa',
        '2026-09-10T10:00:00.000Z',
        'WHATSAPP',
        'RESPONDED',
        'Checking in on training',
        'I had exams, returning next week',
        '2026-09-20',
        '2026-09-10T10:00:00.000Z',
        '2026-09-10T10:05:00.000Z',
      ];

      const model = rowToOutreach(headerKeys, row, 2);
      expect(model.id).toBe('out-101');
      expect(model.memberId).toBe('mem-001');
      expect(model.contactedBy).toBe('Coach Musa');
      expect(model.contactMethod).toBe(ContactMethod.WHATSAPP);
      expect(model.status).toBe(OutreachStatus.RESPONDED);
      expect(model.message).toBe('Checking in on training');
      expect(model.response).toBe('I had exams, returning next week');
      expect(model.nextFollowUpDate).toBe('2026-09-20');
    });

    it('should handle missing or invalid enum values with safe defaults', () => {
      const row = [
        'out-102',
        'mem-002',
        '',
        '',
        'INVALID_METHOD',
        'INVALID_STATUS',
        '',
      ];
      const model = rowToOutreach(headerKeys, row, 3);
      expect(model.id).toBe('out-102');
      expect(model.contactMethod).toBe(ContactMethod.OTHER);
      expect(model.status).toBe(OutreachStatus.UNKNOWN);
      expect(model.nextFollowUpDate).toBeNull();
    });

    it('should convert an Outreach model into a row array', () => {
      const outreach: Outreach = {
        id: 'out-103',
        memberId: 'mem-003',
        contactedBy: 'Coach Jane',
        contactedAt: '2026-09-11T12:00:00.000Z',
        contactMethod: ContactMethod.PHONE_CALL,
        status: OutreachStatus.WILL_RETURN,
        message: 'Called member',
        response: 'Will join Friday session',
        nextFollowUpDate: '2026-09-18',
        createdAt: '2026-09-11T12:00:00.000Z',
        updatedAt: '2026-09-11T12:00:00.000Z',
      };

      const row = outreachToRow(outreach);
      expect(row[0]).toBe('out-103');
      expect(row[1]).toBe('mem-003');
      expect(row[4]).toBe('PHONE_CALL');
      expect(row[5]).toBe('WILL_RETURN');
      expect(row[8]).toBe('2026-09-18');
    });
  });
});
