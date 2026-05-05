# WC-Quote — Frontend API Reference

Base URL: `https://artpay.art/wp-json`

---

## Flusso generale

```
[Vendor] POST create-artwork          → crea prodotto + artista (richiede auth)
[Vendor] POST update-customer-email   → imposta email cliente e invia email preventivo (richiede auth)

[Cliente riceve email con link /quotes?order_key=...&email=...]

[Cliente] GET  order                  → visualizza i dettagli del preventivo
[Cliente] POST convert-to-on-hold     → accetta il preventivo → crea Payment Intent Stripe
[Cliente] POST update-payment-intent-fee → aggiorna fee se cambia metodo pagamento
[Cliente] (Stripe Elements)           → il cliente completa il pagamento
[Cliente] POST complete-payment       → conferma lato client dopo successo Stripe

oppure:

[Cliente] POST reject-quote           → rifiuta il preventivo
```

---

## Autenticazione

La maggior parte degli endpoint è **pubblica** e usa `order_key + email` come validazione.
Solo `create-artwork` e `update-customer-email` richiedono autenticazione WooCommerce (vendor/admin).

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

Il cliente **accetta** il preventivo. L'ordine passa a `on-hold` e viene creato un Payment Intent Stripe Connect. Viene inviata automaticamente un'email con il link di pagamento.

> Importante: con Klarna passa `add_klarna_fee: true` per includere la fee del 5% nel totale prima della creazione del PI. Non è possibile aggiungerla dopo senza usare `update-payment-intent-fee`.

**Body JSON**

| Campo | Tipo | Obbligatorio | Default |
|-------|------|--------------|---------|
| `order_key` | string | sì | |
| `email` | string | sì | |
| `payment_method` | `"card"` \| `"klarna"` | no | `"card"` |
| `add_klarna_fee` | boolean | no | `false` |

**Risposta**

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

## Note sul pagamento con Stripe Elements

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

### Commissioni e split (informativo)

| | Carta | Klarna |
|---|---|---|
| Base price | 100% | 100% |
| Artpay fee | +6% | +6% |
| Klarna fee | — | +5% sul totale |
| **Il cliente paga** | **base** | **base × 1.05** |
| **Il vendor riceve** | **base × 0.94** | **base × 0.94** |

La Klarna fee è a carico del cliente, non del vendor.