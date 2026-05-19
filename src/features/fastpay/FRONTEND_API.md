# WC-Quote — Frontend API Reference

Base URL: `https://artpay.art/wp-json`

---

## Flusso generale

```
[Vendor] POST create-artwork          → crea prodotto + artista (richiede auth)
[Vendor] POST update-customer-email   → imposta email cliente e invia email preventivo (richiede auth)
[Vendor] GET  vendor/quotes               → lista preventivi del vendor con dettagli completi (richiede auth)
[Vendor] GET  vendor/quotes/{id}         → dettaglio di un singolo preventivo (richiede auth)
[Vendor] POST vendor/quotes/{id}/expiry  → imposta o rimuove la data di scadenza del preventivo (richiede auth)

[Cliente riceve email con link /quotes?order_key=...&email=...]

[Cliente] GET  order                  → visualizza i dettagli del preventivo

— Flusso carta / Klarna —
[Cliente] POST convert-to-on-hold     → accetta il preventivo → crea Payment Intent Stripe
[Cliente] POST update-payment-intent-fee → aggiorna fee se cambia metodo pagamento
[Cliente] (Stripe Elements)           → il cliente completa il pagamento su frontend
[Cliente] POST complete-payment       → conferma lato client dopo successo Stripe

— Flusso bonifico bancario —
[Cliente] POST convert-to-on-hold     → accetta il preventivo → crea Payment Intent + ottieni IBAN/causale
[Cliente] (esegue il bonifico manualmente verso l'IBAN ricevuto)
[Stripe Webhook]                      → payment_intent.succeeded → ordine aggiornato automaticamente

oppure:

[Cliente] POST reject-quote           → rifiuta il preventivo
```

---

## Autenticazione

La maggior parte degli endpoint è **pubblica** e usa `order_key + email` come validazione.
`create-artwork`, `update-customer-email`, `vendor/quotes`, `vendor/quotes/{id}`, `vendor/quotes/{id}/expiry`, `vendor/orders` e `vendor/commission` richiedono autenticazione WooCommerce (vendor/admin).

---

## Endpoint pubblici (nessun login richiesto)

### GET `/wc-quote/v1/order`

Recupera i dettagli del preventivo per mostrarlo al cliente.

