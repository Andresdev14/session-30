import * as dashboardModel from "../models/dashboard.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardModel.getStats();
    res.json({ ok: true, data: stats });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const data = await dashboardModel.getDashboard(limit);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await dashboardModel.getRecentActivity(limit);
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};