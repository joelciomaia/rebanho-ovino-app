const pool = require('../config/db');
const Vacina = require('../models/Vacina');
const vacinaModel = new Vacina(pool);

exports.getAll = async (req, res) => {
  const data = await vacinaModel.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await vacinaModel.getById(req.params.id);
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await vacinaModel.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await vacinaModel.update(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  const data = await vacinaModel.delete(req.params.id);
  res.json(data);
};