**Query params**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_key` | string | sì |
| `email` | string | sì |

**Risposta**

```json
{
  "success": true,
  "order": {
    "id": 123,
    "order_number": "123",
    "order_key": "wc_order_abc123",
    "status": "quote",
    "date_created": "2026-05-04 10:00:00",
    "total": 1500.00,
    "subtotal": 1500.00,
    "currency": "EUR",
    "formatted_total": "€1.500,00",
    "billing": {
      "first_name": "Mario",
      "last_name": "Rossi",
      "email": "mario@example.com"
    },
    "line_items": [
      {
        "id": 1,
        "name": "Opera d'arte",
        "product_id": 456,
        "quantity": 1,
        "total": 1500.00,
        "image": "https://artpay.art/wp-content/uploads/..."
      }
    ]
  }
}
```

---

### POST `/wc-quote/v1/convert-to-on-hold`

Il cliente **accetta** il preventivo. L'ordine passa a `on-hold` e viene creato un Payment Intent Stripe. Viene inviata automaticamente un'email con il link di pagamento.

> Importante: con Klarna passa `add_klarna_fee: true` per includere la fee del 5% nel totale prima della creazione del PI. Non è possibile aggiungerla dopo senza usare `update-payment-intent-fee`.

**Body JSON**

| Campo | Tipo | Obbligatorio | Default |
|-------|------|--------------|---------|
| `order_key` | string | sì | |
| `email` | string | sì | |
| `payment_method` | `"card"` \| `"klarna"` \| `"bank_transfer"` | no | `"card"` |
| `add_klarna_fee` | boolean | no | `false` |

**Risposta — carta o Klarna**

```json
{
  "success": true,
  "message": "Ordine convertito da quote a on-hold",
  "order_id": 123,
  "order_key": "wc_order_abc123",
  "new_status": "on-hold",
  "payment_method": "card",
  "email_sent": true,
  "order_data": {
    "id": 123,
    "status": "on-hold",
    "total": 1500.00,
    "currency": "EUR"
  },
  "payment_intent": {
    "payment_intent_id": "pi_xxx",
    "client_secret": "pi_xxx_secret_yyy",
    "amount": 150000,
    "currency": "eur",
    "status": "requires_payment_method",
    "payment_method": "card",
    "payment_url": "https://artpay.art/checkout/payment?order_key=...&client_secret=..."
  }
}
```

**Risposta — bonifico bancario (`bank_transfer`)**

```json
{
  "success": true,
  "message": "Ordine convertito da quote a on-hold",
  "order_id": 123,
  "order_key": "wc_order_abc123",
  "new_status": "on-hold",
  "payment_method": "bank_transfer",
  "email_sent": true,
  "order_data": {
    "id": 123,
    "status": "on-hold",
    "total": 1500.00,
    "currency": "EUR"
  },
  "payment_intent": {
    "payment_intent_id": "pi_xxx",
    "client_secret": null,
    "amount": 150000,
    "currency": "eur",
    "status": "requires_action",
    "payment_method": "bank_transfer",
    "payment_url": "https://artpay.art/checkout/payment?...",
    "bank_transfer_instructions": {
      "reference": "ARTPAY-123456",
      "amount_remaining": 150000,
      "currency": "eur",
      "financial_addresses": [
        {
          "type": "iban",
          "iban": {
            "account_holder_name": "Artpay Srl",
            "bic": "XXXXITXX",
            "country": "IT",
            "iban": "IT60X0542811101000000123456"
          },
          "supported_networks": ["sepa"]
        }
      ],
      "hosted_instructions_url": "https://payments.stripe.com/bank_transfer/..."
    }
  }
}
```

> Con `bank_transfer`: il `client_secret` è `null` (non serve Stripe Elements). Il frontend deve mostrare i dati di `bank_transfer_instructions` al cliente. Il completamento è automatico via webhook quando Stripe riceve il bonifico — **non chiamare `complete-payment`**.

---

### POST `/wc-quote/v1/update-payment-intent-fee`

Aggiorna l'importo del Payment Intent esistente quando il cliente cambia metodo di pagamento (es. da carta a Klarna). Aggiunge o rimuove la fee Klarna (5%) sull'ordine e sincronizza Stripe.

> Usare dopo `convert-to-on-hold`, prima che il cliente completi il pagamento.

**Body JSON**

| Campo | Tipo | Obbligatorio | Default |
|-------|------|--------------|---------|
| `order_key` | string | sì | |
| `email` | string | sì | |
| `add_klarna_fee` | boolean | no | `false` |

**Risposta**

```json
{
  "success": true,
  "payment_intent_id": "pi_xxx",
  "amount": 157500,
  "currency": "eur",
  "order_total": 1575.00,
  "vendor_amount": 1410.00,
  "klarna_fee_added": true
}
```

---

### POST `/wc-quote/v1/reject-quote`

Il cliente **rifiuta** il preventivo. L'ordine passa a `cancelled`.

**Body JSON**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_key` | string | sì |
| `email` | string | sì |

**Risposta**

```json
{
  "success": true,
  "message": "Preventivo rifiutato con successo",
  "order_id": 123,
  "new_status": "cancelled"
}
```

---

### GET `/wc-quote/v1/payment-intent`

Recupera il `client_secret` di un Payment Intent già creato (utile se il cliente torna sulla pagina di pagamento).

**Query params**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_key` | string | sì |
| `email` | string | sì |

**Risposta**

```json
{
  "success": true,
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_yyy",
  "payment_url": "https://artpay.art/checkout/payment?...",
  "order_data": {
    "id": 123,
    "status": "on-hold",
    "total": 1500.00,
    "currency": "EUR"
  }
}
```

---

### GET `/wc-quote/v1/payment-status`

Verifica lo stato del pagamento su Stripe.

**Query params**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_key` | string | sì |
| `email` | string | sì |

**Risposta**

```json
{
  "success": true,
  "payment_intent_id": "pi_xxx",
  "payment_status": "succeeded",
  "order_status": "processing",
  "amount": 150000,
  "currency": "eur"
}
```

Valori possibili di `payment_status`: `requires_payment_method`, `requires_confirmation`, `processing`, `succeeded`, `canceled`, `unknown`.

