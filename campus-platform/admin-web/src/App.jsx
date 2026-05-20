import React, { useState, useEffect } from "react";
import "./App.css";

import { AppDataContext } from "./context/AppDataContext";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { AnimatePresence } from "framer-motion";
import CrudModal from "./components/common/CrudModal";
import {
  normalizeList,
  normalizeUsers,
  normalizeLostFound,
  normalizeGoods,
  normalizeFoodItems,
  normalizeCanteens,
  normalizeNotifications,
  normalizePlacements,
  normalizeMemories,
  normalizeClubs,
  normalizeExamHalls,
  normalizeExams,
} from "./utils/normalize";

import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/UserPage";
import LostFoundPage from "./pages/LostandFound";
import MarketplacePage from "./pages/MarketPlace";
import CanteensPage from "./pages/CanteenPages";
import NotificationsPage from "./pages/Notfications";
import PlacementsPage from "./pages/Placements";
import MemoriesPage from "./pages/MemoriesPage";
import ClubsPage from "./pages/ClubsPage";
import ExamHallPage from "./pages/ExamHallPage";
import SettingsPage from "./pages/SettingsPage";

import { apiRequest as serviceApiRequest } from "./services/api";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  // State initialization
  const [users, setUsers] = useState([]);
  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [goodsItems, setGoodsItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [memories, setMemories] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [examHalls, setExamHalls] = useState([]);
  const [examsData, setExamsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalEditor, setGlobalEditor] = useState(null);

  const apiRequest = serviceApiRequest;

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        usersRes,
        lostFoundRes,
        marketRes,
        canteensRes,
        foodItemsRes,
        notificationsRes,
        memoriesRes,
        clubsRes,
        placementsRes,
        examHallsRes,
        examsRes,
      ] = await Promise.all([
        apiRequest("/api/admin/users"),
        apiRequest("/api/admin/lost-found"),
        apiRequest("/api/admin/marketplace"),
        apiRequest("/api/admin/canteens"),
        apiRequest("/api/admin/food-items"),
        apiRequest("/api/admin/notifications"),
        apiRequest("/api/admin/memories"),
        apiRequest("/api/admin/clubs"),
        apiRequest("/api/admin/placements"),
        apiRequest("/api/admin/exam-halls"),
        apiRequest("/api/admin/exams"),
      ]);

      const usersData = normalizeUsers(normalizeList(usersRes));
      const lostFoundData = normalizeLostFound(normalizeList(lostFoundRes));
      const goodsData = normalizeGoods(normalizeList(marketRes));
      const foodData = normalizeFoodItems(normalizeList(foodItemsRes));
      const canteenData = normalizeCanteens(normalizeList(canteensRes));
      const notificationData = normalizeNotifications(
        normalizeList(notificationsRes),
      );
      const memoryData = normalizeMemories(normalizeList(memoriesRes));
      const clubData = normalizeClubs(normalizeList(clubsRes));
      const placementData = normalizePlacements(normalizeList(placementsRes));
      const examHallData = normalizeExamHalls(normalizeList(examHallsRes));
      const examData = normalizeExams(normalizeList(examsRes));

      setUsers(usersData);
      setLostFoundItems(lostFoundData);
      setGoodsItems(goodsData);
      setFoodItems(foodData);
      setCanteens(canteenData);
      setNotifications(notificationData);
      setMemories(memoryData);
      setClubs(clubData);
      setPlacements(placementData);
      setExamHalls(examHallData);
      setExamsData(examData);
    } catch (error) {
      setUsers([]);
      setLostFoundItems([]);
      setGoodsItems([]);
      setFoodItems([]);
      setCanteens([]);
      setNotifications([]);
      setMemories([]);
      setClubs([]);
      setPlacements([]);
      setExamHalls([]);
      setExamsData([]);
      console.warn(
        "Failed to load admin data from API:",
        error.message || error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        users,
        lostFoundItems,
        goodsItems,
        canteens,
        foodItems,
        notifications,
        placements,
        memories,
        clubs,
        examHalls,
        examsData,
        isLoading,
        apiRequest,
        reloadAdminData: loadAdminData,
      }}
    >
      <div className={`admin-shell ${theme}`}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          open={sidebarOpen}
          close={() => setSidebarOpen(false)}
        />
        <main className="workspace">
          <Topbar
            title={activePage}
            onMenu={() => setSidebarOpen(true)}
            theme={theme}
            setTheme={setTheme}
          />
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "users" && <UsersPage />}
          {activePage === "lostfound" && <LostFoundPage />}
          {activePage === "marketplace" && <MarketplacePage />}
          {activePage === "canteens" && <CanteensPage />}
          {activePage === "notifications" && <NotificationsPage />}
          {activePage === "placements" && <PlacementsPage />}
          {activePage === "memories" && <MemoriesPage />}
          {activePage === "clubs" && <ClubsPage />}
          {activePage === "examhall" && <ExamHallPage />}
          {activePage === "settings" && <SettingsPage />}
          <AnimatePresence>
            {globalEditor && (
              <CrudModal
                title={globalEditor.title}
                description={globalEditor.description}
                fields={globalEditor.fields}
                value={globalEditor.value}
                onChange={(value) =>
                  setGlobalEditor({ ...globalEditor, value })
                }
                onSubmit={async () => {
                  if (globalEditor.onSubmit)
                    await globalEditor.onSubmit(globalEditor.value);
                }}
                onClose={() => setGlobalEditor(null)}
                submitLabel={globalEditor.submitLabel || "Save"}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </AppDataContext.Provider>
  );
}

export default App;
