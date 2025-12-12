const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "@d@niMila_14",
  database: "fourprime"
});

// Teste de conexão
db.connect(err => {
  if (err) {
    console.log("Erro ao conectar:", err);
    return;
  }
  console.log("Conectado ao MySQL!");
});

// ROTA PARA RECEBER FORMULÁRIO
app.post("/clientes", (req, res) => {
  const dados = req.body;

  const sql = `
    INSERT INTO cliente (
      pri_nome, sob_nome, cpf, país, estado, cidade, bairro, rua, end_numero, end_detalhe
    ) VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    dados.pri_nome,
    dados.sob_nome,
    dados.cpf,
    dados.país,
    dados.estado,
    dados.cidade,
    dados.bairro,
    dados.rua,
    dados.end_numero,
    dados.end_detalhe
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Erro ao inserir no banco.");
    }
    res.send("Cliente cadastrado com sucesso!");
  });
});

// Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
