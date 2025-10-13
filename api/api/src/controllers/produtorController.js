const pool = require('../config/db');
const Produtor = require('../models/Produtor');
const produtorModel = new Produtor(pool);

exports.getAll = async (req, res) => {
  const data = await produtorModel.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await produtorModel.getById(req.params.id);
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await produtorModel.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await produtorModel.update(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  const data = await produtorModel.delete(req.params.id);
  res.json(data);
};
