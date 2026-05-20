import {
  FiHome,
  FiUsers,
  FiCompass,
  FiShoppingBag,
  FiPackage,
  FiBell,
  FiBriefcase,
  FiCamera,
  FiStar,
  FiMapPin,
  FiSettings,
} from "react-icons/fi";

export const sidebarItems = [
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