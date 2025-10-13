class Produtor {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const [rows] = await this.db.query('SELECT * FROM produtores');
    return rows;
  }

  async getById(id) {
    const [rows] = await this.db.query('SELECT * FROM produtores WHERE id = ?', [id]);
    return rows[0];
  }

  async create(data) {
    const { nome_completo, email, senha_hash, telefone, endereco } = data;
    const [result] = await this.db.query(
      'INSERT INTO produtores (nome_completo, email, senha_hash, telefone, endereco) VALUES (?, ?, ?, ?, ?)',
      [nome_completo, email, senha_hash, telefone, endereco]
    );
    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    const { nome_completo, email, telefone, endereco } = data;
    await this.db.query(
      'UPDATE produtores SET nome_completo=?, email=?, telefone=?, endereco=? WHERE id=?',
      [nome_completo, email, telefone, endereco, id]
    );
    return { id, ...data };
  }

  async delete(id) {
    await this.db.query('DELETE FROM produtores WHERE id = ?', [id]);
    return { message: 'Produtor removido com sucesso' };
  }
}

module.exports = Produtor;
