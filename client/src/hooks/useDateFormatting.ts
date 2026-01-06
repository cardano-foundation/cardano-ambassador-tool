import { useMemo } from 'react';

interface UseDateFormattingReturn {
  formatDate: (dateString: string) => string;
  getRelativeTime: (dateString: string) => string;
  cleanHtml: (html: string | null | undefined) => string;
}

export const useDateFormatting = (): UseDateFormattingReturn => {
  return useMemo(() => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? 'numeric'
            : undefined,
      });
    };

    const getRelativeTime = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInDays / 365);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      };

      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
      }

      if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      }

      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) {
        return `Today, ${formatTime(date)}`;
      }

      if (isYesterday) {
        return `Yesterday, ${formatTime(date)}`;
      }

      if (diffInDays < 7) {
        return `${diffInDays} days ago, ${formatTime(date)}`;
      }

      if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
      }

      if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
      }

      return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    };

    const cleanHtml = (html: string | null | undefined): string => {
      return html?.replace(/<[^>]*>/g, '') ?? '';
    };

    return {
      formatDate,
      getRelativeTime,
      cleanHtml,
    };
  }, []);
};
