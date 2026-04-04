// frontend/src/pages/CustomerOrder.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomerOrder from './CustomerOrder';

function renderCustomerOrder() {
  return render(
    <MemoryRouter>
      <CustomerOrder />
    </MemoryRouter>
  );
}

describe('CustomerOrder filter restaurants feature', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('role', 'user');
    localStorage.setItem('username', 'testuser');

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/stores')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: 'Pizza Palace', category: 'Pizza', status: 'Open' },
              { id: 2, name: 'Sushi Spot', category: 'Sushi', status: 'Open' },
              { id: 3, name: 'Burger Barn', category: 'Burgers', status: 'Closed' },
              { id: 4, name: 'Closed Pizza', category: 'Pizza', status: 'Closed' },
            ]),
        });
      }

      if (url.includes('/menu-items')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('filters restaurants by category and open now', async () => {
    renderCustomerOrder();

    await waitFor(() => {
      expect(screen.getByText(/Pizza Palace/i)).toBeInTheDocument();
    });

    // These should exist once the feature is implemented
    const categorySelect = screen.getByLabelText(/category/i);
    const openNowCheckbox = screen.getByLabelText(/open now/i);

    // Filter by Pizza
    fireEvent.change(categorySelect, { target: { value: 'Pizza' } });

    expect(screen.getByText(/Pizza Palace/i)).toBeInTheDocument();
    expect(screen.getByText(/Closed Pizza/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sushi Spot/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Burger Barn/i)).not.toBeInTheDocument();

    // Then apply Open Now
    fireEvent.click(openNowCheckbox);

    expect(screen.getByText(/Pizza Palace/i)).toBeInTheDocument();
    expect(screen.queryByText(/Closed Pizza/i)).not.toBeInTheDocument();
  });
});