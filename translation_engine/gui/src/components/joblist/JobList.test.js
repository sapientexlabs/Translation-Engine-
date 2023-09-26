import { render, screen } from '@testing-library/react';

import JobList from './JobList';

test('renders headline', () => {
    render(<JobList />);
    const element = screen.getByText(/Job List/i);
    expect(element).toBeInTheDocument();
});