---

### POST `/wc-quote/v1/complete-payment`

Chiamato dal frontend dopo che Stripe ha confermato il pagamento lato client. Verifica su Stripe e aggiorna l'ordine a `completed`.

**Body JSON**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_key` | string | sì |
| `payment_intent_id` | string | sì |

**Risposta**

```json
{
  "success": true,
  "message": "Pagamento completato con successo",
  "payment_status": "succeeded",
  "order_id": 123,
  "order_status": "completed"
}
```

---

## Endpoint autenticati (vendor/admin)

Richiedono header `Authorization: Basic <base64(consumer_key:consumer_secret)>` o sessione WordPress attiva con ruolo `dc_vendor`, `shop_manager` o `administrator`.

### GET `/wc-quote/v1/vendor/quotes/{id}`

Restituisce il dettaglio completo di un singolo preventivo. La struttura della risposta è identica a un elemento dell'array `quotes` della lista, ma wrappata in `quote` (singolare).

**URL param**

| Param | Tipo | Note |
|-------|------|------|
| `id` | integer | ID dell'ordine principale |

**Risposta**

```json
{
  "success": true,
  "quote": {
    "id": 123,
    "order_number": "123",
    "status": "quote",
    "..."  : "..."
  }
}
```

Per la struttura completa di `quote` vedi i campi descritti nell'endpoint lista qui sotto.

**Errori**

| Codice | Motivo |
|--------|--------|
| `404 order_not_found` | Ordine inesistente |
| `400 invalid_order` | È un sub-order MVX |
| `403 forbidden` | Il vendor non è associato a questo preventivo |

---

### GET `/wc-quote/v1/vendor/quotes`

Restituisce la lista paginata dei preventivi associati al vendor autenticato, con tutti i dettagli: commissione Artpay, sconti applicati, fee Klarna, stato del Payment Intent e suborder MVX corrispondente.

**Query params**

| Campo | Tipo | Default | Note |
|-------|------|---------|------|
| `per_page` | integer | `20` | max `100` |
| `page` | integer | `1` | |
| `status` | string | `any` | `quote`, `on-hold`, `processing`, `completed`, `cancelled`, `any` |
| `orderby` | string | `date` | `date`, `ID`, `title` |
| `order` | string | `DESC` | `ASC`, `DESC` |
| `after` | string | — | ISO8601 — filtra preventivi creati dopo questa data |
| `before` | string | — | ISO8601 — filtra preventivi creati prima di questa data |

**Risposta**

```json
{
  "success": true,
  "total": 5,
  "total_pages": 1,
  "page": 1,
  "per_page": 20,
  "quotes": [
    {
      "id": 123,
      "order_number": "123",
      "order_key": "wc_order_abc123",
      "status": "quote",
      "date_created": "2026-05-10 09:00:00",
      "date_modified": "2026-05-10 09:30:00",
      "quote_expires_at": null,
      "email_sent": "2026-05-10 09:05:00",
      "payment_link_email_sent": null,

      "total": 1575.00,
      "subtotal": 1500.00,
      "discount_total": 0.00,
      "tax_total": 0.00,
      "shipping_total": 0.00,
      "base_total": 1500.00,
      "currency": "EUR",
      "formatted_total": "€1.575,00",

      "billing": {
        "first_name": "Mario",
        "last_name": "Rossi",
        "email": "mario@example.com",
        "phone": "+39 333 1234567",
        "address_1": "Via Roma 1",
        "address_2": "",
        "city": "Milano",
        "state": "MI",
        "postcode": "20100",
        "country": "IT"
      },

      "line_items": [
        {
          "id": 10,
          "name": "Opera senza titolo",
          "product_id": 456,
          "variation_id": 0,
          "quantity": 1,
          "subtotal": 1500.00,
          "total": 1500.00,
          "tax": 0.00,
          "sku": "ARTWORK-001",
          "price": "1500",
          "image": "https://artpay.art/wp-content/uploads/opera.jpg"
        }
      ],

      "coupon_lines": [
        {
          "id": 20,
          "code": "GALLERY10",
          "discount": 150.00,
          "discount_tax": 0.00
        }
      ],

      "fee_lines": [
        {
          "id": 30,
          "name": "payment-gateway-fee",
          "total": 75.00,
          "tax": 0.00
        }
      ],

      "commission": {
        "percentage": 12,
        "vendor_amount": 1320.00,
        "artpay_fee": 180.00,
        "klarna_fee_applied": true,
        "suborder_commission_amount": 1320.00
      },

      "payment": {
        "stripe_payment_intent_id": null,
        "stripe_client_secret": null,
        "payment_intent_created_at": null,
        "payment_method_type": null,
        "transfer_amount": null,
        "stripe_account_id": null
      },

      "suborder": {
        "id": 124,
        "status": "quote",
        "total": 1500.00,
        "commission_amount": 1320.00
      },

      "customer_note": "Vorrei sapere le dimensioni esatte."
    }
  ]
}
```

**Dettaglio campi `commission`**

| Campo | Descrizione |
|-------|-------------|
| `percentage` | Percentuale commissione Artpay (6% primi 6 mesi, 12% dopo) |
| `vendor_amount` | Importo che riceve il vendor (calcolato al momento della creazione del PI) |
| `artpay_fee` | `base_total - vendor_amount` |
| `klarna_fee_applied` | `true` se è presente una fee gateway (Klarna +5%) nelle righe ordine |
| `suborder_commission_amount` | `_commission_amount` dal suborder MVX del vendor |

**Dettaglio campi `payment`**

| Campo | Descrizione |
|-------|-------------|
| `stripe_payment_intent_id` | ID del Payment Intent Stripe (`null` finché il cliente non accetta) |
| `stripe_client_secret` | Client secret per Stripe.js |
| `payment_intent_created_at` | Timestamp creazione PI |
| `payment_method_type` | `"card"`, `"klarna"` o `"bank_transfer"` |
| `transfer_amount` | Importo trasferito al vendor su Stripe Connect |
| `stripe_account_id` | ID account Stripe Connect del vendor |

---

### POST `/wc-quote/v1/vendor/quotes/{id}/expiry`

Imposta o rimuove la data di scadenza di un preventivo. Il campo `quote_expires_at` è già incluso nella risposta di `vendor/quotes`.

> Solo il vendor proprietario del preventivo può modificarlo. Admin e shop_manager possono agire su qualsiasi ordine.

**URL param**

| Param | Tipo | Note |
|-------|------|------|
| `id` | integer | ID dell'ordine principale (non del sub-order) |

**Body JSON**

| Campo | Tipo | Obbligatorio | Note |
|-------|------|--------------|------|
| `expires_at` | string | no | ISO8601 (es. `2026-06-30T23:59:59`). Ometti, passa `null` o stringa vuota per **rimuovere** la scadenza. |

**Risposta — scadenza impostata**

```json
{
  "success": true,
  "order_id": 123,
  "expires_at": "2026-06-30 23:59:59",
  "message": "Scadenza aggiornata."
}
```

**Risposta — scadenza rimossa**

```json
{
  "success": true,
  "order_id": 123,
  "expires_at": null,
  "message": "Scadenza rimossa."
}
```

**Errori**

| Codice | Motivo |
|--------|--------|
| `404 order_not_found` | Ordine inesistente |
| `400 invalid_order` | È un sub-order MVX, non l'ordine principale |
| `400 invalid_date` | Formato data non riconoscibile |
| `400 date_in_past` | La data è già passata |
| `403 forbidden` | Il vendor non è associato a questo preventivo |

---

### POST `/wc-quote/v1/create-artwork`

Crea un prodotto WooCommerce (opera d'arte) e l'artista associato. Il prodotto viene creato in stato `draft`.

**Body JSON**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `artwork_title` | string | sì |
| `artist_name` | string | sì |
| `price` | number | sì |
| `description` | string | no |
| `short_description` | string | no |
| `image` | string (URL o base64) | no |
| `sku` | string | no (auto-generato) |
| `artist_birth_year` | string | no |
| `artist_birth_nation` | string | no |
| `artist_location` | string | no |
| `height` | string | no |
| `width` | string | no |
| `depth` | string | no |
| `weight` | string | no |
| `production_year` | string | no |
| `condition` | string | no |
| `estimated_shipping_cost` | number | no |

**Risposta**

```json
{
  "success": true,
  "product": {
    "id": 456,
    "title": "Senza titolo",
    "sku": "ARTWORK-1234567890-1234",
    "price": 1500,
    "status": "draft",
    "image_id": 789,
    "image_url": "https://artpay.art/wp-content/uploads/..."
  },
  "artist": {
    "id": 101,
    "name": "Leonardo Rossi"
  }
}
```

---

### POST `/wc-quote/v1/update-customer-email`

Imposta l'email del cliente sull'ordine e invia l'email con il link al preventivo.

**Body JSON**

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `order_id` | integer | sì |
| `email` | string | sì |
| `first_name` | string | no |
| `last_name` | string | no |
| `send_email` | boolean | no (default `true`) |

**Risposta**

```json
{
  "success": true,
  "message": "Email cliente aggiornata con successo",
  "order_id": 123,
  "new_email": "mario@example.com",
  "email_sent": "2026-05-04 10:05:00"
}
```

---

## Note sul pagamento con Stripe Elements (carta / Klarna)

Il `client_secret` restituito da `convert-to-on-hold` (o da `payment-intent`) va usato direttamente con **Stripe.js** per mostrare gli Elements al cliente.

```js
const stripe = Stripe('pk_live_...');
const elements = stripe.elements({ clientSecret: 'pi_xxx_secret_yyy' });

