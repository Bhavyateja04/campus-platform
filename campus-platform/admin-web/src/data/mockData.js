export const usersDefault = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", isBlocked: false, createdAt: new Date().toISOString() },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user", isBlocked: false, createdAt: new Date().toISOString() }
];

export const memoriesDefault = [
  { id: 1, title: "Campus Fest 2023", description: "A vibrant celebration of culture and talent.", isActive: true, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80" },
  { id: 2, title: "Tech Innovation Summit", description: "Showcasing the latest in technology and innovation.", isActive: true, image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80" }
];

export const clubsDefault = [
  { id: 1, clubName: "Debating Society", members: ["Alice Johnson", "Bob Smith"], isActive: true, description: "A platform for intellectual discussions and debates." },
  { id: 2, clubName: "Photography Club", members: ["Charlie Brown", "Diana Prince"], isActive: true, description: "For enthusiasts of capturing moments through the lens." }
];

export const lostFoundItemsDefault = [
  { id: 1, name: "Blue Backpack", category: "Lost", image: "https://images.unsplash.com/photo-1523580494842-597bc642af9d?auto=format&fit=crop&w=600&q=80", status: "active" },
  { id: 2, name: "Red Water Bottle", category: "Found", image: "https://images.unsplash.com/photo-1553877520-8adc44ab3c1d?auto=format&fit=crop&w=600&q=80", status: "active" }
];

export const productsDefault = [
  { id: 1, name: "Study Table Lamp", category: "Hostel", price: "Rs. 850", seller: "Kabir Singh", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80", status: "active" }
];

export const canteensDefault = [
  { id: 1, name: "Pencil Canteen", menus: ["/menus/pencil-canteen.png"], accent: "#1d4ed8" },
  { id: 2, name: "RK Foods", menus: ["/menus/rk-foods.png"], accent: "#f97316" }
];

export const foodItemsDefault = [
  { id: 1, name: "Veg Maggie", price: "Rs. 40", category: "Snacks", available: true, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80" }
];

export const notificationsDefault = [
  { id: 1, title: "Placement drive shortlisted students published", priority: "High", time: "12 min ago", unread: true },
  { id: 2, title: "Marketplace policy update", priority: "Medium", time: "1 hr ago", unread: true }
];

export const placementsDefault = [
  { id: 1, company: "Infosys", role: "Systems Engineer", package: "Rs. 6.5 LPA", deadline: "18 May 2026", applicants: 142 }
];

export const examHallsDefault = [
  { id: 1, hallName: "Hall A - Ground Floor", capacity: 120, location: "Building 1", availability: "Available" }
];

export const examsDefault = [
  { id: 1, name: "Data Structures & Algorithms", code: "CS201", date: "15 May 2026", time: "9:00 AM - 11:00 AM", hallId: 1, status: "Scheduled" }
];