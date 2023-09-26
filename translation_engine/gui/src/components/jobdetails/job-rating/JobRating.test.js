import {render, screen} from '@testing-library/react';

import JobRating from "./JobRating";

test('renders headline', () => {
    render(<JobRating />);
    const element = screen.getByText(/Job Rating/i);
    expect(element).toBeInTheDocument();
});