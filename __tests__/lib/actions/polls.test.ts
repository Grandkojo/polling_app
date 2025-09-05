import { createPoll, vote, deletePoll, createShareCode } from '../../../lib/actions/polls';
import { supabaseAdmin } from '../../../lib/supabase/server';

// Mock the supabaseAdmin
jest.mock('../../../lib/supabase/server', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('Poll Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll successfully with valid data', async () => {
      // Mock data
      const userId = 'user-123';
      const mockPoll = { id: 'poll-123', title: 'Test Poll' };
      const mockFormData = new FormData();
      mockFormData.append('title', 'Test Poll');
      mockFormData.append('description', 'Test Description');
      mockFormData.append('isPublic', 'true');
      mockFormData.append('allowMultipleVotes', 'false');
      mockFormData.append('allowAnonymousVotes', 'true');
      mockFormData.append('expiresAt', '');
      mockFormData.append('options', 'Option 1');
      mockFormData.append('options', 'Option 2');

      // Mock the chained methods
      const mockSingle = jest.fn();
      const mockSelect = jest.fn(() => ({ single: mockSingle }));
      const mockInsert = jest.fn(() => ({ select: mockSelect }));
      const mockFrom = jest.fn(() => ({ insert: mockInsert }));

      mockSupabaseAdmin.from = mockFrom;
      mockSingle
        .mockResolvedValueOnce({ data: mockPoll, error: null }) // Poll creation
        .mockResolvedValueOnce({ data: null, error: null }); // Options creation

      // Execute
      const result = await createPoll(mockFormData, userId);

      // Assert
      expect(result).toEqual({ success: true, pollId: 'poll-123' });
      expect(mockFrom).toHaveBeenCalledWith('polls');
      expect(mockFrom).toHaveBeenCalledWith('poll_options');
    });

    it('should return error when title is missing', async () => {
      const userId = 'user-123';
      const mockFormData = new FormData();
      mockFormData.append('title', '');
      mockFormData.append('options', 'Option 1');
      mockFormData.append('options', 'Option 2');

      const result = await createPoll(mockFormData, userId);

      expect(result).toEqual({
        success: false,
        error: 'Poll title is required',
      });
    });

    it('should return error when less than 2 options provided', async () => {
      const userId = 'user-123';
      const mockFormData = new FormData();
      mockFormData.append('title', 'Test Poll');
      mockFormData.append('options', 'Option 1');

      const result = await createPoll(mockFormData, userId);

      expect(result).toEqual({
        success: false,
        error: 'At least 2 options are required',
      });
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const mockFormData = new FormData();
      mockFormData.append('title', 'Test Poll');
      mockFormData.append('options', 'Option 1');
      mockFormData.append('options', 'Option 2');

      const mockSingle = jest.fn();
      const mockSelect = jest.fn(() => ({ single: mockSingle }));
      const mockInsert = jest.fn(() => ({ select: mockSelect }));
      const mockFrom = jest.fn(() => ({ insert: mockInsert }));

      mockSupabaseAdmin.from = mockFrom;
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await createPoll(mockFormData, userId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to create poll',
      });
    });
  });

  describe('vote', () => {


    it('should return error when poll ID or option ID is missing', async () => {
      const mockFormData = new FormData();
      mockFormData.append('pollId', '');

      const result = await vote(mockFormData);

      expect(result).toEqual({
        success: false,
        error: 'Poll ID and option ID are required',
      });
    });

    it('should return error when poll is not found', async () => {
      const mockFormData = new FormData();
      mockFormData.append('pollId', 'poll-123');
      mockFormData.append('optionId', 'option-123');

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await vote(mockFormData);

      expect(result).toEqual({
        success: false,
        error: 'Failed to vote',
      });
    });

    it('should return error when poll has expired', async () => {
      const mockFormData = new FormData();
      mockFormData.append('pollId', 'poll-123');
      mockFormData.append('optionId', 'option-123');

      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const mockPoll = {
        id: 'poll-123',
        expires_at: expiredDate.toISOString(),
      };

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: mockPoll,
        error: null,
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await vote(mockFormData);

      expect(result).toEqual({
        success: false,
        error: 'This poll has expired',
      });
    });

    it('should return error when rate limit is exceeded', async () => {
      const mockFormData = new FormData();
      mockFormData.append('pollId', 'poll-123');
      mockFormData.append('optionId', 'option-123');

      const mockPoll = {
        id: 'poll-123',
        expires_at: null,
      };

      const mockSingle = jest.fn();
      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      const mockFrom = jest.fn(() => ({ select: mockSelect }));

      mockSupabaseAdmin.from = mockFrom;
      mockSingle.mockResolvedValueOnce({
        data: mockPoll,
        error: null,
      });

      // Mock RPC call to return false (rate limit exceeded)
      mockSupabaseAdmin.rpc.mockResolvedValueOnce({
        data: false,
        error: null,
      });

      const result = await vote(mockFormData);

      expect(result).toEqual({
        success: false,
        error: 'Rate limit exceeded. Please wait before voting again.',
      });
    });
  });

  describe('deletePoll', () => {
    it('should delete poll successfully when user is owner', async () => {
      const pollId = 'poll-123';
      const userId = 'user-123';

      const mockPoll = { created_by: userId };

      const mockSingle = jest.fn();
      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      const mockDelete = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) }));
      const mockFrom = jest.fn(() => ({ select: mockSelect, delete: mockDelete }));

      mockSupabaseAdmin.from = mockFrom;
      mockSingle.mockResolvedValueOnce({
        data: mockPoll,
        error: null,
      });

      const result = await deletePoll(pollId, userId);

      expect(result).toEqual({ success: true });
    });

    it('should return error when poll is not found', async () => {
      const pollId = 'poll-123';
      const userId = 'user-123';

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await deletePoll(pollId, userId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to delete poll',
      });
    });

    it('should return error when user is not the owner', async () => {
      const pollId = 'poll-123';
      const userId = 'user-123';
      const otherUserId = 'user-456';

      const mockPoll = { created_by: otherUserId };

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: mockPoll,
        error: null,
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await deletePoll(pollId, userId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized to delete this poll',
      });
    });
  });

  describe('createShareCode', () => {

    it('should return error when poll is not found', async () => {
      const pollId = 'poll-123';
      const userId = 'user-123';

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await createShareCode(pollId, userId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to create share code',
      });
    });

    it('should return error when user is not the owner', async () => {
      const pollId = 'poll-123';
      const userId = 'user-123';
      const otherUserId = 'user-456';

      const mockPoll = { created_by: otherUserId };

      const mockFrom = jest.fn();
      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockSingle = jest.fn();

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockSingle.mockResolvedValueOnce({
        data: mockPoll,
        error: null,
      });

      mockSupabaseAdmin.from = mockFrom;

      const result = await createShareCode(pollId, userId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized to share this poll',
      });
    });
  });
});
