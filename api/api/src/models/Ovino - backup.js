class Ovino {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const [rows] = await this.db.query('SELECT * FROM ovinos');
    return rows;
  }

  async getById(id) {
    const [rows] = await this.db.query('SELECT * FROM ovinos WHERE id = ?', [id]);
    return rows[0];
  }

  async create(data) {
    const { produtor_id, brinco, nome, sexo, data_nascimento, raca, categoria, peso_atual, situacao } = data;
    const [result] = await this.db.query(
      'INSERT INTO ovinos (produtor_id, brinco, nome, sexo, data_nascimento, raca, categoria, peso_atual, situacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [produtor_id, brinco, nome, sexo, data_nascimento, raca, categoria, peso_atual, situacao]
    );
    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    const { nome, peso_atual, situacao } = data;
    await this.db.query(
      'UPDATE ovinos SET nome=?, peso_atual=?, situacao=? WHERE id=?',
      [nome, peso_atual, situacao, id]
    );
    return { id, ...data };
  }

  async delete(id) {
    await this.db.query('DELETE FROM ovinos WHERE id = ?', [id]);
    return { message: 'Ovino removido com sucesso' };
  }
}

module.exports = Ovino;
