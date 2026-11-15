/** Names follow the supplied photos. Captions are SP Properties editorial copy, not client quotes. */
export const clientStories = [
  {
    id: "balaji", name: "Balaji", image: "/images/client name balaji.jpeg",
    headline: "Together, a new chapter.",
    summary: "The best beginnings are the ones we share with family.",
    caption: "A family moment with our team. It is a reminder that a home begins with the people who will share it.",
  },
  {
    id: "jagadesh", name: "Jagadesh", image: "/images/client name jagadesh.jpeg",
    headline: "Moments worth keeping.",
    summary: "A shared moment today. A memory to carry into tomorrow.",
    caption: "Together with Jagadesh and family. The small, shared moments are what make a home journey personal and memorable.",
  },
  {
    id: "prakesh", name: "Prakesh", image: "/images/client name prakesh.jpeg",
    headline: "Family makes it home.",
    summary: "Different generations. One beautiful sense of belonging.",
    caption: "A shared moment with Prakesh and family. Home means making room for everyday conversations, connection and time together.",
  },
  {
    id: "ramakrishnan", name: "Ramakrishnan", image: "/images/client name ramakrishnan.jpeg",
    headline: "A personal connection.",
    summary: "Every journey is made more meaningful by the people we meet.",
    caption: "A moment with Ramakrishnan and family. We value the conversations that help us understand what home means to each person.",
  },
  {
    id: "samy", name: "Samy", image: "/images/client name samy.jpeg",
    headline: "Room for tomorrow.",
    summary: "For the everyday joys and the memories yet to be made.",
    caption: "A moment with Samy and family, and a reminder to plan for everyday life as well as the years ahead.",
  },
] as const;

/** General guidance for prospective clients; these are not attributed customer statements. */
export const clientPriorities = [
  {
    id: "space", label: "Space for my family", title: "Room for your everyday.",
    description: "Explore 2 & 3 BHK homes around your family's needs. Discuss layouts, room sizes and the way you want to live.",
    points: ["2 & 3 BHK options", "Floor plan discussions"],
    link: "/projects", linkLabel: "Explore Chennai homes",
    enquiry: "Hi SP Properties, I am looking for a 2 or 3 BHK home for my family. Please help me compare layouts and current availability.",
  },
  {
    id: "location", label: "The right location", title: "Closer to what matters.",
    description: "Start with your preferred neighbourhood, daily commute and family routines. Explore our 11 Chennai locations and arrange a site visit.",
    points: ["11 Chennai neighbourhoods", "Site visits with our team"],
    link: "/projects#location-map", linkLabel: "Find your neighbourhood",
    enquiry: "Hi SP Properties, I would like help choosing a home location in Chennai and arranging a site visit.",
  },
  {
    id: "guidance", label: "Clarity before I decide", title: "Your questions, welcomed.",
    description: "Buying a 2 or 3 BHK flat in Ambattur? Ask our team for current prices, floor plans and project details before your site visit.",
    points: ["Current availability and prices", "Project details explained"],
    link: "/contact", linkLabel: "Contact our Ambattur team",
    enquiry: "Hi SP Properties, I would like to discuss current prices, availability and project details before choosing a home.",
  },
] as const;
