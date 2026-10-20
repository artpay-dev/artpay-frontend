# Heylight BNPL — Guida integrazione Frontend

## Flusso generale

1. Frontend crea una sessione → `POST /artpay/v1/heylight/sessions`
2. Backend risponde con `redirect_url`
3. Frontend redirige l'utente su `redirect_url` (pagina Heylight)
4. Heylight notifica il backend via webhook (automatico)
5. Frontend fa polling → `GET /artpay/v1/heylight/sessions/{uuid}`
6. Quando `status = "success"` → ordine completato

---

## 1. Avviare una sessione di pagamento

```
POST /artpay/v1/heylight/sessions
```

Richiede autenticazione (cookie di sessione o `Authorization: Bearer <token>`).

### Request body

| Campo           | Tipo       | Obbligatorio | Note                                                              |
|-----------------|------------|--------------|-------------------------------------------------------------------|
| `wc_order_id`   | `number`   | sì           | ID ordine WooCommerce già creato                                  |
| `success_url`   | `string`   | sì           | URL assoluto, con redirect dopo pagamento ok                      |
| `failure_url`   | `string`   | sì           | URL assoluto, per cancellazione o errore                          |
| `language`      | `string`   | no           | Default `"it"`                                                    |
| `product_type`  | `string`   | no           | `"finanziamento"` (default) oppure `"dilazione"`                  |
| `allowed_terms` | `number[]` | no           | Rate permesse (es. `[3, 6, 12]`). Solo per `finanziamento`        |

### Response 201

```json
{
  "application_uuid": "hl_abc123...",
  "redirect_url": "https://checkout.heylight.com/...",
  "product_type": "finanziamento",
  "status": "pending"
}
```

### Response 200 (idempotente — sessione pending già esistente)

```json
{
  "application_uuid": "hl_abc123...",
  "redirect_url": "https://checkout.heylight.com/...",
  "product_type": "finanziamento",
  "status": "pending"
}
```

Dopo aver ricevuto la risposta:

```js
window.location.href = data.redirect_url;
```

> L'utente completa il pagamento su Heylight. Al termine, Heylight lo redirige su `success_url` o `failure_url`.

---

## 2. Polling dello stato

Quando l'utente torna su `success_url` o `failure_url`, fare polling per leggere lo stato aggiornato.

```
GET /artpay/v1/heylight/sessions/{application_uuid}
```

Richiede autenticazione.

### Response 200

```json
{
  "application_uuid": "hl_abc123...",
  "wc_order_id": 1234,
  "status": "success",
  "product_type": "finanziamento",
  "amount": 150000,
  "currency": "EUR",
  "created_at": "2026-09-25 10:00:00",
  "updated_at": "2026-09-25 10:05:00"
}
```

### Stati possibili

| Status                  | Significato                    | Azione frontend                       |
|-------------------------|--------------------------------|---------------------------------------|
| `pending`               | In attesa                      | Continua il polling                   |
| `success`               | Pagamento approvato            | Mostra conferma ordine                |
| `awaiting_confirmation` | In attesa di conferma Heylight | Mostra stato "in lavorazione"         |
| `cancelled`             | Annullato o rifiutato          | Mostra messaggio di errore            |

### Esempio di polling

```ts
async function pollStatus(uuid: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`/wp-json/artpay/v1/heylight/sessions/${uuid}`, {
      credentials: 'include',
    });
    const data = await res.json();

    if (data.status === 'success') return data;
    if (data.status === 'cancelled') throw new Error('Pagamento annullato');
    if (data.status === 'awaiting_confirmation') return data; // stop, mostra "in lavorazione"

    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Timeout polling');
}
```

---

## 3. Rimborso (solo vendor/admin)

```
POST /artpay/v1/heylight/refund
```

```json
{
  "application_uuid": "hl_abc123...",
  "amount": 50000,
  "reference": "rimborso-parziale-1234"
}
```

- `amount` è in centesimi (es. `50000` = €500,00)
- Non può superare il totale del contratto
- Solo utenti con ruolo `administrator`, `dc_vendor` o `seller`

---

## 4. Errori comuni

| HTTP | Causa                               | Soluzione                                       |
|------|-------------------------------------|-------------------------------------------------|
| 400  | Campi mancanti o ordine già completato | Verificare il body della richiesta           |
| 401  | Utente non autenticato              | Fare login prima                                |
| 403  | L'ordine appartiene a un altro utente | Verificare che l'utente sia il proprietario  |
| 404  | Ordine o sessione non trovati       | Verificare `wc_order_id` e `application_uuid`   |
| 502  | Errore di comunicazione con Heylight | Riprovare, segnalare al backend se persiste    |

---

## 5. Note importanti

- L'ordine WooCommerce deve esistere prima di chiamare `/sessions`. Il frontend deve prima creare l'ordine (flusso esistente) e poi avviare la sessione Heylight con l'ID ottenuto.
- Non serve gestire il webhook: viene ricevuto direttamente dal backend. Il frontend scopre l'esito solo tramite polling.
- `amount` nelle risposte è in centesimi: dividere per 100 per visualizzarlo.
- In sandbox le chiamate vanno verso `sbx-origination.heidipay.io` — il backend gestisce l'ambiente automaticamente in base alla configurazione.