import * as studentModel from "../models/student.model.js";

// GET
export const getStudents = async (req, res) => {
  try {
    const data = await studentModel.getAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
export const getStudentById = async (req, res) => {
  try {
    const data = await studentModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST
export const createStudent = async (req, res) => {
  try {
    const result = await studentModel.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await studentModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await studentModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};