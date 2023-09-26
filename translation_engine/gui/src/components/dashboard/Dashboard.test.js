import { render, screen } from '@testing-library/react';

import Dashboard from './Dashboard';

test('renders headline', () => {
    render(<Dashboard />);
    const element = screen.getByText(/Dashboard/i);
    expect(element).toBeInTheDocument();
});