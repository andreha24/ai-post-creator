export const formatDate = (dateString: string) => {
    if (!dateString) return "";
  
    const date = new Date(dateString);
  
    if (Number.isNaN(date.getTime())) return "";
  
    // Example output: "3/22/2026, 14:30:00" (depends on user's locale)
    // en-US: "3/22/2026, 2:30:00 PM"
    // uk-UA: "22.03.2026, 14:30:00"
    return date.toLocaleString();
  };