// Per carta
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// Conferma pagamento
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: 'https://artpay.art/checkout/success?order_key=...',
  },
});

// Dopo successo, chiamare complete-payment
await fetch('/wp-json/wc-quote/v1/complete-payment', {
  method: 'POST',
  body: JSON.stringify({ order_key: '...', payment_intent_id: 'pi_xxx' }),
});
```

---

## Note sul pagamento con bonifico bancario (`bank_transfer`)

Con `bank_transfer` **non si usa Stripe Elements** e **non si chiama `complete-payment`**.

Il flusso lato frontend è:

1. Chiamare `convert-to-on-hold` con `payment_method: "bank_transfer"`
2. Leggere `payment_intent.bank_transfer_instructions` dalla risposta
3. Mostrare al cliente IBAN, BIC, causale e importo da versare
4. Opzionalmente reindirizzare il cliente su `hosted_instructions_url` (pagina Stripe con le istruzioni)
5. Il completamento è **automatico**: quando Stripe rileva il bonifico, il webhook aggiorna l'ordine a `completed`

```js
const res = await fetch('/wp-json/wc-quote/v1/convert-to-on-hold', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_key: 'wc_order_abc123',
    email: 'mario@example.com',
    payment_method: 'bank_transfer',
  }),
});
const data = await res.json();

