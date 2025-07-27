import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextInput } from './text-input';

describe('TextInput', () => {
  const mockOnTextSubmit = jest.fn();

  beforeEach(() => {
    mockOnTextSubmit.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} />);
    
    expect(screen.getByPlaceholderText('Paste your raw meeting notes here...')).toBeInTheDocument();
  });

  it('shows validation error for text that is too short', async () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} minLength={10} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'short' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Text must be at least 10 characters long/)).toBeInTheDocument();
    });
  });

  it('shows success indicator for valid text', async () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} minLength={5} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a valid meeting note that is long enough' } });
    
    await waitFor(() => {
      expect(screen.getByText('Ready to process')).toBeInTheDocument();
    });
  });

  it('calls onTextSubmit when button is clicked with valid text', async () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} minLength={5} />);
    
    const textarea = screen.getByRole('textbox');
    const testText = 'This is a valid meeting note';
    fireEvent.change(textarea, { target: { value: testText } });
    
    await waitFor(() => {
      const submitButton = screen.getByText('Process Meeting Notes');
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);
    });
    
    expect(mockOnTextSubmit).toHaveBeenCalledWith(testText);
  });

  it('shows word and character count', async () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} showStats={true} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello world test' } });
    
    await waitFor(() => {
      expect(screen.getByText('3 words')).toBeInTheDocument();
      expect(screen.getByText('16 characters')).toBeInTheDocument();
    });
  });

  it('clears text when clear button is clicked', async () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Some text to clear' } });
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: '' }); // Trash icon button
      fireEvent.click(clearButton);
    });
    
    expect(textarea).toHaveValue('');
  });

  it('disables submit button when disabled prop is true', () => {
    render(<TextInput onTextSubmit={mockOnTextSubmit} disabled={true} />);
    
    const submitButton = screen.getByText('Process Meeting Notes');
    expect(submitButton).toBeDisabled();
  });
});
