# Testing Strategy

### Testing Pyramid

```
        E2E Tests
       /        \
   Integration Tests
  /            \
Frontend Unit  Backend Unit
```

### Test Organization

#### Frontend Tests
```
tests/
├── components/              # Component tests
├── hooks/                   # Hook tests
├── pages/                   # Page tests
└── e2e/                     # Cypress E2E tests
```

#### Backend Tests
```
tests/
├── api/                     # API route tests
├── utils/                   # Utility function tests
└── integration/             # Integration tests
```

### Test Examples

#### Frontend Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { StreamVideoCallManagerV2 } from '@/components/meeting/StreamVideoCallManagerV2';
import { StreamCall, StreamVideo } from '@stream-io/video-react-sdk';

describe('StreamVideoCallManagerV2', () => {
  it('should render within Stream context', () => {
    // Note: Stream SDK components require StreamVideo and StreamCall providers
    const mockClient = createMockStreamClient();
    const mockCall = createMockCall();

    render(
      <StreamVideo client={mockClient}>
        <StreamCall call={mockCall}>
          <StreamVideoCallManagerV2 />
        </StreamCall>
      </StreamVideo>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```

#### Backend API Test
```typescript
import { POST } from '@/app/api/meetings/route';
import { createMocks } from 'node-mocks-http';

describe('/api/meetings', () => {
  it('should create meeting', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { title: 'Test Meeting' },
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
  });
});
```
