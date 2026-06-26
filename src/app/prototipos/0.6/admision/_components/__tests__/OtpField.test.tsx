import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { OtpField } from '../OtpField';

function Harness() {
  const [v, setV] = useState('');
  return <OtpField value={v} onChange={setV} />;
}

describe('admision/OtpField', () => {
  it('advances focus to the next input after typing a digit', () => {
    render(<Harness />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('fills all boxes when pasting a full code', () => {
    render(<Harness />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
    });
    expect(inputs.map((i) => i.value).join('')).toBe('123456');
  });

  it('moves focus back on backspace when the current box is empty', () => {
    render(<Harness />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('ignores non-numeric input', () => {
    render(<Harness />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: 'a' } });
    expect(inputs[0].value).toBe('');
  });
});
