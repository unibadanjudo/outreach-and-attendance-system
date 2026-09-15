import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { GoogleSheetsMemberRepository } from './google-sheets-member.repository';

describe('GoogleSheetsMemberRepository', () => {
  let repository: GoogleSheetsMemberRepository;
  let mockSheetsService: { readRange: jest.Mock };

  const sampleHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Other Names',
    'Nick Name',
    'Phone Number',
    'Faculty-Department',
    'Matric',
    'Date Of Birth',
    'Date You Started Judo',
    'Primary Motivation for Training Judo',
  ];

  const sampleRows = [
    [
      '2026-01-01',
      'Jigoro',
      'Kano',
      'Master',
      'Father of Judo',
      '08011112222',
      'Education - Sports',
      '111111',
      '1860-10-28',
      '1882-05-01',
      'Self Defense & Education',
    ],
    [
      '2026-01-02',
      'Yasuhiro',
      'Yamashita',
      '',
      'Yasu',
      '08033334444',
      'Physical Education',
      '222222',
      '1957-06-01',
      '1970-01-01',
      'Competition',
    ],
  ];

  beforeEach(() => {
    mockSheetsService = {
      readRange: jest.fn().mockResolvedValue([sampleHeaders, ...sampleRows]),
    };

    const configService = {
      get: jest.fn().mockReturnValue('Members!A:Z'),
    } as unknown as ConfigService;

    repository = new GoogleSheetsMemberRepository(
      mockSheetsService as unknown as GoogleSheetsService,
      configService,
    );
  });

  it('findAll should return all members from sheet', async () => {
    const members = await repository.findAll();
    expect(members).toHaveLength(2);
    expect(members[0].firstName).toBe('Jigoro');
    expect(members[0].id).toBe('mem_08011112222');
    expect(members[1].firstName).toBe('Yasuhiro');
  });

  it('findAll should return empty list when sheet is empty or headers only', async () => {
    mockSheetsService.readRange.mockResolvedValueOnce([sampleHeaders]);
    const members = await repository.findAll();
    expect(members).toEqual([]);
  });

  it('findById should match by generated member ID', async () => {
    const member = await repository.findById('mem_08011112222');
    expect(member).not.toBeNull();
    expect(member?.firstName).toBe('Jigoro');
  });

  it('findById should match by raw or formatted phone number', async () => {
    const member = await repository.findById('080-3333-4444');
    expect(member).not.toBeNull();
    expect(member?.firstName).toBe('Yasuhiro');
  });

  it('findById should match by matric number', async () => {
    const member = await repository.findById('111111');
    expect(member).not.toBeNull();
    expect(member?.firstName).toBe('Jigoro');
  });

  it('findById should return null when no member matches', async () => {
    const member = await repository.findById('non_existent');
    expect(member).toBeNull();
  });

  it('findByPhone should match by phone number', async () => {
    const member = await repository.findByPhone('08011112222');
    expect(member?.lastName).toBe('Kano');
  });

  it('findByMatric should match by matric number', async () => {
    const member = await repository.findByMatric('222222');
    expect(member?.lastName).toBe('Yamashita');
  });

  it('search should filter across multiple fields', async () => {
    const resultsName = await repository.search('jigoro');
    expect(resultsName).toHaveLength(1);

    const resultsDept = await repository.search('Education');
    expect(resultsDept).toHaveLength(2);

    const resultsMatric = await repository.search('222222');
    expect(resultsMatric).toHaveLength(1);
  });
});
