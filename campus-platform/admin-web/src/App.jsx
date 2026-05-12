import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  FiActivity, FiAlertTriangle, FiBell, FiBriefcase, FiCalendar,
  FiCamera, FiChevronDown, FiCompass, FiEdit, FiEye, FiHeart,
  FiHome, FiImage, FiLock, FiMail, FiMapPin, FiMenu,
  FiMessageCircle, FiMoon, FiPackage, FiPhone, FiPlus, FiSearch,
  FiSend, FiSettings, FiShare2, FiShield, FiShoppingBag,
  FiSliders, FiStar, FiSun, FiTrash2, FiTrendingUp, FiUpload,
  FiUserCheck, FiUsers, FiX,
} from "react-icons/fi";
import "./App.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { id: "dashboard",     label: "Dashboard",          icon: FiHome },
  { id: "users",         label: "Users",               icon: FiUsers },
  { id: "lostfound",     label: "Lost & Found",        icon: FiCompass },
  { id: "marketplace",   label: "Marketplace",         icon: FiShoppingBag },
  { id: "canteens",      label: "Canteens",             icon: FiPackage },
  { id: "notifications", label: "Notifications",       icon: FiBell, badge: 8 },
  { id: "placements",    label: "Placements",          icon: FiBriefcase },
  { id: "memories",      label: "Memories",            icon: FiCamera },
  { id: "clubs",         label: "Clubs",               icon: FiStar },
  { id: "examhall",      label: "Exam Hall Locator",   icon: FiMapPin },
  { id: "settings",      label: "Settings",            icon: FiSettings },
];

const CHART_COLORS = ["#6c5ce7", "#00b894", "#fdcb6e", "#ff7675", "#0984e3"];

// ─── Static Data ──────────────────────────────────────────────────────────────

const growthData = [
  { month: "Jan", users: 820,  posts: 214, market: 84,  placement: 31 },
  { month: "Feb", users: 960,  posts: 260, market: 112, placement: 38 },
  { month: "Mar", users: 1180, posts: 318, market: 146, placement: 45 },
  { month: "Apr", users: 1320, posts: 370, market: 168, placement: 53 },
  { month: "May", users: 1490, posts: 438, market: 202, placement: 61 },
  { month: "Jun", users: 1710, posts: 510, market: 245, placement: 74 },
];

const channelData = [
  { name: "Marketplace", value: 34 },
  { name: "Lost Posts",  value: 22 },
  { name: "Memories",    value: 28 },
  { name: "Placements",  value: 16 },
];

const activityData = [
  { day: "Mon", reports: 18, approvals: 34 },
  { day: "Tue", reports: 25, approvals: 42 },
  { day: "Wed", reports: 14, approvals: 38 },
  { day: "Thu", reports: 31, approvals: 51 },
  { day: "Fri", reports: 22, approvals: 48 },
  { day: "Sat", reports: 12, approvals: 29 },
  { day: "Sun", reports: 16, approvals: 33 },
];

// ─── Default Seed Data ────────────────────────────────────────────────────────

const DEFAULT_USERS = [
  {
    name: "Aarav Mehta",
    email: "aarav.mehta@campus.edu",
    phone: "+91 98765 12001",
    joined: "12 Jan 2026",
    activity: 92,
    avatar: "https://i.pravatar.cc/120?img=12",
    department: "Computer Science",
    reports: 0,
  },
  {
    name: "Diya Rao",
    email: "diya.rao@campus.edu",
    phone: "+91 98765 12002",
    joined: "03 Feb 2026",
    activity: 76,
    avatar: "https://i.pravatar.cc/120?img=47",
    department: "Design",
    reports: 1,
  },
  {
    name: "Kabir Singh",
    email: "kabir.singh@campus.edu",
    phone: "+91 98765 12003",
    joined: "18 Feb 2026",
    activity: 84,
    avatar: "https://i.pravatar.cc/120?img=15",
    department: "Business",
    reports: 0,
  },
  {
    name: "Nisha Iyer",
    email: "nisha.iyer@campus.edu",
    phone: "+91 98765 12004",
    joined: "27 Mar 2026",
    activity: 66,
    avatar: "https://i.pravatar.cc/120?img=32",
    department: "Electronics",
    reports: 2,
  },
  {
    name: "Rehan Khan",
    email: "rehan.khan@campus.edu",
    phone: "+91 98765 12005",
    joined: "09 Apr 2026",
    activity: 88,
    avatar: "https://i.pravatar.cc/120?img=59",
    department: "Mechanical",
    reports: 0,
  },
];

const DEFAULT_LOST_FOUND = [
  {
    title: "Black Laptop Bag",
    type: "Lost",
    user: "Aarav Mehta",
    email: "aarav.mehta@campus.edu",
    phone: "+91 98765 12001",
    location: "Library Wing B",
    time: "Today, 10:20 AM",
    status: "Open",
    claims: 3,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
    details: "Contains Dell charger, notebooks, and ID card.",
  },
  {
    title: "Silver Water Bottle",
    type: "Found",
    user: "Diya Rao",
    email: "diya.rao@campus.edu",
    phone: "+91 98765 12002",
    location: "Canteen Atrium",
    time: "Yesterday, 4:45 PM",
    status: "Claim review",
    claims: 1,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
    details: "Sticker with robotics club logo.",
  },
  {
    title: "Wireless Earbuds Case",
    type: "Lost",
    user: "Nisha Iyer",
    email: "nisha.iyer@campus.edu",
    phone: "+91 98765 12004",
    location: "Auditorium",
    time: "08 May, 6:10 PM",
    status: "Flagged",
    claims: 5,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=80",
    details: "Reported duplicate claims from two accounts.",
  },
];

const DEFAULT_PRODUCTS = [
  {
    name: "MacBook Air M2",
    category: "Electronics",
    price: "Rs. 68,000",
    seller: "Rehan Khan",
    phone: "+91 98765 12005",
    email: "rehan.khan@campus.edu",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Engineering Graphics Kit",
    category: "Books",
    price: "Rs. 1,250",
    seller: "Diya Rao",
    phone: "+91 98765 12002",
    email: "diya.rao@campus.edu",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Study Table Lamp",
    category: "Hostel",
    price: "Rs. 850",
    seller: "Kabir Singh",
    phone: "+91 98765 12003",
    email: "kabir.singh@campus.edu",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Acoustic Guitar",
    category: "Music",
    price: "Rs. 5,900",
    seller: "Nisha Iyer",
    phone: "+91 98765 12004",
    email: "nisha.iyer@campus.edu",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80",
  },
];

