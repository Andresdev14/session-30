import * as dashboardModel from "../models/dashboard.model.js";

// 🔹 GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const data = await dashboardModel.getStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET DASHBOARD (combined endpoint)
export const getDashboard = async (req, res) => {
  try {
    const stats = await dashboardModel.getStats();
    const activity = await dashboardModel.getRecentActivity(5);

    res.json({
      stats,
      recentActivity: activity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 GET RECENT ACTIVITY
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await dashboardModel.getRecentActivity(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};