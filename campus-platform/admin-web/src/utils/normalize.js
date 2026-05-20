export function normalizeList(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

export function normalizeUsers(records = []) {
  return records.map((user, index) => ({
    id: user._id || user.id || `user-${index}`,
    name: user.name || "Unnamed User",
    email: user.email || "-",
    phone: user.phone || "-",
    joined: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-GB")
      : "-",
    activity: user.isBlocked ? 0 : user.role === "admin" ? 100 : 72,
    avatar:
      user.avatar ||
      user.profileImage ||
      `https://i.pravatar.cc/120?img=${(index % 70) + 1}`,
    department: user.role || user.department || "user",
    role: user.role || "user",
    isBlocked: Boolean(user.isBlocked),
    status: user.isBlocked ? "Blocked" : "Active",
    reports: Number(
      user.reports ?? user.reportCount ?? (user.isBlocked ? 1 : 0),
    ),
  }));
}

export function normalizeLostFound(records = []) {
  return records.map((item, index) => ({
    id: item._id || item.id || `lost-${index}`,
    title: item.itemName || item.title || "Untitled item",
    itemName: item.itemName || item.title || "Untitled item",
    type:
      String(item.category || item.type || item.status || "Lost")
        .charAt(0)
        .toUpperCase() +
      String(item.category || item.type || item.status || "Lost").slice(1),
    user:
      item.reportedBy?.name || item.postedBy?.name || item.user || "Unknown",
    email: item.reportedBy?.email || item.postedBy?.email || item.email || "-",
    phone: item.reportedBy?.phone || item.postedBy?.phone || item.phone || "-",
    location: item.location || "Unknown",
    time: item.createdAt
      ? new Date(item.createdAt).toLocaleString("en-GB")
      : "-",
    status: item.status || "active",
    claims: Array.isArray(item.matchSuggestions)
      ? item.matchSuggestions.length
      : Number(item.claims ?? 0),
    image:
      item.imageUrl ||
      item.image ||
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
    details: item.description || item.details || "No description available.",
    blocked: Boolean(item.blocked),
    category: item.category || item.type || "General",
    matchSuggestions: item.matchSuggestions || [],
    aiAnalysis: item.aiAnalysis || null,
    imageSimilarityPercentage: item.imageSimilarityPercentage ?? null,
  }));
}

export function normalizeGoods(records = []) {
  return records.map((item, index) => ({
    id: item._id || item.id || `good-${index}`,
    name: item.productName || item.itemName || item.title || "Unnamed item",
    category: item.category || "Other",
    price: item.price != null ? `Rs. ${item.price}` : item.amount || "-",
    seller: item.seller?.name || item.seller || "Unknown",
    phone: item.contactNumber || item.phone || item.seller?.phone || "-",
    email: item.seller?.email || item.email || "-",
    status: item.status || "active",
    description: item.description || "",
    image:
      item.imageUrl ||
      item.images?.[0] ||
      item.image ||
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  }));
}

export function normalizeFoodItems(records = []) {
  return records.map((item, index) => ({
    id: item._id || item.id || `food-${index}`,
    name: item.name || item.itemName || `Food ${index + 1}`,
    price: item.price != null ? `Rs. ${item.price}` : "Rs. 0",
    category: item.category || "Snacks",
    available: Boolean(item.available ?? true),
    badge: item.badge || "Fresh",
    image:
      item.image ||
      item.imageUrl ||
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80",
  }));
}

export function normalizeCanteens(records = []) {
  return records.map((canteen, index) => ({
    id: canteen._id || canteen.id || `canteen-${index}`,
    name: canteen.name || `Canteen ${index + 1}`,
    location: canteen.location || "Campus",
    isActive: Boolean(canteen.isActive ?? true),
    menus: Array.isArray(canteen.menu)
      ? canteen.menu.map((menuItem, menuIndex) =>
          typeof menuItem === "string"
            ? menuItem
            : menuItem?.image ||
              menuItem?.url ||
              [
                "/menus/pencil-canteen.png",
                "/menus/rk-foods.png",
                "/menus/aparna-canteen.png",
                "/menus/ball-canteen.png",
              ][menuIndex % 4],
        )
      : [],
    accent:
      canteen.accent || ["#1d4ed8", "#f97316", "#166534", "#eab308"][index % 4],
  }));
}

export function normalizeNotifications(records = []) {
  return records.map((note, index) => ({
    id: note._id || note.id || `note-${index}`,
    title: note.title || "Notification",
    priority: note.priority || (note.type === "System" ? "Low" : "Medium"),
    time: note.createdAt
      ? new Date(note.createdAt).toLocaleString("en-GB")
      : "Just now",
    body: note.body || "",
    unread: Boolean(note.unread ?? true),
    audience: note.audience || "All Students",
  }));
}

export function normalizePlacements(records = []) {
  return records.map((post, index) => ({
    id: post._id || post.id || `placement-${index}`,
    company: post.companyName || post.company || "Unknown company",
    role: post.role || post.position || "Open role",
    package: post.package || (post.salary != null ? `Rs. ${post.salary}` : "-"),
    deadline: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString("en-GB")
      : "-",
    logo: (post.companyName || post.company || "UN").slice(0, 2).toUpperCase(),
    applicants: Number(post.applicants ?? 0),
    desc: post.description || "",
  }));
}

export function normalizeMemories(records = []) {
  return records.map((memory, index) => ({
    id: memory._id || memory.id || `memory-${index}`,
    user:
      memory.uploadedBy?.name ||
      memory.authorId?.name ||
      memory.user ||
      "Unknown",
    image:
      memory.imageUrl ||
      memory.images?.[0] ||
      memory.image ||
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80",
    caption: memory.title || memory.caption || "Untitled memory",
    likes: Number(memory.likes ?? 0),
    views: Number(memory.views ?? 0),
    blocked: Boolean(memory.blocked),
    status:
      memory.isActive === false
        ? "Reported"
        : memory.reportCount > 0
          ? memory.reportCount > 2
            ? "AI Flagged"
            : "Reported"
          : memory.status || "Approved",
    risk: Math.min(100, Number(memory.reportCount ?? 0) * 25),
    reports: Number(memory.reportCount ?? memory.reports ?? 0),
    complaint: memory.description || "No complaints",
  }));
}

export function normalizeClubs(records = []) {
  return records.map((club, index) => ({
    id: club._id || club.id || `club-${index}`,
    name: club.clubName || club.name || `Club ${index + 1}`,
    members: Array.isArray(club.members)
      ? club.members.length
      : Number(club.members ?? 0),
    requests: Number(club.requests ?? 0),
    event: club.event || club.description || "No upcoming event",
    banner:
      club.banner ||
      `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80`,
    engagement: Number(club.engagement ?? 0),
    isActive: Boolean(club.isActive ?? true),
  }));
}

export function normalizeExamSearch(records = []) {
  return records.map((exam, index) => ({
    id: exam._id || exam.id || `exam-${index}`,
    name: exam.name || exam.subject || "Exam",
    code: exam.code || exam.examCode || "-",
    date: exam.date || "-",
    time: exam.time || "-",
    hallId: exam.hallId || 1,
    studentsCount: Number(exam.studentsCount ?? 0),
    proctors: Number(exam.proctors ?? 0),
    status: exam.status || "Scheduled",
    duration: Number(exam.duration ?? 0),
  }));
}

export function normalizeExamHalls(records = []) {
  return records.map((hall, index) => ({
    id: hall._id || hall.id || `hall-${index}`,
    hallName: hall.hallName || hall.name || `Hall ${index + 1}`,
    capacity: Number(hall.capacity ?? 0),
    location: hall.location || "Campus",
    availability: hall.availability || "Available",
    floor: hall.floor || "Ground",
    seatsPerRow: Number(hall.seatsPerRow ?? 0),
    totalRows: Number(hall.totalRows ?? 0),
    facilities: Array.isArray(hall.facilities)
      ? hall.facilities
      : hall.facilities
        ? String(hall.facilities)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    examsScheduled: Number(hall.examsScheduled ?? 0),
  }));
}

export function normalizeExams(records = []) {
  return records.map((exam, index) => ({
    id: exam._id || exam.id || `exam-${index}`,
    name: exam.name || exam.subject || "Exam",
    code: exam.code || exam.examCode || "-",
    date: exam.date || "-",
    time: exam.time || "-",
    hallId: exam.hallId || exam.hall || null,
    studentsCount: Number(exam.studentsCount ?? 0),
    proctors: Number(exam.proctors ?? 0),
    status: exam.status || "Scheduled",
    duration: Number(exam.duration ?? 0),
  }));
}
