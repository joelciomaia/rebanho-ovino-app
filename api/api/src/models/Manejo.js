const crypto = require('crypto');

class Manejo {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    try {
      const [rows] = await this.db.query(`
        SELECT 
          m.*,
          o.brinco as ovino_brinco,
          o.nome as ovino_nome
        FROM manejos m
        LEFT JOIN ovinos o ON m.ovino_id = o.id
        ORDER BY m.data DESC
      `);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao buscar manejos: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const [rows] = await this.db.query(`
        SELECT 
          m.*,
          o.brinco as ovino_brinco,
          o.nome as ovino_nome
        FROM manejos m
        LEFT JOIN ovinos o ON m.ovino_id = o.id
        WHERE m.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        throw new Error('Manejo não encontrado');
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar manejo: ${error.message}`);
    }
  }

  async getByOvinoId(ovino_id) {
    try {
      const [rows] = await this.db.query(`
        SELECT 
          m.*,
          o.brinco as ovino_brinco,
          o.nome as ovino_nome
        FROM manejos m
        LEFT JOIN ovinos o ON m.ovino_id = o.id
        WHERE m.ovino_id = ?
        ORDER BY m.data DESC
      `, [ovino_id]);
      
      return rows;
    } catch (error) {
      throw new Error(`Erro ao buscar manejos do ovino: ${error.message}`);
    }
  }

  async create(data) {
    const {
      ovino_id, tipo, data: data_manejo, observacoes,
      reprodutivo_acao, sanitario_produto, sanitario_dosagem,
      nutricao_alimento, nutricao_quantidade
    } = data;

    try {
      const id = crypto.randomUUID();

      const query = `
        INSERT INTO manejos (
          id, ovino_id, tipo, data, observacoes,
          reprodutivo_acao, sanitario_produto, sanitario_dosagem,
          nutricao_alimento, nutricao_quantidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id, ovino_id, tipo, data_manejo, observacoes,
        reprodutivo_acao || null, sanitario_produto || null, sanitario_dosagem || null,
        nutricao_alimento || null, nutricao_quantidade || null
      ];

      await this.db.query(query, params);

      return { 
        id, 
        ...data
      };
    } catch (error) {
      throw new Error(`Erro ao criar manejo: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const existing = await this.getById(id);

      const {
        tipo, data: data_manejo, observacoes,
        reprodutivo_acao, sanitario_produto, sanitario_dosagem,
        nutricao_alimento, nutricao_quantidade
      } = data;

      const query = `
        UPDATE manejos SET 
          tipo=?, data=?, observacoes=?,
          reprodutivo_acao=?, sanitario_produto=?, sanitario_dosagem=?,
          nutricao_alimento=?, nutricao_quantidade=?
        WHERE id=?
      `;

      const params = [
        tipo, data_manejo, observacoes,
        reprodutivo_acao || null, sanitario_produto || null, sanitario_dosagem || null,
        nutricao_alimento || null, nutricao_quantidade || null, id
      ];

      await this.db.query(query, params);

      return { 
        id, 
        ...data
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar manejo: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const existing = await this.getById(id);
      
      await this.db.query('DELETE FROM manejos WHERE id = ?', [id]);
      
      return { 
        message: 'Manejo removido com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao deletar manejo: ${error.message}`);
    }
  }
}

module.exports = Manejo;