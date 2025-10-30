import express from "express";
import { getEmpresas, getPreciosPorEmpresa } from "../controllers/empresa.controller.js"; //  importamos ambas funciones

const router = express.Router();

//  Ruta para obtener todas las empresas
router.get("/", getEmpresas);

// Ruta para obtener los precios históricos de una empresa
router.get("/:id/precios", getPreciosPorEmpresa);

export default router;