const DEFAULT_CANTEENS = [
  { name: "Pencil Canteen", menus: ["/menus/pencil-canteen.png"], accent: "#1d4ed8" },
  { name: "RK Foods",       menus: ["/menus/rk-foods.png"],        accent: "#f97316" },
  { name: "Aparna Canteen", menus: ["/menus/aparna-canteen.png"], accent: "#166534" },
  { name: "Ball Canteen",   menus: ["/menus/ball-canteen.png"],   accent: "#eab308" },
];

const DEFAULT_FOOD_ITEMS = [
  {
    name: "Veg Maggie",
    price: "Rs. 40",
    category: "Snacks",
    available: true,
    image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80",
    badge: "Trending",
  },
  {
    name: "Grilled Sandwich",
    price: "Rs. 45",
    category: "Sandwich",
    available: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80",
    badge: "Best seller",
  },
  {
    name: "Chicken Biryani",
    price: "Rs. 120",
    category: "Meals",
    available: true,
    image: "https://images.unsplash.com/photo-1563379091339-03246963d7d9?auto=format&fit=crop&w=500&q=80",
    badge: "Hot",
  },
  {
    name: "Masala Dosa",
    price: "Rs. 60",
    category: "South Indian",
    available: true,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80",
    badge: "Fresh",
  },
  {
    name: "Veg Burger",
    price: "Rs. 40",
    category: "Fast Food",
    available: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
    badge: "Sold out",
  },
  {
    name: "Cold Coffee",
    price: "Rs. 45",
    category: "Beverages",
    available: true,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80",
    badge: "Chilled",
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    title: "Placement drive shortlisted students published",
    priority: "High",
    time: "12 min ago",
    body: "Sent by Admin. Computer Science placement shortlist is now available for review.",
    unread: true,
  },
  {
    title: "Marketplace policy update",
    priority: "Medium",
    time: "1 hr ago",
    body: "Sent by Admin. Sellers must verify contact details before listing electronics.",
    unread: true,
  },
  {
    title: "Lost and found desk timing changed",
    priority: "Low",
    time: "Yesterday",
    body: "Sent by Admin. Desk will operate from 9 AM to 5 PM this week.",
    unread: false,
  },
  {
    title: "Club event approvals pending",
    priority: "Medium",
    time: "09 May",
    body: "Sent by Admin. Three event requests need moderation review.",
    unread: false,
  },
];

const DEFAULT_PLACEMENTS = [
  {
    company: "Infosys",
    role: "Systems Engineer",
    package: "Rs. 6.5 LPA",
    deadline: "18 May 2026",
    logo: "IN",
    applicants: 142,
    desc: "Cloud engineering, automation, and enterprise delivery role for final-year students.",
  },
  {
    company: "Deloitte",
    role: "Analyst Trainee",
    package: "Rs. 7.8 LPA",
    deadline: "22 May 2026",
    logo: "DE",
    applicants: 98,
    desc: "Consulting track with analytics, client delivery, and business process projects.",
  },
  {
    company: "Adobe",
    role: "Product Intern",
    package: "Rs. 1.2 L / month",
    deadline: "27 May 2026",
    logo: "AD",
    applicants: 64,
    desc: "Design systems, frontend product work, and experimentation for SaaS tools.",
  },
];

const DEFAULT_MEMORIES = [
  {
    user: "Diya Rao",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80",
    caption: "Design fest installation day.",
    likes: 1240, views: 8700,
    blocked: false, status: "Approved", risk: 8, reports: 0,
    complaint: "No complaints",
  },
  {
    user: "Kabir Singh",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=700&q=80",
    caption: "Freshers evening from the main lawn.",
    likes: 920, views: 6500,
    blocked: false, status: "Pending", risk: 24, reports: 1,
    complaint: "Needs caption review",
  },
  {
    user: "Nisha Iyer",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=80",
    caption: "Robotics club demo night.",
    likes: 1480, views: 11300,
    blocked: true, status: "AI Flagged", risk: 82, reports: 3,
    complaint: "Possible unsafe crowding content",
  },
  {
    user: "Rehan Khan",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80",
    caption: "Hackathon afterparty highlights.",
    likes: 760, views: 4800,
    blocked: false, status: "Reported", risk: 58, reports: 7,
    complaint: "Users reported privacy concerns",
  },
];

const DEFAULT_CLUBS = [
  {
    name: "Robotics Club",
    members: 318,
    requests: 24,
    event: "Autonomous Rover Sprint",
    banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80",
    engagement: 86,
  },
  {
    name: "Design Circle",
    members: 214,
    requests: 18,
    event: "Portfolio Review Jam",
    banner: "https://images.unsplash.com/photo-1558655146-364adaf25e0a?auto=format&fit=crop&w=700&q=80",
    engagement: 79,
  },
  {
    name: "Entrepreneurship Cell",
    members: 402,
    requests: 36,
    event: "Campus Pitch Night",
    banner: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80",
    engagement: 91,
  },
];

const DEFAULT_EXAM_HALLS = [
  {
    id: 1,
    hallName: "Hall A - Ground Floor",
    capacity: 120,
    location: "Building 1",
    floor: "Ground",
    seatsPerRow: 10,
    totalRows: 12,
    facilities: ["AC", "Water", "Washroom"],
    availability: "Available",
    examsScheduled: 3,
  },
  {
    id: 2,
    hallName: "Hall B - First Floor",
    capacity: 100,
    location: "Building 1",
    floor: "First",
    seatsPerRow: 10,
    totalRows: 10,
    facilities: ["AC", "Projector", "Water"],
    availability: "Occupied",
    examsScheduled: 2,
  },
  {
    id: 3,
    hallName: "Hall C - Second Floor",
    capacity: 150,
    location: "Building 2",
    floor: "Second",
    seatsPerRow: 12,
    totalRows: 12,
    facilities: ["AC", "Water", "Washroom", "Emergency Exit"],
    availability: "Available",
    examsScheduled: 4,
  },
  {
    id: 4,
    hallName: "Hall D - Computer Lab",
    capacity: 80,
    location: "Building 3",
    floor: "Ground",
    seatsPerRow: 10,
    totalRows: 8,
    facilities: ["AC", "Computers", "Internet"],
    availability: "Available",
    examsScheduled: 1,
  },
];

