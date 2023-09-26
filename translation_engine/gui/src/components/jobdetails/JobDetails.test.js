import {render, screen} from '@testing-library/react';

import JobDetails from "./JobDetails";

test('renders headline', () => {
    render(<JobDetails />);
    const element = screen.getByText(/Job Details/i);
    expect(element).toBeInTheDocument();
});