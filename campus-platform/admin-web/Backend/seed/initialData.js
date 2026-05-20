module.exports = {
  users: [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "admin",
      isBlocked: false,
      avatar: "https://i.pravatar.cc/120?img=1",
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      role: "user",
      isBlocked: false,
      avatar: "https://i.pravatar.cc/120?img=2",
    },
  ],
  lostFound: [
    {
      itemName: "Blue Backpack",
      category: "Lost",
      description: "Navy blue backpack lost near the library.",
      location: "Library",
      status: "active",
    },
    {
      itemName: "Red Water Bottle",
      category: "Found",
      description: "Stainless steel bottle found in the canteen.",
      location: "Canteen",
      status: "claimed",
    },
  ],
  marketplace: [
    {
      productName: "Study Table Lamp",
      category: "Hostel",
      price: 850,
      description: "Bright desk lamp in good condition.",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      ],
      status: "active",
    },
  ],
  canteens: [
    {
      name: "Pencil Canteen",
      location: "Campus Center",
      isActive: true,
      menu: [{ image: "/menus/pencil-canteen.png" }],
    },
    {
      name: "RK Foods",
      location: "North Block",
      isActive: true,
      menu: [{ image: "/menus/rk-foods.png" }],
    },
  ],
  foodItems: [
    {
      name: "Veg Maggie",
      price: 40,
      category: "Snacks",
      available: true,
      badge: "Fresh",
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80",
    },
  ],
  notifications: [
    {
      title: "Placement drive shortlisted students published",
      body: "Check the placement section for the latest shortlist.",
      priority: "High",
      audience: "All Students",
      unread: true,
    },
    {
      title: "Marketplace policy update",
      body: "Please review the updated marketplace policy.",
      priority: "Medium",
      audience: "Marketplace Sellers",
      unread: true,
    },
  ],
  placements: [
    {
      companyName: "Infosys",
      role: "Systems Engineer",
      package: 650000,
      description: "Entry-level hiring for fresh graduates.",
      tips: "Prepare aptitude and coding rounds.",
    },
  ],
  memories: [
    {
      title: "Campus Fest 2023",
      description: "A vibrant celebration of culture and talent.",
      isActive: true,
      images: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80",
      ],
    },
    {
      title: "Tech Innovation Summit",
      description: "Showcasing the latest in technology and innovation.",
      isActive: true,
      images: [
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80",
      ],
    },
  ],
  clubs: [
    {
      clubName: "Debating Society",
      description: "A platform for intellectual discussions and debates.",
      isActive: true,
      members: [],
    },
    {
      clubName: "Photography Club",
      description: "For enthusiasts of capturing moments through the lens.",
      isActive: true,
      members: [],
    },
  ],
  examHalls: [
    {
      hallName: "Hall A - Ground Floor",
      capacity: 120,
      location: "Building 1",
      availability: "Available",
      floor: "Ground",
      seatsPerRow: 10,
      totalRows: 12,
      facilities: ["CCTV", "AC", "Projector"],
      examsScheduled: 1,
    },
  ],
  exams: [
    {
      name: "Data Structures & Algorithms",
      code: "CS201",
      date: "15 May 2026",
      time: "9:00 AM - 11:00 AM",
      studentsCount: 90,
      duration: 120,
      status: "Scheduled",
    },
  ],
};
