import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import Input from '@/components/atoms/Input';

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('applies default props correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).not.toBeDisabled();
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('h-10');
    expect(input).toHaveClass('px-3');
    expect(input).toHaveClass('py-3');
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border');
  });

  it('renders label when provided', () => {
    render(<Input label="Email Address" />);
    const label = screen.getByText('Email Address');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('absolute');
    expect(label).toHaveClass('left-0');
    expect(label).toHaveClass('top-[-1px]');
  });

  it('handles disabled state correctly', () => {
    render(<Input disabled label="Disabled Field" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Disabled Field');
    
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-30');
    expect(input).toHaveClass('cursor-not-allowed');
    expect(label).toHaveClass('opacity-50');
  });

  it('handles error state correctly', () => {
    render(<Input error label="Error Field" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Error Field');
    
    expect(input).toHaveClass('!border-primary-500');
    expect(input).toHaveClass('focus:!border-primary-500');
    expect(input).toHaveClass('focus:ring-primary-500/20');
    expect(label).toHaveClass('text-primary-base');
  });

  it('displays error message when provided', () => {
    render(<Input error errorMessage="This field is required" />);
    const errorMessage = screen.getByText('This field is required');
    
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('absolute');
    expect(errorMessage).toHaveClass('top-[60px]');
    expect(errorMessage).toHaveClass('text-xs');
    expect(errorMessage).toHaveClass('text-primary-base');
  });

  it('does not display error message when error is false', () => {
    render(<Input errorMessage="This field is required" />);
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('does not display error message when error is true but errorMessage is not provided', () => {
    render(<Input error />);
    // Should not crash and should not display any error message
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('handles value changes correctly', () => {
    const handleChange = jest.fn();
    render(<Input value="initial" onChange={handleChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    expect(input.value).toBe('initial');
    
    fireEvent.change(input, { target: { value: 'updated' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('applies focus styles correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('focus:outline-none');
    expect(input).toHaveClass('focus:!border-primary-300');
    expect(input).toHaveClass('focus:ring-2');
    expect(input).toHaveClass('focus:ring-primary-300/20');
  });

  it('applies hover styles correctly', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('hover:!border-primary-300');
  });

  it('disabled input does not have hover/focus styles', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('hover:!border-border');
    expect(input).toHaveClass('focus:!border-border');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('forwards all other input props correctly', () => {
    render(
      <Input 
        type="email"
        name="email"
        id="email-input"
        data-testid="email"
        autoComplete="email"
        required
        maxLength={100}
      />
    );
    
    const input = screen.getByTestId('email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('id', 'email-input');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('maxlength', '100');
    expect(input).toBeRequired();
  });

  it('has correct container structure', () => {
    const { container } = render(<Input label="Test" />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toHaveClass('h-16');
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('w-full');
  });

  it('positions input correctly within container', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    expect(input).toHaveClass('absolute');
    expect(input).toHaveClass('top-[22px]');
    expect(input).toHaveClass('left-0');
  });

  it('handles different input types correctly', () => {
    const { rerender } = render(<Input type="password" />);
    let input = screen.getByLabelText('', { exact: false });
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');

    rerender(<Input type="email" />);
    input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('combines error and disabled states correctly', () => {
    render(<Input error disabled label="Error Disabled" errorMessage="Error text" />);
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Error Disabled');
    const errorMessage = screen.getByText('Error text');
    
    // Should have both error and disabled styles
    expect(input).toHaveClass('!border-primary-500');
    expect(input).toHaveClass('opacity-30');
    expect(input).toHaveClass('cursor-not-allowed');
    
    expect(label).toHaveClass('text-primary-base');
    expect(label).toHaveClass('opacity-50');
    
    expect(errorMessage).toBeInTheDocument();
  });

  it('has proper displayName for debugging', () => {
    expect(Input.displayName).toBe('Input');
  });

  it('maintains consistent heights with and without labels', () => {
    const { container: containerWithLabel } = render(<Input label="With label" />);
    const { container: containerWithoutLabel } = render(<Input />);
    
    const wrapperWithLabel = containerWithLabel.firstChild as HTMLElement;
    const wrapperWithoutLabel = containerWithoutLabel.firstChild as HTMLElement;
    
    expect(wrapperWithLabel).toHaveClass('h-16');
    expect(wrapperWithoutLabel).toHaveClass('h-16');
  });

  it('supports controlled and uncontrolled usage', () => {
    const { rerender } = render(<Input defaultValue="uncontrolled" />);
    let input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('uncontrolled');

    rerender(<Input value="controlled" onChange={() => {}} />);
    input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('controlled');
  });
});