const DEFAULT_EXAMS = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    code: "CS201",
    date: "15 May 2026",
    time: "9:00 AM - 11:00 AM",
    hallId: 1,
    studentsCount: 85,
    proctors: 2,
    status: "Scheduled",
    duration: 120,
  },
  {
    id: 2,
    name: "Database Management Systems",
    code: "CS301",
    date: "16 May 2026",
    time: "2:00 PM - 4:00 PM",
    hallId: 3,
    studentsCount: 92,
    proctors: 2,
    status: "Scheduled",
    duration: 120,
  },
  {
    id: 3,
    name: "Operating Systems",
    code: "CS251",
    date: "17 May 2026",
    time: "9:00 AM - 11:00 AM",
    hallId: 2,
    studentsCount: 78,
    proctors: 2,
    status: "Confirmed",
    duration: 120,
  },
  {
    id: 4,
    name: "Web Development Practical",
    code: "CS401P",
    date: "18 May 2026",
    time: "10:00 AM - 1:00 PM",
    hallId: 4,
    studentsCount: 60,
    proctors: 1,
    status: "Scheduled",
    duration: 180,
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useFilteredData(items, search, keys) {
  return useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return items;
    return items.filter((item) =>
      keys.some((key) => String(item[key]).toLowerCase().includes(text))
    );
  }, [items, keys, search]);
}

function useToast() {
  const [toast, setToast] = useState("");
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  return [toast, showToast];
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const API_BASE   = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || "";

  const [users,          setUsers]          = useState(DEFAULT_USERS);
  const [lostFoundItems, setLostFoundItems] = useState(DEFAULT_LOST_FOUND);
  const [placements,     setPlacements]     = useState(DEFAULT_PLACEMENTS);
  const [memories,       setMemories]       = useState(DEFAULT_MEMORIES);

  const apiFetch = async (path, opts = {}) => {
    const headers = { ...(opts.headers || {}) };
    if (ADMIN_TOKEN) headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (!res.ok) throw new Error(`API error ${res.status} ${path}`);
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        const [lostRes, placementsRes, memRes, usersRes] = await Promise.all([
          apiFetch("/api/lostitems").catch(() => null),
          apiFetch("/api/placements").catch(() => null),
          apiFetch("/api/college-memories").catch(() => null),
          apiFetch("/api/admin/viewusers").catch(() => null),
        ]);
        if (lostRes?.data)       setLostFoundItems(lostRes.data);
        if (placementsRes?.data) setPlacements(placementsRes.data);
        if (memRes?.data)        setMemories(memRes.data.data ?? memRes.data);
        if (usersRes?.data)      setUsers(usersRes.data);
      } catch (err) {
        console.warn("Admin dashboard fetch failed, using defaults:", err.message ?? err);
      }
    })();
  }, []);

  const activeSidebarItem = SIDEBAR_ITEMS.find((item) => item.id === activePage);

  return (
    <div className={`admin-shell ${theme}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="workspace">
        <Topbar
          title={activeSidebarItem.label}
          onMenu={() => setSidebarOpen(true)}
          theme={theme}
          setTheme={setTheme}
        />
        <AnimatePresence mode="wait">
          <motion.section
            key={activePage}
            className="page-motion"
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {activePage === "dashboard"     && <DashboardPage />}
            {activePage === "users"         && <UsersPage users={users} />}
            {activePage === "lostfound"     && <LostFoundPage initialItems={lostFoundItems} />}
            {activePage === "marketplace"   && <MarketplacePage products={DEFAULT_PRODUCTS} />}
            {activePage === "canteens"      && <CanteensPage canteens={DEFAULT_CANTEENS} foodItems={DEFAULT_FOOD_ITEMS} />}
            {activePage === "notifications" && <NotificationsPage initialItems={DEFAULT_NOTIFICATIONS} />}
            {activePage === "placements"    && <PlacementsPage initialPlacements={placements} />}
            {activePage === "memories"      && <MemoriesPage initialMemories={memories} />}
            {activePage === "clubs"         && <ClubsPage clubs={DEFAULT_CLUBS} />}
            {activePage === "examhall"      && <ExamHallPage initialHalls={DEFAULT_EXAM_HALLS} initialExams={DEFAULT_EXAMS} />}
            {activePage === "settings"      && <SettingsPage />}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Layout Components ────────────────────────────────────────────────────────

function Sidebar({ activePage, setActivePage, open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CampusAdmin</strong>
            <span>Command center</span>
          </div>
        </div>
        <nav>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon     = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => { setActivePage(item.id); onClose(); }}
              >
                {isActive && <motion.span layoutId="active-pill" className="active-pill" />}
                <Icon />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <FiActivity />
          <strong>Live campus pulse</strong>
          <span>94% systems healthy</span>
        </div>
      </aside>
      {open && (
        <button className="scrim" onClick={onClose} aria-label="Close sidebar" />
      )}
    </>
  );
}

function Topbar({ title, onMenu, theme, setTheme }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="Open menu">
        <FiMenu />
      </button>
      <div>
        <p>Admin Workspace</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <FiSearch />
          <input placeholder="Search campus data..." />
        </label>
        <button
          className="icon-button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <FiMoon /> : <FiSun />}
        </button>
        <button className="icon-button badge-dot" aria-label="Notifications">
          <FiBell />
        </button>
      </div>
    </header>
  );
}

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function PageHeader({ eyebrow, title, text, action }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, tone = "violet" }) {
  return (
    <motion.article className={`stat-card ${tone}`} whileHover={{ y: -6, scale: 1.01 }}>
      <div className="stat-icon"><Icon /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small><FiTrendingUp /> {change}</small>
    </motion.article>
  );
}

function SearchFilter({ search, setSearch, placeholder, filters = [], selected, setSelected }) {
  return (
    <div className="filters">
      <label className="search-box">
        <FiSearch />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
        />
      </label>
      {filters.length > 0 && (
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {filters.map((f) => <option key={f}>{f}</option>)}
        </select>
      )}
    </div>
  );
}

function ChartPanel({ title, children, className = "" }) {
  return (
    <motion.div
      className={`panel chart-panel ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="panel-title">
        <h3>{title}</h3>
        <span>Live</span>
      </div>
      {children}
    </motion.div>
  );
}

