import { AxiosError } from 'axios';

export interface APIError {
  error: string;
  message?: string;
  status?: number;
}

export interface Event {
  _id: string;
  name: string;
  subtitle?: string;
  description: string;
  date: string;
  time: {
    from: string;
    to: string;
  };
  venue: {
    name: string;
    city: string;
  };
  attendees: string[];
  images: Array<{
    url: string;
    alt?: string;
    isFeatured: boolean;
  }>;
}

export type EventResponse = {
  events: Event[];
  totalPages: number;
  currentPage: number;
};

export type EventRegistrationResponse = {
  message: string;
  attendeeCount: number;
};