const instructions = data.payment_intent?.bank_transfer_instructions;
if (instructions) {
  const ibanInfo = instructions.financial_addresses?.[0]?.iban;
  // mostrare: ibanInfo.iban, ibanInfo.bic, instructions.reference, importo
  // oppure reindirizzare su instructions.hosted_instructions_url
}
```

> **Nota architetturale:** per il bonifico bancario il pagamento arriva sul conto della piattaforma (Stripe non supporta `transfer_data` con `customer_balance`). Il payout al vendor viene gestito separatamente; l'importo corretto è comunque disponibile nel meta `wc_quote_vendor_amount` dell'ordine.

---

## Commissioni e split (informativo)

La commissione Artpay è **dinamica** in base alla data di registrazione del vendor:

| Anzianità vendor | Commissione Artpay |
|------------------|--------------------|
| Primi 6 mesi | 6% |
| Dopo 6 mesi | 12% |

| | Carta | Klarna | Bonifico |
|---|---|---|---|
| Base price | 100% | 100% | 100% |
| Artpay fee | +6% o +12% | +6% o +12% | +6% o +12% |
| Klarna fee | — | +5% sul totale | — |
| **Il cliente paga** | **base** | **base × 1.05** | **base** |
| **Il vendor riceve** | **base × (1 − fee%)** | **base × (1 − fee%)** | **base × (1 − fee%)** |
| Split Stripe automatico | sì | sì | no (manuale) |

La Klarna fee è a carico del cliente, non del vendor. La quota del vendor è sempre calcolata sul `base_total` (senza la fee Klarna).