import { RefObject } from 'react';

/**
 * Smooth scroll utility that scrolls to a target element
 * @param targetRef - React ref object pointing to the target element
 * @param options - Optional scroll behavior configuration
 */
export const smoothScrollToElement = (
  targetRef: RefObject<HTMLElement|null>,
  options: {
    delay?: number;
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
  } = {}
) => {
  const {
    delay = 100,
    behavior = 'smooth',
    block = 'start'
  } = options;

  requestAnimationFrame(() => {
    setTimeout(() => {
      if (targetRef.current) {
        targetRef.current.scrollIntoView({ 
          behavior, 
          block 
        });
      }
    }, delay);
  });
};

/**
 * Smooth scroll to top of the page
 * @param options - Optional scroll behavior configuration
 */
export const smoothScrollToTop = (
  options: {
    delay?: number;
    behavior?: ScrollBehavior;
  } = {}
) => {
  const {
    delay = 100,
    behavior = 'smooth'
  } = options;

  requestAnimationFrame(() => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior
      });
    }, delay);
  });
};