function Modal({ children, onClose, wide = false }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`modal ${wide ? "wide" : ""}`}
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
      >
        <button className="icon-button modal-close" onClick={onClose}>
          <FiX />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
        >
          <FiShield />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Progress({ value }) {
  return (
    <span className="progress">
      <i style={{ width: `${value}%` }} />
      <b>{value}%</b>
    </span>
  );
}

// ─── Page: Dashboard ──────────────────────────────────────────────────────────

function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Campus operations dashboard"
        text="Real-time analytics across users, commerce, lost reports, placements, notifications, and moderation."
      />
      <div className="stats-grid">
        <StatCard icon={FiUsers}       label="Active users"      value="17,410"   change="+18.4% this month" tone="violet" />
        <StatCard icon={FiShoppingBag} label="Marketplace GMV"   value="Rs. 8.7L" change="+12.8% this week"  tone="green"  />
        <StatCard icon={FiCompass}     label="Resolved items"    value="842"      change="+31 claims closed" tone="amber"  />
        <StatCard icon={FiBriefcase}   label="Placement posts"   value="74"       change="+9 new drives"     tone="blue"   />
      </div>
      <div className="dashboard-grid">
        <ChartPanel title="User growth graph" className="wide-panel">
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6c5ce7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 16, border: 0 }} />
              <Area type="monotone" dataKey="users" stroke="#6c5ce7" fill="url(#usersGradient)" strokeWidth={3} />
              <Line  type="monotone" dataKey="posts" stroke="#00b894" strokeWidth={3} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Channel activity">
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie data={channelData} innerRadius={72} outerRadius={108} paddingAngle={4} dataKey="value">
                {channelData.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Lost & Found analytics">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 16, border: 0 }} />
              <Bar dataKey="reports"   fill="#ff7675" radius={[12, 12, 0, 0]} />
              <Bar dataKey="approvals" fill="#00b894" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <div className="panel timeline-panel">
          <div className="panel-title">
            <h3>Activity timeline</h3>
            <span>Now</span>
          </div>
          {[
            "Marketplace listing verified",
            "Fake lost-item report quarantined",
            "Adobe placement post reviewed",
            "Admin notification delivered",
          ].map((item, index) => (
            <motion.div
              key={item}
              className="timeline-item"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <i />
              <div>
                <strong>{item}</strong>
                <span>{index + 1}0 min ago</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Page: Users ──────────────────────────────────────────────────────────────

function UsersPage({ users }) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = useFilteredData(users, search, ["name", "email", "department"]);

  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="Users management"
        text="Search, filter, and inspect student profiles with activity statistics and contact information."
      />
      <SearchFilter search={search} setSearch={setSearch} placeholder="Search users by name, email, department..." />
      <div className="panel table-panel">
        <div className="users-table">
          <div className="table-row table-head">
            <span>Profile</span>
            <span>Email</span>
            <span>Contact</span>
            <span>Joined</span>
            <span>Activity</span>
            <span />
          </div>
          {filtered.map((user) => (
            <motion.div
              key={user.email}
              className="table-row"
              whileHover={{ backgroundColor: "var(--hover)" }}
            >
              <span className="profile-cell">
                <img src={user.avatar} alt="" />
                <b>{user.name}</b>
              </span>
              <span>{user.email}</span>
              <span>{user.phone}</span>
              <span>{user.joined}</span>
              <span><Progress value={user.activity} /></span>
              <button className="soft-button" onClick={() => setSelected(user)}>View</button>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal onClose={() => setSelected(null)}>
            <div className="profile-modal">
              <img src={selected.avatar} alt="" />
              <h2>{selected.name}</h2>
              <p>{selected.department}</p>
              <div className="detail-grid">
                <span><FiMail />     {selected.email}</span>
                <span><FiPhone />    {selected.phone}</span>
                <span><FiCalendar /> Joined {selected.joined}</span>
                <span><FiActivity /> {selected.activity}% activity score</span>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page: Lost & Found ───────────────────────────────────────────────────────

function LostFoundPage({ initialItems }) {
  const [search,        setSearch]        = useState("");
  const [type,          setType]          = useState("All");
  const [posts,         setPosts]         = useState(initialItems);
  const [selected,      setSelected]      = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, showToast] = useToast();

  const filtered = useFilteredData(posts, search, ["title", "user", "location"])
    .filter((item) => type === "All" || item.type === type);

  const updatePost = (title, patch) => {
    setPosts(posts.map((item) => (item.title === title ? { ...item, ...patch } : item)));
    showToast(patch.blocked ? "User blocked successfully" : "User unblocked successfully");
  };

  const deletePost = (title) => {
    setPosts(posts.filter((item) => item.title !== title));
    setPendingDelete(null);
    showToast("Lost & Found post deleted");
  };

  return (
    <>
      <PageHeader
        eyebrow="Moderation"
        title="Lost & Found command desk"
        text="Manage posts, claims, contact details, fake reports, and user moderation from one workflow."
      />
      <SearchFilter
        search={search} setSearch={setSearch}
        placeholder="Search lost and found posts..."
        filters={["All", "Lost", "Found"]}
        selected={type} setSelected={setType}
      />
      <div className="card-grid">
        <AnimatePresence>
          {filtered.map((item) => (
            <motion.article
              key={item.title}
              className="item-card"
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
            >
              <img src={item.image} alt="" />
              <div>
                <div className="split">
                  <span className={`pill ${item.type.toLowerCase()}`}>{item.type}</span>
                  <span className={`status ${item.blocked ? "danger" : ""}`}>
                    {item.blocked ? "User blocked" : item.status}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.location} — {item.time}</p>
                <small>{item.claims} claim requests waiting</small>
                <div className="button-row">
                  <button className="primary-button" onClick={() => setSelected(item)}>View details</button>
                  <button className="danger-button" onClick={() => updatePost(item.title, { blocked: true })}>Block</button>
                  <button className="soft-button"   onClick={() => updatePost(item.title, { blocked: false })}>Unblock</button>
                  <button className="danger-button ghost-danger" onClick={() => setPendingDelete(item)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
      <div className="panel moderation-panel">
        <h3>Admin moderation panel</h3>
        <p>Spam queue: 12 reports — Fake claim confidence: 88% — Auto-hidden posts: 4</p>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal onClose={() => setSelected(null)} wide>
            <div className="side-detail">
              <img src={selected.image} alt="" />
              <div>
                <span className={`pill ${selected.type.toLowerCase()}`}>{selected.type}</span>
                <h2>{selected.title}</h2>
                <p>{selected.details}</p>
                <div className="detail-grid">
                  <span><FiUserCheck /> {selected.user}</span>
                  <span><FiMail />      {selected.email}</span>
                  <span><FiPhone />     {selected.phone}</span>
                  <span><FiCompass />   {selected.location}</span>
                </div>
                <div className="button-row">
                  <button className="primary-button">Approve claim</button>
                  <button className="danger-button">Mark spam/fake</button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Delete suspicious post?</h2>
            <p>This will remove "{pendingDelete.title}" from the Lost & Found queue.</p>
            <div className="button-row">
              <button className="danger-button" onClick={() => deletePost(pendingDelete.title)}>Delete post</button>
              <button className="soft-button"   onClick={() => setPendingDelete(null)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}

// ─── Page: Marketplace ────────────────────────────────────────────────────────

function MarketplacePage({ products }) {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered   = useFilteredData(products, search, ["name", "seller", "category"])
    .filter((p) => category === "All" || p.category === category);

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Student marketplace"
        text="Controls for listings, seller contacts, categories, and product discovery."
      />
      <SearchFilter
        search={search} setSearch={setSearch}
        placeholder="Search products or sellers..."
        filters={categories} selected={category} setSelected={setCategory}
      />
      <div className="product-grid">
        {filtered.map((product) => (
          <motion.article key={product.name} className="product-card" whileHover={{ y: -10 }}>
            <img src={product.image} alt="" />
            <div>
              <span className="pill">{product.category}</span>
              <h3>{product.name}</h3>
              <strong>{product.price}</strong>
              <p>Seller: {product.seller}</p>
              <div className="contact-row">
                <a href={`tel:${product.phone}`}><FiPhone /> {product.phone}</a>
                <a href={`mailto:${product.email}`}><FiMail /> Email</a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}

// ─── Page: Canteens ───────────────────────────────────────────────────────────

function CanteensPage({ canteens, foodItems }) {
  const [selectedName,   setSelectedName]   = useState(canteens[0].name);
  const [menusByCanteen, setMenusByCanteen] = useState(() =>
    Object.fromEntries(canteens.map((c) => [c.name, c.menus]))
  );
  const [search,        setSearch]        = useState("");
  const [category,      setCategory]      = useState("All");
  const [lightbox,      setLightbox]      = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, showToast] = useToast();

  const selected     = canteens.find((c) => c.name === selectedName);
  const menus        = menusByCanteen[selectedName] || [];
  const categories   = ["All", ...new Set(foodItems.map((item) => item.category))];
  const filteredFood = useFilteredData(foodItems, search, ["name", "category"])
    .filter((item) => category === "All" || item.category === category);

  const addMenuFiles = (files) => {
    const uploads = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));
    if (!uploads.length) return;
    setMenusByCanteen({ ...menusByCanteen, [selectedName]: [...menus, ...uploads] });
    showToast("Menu image uploaded successfully");
  };

  const deleteMenu = (menu) => {
    setMenusByCanteen({ ...menusByCanteen, [selectedName]: menus.filter((m) => m !== menu) });
    setPendingDelete(null);
    showToast("Menu image deleted");
  };

  return (
    <>
      <PageHeader
        eyebrow="Dining"
        title="Canteen menu gallery"
        text="Choose a canteen to manage menu posters, food cards, uploads, and lightbox previews."
      />
      <div className="canteen-layout">
        <div className="canteen-list">
          {canteens.map((c) => (
            <motion.button
              key={c.name}
              className={selectedName === c.name ? "active" : ""}
              onClick={() => setSelectedName(c.name)}
              whileHover={{ x: 8 }}
            >
              <FiPackage />
              <span>{c.name}</span>
            </motion.button>
          ))}
        </div>
        <motion.div
          key={selected.name}
          className="panel canteen-profile dark-food-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="panel-title">
            <h3>{selected.name}</h3>
            <label className="primary-button upload-trigger">
              <FiPlus /> Add Menu
              <input type="file" accept="image/*" multiple onChange={(e) => addMenuFiles(e.target.files)} />
            </label>
          </div>
          <label
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addMenuFiles(e.dataTransfer.files); }}
          >
            <FiUpload />
            <span>Drag and drop menu images here, or click Add Menu</span>
          </label>
          <motion.div className="menu-gallery" layout>
            <AnimatePresence>
              {menus.map((menu, index) => (
                <motion.article
                  key={menu}
                  className="menu-poster-card"
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  whileHover={{ y: -8 }}
                >
                  <button className="image-button" onClick={() => setLightbox(menu)}>
                    <img src={menu} alt={`${selected.name} menu ${index + 1}`} loading="lazy" />
                  </button>
                  <div className="button-row">
                    <button className="soft-button" onClick={() => showToast("Menu edit mode opened")}>Edit</button>
                    <button className="danger-button" onClick={() => setPendingDelete(menu)}>
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <SearchFilter
            search={search} setSearch={setSearch}
            placeholder="Search food items..."
            filters={categories} selected={category} setSelected={setCategory}
          />
          <div className="food-grid">
            {filteredFood.map((item, index) => (
              <motion.article
                key={item.name}
                className="food-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/menus/pencil-canteen.png"; }}
                />
                <div>
                  <span className="pill">{item.category}</span>
                  <em>{item.badge}</em>
                  <h3>{item.name}</h3>
                  <strong>{item.price}</strong>
                  <small className={item.available ? "available" : "unavailable"}>
                    {item.available ? "Available now" : "Currently unavailable"}
                  </small>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <Modal onClose={() => setLightbox(null)} wide>
            <img className="lightbox-image" src={lightbox} alt="" />
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Delete menu image?</h2>
            <p>This removes the selected poster from {selectedName}.</p>
            <div className="button-row">
              <button className="danger-button" onClick={() => deleteMenu(pendingDelete)}>Delete image</button>
              <button className="soft-button"   onClick={() => setPendingDelete(null)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}

// ─── Page: Notifications ──────────────────────────────────────────────────────

const EMPTY_NOTIFICATION_FORM = { title: "", body: "", priority: "Medium", audience: "All Students" };

function NotificationsPage({ initialItems }) {
  const [search,       setSearch]       = useState("");
  const [openIndex,    setOpenIndex]    = useState(-1);
  const [items,        setItems]        = useState(initialItems);
  const [showComposer, setShowComposer] = useState(false);
  const [form,         setForm]         = useState(EMPTY_NOTIFICATION_FORM);
  const [toast, showToast] = useToast();

  const filtered = useFilteredData(items, search, ["title", "priority", "body"]);

  const handleField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const sendNotification = (e) => {
    e.preventDefault();
    setItems([
      { title: form.title, priority: form.priority, time: "Just now", body: `Sent by Admin. ${form.body}`, unread: true },
      ...items,
    ]);
    setForm(EMPTY_NOTIFICATION_FORM);
    setShowComposer(false);
    showToast("Notification sent successfully");
  };

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Notification center"
        text="Collapsible admin notifications with priority, read state, timestamp, and sender context."
        action={
          <button className="primary-button" onClick={() => setShowComposer(true)}>
            <FiSend /> Send notification
          </button>
        }
      />
      <SearchFilter search={search} setSearch={setSearch} placeholder="Search notifications..." />
      <div className="notification-summary">
        <StatCard icon={FiBell}          label="Unread alerts" value={String(items.filter((n) => n.unread).length)}             change="Visible now"     tone="violet" />
        <StatCard icon={FiSend}          label="Sent today"    value="18"                                                        change="+4 this hour"    tone="green"  />
        <StatCard icon={FiAlertTriangle} label="High priority" value={String(items.filter((n) => n.priority === "High").length)} change="Needs attention" tone="amber"  />
      </div>
      <div className="notification-stack">
        {filtered.map((note, index) => (
          <motion.article
            key={note.title}
            className={`notification-card ${note.unread ? "unread" : ""}`}
            layout
          >
            <button onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <span>
                <b>{note.title}</b>
                <small><i className="unread-dot" /> Sent by Admin — {note.time}</small>
              </span>
              <em className={`priority ${note.priority.toLowerCase()}`}>{note.priority}</em>
              <motion.span animate={{ rotate: openIndex === index ? 180 : 0 }}>
                <FiChevronDown />
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {note.body}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>
      <motion.button
        className="fab-button"
        onClick={() => setShowComposer(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
        >
          <FiBell />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {showComposer && (
          <Modal onClose={() => setShowComposer(false)}>
            <form className="notification-form" onSubmit={sendNotification}>
              <h2>Send notification</h2>
              <label>Title
                <input required value={form.title} onChange={handleField("title")} placeholder="Enter notification title" />
              </label>
              <label>Description
                <textarea required value={form.body} onChange={handleField("body")} placeholder="Write a compact admin message" />
              </label>
              <label>Priority
                <select value={form.priority} onChange={handleField("priority")}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label>Audience
                <select value={form.audience} onChange={handleField("audience")}>
                  <option>All Students</option>
                  <option>Final Year</option>
                  <option>Club Admins</option>
                  <option>Marketplace Sellers</option>
                </select>
              </label>
              <button className="primary-button" type="submit"><FiSend /> Send now</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
      <Toast message={toast} />
    </>
  );
}

// ─── Page: Placements ─────────────────────────────────────────────────────────

function PlacementsPage({ initialPlacements }) {
  const [search,        setSearch]        = useState("");
  const [posts,         setPosts]         = useState(initialPlacements);
  const [pendingDelete, setPendingDelete] = useState(null);
  const filtered = useFilteredData(posts, search, ["company", "role"]);

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Placement management"
        text="Review company posts, salary data, deadlines, applicants, and deletion approvals."
      />
      <SearchFilter search={search} setSearch={setSearch} placeholder="Search companies or roles..." />
      <div className="placement-grid">
        {filtered.map((job) => (
          <motion.article key={job.company} className="placement-card" whileHover={{ y: -8 }}>
            <div className="company-logo">{job.logo}</div>
            <h3>{job.company}</h3>
            <strong>{job.role}</strong>
            <p>{job.desc}</p>
            <div className="metric-row">
              <span>{job.package}</span>
              <span>{job.deadline}</span>
              <span>{job.applicants} applicants</span>
            </div>
            <button className="danger-button" onClick={() => setPendingDelete(job)}>
              <FiTrash2 /> Delete placement post
            </button>
          </motion.article>
        ))}
      </div>
      <div className="panel moderation-panel">
        <h3>Admin review panel</h3>
        <p>5 posts pending legal review · 2 compensation edits requested · 11 company profiles verified</p>
      </div>
      <AnimatePresence>
        {pendingDelete && (
          <Modal onClose={() => setPendingDelete(null)}>
            <h2>Confirm deletion</h2>
            <p>Delete the {pendingDelete.company} placement post? This removes it from student discovery.</p>
            <div className="button-row">
              <button
                className="danger-button"
                onClick={() => { setPosts(posts.filter((p) => p.company !== pendingDelete.company)); setPendingDelete(null); }}
              >
                Delete post
              </button>
              <button className="soft-button" onClick={() => setPendingDelete(null)}>Cancel</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page: Memories ───────────────────────────────────────────────────────────

const MEMORY_TABS = ["Approved", "Pending", "AI Flagged", "Reported"];

function MemoriesPage({ initialMemories }) {
  const [items,  setItems]  = useState(initialMemories);
  const [tab,    setTab]    = useState("Approved");
  const [search, setSearch] = useState("");

  const filtered = useFilteredData(items, search, ["user", "caption", "status"])
    .filter((m) => m.status === tab);

  const updateMemory = (caption, patch) =>
    setItems(items.map((item) => (item.caption === caption ? { ...item, ...patch } : item)));

  const deleteMemory = (caption) =>
    setItems(items.filter((item) => item.caption !== caption));

  return (
    <>
      <PageHeader
        eyebrow="Social"
        title="Campus memories"
        text="Moderate visual posts, engagement analytics, blocked users, and AI-flagged content."
      />
      <div className="memory-tabs">
        {MEMORY_TABS.map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            <span>{item}</span>
            <b>{items.filter((m) => m.status === item).length}</b>
          </button>
        ))}
      </div>
      <SearchFilter search={search} setSearch={setSearch} placeholder="Filter by user, caption, status..." />
      <div className="notification-summary">
        <StatCard icon={FiEye}          label="Views in tab"  value={filtered.reduce((s, i) => s + i.views,   0).toLocaleString()} change="Dynamic counter"    tone="blue"  />
        <StatCard icon={FiHeart}        label="Likes in tab"  value={filtered.reduce((s, i) => s + i.likes,   0).toLocaleString()} change="Live social signal" tone="green" />
        <StatCard icon={FiAlertTriangle} label="Reports in tab" value={String(filtered.reduce((s, i) => s + i.reports, 0))}       change="Moderation queue"  tone="amber" />
      </div>
      <div className="memory-grid">
        <AnimatePresence>
          {filtered.map((memory) => (
            <motion.article
              key={memory.caption}
              className="memory-card"
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              whileHover={{ y: -8 }}
            >
              <img src={memory.image} alt="" />
              <div>
                <div className="split">
                  <b>{memory.user}</b>
                  <span className={`status ${memory.status === "AI Flagged" || memory.blocked ? "danger" : ""}`}>
                    {memory.blocked ? "Blocked" : memory.status}
                  </span>
                </div>
                <p>{memory.caption}</p>
                {(memory.status === "AI Flagged" || memory.status === "Reported") && (
                  <div className="ai-panel">
                    <span>
                      <FiAlertTriangle />
                      {memory.status === "AI Flagged" ? "AI moderation indicator" : `${memory.reports} user reports`}
                    </span>
                    <Progress value={memory.risk} />
                    <small>{memory.complaint}</small>
                  </div>
                )}
                <div className="memory-actions">
                  <button><FiHeart />         Like</button>
                  <button><FiMessageCircle /> Comment</button>
                  <button><FiShare2 />        Share</button>
                </div>
                <div className="metric-row">
                  <span><FiEye />   {memory.views.toLocaleString()} views</span>
                  <span><FiHeart /> {memory.likes.toLocaleString()} likes</span>
                  <span>{memory.reports} reports</span>
                </div>
                <div className="button-row">
                  <button className="primary-button" onClick={() => updateMemory(memory.caption, { status: "Approved", blocked: false })}>Approve</button>
                  <button className="danger-button"  onClick={() => updateMemory(memory.caption, { blocked: true })}>Block</button>
                  <button className="soft-button"    onClick={() => updateMemory(memory.caption, { blocked: false })}>Unblock</button>
                  <button className="danger-button ghost-danger" onClick={() => deleteMemory(memory.caption)}><FiTrash2 /> Delete</button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
      <div className="panel moderation-panel">
        <h3>Content moderation panel</h3>
        <p>AI review confidence: 92% — Copyright flags: 1 — Reported comments: 7</p>
      </div>
    </>
  );
}

// ─── Page: Clubs ──────────────────────────────────────────────────────────────

function ClubsPage({ clubs }) {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Clubs management"
        text="Track events, member counts, join requests, engagement, and upcoming activities."
      />
      <div className="club-grid">
        {clubs.map((club) => (
          <motion.article key={club.name} className="club-card" whileHover={{ y: -8 }}>
            <img src={club.banner} alt="" />
            <div>
              <h3>{club.name}</h3>
              <p>Upcoming: {club.event}</p>
              <div className="metric-row">
                <span>{club.members} members</span>
                <span>{club.requests} requests</span>
              </div>
              <Progress value={club.engagement} />
              <button className="primary-button">Review join requests</button>
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}

// ─── Page: Exam Hall ──────────────────────────────────────────────────────────

const EMPTY_EXAM_FORM = { name: "", code: "", date: "", time: "", hallId: 1, studentsCount: 0, duration: 120 };

function ExamHallPage({ initialHalls, initialExams }) {
  const [search,       setSearch]       = useState("");
  const [halls,        setHalls]        = useState(initialHalls);
  const [examsData,    setExamsData]    = useState(initialExams);
  const [selectedHall, setSelectedHall] = useState(null);
  const [showAddExam,  setShowAddExam]  = useState(false);
  const [newExam,      setNewExam]      = useState(EMPTY_EXAM_FORM);

  const filteredHalls = useFilteredData(halls, search, ["hallName", "location"]);
  const filteredExams = useFilteredData(examsData, search, ["name", "code", "date"]);

  const handleExamField = (key) => (e) =>
    setNewExam({ ...newExam, [key]: e.target.type === "number" ? parseInt(e.target.value) : e.target.value });

  const addExam = (e) => {
    e.preventDefault();
    const exam = {
      id: examsData.length + 1,
      ...newExam,
      proctors: Math.ceil(newExam.studentsCount / 30),
      status: "Scheduled",
    };
    setExamsData([...examsData, exam]);
    setNewExam(EMPTY_EXAM_FORM);
    setShowAddExam(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Academic"
        title="Exam Hall Locator"
        text="Manage exam halls, schedules, seating capacity, facilities, and hall assignments."
        action={
          <motion.button
            className="primary-button"
            onClick={() => setShowAddExam(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus /> Add Exam
          </motion.button>
        }
      />
      <div className="tabs">
        <button className="active">Exam Halls ({halls.length})</button>
        <button>Exams ({examsData.length})</button>
      </div>
      <SearchFilter
        search={search} setSearch={setSearch}
        placeholder="Search halls or exams by name, code, location..."
      />
      <div className="exam-halls-grid">
        <AnimatePresence>
          {filteredHalls.map((hall) => {
            const hallExams = examsData.filter((e) => e.hallId === hall.id);
            return (
              <motion.article
                key={hall.id}
                className="exam-hall-card"
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -8 }}
              >
                <div className="hall-header">
                  <div>
                    <h3>{hall.hallName}</h3>
                    <span className={`status ${hall.availability === "Available" ? "success" : "warning"}`}>
                      {hall.availability}
                    </span>
                  </div>
                  <FiMapPin size={20} />
                </div>
                <div className="hall-details">
                  <span><strong>Capacity:</strong> {hall.capacity} students</span>
                  <span><strong>Location:</strong> {hall.location} — {hall.floor} Floor</span>
                  <span><strong>Layout:</strong> {hall.seatsPerRow} × {hall.totalRows} seats</span>
                </div>
                <div className="hall-facilities">
                  {hall.facilities.map((f) => <span key={f} className="facility-badge">{f}</span>)}
                </div>
                <div className="metric-row">
                  <span>{hallExams.length} exams scheduled</span>
                  <span>{hall.examsScheduled} total planned</span>
                </div>
                <button className="soft-button" onClick={() => setSelectedHall(hall)}>
                  <FiEdit /> View Details
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="panel">
        <div className="panel-title">
          <h3>Upcoming Exams</h3>
          <span>{filteredExams.length} scheduled</span>
        </div>
        <div className="exams-table">
          <div className="table-row table-head">
            <span>Subject</span>
            <span>Code</span>
            <span>Date & Time</span>
            <span>Hall</span>
            <span>Students</span>
            <span>Status</span>
            <span />
          </div>
          <AnimatePresence>
            {filteredExams.map((exam) => {
              const hall = halls.find((h) => h.id === exam.hallId);
              return (
                <motion.div
                  key={exam.id}
                  className="table-row"
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ backgroundColor: "var(--hover)" }}
                >
                  <span><b>{exam.name}</b></span>
                  <span>{exam.code}</span>
                  <span>{exam.date}<br />{exam.time}</span>
                  <span>{hall?.hallName ?? "Not assigned"}</span>
                  <span>{exam.studentsCount}</span>
                  <span>
                    <span className={`status ${exam.status === "Confirmed" ? "success" : "info"}`}>
                      {exam.status}
                    </span>
                  </span>
                  <button className="soft-button" onClick={() => setExamsData(examsData.filter((e) => e.id !== exam.id))}>
                    <FiTrash2 />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showAddExam && (
          <Modal onClose={() => setShowAddExam(false)}>
            <form className="exam-form" onSubmit={addExam}>
              <h2>Schedule New Exam</h2>
              <label>Subject Name
                <input required value={newExam.name} onChange={handleExamField("name")} placeholder="e.g., Data Structures" />
              </label>
              <label>Course Code
                <input required value={newExam.code} onChange={handleExamField("code")} placeholder="e.g., CS201" />
              </label>
              <label>Exam Date
                <input required type="date" value={newExam.date} onChange={handleExamField("date")} />
              </label>
              <label>Time
                <input required type="time" value={newExam.time} onChange={handleExamField("time")} />
              </label>
              <label>Expected Students
                <input required type="number" min="1" value={newExam.studentsCount} onChange={handleExamField("studentsCount")} placeholder="e.g., 85" />
              </label>
              <label>Assign Hall
                <select value={newExam.hallId} onChange={handleExamField("hallId")}>
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>{h.hallName} (Capacity: {h.capacity})</option>
                  ))}
                </select>
              </label>
              <label>Duration (minutes)
                <input type="number" min="30" step="15" value={newExam.duration} onChange={handleExamField("duration")} />
              </label>
              <button className="primary-button" type="submit"><FiPlus /> Schedule Exam</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedHall && (
          <Modal onClose={() => setSelectedHall(null)} wide>
            <div className="hall-modal">
              <h2>{selectedHall.hallName}</h2>
              <div className="modal-grid">
                <div>
                  <h4>Basic Information</h4>
                  <p><strong>Location:</strong> {selectedHall.location}</p>
                  <p><strong>Floor:</strong> {selectedHall.floor}</p>
                  <p><strong>Capacity:</strong> {selectedHall.capacity} students</p>
                  <p><strong>Seating:</strong> {selectedHall.seatsPerRow} columns × {selectedHall.totalRows} rows</p>
                </div>
                <div>
                  <h4>Facilities</h4>
                  <div className="facility-list">
                    {selectedHall.facilities.map((f) => (
                      <span key={f} className="facility-badge">✓ {f}</span>
                    ))}
                  </div>
                </div>
              </div>
              <h4 style={{ marginTop: "24px" }}>Scheduled Exams</h4>
              <div className="hall-exams-list">
                {examsData.filter((e) => e.hallId === selectedHall.id).map((exam) => (
                  <div key={exam.id} className="exam-item">
                    <div>
                      <strong>{exam.name}</strong>
                      <p>{exam.date} at {exam.time}</p>
                      <span className="small-text">{exam.studentsCount} students, {exam.duration} min</span>
                    </div>
                    <span className={`status ${exam.status === "Confirmed" ? "success" : "info"}`}>
                      {exam.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Page: Settings ───────────────────────────────────────────────────────────

const SETTINGS_TABS = ["Profile", "Preferences", "Appearance", "Notifications", "Security"];

function SettingsPage() {
  const [tab, setTab] = useState("Profile");

  const tabContent = {
    Profile:       { icon: FiUserCheck, title: "Admin profile",          text: "Update display name, avatar, department ownership, and public support contact." },
    Preferences:   { icon: FiSliders,   title: "Workspace preferences",  text: "Default page, compact tables, timezone, export format, and dashboard density." },
    Appearance:    { icon: FiImage,     title: "Appearance",             text: "Theme, accent color, chart contrast, reduced motion, and presentation mode." },
    Notifications: { icon: FiBell,      title: "Notification rules",     text: "Digest schedules, priority routing, escalation rules, and moderation reminders." },
  };

  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="Settings"
        text="Admin configuration with clean tabbed organization and focused security controls."
      />
      <div className="tabs">
        {SETTINGS_TABS.map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="panel settings-panel">
        {tab !== "Security" && tabContent[tab] && (
          <SettingsBlock {...tabContent[tab]} />
        )}
        {tab === "Security" && (
          <div className="security-grid">
            <SettingsBlock icon={FiLock}     title="Password change"  text="Require strong password rotation and update recovery email for admin access." />
            <SettingsBlock icon={FiActivity} title="Login activity"   text="Last login: 11 May 2026, 12:08 PM from Chrome on Windows. No unusual activity." />
            <SettingsBlock icon={FiShield}   title="Security alerts"  text="Critical alerts are sent instantly to the admin email and notification center." />
          </div>
        )}
      </div>
    </>
  );
}

function SettingsBlock({ icon: Icon, title, text }) {
  return (
    <div className="settings-block">
      <div className="stat-icon"><Icon /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="soft-button">Configure</button>
    </div>
  );
}

export default App;
