import {render, screen} from '@testing-library/react';

import UntertitlePlayer from "./UntertitlePlayer";

test('renders untertitle player', () => {
    render(<UntertitlePlayer />);
    const element = screen.getByText(/--- untertitle/i);
    expect(element).toBeInTheDocument();
});