import * as studentModel from "../models/student.model.js";
import * as studentGuardianModel from "../models/studentGuardian.model.js";

// GET
export const getStudents = async (req, res) => {
  try {
    const data = await studentModel.getAll();
    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// GET BY ID
export const getStudentById = async (req, res) => {
  try {
    const data = await studentModel.getById(req.params.id);

    if (!data) {
      return res.status(404).json({ ok: false, error: "Student not found" });
    }

    res.json({ ok: true, data });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// POST
export const createStudent = async (req, res) => {
  try {
    const { student_code, first_name, last_name } = req.body;

    // Validate required fields
    if (!student_code || !first_name || !last_name) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: student_code, first_name, last_name"
      });
    }

    const result = await studentModel.create(req.body);
    if (Array.isArray(req.body.guardian_ids)) {
      await studentGuardianModel.replaceRelationsForStudent(result.id, req.body.guardian_ids);
    }
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// PUT
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await studentModel.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ ok: false, error: "Student not found" });
    }

    if (Array.isArray(req.body.guardian_ids)) {
      await studentGuardianModel.replaceRelationsForStudent(id, req.body.guardian_ids);
    }

    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// DELETE
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await studentModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: "Student not found" });
    }

    res.json({ ok: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Failed to delete student:", error);
    const message = error.message.includes("Cannot delete")
      ? "No se puede eliminar este estudiante porque tiene registros relacionados. Elimina primero asistencia, cuentas o notificaciones asociadas."
      : error.message;
    res.status(500).json({ ok: false, error: message });
  }
};