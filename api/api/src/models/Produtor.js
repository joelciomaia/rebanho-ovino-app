const pool = require('../config/db');

class Produtor {
  constructor(db) {
    this.db = db;
  }

  // Buscar produtor por email
  async findByEmail(email) {
    const [rows] = await this.db.execute(
      'SELECT * FROM criadores WHERE email = ? AND ativo = 1',
      [email]
    );
    return rows[0];
  }

  // Buscar produtor por ID
  async getById(id) {
    const [rows] = await this.db.execute(
      `SELECT id, nome_completo, email, telefone_whatsapp, preferencia_recuperacao, 
              foto_perfil, data_cadastro, cabanha_nome, cabanha_municipio, cabanha_estado, 
              cabanha_localizacao_livre, cabanha_latitude, cabanha_longitude 
       FROM criadores WHERE id = ? AND ativo = 1`,
      [id]
    );
    return rows[0];
  }

  // Buscar todos (para admin)
  async getAll() {
    const [rows] = await this.db.execute(
      'SELECT id, nome_completo, email, telefone_whatsapp, data_cadastro FROM criadores WHERE ativo = 1'
    );
    return rows;
  }

  // Criar novo produtor
  async create(data) {
    const {
      nome_completo,
      email,
      telefone_whatsapp,
      preferencia_recuperacao,
      senha,
      cabanha_nome,
      cabanha_municipio,
      cabanha_estado,
      cabanha_localizacao_livre,
      cabanha_latitude,
      cabanha_longitude
    } = data;

    const [result] = await this.db.execute(
      `INSERT INTO criadores 
      (nome_completo, email, telefone_whatsapp, preferencia_recuperacao, senha, 
       cabanha_nome, cabanha_municipio, cabanha_estado, cabanha_localizacao_livre, 
       cabanha_latitude, cabanha_longitude) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_completo,
        email,
        telefone_whatsapp,
        preferencia_recuperacao,
        senha,
        cabanha_nome,
        cabanha_municipio,
        cabanha_estado,
        cabanha_localizacao_livre,
        cabanha_latitude,
        cabanha_longitude
      ]
    );

    return this.getById(result.insertId);
  }

  // Atualizar produtor
  async update(id, data) {
    const {
      nome_completo,
      email,
      telefone_whatsapp,
      preferencia_recuperacao,
      cabanha_nome,
      cabanha_municipio,
      cabanha_estado,
      cabanha_localizacao_livre,
      cabanha_latitude,
      cabanha_longitude
    } = data;

    await this.db.execute(
      `UPDATE criadores 
       SET nome_completo = ?, email = ?, telefone_whatsapp = ?, preferencia_recuperacao = ?,
           cabanha_nome = ?, cabanha_municipio = ?, cabanha_estado = ?, 
           cabanha_localizacao_livre = ?, cabanha_latitude = ?, cabanha_longitude = ?
       WHERE id = ?`,
      [
        nome_completo,
        email,
        telefone_whatsapp,
        preferencia_recuperacao,
        cabanha_nome,
        cabanha_municipio,
        cabanha_estado,
        cabanha_localizacao_livre,
        cabanha_latitude,
        cabanha_longitude,
        id
      ]
    );

    return this.getById(id);
  }

  // Atualizar senha
  async updatePassword(id, senha) {
    await this.db.execute(
      'UPDATE criadores SET senha = ? WHERE id = ?',
      [senha, id]
    );
    return true;
  }

  // "Deletar" (inativar) produtor
  async delete(id) {
    await this.db.execute(
      'UPDATE criadores SET ativo = 0 WHERE id = ?',
      [id]
    );
    return { message: 'Produtor removido com sucesso' };
  }
}

module.exports = Produtor;