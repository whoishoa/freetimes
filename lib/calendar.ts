

// Add this function to fetch calendar events
export async function fetchCalendarEvents(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  console.log('Calendar events:', data.items);
}


