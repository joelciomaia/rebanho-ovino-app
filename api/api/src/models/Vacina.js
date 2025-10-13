class Vacina {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const [rows] = await this.db.query('SELECT * FROM vacinas');
    return rows;
  }

  async getById(id) {
    const [rows] = await this.db.query('SELECT * FROM vacinas WHERE id = ?', [id]);
    return rows[0];
  }

  async create(data) {
    const { nome, descricao } = data;
    const [result] = await this.db.query(
      'INSERT INTO vacinas (nome, descricao) VALUES (?, ?)',
      [nome, descricao]
    );
    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    const { nome, descricao } = data;
    await this.db.query(
      'UPDATE vacinas SET nome=?, descricao=? WHERE id=?',
      [nome, descricao, id]
    );
    return { id, ...data };
  }

  async delete(id) {
    await this.db.query('DELETE FROM vacinas WHERE id = ?', [id]);
    return { message: 'Vacina removida com sucesso' };
  }
}

module.exports = Vacina;
