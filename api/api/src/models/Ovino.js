const crypto = require('crypto');

class Ovino {
  constructor(db) {
    this.db = db;
  }

  async getAll(produtorId) {
    try {
      console.error('🔍 Tentando buscar ovinos do produtor:', produtorId);
      console.error('📊 Executando query...');
      
      const [rows] = await this.db.query(`
        SELECT 
          o.*,
          r.nome as raca_nome
        FROM ovinos o
        LEFT JOIN racas_ovinas r ON o.raca_id = r.id
        WHERE o.produtor_id = ?
        ORDER BY o.data_cadastro DESC
      `, [produtorId]);
      
      console.error('✅ Ovinos encontrados:', rows.length);
      return rows;
    } catch (error) {
      console.error('❌ ERRO COMPLETO:', error);
      console.error('📌 SQL State:', error.code);
      console.error('📌 Message:', error.message);
      console.error('📌 Stack:', error.stack);
      throw new Error(`Erro ao buscar ovinos: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const [rows] = await this.db.query(`
        SELECT 
          o.*,
          r.nome as raca_nome
        FROM ovinos o
        LEFT JOIN racas_ovinas r ON o.raca_id = r.id
        WHERE o.id = ?
      `, [id]);
      
      if (rows.length === 0) {
        throw new Error('Ovino não encontrado');
      }
      
      return rows[0];
    } catch (error) {
      console.error('❌ ERRO getById:', error);
      throw new Error(`Erro ao buscar ovino: ${error.message}`);
    }
  }

  async create(data) {
    const {
      produtor_id, brinco, nome, sexo, data_nascimento, raca_id, categoria, 
      peso_atual, situacao, mae_id, pai_id, foto_perfil, tipo_parto_nascimento,
      habilidade_materna_nascimento, peso_nascimento, vigor_nascimento, 
      mamou_colostro, observacao_nascimento, descarte_tipo, descarte_data, 
      descarte_observacao, origem
    } = data;

    try {
      const id = crypto.randomUUID();

      const query = `
        INSERT INTO ovinos (
          id, produtor_id, brinco, nome, sexo, data_nascimento, raca_id, categoria, 
          peso_atual, situacao, mae_id, pai_id, foto_perfil, tipo_parto_nascimento,
          habilidade_materna_nascimento, peso_nascimento, vigor_nascimento, 
          mamou_colostro, observacao_nascimento, descarte_tipo, descarte_data, 
          descarte_observacao, origem
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        id, produtor_id, brinco, nome, sexo, data_nascimento, raca_id, categoria, 
        peso_atual, situacao, mae_id, pai_id, foto_perfil, tipo_parto_nascimento,
        habilidade_materna_nascimento, peso_nascimento, vigor_nascimento, 
        mamou_colostro, observacao_nascimento, descarte_tipo, descarte_data, 
        descarte_observacao, origem
      ];

      await this.db.query(query, params);

      const novoOvino = await this.getById(id);
      return novoOvino;
    } catch (error) {
      console.error('❌ ERRO create:', error);
      throw new Error(`Erro ao criar ovino: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const existing = await this.getById(id);

      const {
        nome, peso_atual, situacao, mae_id, pai_id, data_nascimento, 
        raca_id, categoria, peso_nascimento, tipo_parto_nascimento, 
        vigor_nascimento, mamou_colostro, habilidade_materna_nascimento, 
        observacao_nascimento, descarte_tipo, descarte_data, 
        descarte_observacao, origem
      } = data;

      const query = `
        UPDATE ovinos SET 
          nome=?, peso_atual=?, situacao=?, mae_id=?, pai_id=?, 
          data_nascimento=?, raca_id=?, categoria=?, peso_nascimento=?,
          tipo_parto_nascimento=?, vigor_nascimento=?, mamou_colostro=?,
          habilidade_materna_nascimento=?, observacao_nascimento=?,
          descarte_tipo=?, descarte_data=?, descarte_observacao=?, origem=?
        WHERE id=?
      `;

      const params = [
        nome, peso_atual, situacao, mae_id, pai_id, data_nascimento, 
        raca_id, categoria, peso_nascimento, tipo_parto_nascimento, 
        vigor_nascimento, mamou_colostro, habilidade_materna_nascimento, 
        observacao_nascimento, descarte_tipo, descarte_data, 
        descarte_observacao, origem, id
      ];

      await this.db.query(query, params);

      const ovinoAtualizado = await this.getById(id);
      return ovinoAtualizado;
    } catch (error) {
      console.error('❌ ERRO update:', error);
      throw new Error(`Erro ao atualizar ovino: ${error.message}`);
    }
  }

  async updateStatus(id, data) {
    try {
      const existing = await this.getById(id);

      const {
        situacao,
        descarte_tipo,
        descarte_data, 
        descarte_observacao
      } = data;

      const query = `
        UPDATE ovinos SET 
          situacao=?,
          descarte_tipo=?,
          descarte_data=?,
          descarte_observacao=?
        WHERE id=?
      `;

      const params = [
        situacao,
        descarte_tipo || null,
        descarte_data || null, 
        descarte_observacao || null,
        id
      ];

      await this.db.query(query, params);

      const ovinoAtualizado = await this.getById(id);
      return ovinoAtualizado;
    } catch (error) {
      console.error('❌ ERRO updateStatus:', error);
      throw new Error(`Erro ao atualizar status do ovino: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const existing = await this.getById(id);
      await this.db.query('DELETE FROM ovinos WHERE id = ?', [id]);
      return { message: 'Ovino removido com sucesso' };
    } catch (error) {
      console.error('❌ ERRO delete:', error);
      throw new Error(`Erro ao deletar ovino: ${error.message}`);
    }
  }
}

module.exports = Ovino;