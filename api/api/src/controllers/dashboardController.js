const db = require("../config/db");

exports.getResumo = async (req, res) => {
  try {
    const [[{ totalProdutores }]] = await db.query("SELECT COUNT(*) AS totalProdutores FROM produtores");
    const [[{ totalOvinos }]] = await db.query("SELECT COUNT(*) AS totalOvinos FROM ovinos");
    const [[{ ativos }]] = await db.query("SELECT COUNT(*) AS ativos FROM ovinos WHERE situacao = 'ativo'");
    const [[{ inativos }]] = await db.query("SELECT COUNT(*) AS inativos FROM ovinos WHERE situacao = 'inativo'");
    const [[{ totalVacinas }]] = await db.query("SELECT COUNT(*) AS totalVacinas FROM vacinas");

    res.json({
      produtores: totalProdutores,
      ovinos: totalOvinos,
      ovinosAtivos: ativos,
      ovinosInativos: inativos,
      vacinasAplicadas: totalVacinas
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
