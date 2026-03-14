# API - Lista de Presentes

Base URL local: `http://localhost:5000`

## Healthcheck

### `GET /api/health`
Retorna status da API.

## Confirmações

### `GET /api/confirmacoes`
Lista confirmações de presença registradas.

Query params opcionais:
- `page` (default: 1)
- `limit` (default: 12, max: 100)
- `confirmado` (filtra apenas confirmados ou não; aceita true/false, sim/nao, 1/0)
- `busca` (filtro por nome do convidado)

Resposta:
```json
{
  "data": [
    {
      "id": 10,
      "nome_convidado": "Maria Silva",
      "confirmado": true,
      "criado_em": "2026-03-10T..."
    }
  ],
  "page": 1,
  "limit": 12,
  "count": 1
}
```

### `GET /api/confirmacoes/:id`
Retorna os dados de uma confirmação específica.

### `POST /api/confirmacoes`
Cria uma nova confirmação.

Body JSON:
```json
{
  "nome_convidado": "Maria Silva",
  "confirmado": true
}
```

### `PATCH /api/confirmacoes/:id`
Atualiza nome e/ou status de confirmação.

Body JSON de exemplo:
```json
{
  "confirmado": false
}
```

## Presentes

### `GET /api/presentes`
Lista presentes ativos.

Query params opcionais:
- `page` (default: 1)
- `limit` (default: 12, max: 100)
- `categoria` (filtro exato, case-insensitive)
- `busca` (filtro por nome/descricao)
- `somente_disponiveis` (`true/false`)

Resposta:
```json
{
  "data": [
    {
      "id": 1,
      "nome_presente": "Air Fryer",
      "descricao": "Modelo 5L",
      "valor": 499.9,
      "categoria": "cozinha",
      "tipo_pagamento": "pix",
      "url_image": "https://...",
      "quantidade_total": 1,
      "ativo": true,
      "criado_em": "2026-03-06T...",
      "atualizado_em": "2026-03-06T...",
      "disponivel": true,
      "reservado_por": null
    }
  ],
  "page": 1,
  "limit": 12,
  "count": 1
}
```

### `GET /api/presentes/:id`
Detalhe de um presente ativo.

### `POST /api/presentes`
Cria presente.

Body JSON:
```json
{
  "nome_presente": "Air Fryer",
  "descricao": "Modelo 5L",
  "valor": 499.90,
  "categoria": "cozinha",
  "tipo_pagamento": "pix",
  "url_image": "https://...",
  "quantidade_total": 1,
  "ativo": true
}
```

### `PATCH /api/presentes/:id`
Atualiza campos de um presente.

### `DELETE /api/presentes/:id`
Remove presente.

## Reserva de Presentes

### `POST /api/presentes/:id/reservar`
Cria reserva ativa para um presente (apenas uma reserva ativa por presente).

Body JSON:
```json
{
  "nome_convidado": "Joao",
  "email_convidado": "joao@email.com",
  "telefone_convidado": "85999999999",
  "mensagem": "Parabens ao casal"
}
```

Possiveis respostas:
- `201`: reserva criada
- `409`: presente ja reservado
- `404`: presente nao encontrado

### `POST /api/presentes/:id/cancelar-reserva`
Cancela reserva ativa.

Body JSON opcional:
```json
{
  "reserva_id": 10
}
```

## CORS

A API retorna headers CORS com:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`

## Schema automatico

Por padrao, ao iniciar a aplicacao, o backend garante a existencia/atualizacao basica das tabelas:
- `lista_presentes`
- `reservas_presentes`

Variaveis de ambiente:
- `DATABASE_URL` (obrigatoria)
- `AUTO_MIGRATE` (default: `true`)
- `FLASK_DEBUG` (default: `false`)
