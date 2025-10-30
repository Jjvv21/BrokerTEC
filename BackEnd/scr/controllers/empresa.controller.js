import { EmpresaService } from "../services/empresa.service.js";

export const getEmpresas = async (req, res) => {
  try {
    const service = new EmpresaService();
    const empresas = await service.getEmpresas();
    res.status(200).json(empresas);
  } catch (error) {
    console.error(" Error al obtener empresas:", error.message);
    res.status(500).json({
      error: "Error al obtener empresas",
      details: error.message
    });
  }

};

export const getPreciosPorEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const service = new EmpresaService();
    const precios = await service.getPreciosPorEmpresa(id);
    res.status(200).json(precios);
  } catch (error) {
    console.error(" Error al obtener precios:", error);
    res.status(500).json({ error: "Error al obtener precios", details: error.message });
  }
};

