const express = require("express");
const cors = require("cors");
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Postgres usando variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST,       // Host do Postgres na Render
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,       // Usuário do banco
  password: process.env.DB_PASS,   // Senha do banco
  database: process.env.DB_NAME,   // Nome do banco
});

// Teste de conexão
pool.connect()
  .then(() => console.log("Conectado ao Postgres!"))
  .catch(err => console.error("Erro ao conectar:", err));

// Rota para receber formulário
app.post("/clientes", async (req, res) => {
  const dados = req.body;

  const sql = `
    INSERT INTO cliente (
      pri_nome, sob_nome, cpf, pais, estado, cidade, bairro, rua, end_numero, end_detalhe
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const values = [
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
  ];

  try {
    const result = await pool.query(sql, values);
    res.json({ message: "Cliente cadastrado com sucesso!", cliente: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao inserir no banco.", error: err });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
