import {render, screen} from '@testing-library/react';

import JobUpload from "./JobUpload";

test('renders headline', () => {
    render(<JobUpload />);
    const element = screen.getByText(/Job Upload/i);
    expect(element).toBeInTheDocument();
});