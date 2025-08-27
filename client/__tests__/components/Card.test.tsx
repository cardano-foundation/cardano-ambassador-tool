import { render, screen, fireEvent } from '@testing-library/react';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/atoms/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default props correctly', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    
    // Should have default medium padding
    expect(card).toHaveClass('p-6');
    // Should have base card styles
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('shadow-[0px_3px_4px_rgba(0,0,0,0.03)]');
  });

  it('applies different padding sizes correctly', () => {
    const { rerender } = render(<Card padding="none" data-testid="card">Content</Card>);
    let card = screen.getByTestId('card');
    expect(card).toHaveClass('p-0');

    rerender(<Card padding="sm" data-testid="card">Content</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('p-4');

    rerender(<Card padding="md" data-testid="card">Content</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6');

    rerender(<Card padding="lg" data-testid="card">Content</Card>);
    card = screen.getByTestId('card');
    expect(card).toHaveClass('p-8');
  });

  it('handles non-clickable card correctly', () => {
    render(<Card data-testid="card">Non-clickable</Card>);
    const card = screen.getByTestId('card');
    
    expect(card).not.toHaveClass('cursor-pointer');
    expect(card).not.toHaveClass('hover:shadow-[0px_3px_8px_rgba(0,0,0,0.08)]');
  });

  it('handles clickable card correctly', () => {
    const handleClick = jest.fn();
    render(
      <Card clickable onCardClick={handleClick} data-testid="card">
        Clickable content
      </Card>
    );
    
    const card = screen.getByTestId('card');
    
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-[0px_3px_8px_rgba(0,0,0,0.08)]');
    expect(card).toHaveClass('hover:outline-muted');
    expect(card).toHaveClass('active:scale-[0.98]');
  });

  it('calls onCardClick when clickable card is clicked', () => {
    const handleClick = jest.fn();
    render(
      <Card clickable onCardClick={handleClick} data-testid="card">
        Click me
      </Card>
    );
    
    const card = screen.getByTestId('card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onCardClick when card is not clickable', () => {
    const handleClick = jest.fn();
    render(
      <Card onCardClick={handleClick} data-testid="card">
        Not clickable
      </Card>
    );
    
    const card = screen.getByTestId('card');
    fireEvent.click(card);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onCardClick when clickable is true but onCardClick is not provided', () => {
    render(
      <Card clickable data-testid="card">
        Clickable but no handler
      </Card>
    );
    
    const card = screen.getByTestId('card');
    
    // Should not throw error when clicked
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('forwards all other props to the div element', () => {
    render(
      <Card 
        data-testid="card" 
        aria-label="Test card"
        role="article"
      >
        Content
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('aria-label', 'Test card');
    expect(card).toHaveAttribute('role', 'article');
  });

  it('combines clickable styles with custom classes', () => {
    render(
      <Card 
        clickable 
        onCardClick={() => {}} 
        className="custom-hover" 
        data-testid="card"
      >
        Content
      </Card>
    );
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('custom-hover');
  });
});

describe('CardHeader', () => {
  it('renders without any props', () => {
    render(<CardHeader />);
    // Should render an empty header div
    const header = document.querySelector('div');
    expect(header).toBeInTheDocument();
  });

  it('renders title only', () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle only', () => {
    render(<CardHeader subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders title and subtitle together', () => {
    render(<CardHeader title="Main Title" subtitle="Sub title text" />);
    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Sub title text')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <CardHeader 
        title="Title" 
        actions={<button>Action</button>} 
      />
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders title, subtitle, and actions together', () => {
    render(
      <CardHeader
        title="Complete Header"
        subtitle="With all props"
        actions={<button>Edit</button>}
      />
    );
    
    expect(screen.getByText('Complete Header')).toBeInTheDocument();
    expect(screen.getByText('With all props')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-header" title="Title" />);
    const header = screen.getByText('Title').closest('div');
    expect(header?.parentElement).toHaveClass('custom-header');
  });

  it('applies default styles', () => {
    const { container } = render(<CardHeader title="Title" />);
    const headerDiv = container.firstChild;
    expect(headerDiv).toHaveClass('flex');
    expect(headerDiv).toHaveClass('items-start');
    expect(headerDiv).toHaveClass('justify-between');
    expect(headerDiv).toHaveClass('mb-6');
  });
});

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(
      <CardContent>
        <div>Content item 1</div>
        <div>Content item 2</div>
      </CardContent>
    );
    
    expect(screen.getByText('Content item 1')).toBeInTheDocument();
    expect(screen.getByText('Content item 2')).toBeInTheDocument();
  });

  it('applies default spacing classes', () => {
    const { container } = render(
      <CardContent>
        <div>Content</div>
      </CardContent>
    );
    
    const contentDiv = container.firstChild;
    expect(contentDiv).toHaveClass('space-y-4');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardContent className="custom-content">
        <div>Content</div>
      </CardContent>
    );
    
    const contentDiv = container.firstChild;
    expect(contentDiv).toHaveClass('custom-content');
    expect(contentDiv).toHaveClass('space-y-4'); // Should still have default class
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(
      <CardFooter>
        <button>Save</button>
        <button>Cancel</button>
      </CardFooter>
    );
    
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('applies default spacing classes', () => {
    const { container } = render(
      <CardFooter>
        <div>Footer content</div>
      </CardFooter>
    );
    
    const footerDiv = container.firstChild;
    expect(footerDiv).toHaveClass('mt-6');
    expect(footerDiv).toHaveClass('pt-4');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardFooter className="custom-footer">
        <div>Footer</div>
      </CardFooter>
    );
    
    const footerDiv = container.firstChild;
    expect(footerDiv).toHaveClass('custom-footer');
    expect(footerDiv).toHaveClass('mt-6'); // Should still have default classes
    expect(footerDiv).toHaveClass('pt-4');
  });
});

describe('Card composition', () => {
  it('renders a complete card with all sub-components', () => {
    render(
      <Card padding="lg" data-testid="complete-card">
        <CardHeader 
          title="Complete Card" 
          subtitle="With all components"
          actions={<button>Action</button>}
        />
        <CardContent>
          <div>Main content goes here</div>
          <div>More content</div>
        </CardContent>
        <CardFooter>
          <button>Submit</button>
        </CardFooter>
      </Card>
    );
    
    const card = screen.getByTestId('complete-card');
    expect(card).toHaveClass('p-8'); // lg padding
    
    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('With all components')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByText('More content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
