import { FormData } from 'formdata-node';

// Helper function to create FormData for testing
export function createTestFormData(data: Record<string, string | string[]>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
}

// Mock poll data for testing
export const mockPoll = {
  id: 'poll-123',
  title: 'Test Poll',
  description: 'Test Description',
  is_public: true,
  allow_multiple_votes: false,
  allow_anonymous_votes: true,
  expires_at: null,
  created_by: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock poll option data for testing
export const mockPollOptions = [
  {
    id: 'option-1',
    poll_id: 'poll-123',
    text: 'Option 1',
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'option-2',
    poll_id: 'poll-123',
    text: 'Option 2',
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// Mock vote data for testing
export const mockVote = {
  id: 'vote-123',
  poll_id: 'poll-123',
  option_id: 'option-1',
  user_id: 'user-123',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0',
  created_at: '2024-01-01T00:00:00Z',
};

// Mock share code data for testing
export const mockShareCode = {
  id: 'share-123',
  poll_id: 'poll-123',
  share_code: 'ABC123',
  created_by: 'user-123',
  expires_at: null,
  created_at: '2024-01-01T00:00:00Z',
};

// Helper to create mock Supabase response
export function createMockSupabaseResponse<T>(data: T | null, error: any = null) {
  return { data, error };
}

// Helper to create mock Supabase query builder
export function createMockQueryBuilder(mockData: any, mockError: any = null) {
  const mockResponse = createMockSupabaseResponse(mockData, mockError);
  
  return {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(mockResponse),
    then: jest.fn().mockResolvedValue(mockResponse),
  };
}
