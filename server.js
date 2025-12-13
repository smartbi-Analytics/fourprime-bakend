require("dotenv").config({ path: __dirname + "/.env" });

console.log("ENV TESTE ↓↓↓");
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_PASSWORD =", process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
console.log("DB_NAME =", process.env.DB_NAME);
console.log("ENV TESTE ↑↑↑");

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

pool.connect()
  .then(() => console.log("Conectado ao Postgres!"))
  .catch(err => console.error("Erro ao conectar:", err));

// Criar tabela cliente se não existir
const criarTabelaCliente = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS cliente (
      id SERIAL PRIMARY KEY,
      data_incl TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo'), -- Primeira coluna com data de criação no horário de SP
      pri_nome TEXT,
      sob_nome TEXT,
      cpf VARCHAR(14),
      pais TEXT,
      estado TEXT,
      cidade TEXT,
      bairro TEXT,
      rua TEXT,
      end_numero TEXT,
      end_detalhe TEXT,
      updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Sao_Paulo')
    );
  `;
  try {
    await pool.query(sql);
    console.log("Tabela cliente criada com sucesso!");
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
  }
};

criarTabelaCliente();

// Inserir cliente
app.post("/clientes", async (req, res) => {
  const dados = req.body;

  const sql = `
    INSERT INTO cliente (
      pri_nome, sob_nome, cpf, pais, estado, cidade, bairro, rua, end_numero, end_detalhe
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  try {
    const result = await pool.query(sql, [
      dados.pri_nome,
      dados.sob_nome,
      dados.cpf,
      dados.pais,
      dados.estado,
      dados.cidade,
      dados.bairro,
      dados.rua,
      dados.end_numero,
      dados.end_detalhe
    ]);

    res.json({
      message: "Cliente cadastrado com sucesso!",
      cliente: result.rows[0] // já inclui created_at e updated_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao inserir no banco." });
  }
});

// Listar todos os clientes
app.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cliente ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar clientes." });
  }
});

// Atualizar cliente (atualiza updated_at)
app.put("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  const sql = `
    UPDATE cliente
    SET pri_nome=$1, sob_nome=$2, cpf=$3, pais=$4, estado=$5, cidade=$6, bairro=$7, rua=$8, end_numero=$9, end_detalhe=$10, updated_at=NOW()
    WHERE id=$11
    RETURNING *
  `;

  try {
    const result = await pool.query(sql, [
      dados.pri_nome,
      dados.sob_nome,
      dados.cpf,
      dados.pais,
      dados.estado,
      dados.cidade,
      dados.bairro,
      dados.rua,
      dados.end_numero,
      dados.end_detalhe,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    res.json({
      message: "Cliente atualizado com sucesso!",
      cliente: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar cliente." });
  }
});

// Deletar cliente
app.delete("/clientes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM cliente WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    res.json({
      message: "Cliente deletado com sucesso!",
      cliente: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao deletar cliente." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
