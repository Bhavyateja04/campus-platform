// ===============================
// IMPORTS
// ===============================

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiChevronDown,
  FiCompass,
  FiEdit,
  FiEye,
  FiHeart,
  FiHome,
  FiImage,
  FiLock,
  FiMail,
  FiMapPin,
  FiMenu,
  FiMessageCircle,
  FiMoon,
  FiPackage,
  FiPhone,
  FiPlus,
  FiSearch,
  FiSend,
  FiSettings,
  FiShare2,
  FiShield,
  FiShoppingBag,
  FiSliders,
  FiStar,
  FiSun,
  FiTrash2,
  FiTrendingUp,
  FiUpload,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";

import "./App.css";


// ===============================
// CONSTANTS
// ===============================

const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiHome,
  },
  {
    id: "users",
    label: "Users",
    icon: FiUsers,
  },
  {
    id: "lostfound",
    label: "Lost & Found",
    icon: FiCompass,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: FiShoppingBag,
  },
  {
    id: "canteens",
    label: "Canteens",
    icon: FiPackage,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: FiBell,
    badge: 8,
  },
  {
    id: "placements",
    label: "Placements",
    icon: FiBriefcase,
  },
  {
    id: "memories",
    label: "Memories",
    icon: FiCamera,
  },
  {
    id: "clubs",
    label: "Clubs",
    icon: FiStar,
  },
  {
    id: "examhall",
    label: "Exam Hall Locator",
    icon: FiMapPin,
  },
  {
    id: "settings",
    label: "Settings",
    icon: FiSettings,
  },
];

const CHART_COLORS = [
  "#6c5ce7",
  "#00b894",
  "#fdcb6e",
  "#ff7675",
  "#0984e3",
];


// ===============================
// HOOKS
// ===============================

function useFilteredData(items, search, keys) {
  return useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return items;

    return items.filter((item) =>
      keys.some((key) =>
        String(item[key]).toLowerCase().includes(text)
      )
    );
  }, [items, keys, search]);
}

function useToast() {
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  return [toast, showToast];
}


// ===============================
// MAIN APP
// ===============================

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "http://localhost:5000";

  const ADMIN_TOKEN =
    process.env.REACT_APP_ADMIN_TOKEN || "";

  const [users, setUsers] = useState(DEFAULT_USERS);
  const [lostFoundItems, setLostFoundItems] =
    useState(DEFAULT_LOST_FOUND);
  const [placements, setPlacements] =
    useState(DEFAULT_PLACEMENTS);
  const [memories, setMemories] =
    useState(DEFAULT_MEMORIES);

  // ===========================
  // API FETCH HELPER
  // ===========================

  const apiFetch = async (path, opts = {}) => {
    const headers = {
      ...(opts.headers || {}),
    };

    if (ADMIN_TOKEN) {
      headers.Authorization = `Bearer ${ADMIN_TOKEN}`;
    }

    const response = await fetch(
      `${API_BASE}${path}`,
      {
        ...opts,
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `API error ${response.status} ${path}`
      );
    }

    return response.json();
  };

  // ===========================
  // INITIAL DATA LOAD
  // ===========================

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          lostRes,
          placementsRes,
          memRes,
          usersRes,
        ] = await Promise.all([
          apiFetch("/api/lostitems").catch(() => null),

          apiFetch("/api/placements").catch(() => null),

          apiFetch("/api/college-memories").catch(
            () => null
          ),

          apiFetch("/api/admin/viewusers").catch(
            () => null
          ),
        ]);

        if (lostRes?.data) {
          setLostFoundItems(lostRes.data);
        }

        if (placementsRes?.data) {
          setPlacements(placementsRes.data);
        }

        if (memRes?.data) {
          setMemories(
            memRes.data.data ?? memRes.data
          );
        }

        if (usersRes?.data) {
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.warn(
          "Admin dashboard fetch failed:",
          error.message ?? error
        );
      }
    };

    loadDashboardData();
  }, []);

  const activeSidebarItem = SIDEBAR_ITEMS.find(
    (item) => item.id === activePage
  );

  // ===========================
  // RENDER
  // ===========================

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
            initial={{
              opacity: 0,
              y: 18,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -14,
              filter: "blur(8px)",
            }}
            transition={{
              duration: 0.28,
              ease: "easeOut",
            }}
          >
            {activePage === "dashboard" && (
              <DashboardPage />
            )}

            {activePage === "users" && (
              <UsersPage users={users} />
            )}

            {activePage === "lostfound" && (
              <LostFoundPage
                initialItems={lostFoundItems}
              />
            )}

            {activePage === "marketplace" && (
              <MarketplacePage
                products={DEFAULT_PRODUCTS}
              />
            )}

            {activePage === "canteens" && (
              <CanteensPage
                canteens={DEFAULT_CANTEENS}
                foodItems={DEFAULT_FOOD_ITEMS}
              />
            )}

            {activePage === "notifications" && (
              <NotificationsPage
                initialItems={DEFAULT_NOTIFICATIONS}
              />
            )}

            {activePage === "placements" && (
              <PlacementsPage
                initialPlacements={placements}
              />
            )}

            {activePage === "memories" && (
              <MemoriesPage
                initialMemories={memories}
              />
            )}

            {activePage === "clubs" && (
              <ClubsPage clubs={DEFAULT_CLUBS} />
            )}

            {activePage === "examhall" && (
              <ExamHallPage
                initialHalls={DEFAULT_EXAM_HALLS}
                initialExams={DEFAULT_EXAMS}
              />
            )}

            {activePage === "settings" && (
              <SettingsPage />
            )}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
