/* @vitest-environment jsdom */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SlideToPost } from './SlideToPost';

describe('SlideToPost', () => {
  afterEach(() => cleanup());

  it('renders idle state', () => {
    render(<SlideToPost onPost={vi.fn()} />);
    expect(screen.getByTestId('slide-to-post')).toBeInTheDocument();
    expect(screen.getByTestId('slide-label-idle')).toHaveTextContent('Slide to Post');
  });

  it('is disabled when disabled prop is true', () => {
    render(<SlideToPost onPost={vi.fn()} disabled />);
    expect(screen.getByTestId('slide-to-post')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onPost with discuss stance when released at center (fallback width)', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    render(<SlideToPost onPost={onPost} />);

    const track = screen.getByTestId('slide-to-post');
    fireEvent.mouseDown(track, { clientX: 192 });
    fireEvent.mouseUp(document);

    await waitFor(() => expect(onPost).toHaveBeenCalledWith('discuss'));
  });

  it('calls onPost with concur stance when released on left', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    render(<SlideToPost onPost={onPost} />);

    const track = screen.getByTestId('slide-to-post');
    Object.defineProperty(track, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 384 })
    });

    fireEvent.mouseDown(track, { clientX: 50 }); // ~13%
    fireEvent.mouseUp(document);

    await waitFor(() => expect(onPost).toHaveBeenCalledWith('concur'));
  });

  it('calls onPost with counter stance when released on right', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    render(<SlideToPost onPost={onPost} />);

    const track = screen.getByTestId('slide-to-post');
    Object.defineProperty(track, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 384 })
    });

    fireEvent.mouseDown(track, { clientX: 330 }); // ~86%
    fireEvent.mouseUp(document);

    await waitFor(() => expect(onPost).toHaveBeenCalledWith('counter'));
  });

  it('supports keyboard navigation', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    render(<SlideToPost onPost={onPost} />);

    const track = screen.getByTestId('slide-to-post');
    track.focus();

    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    fireEvent.keyDown(track, { key: 'Enter' });

    await waitFor(() => expect(onPost).toHaveBeenCalledWith('concur'));
  });

  it('shows success message after posting', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    render(<SlideToPost onPost={onPost} />);

    const track = screen.getByTestId('slide-to-post');
    fireEvent.mouseDown(track, { clientX: 192 });
    fireEvent.mouseUp(document);

    await waitFor(() => expect(screen.getByTestId('slide-label-idle')).toHaveTextContent('✓ Posted!'));
  });

  it('has proper ARIA attributes', () => {
    render(<SlideToPost onPost={vi.fn()} />);
    const track = screen.getByTestId('slide-to-post');

    expect(track).toHaveAttribute('role', 'slider');
    expect(track).toHaveAttribute('aria-valuemin', '0');
    expect(track).toHaveAttribute('aria-valuemax', '100');
    expect(track).toHaveAttribute('aria-valuenow');
    expect(track).toHaveAttribute('aria-valuetext');
    expect(track).toHaveAttribute('tabIndex', '0');
  });
});

