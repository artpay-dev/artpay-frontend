# CDS Auction — Frontend API Reference

Questa guida è destinata al **team frontend** per integrare il flusso di pagamento degli ordini CDS auction.

---

## Base URL

- **Produzione:** `https://artpay.art/wp-json`
- **Staging:** `https://staging-api.artpay.art/wp-json`

---

## Flusso di pagamento

```
1. Vendor crea ordine via API
   ↓
2. Vendor invia redirect_link al cliente
   ↓
3. Cliente apre pagina di pagamento Artpay
   ↓
4. Frontend recupera dettagli ordine (GET /cds-order-details)
   ↓
5. Frontend mostra: descrizione, prezzo, logo vendor, immagine lotto
   ↓
6. Cliente sceglie metodo di pagamento (Card / Klarna)
   ↓
7. Frontend crea Payment Intent Stripe (POST /cds-payment-intent)
   ↓
8. Cliente completa pagamento con Stripe Elements
   ↓
9. Stripe conferma pagamento → webhook → ordine diventa "processing"
```

---

## Endpoint Frontend (Guest Access)

Gli endpoint seguenti sono utilizzabili **senza autenticazione** (guest users).

### 1. Recupera dettagli ordine

Recupera i dettagli dell'ordine per visualizzare la pagina di pagamento.

```
GET /wp-json/wc/v3/stripe/cds-order-details?order_key={wc_order_key}
```

#### Headers
```
Content-Type: application/json
```

**Nessuna autenticazione richiesta** (guest access)

#### Query Parameters

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:---:|-------------|
| `order_key` | string | ✅ | Order key WooCommerce (es. `wc_order_xxxxxxxxxxxxxxx`) |

#### Response (200)

```json
{
  "order_key": "wc_order_xxxxxxxxxxxxxxx",
  "order_id": 1234,
  "status": "pending",
  "currency": "EUR",
  "created_date": "2024-11-15T10:30:00+01:00",
  "description": "Lotto 42 — Mario Rossi, Paesaggio, 1980",
  "third_party_id": "CDS-2024-001",
  "base_total": "1000.00",
  "platform_fee": "40.00",
  "grand_total": "1040.00",
  "vendor_name": "Galleria Esempio",
  "vendor_logo_url": "https://galleria.it/logo.png",
  "lot_image_url": "https://galleria.it/lotto42.jpg",
  "return_url": "https://galleria.it/aste/lotto-42",
  "customer_email": "cliente@email.com"
}
```

#### Response - Errori

| HTTP | Descrizione |
|------|-------------|
| `400` | `order_key` mancante |
| `404` | Ordine non trovato |
| `400` | Ordine non è di tipo CDS auction |

---

---

### 2. Crea Payment Intent

Crea un Stripe Payment Intent per l'ordine. Da chiamare quando il cliente seleziona il metodo di pagamento.

```
POST /wp-json/wc/v3/stripe/cds-payment-intent
```

#### Headers
```
Content-Type: application/json
```

**Nessuna autenticazione richiesta** (guest access)

#### Request Body

```json
{
  "wc_order_key": "wc_order_xxxxxxxxxxxxxxx",
  "payment_method": "card",
  "add_klarna_fee": false
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|:---:|-------------|
| `wc_order_key` | string | ✅ | Order key WooCommerce (ricevuto nel redirect_link dal vendor) |
| `payment_method` | string | ✅ | Metodo di pagamento: `card` o `klarna` |
| `add_klarna_fee` | boolean | ❌ | Se `true`, aggiunge commissione Klarna 5%. Default: `false` |

#### Response (200)

```json
{
  "id": "pi_xxxxxxxxxxxxx",
  "client_secret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "amount": 104000,
  "currency": "eur",
  "status": "requires_payment_method"
}
```

Questo è un oggetto Stripe PaymentIntent. Usa `client_secret` per inizializzare Stripe Elements.

#### Response - Errori

| HTTP | Descrizione |
|------|-------------|
| `400` | `wc_order_key` mancante o non valido |
| `400` | `payment_method` non supportato (solo `card` o `klarna`) |
| `400` | Vendor non ha collegato Stripe Connect |
| `400` | Importo ordine sotto il minimo (€0.50) |

---

### 3. Aggiorna commissione Payment Intent

Aggiorna l'importo del payment intent quando il cliente cambia metodo di pagamento (aggiunge/rimuove fee Klarna).

```
POST /wp-json/wc/v3/stripe/cds-payment-intent-fee
```

#### Headers
```
Content-Type: application/json
```

**Nessuna autenticazione richiesta** (guest access)

#### Request Body

```json
{
  "wc_order_key": "wc_order_xxxxxxxxxxxxxxx",
  "add_klarna_fee": true
}
```

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|:---:|-------------|
| `wc_order_key` | string | ✅ | Order key WooCommerce |
| `add_klarna_fee` | boolean | ✅ | `true` per aggiungere fee Klarna, `false` per rimuoverla |

#### Response (200)

```json
{
  "id": "pi_xxxxxxxxxxxxx",
  "client_secret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "amount": 109200,
  "currency": "eur",
  "status": "requires_payment_method"
}
```

PaymentIntent aggiornato con nuovo importo.

#### Quando usarlo?

- Cliente cambia da Card a Klarna → chiama con `add_klarna_fee: true`
- Cliente cambia da Klarna a Card → chiama con `add_klarna_fee: false`

---

## Informazioni ordine nel URL

Il vendor invia al cliente un link nel formato:

```
https://artpay.art/landing?order_id=wc_order_xxxxxxxxxxxxxxx
```

oppure (ordini già esistenti):

```
https://artpay.art/acquisto-esterno?order=wc_order_xxxxxxxxxxxxxxx
```

Il frontend estrae `order_id` o `order` dal query parameter e lo usa come `order_key` per recuperare i dettagli tramite `GET /wc/v3/stripe/cds-order-details?order_key={...}`

---

## Metadata ordine disponibili

Quando recuperi l'ordine WooCommerce, questi metadata sono disponibili:

| Meta Key | Descrizione |
|----------|-------------|
| `original_order_id` | ID ordine originale del sistema CDS |
| `original_order_desc` | Descrizione del lotto (es. "Lotto 42 — Mario Rossi, Paesaggio, 1980") |
| `vendor_logo_url` | URL logo vendor (opzionale) |
| `lot_image_url` | URL immagine lotto (opzionale) |
| `return_url` | URL per pulsante "torna indietro" (opzionale) |
| `cds_auction_base_total` | Prezzo di aggiudicazione (senza commissione Artpay) |
| `cds_auction_fee_total` | Commissione Artpay 4% |
| `artpay_fee` | Commissione Artpay (duplicato di cds_auction_fee_total) |

---

## Flusso completo esempio

### Pagina di pagamento frontend

```javascript
// 1. Estrai order_key dal URL
const params = new URLSearchParams(window.location.search);
const orderKey = params.get('order_id') || params.get('order');

// 2. Carica dettagli ordine per display
const orderResponse = await fetch(
  `https://artpay.art/wp-json/wc/v3/stripe/cds-order-details?order_key=${orderKey}`
);
const orderDetails = await orderResponse.json();

console.log('Ordine:', orderDetails.description);
console.log('Totale:', orderDetails.grand_total, 'EUR');
console.log('Vendor:', orderDetails.vendor_name);

// 3. Cliente seleziona metodo di pagamento
const paymentMethod = 'card'; // o 'klarna'
const addKlarnaFee = paymentMethod === 'klarna';

// 4. Crea Payment Intent
const response = await fetch('https://artpay.art/wp-json/wc/v3/stripe/cds-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wc_order_key: orderKey,
    payment_method: paymentMethod,
    add_klarna_fee: addKlarnaFee
  })
});

const paymentIntent = await response.json();

// 5. Inizializza Stripe Elements
const stripe = Stripe('pk_live_xxxxx');
const elements = stripe.elements({ clientSecret: paymentIntent.client_secret });

// 6. Mostra form di pagamento
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// 7. Conferma pagamento
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: 'https://artpay.art/payment-success',
  }
});

// 8. Gestisci errori
if (error) {
  console.error(error.message);
}
```

### Cambio metodo di pagamento

```javascript
// Cliente cambia da Card a Klarna
const response = await fetch('https://artpay.art/wp-json/wc/v3/stripe/cds-payment-intent-fee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wc_order_key: orderKey,
    add_klarna_fee: true // aggiunge 5%
  })
});

const updatedIntent = await response.json();

// Aggiorna UI con nuovo importo
console.log('Nuovo totale:', updatedIntent.amount / 100, 'EUR');
```

---

## Note importanti

### Commissioni

- **Commissione Artpay:** 4% automatica, già inclusa nel totale ordine
- **Commissione Klarna:** 5% opzionale, calcolata sul totale corrente (inclusa commissione Artpay)

**Esempio calcolo:**
- Prezzo aggiudicazione: €1.000,00
- Commissione Artpay 4%: €40,00
- **Subtotale: €1.040,00**
- Se cliente sceglie Klarna:
  - Commissione Klarna 5% su €1.040,00: €52,00
  - **Totale finale: €1.092,00**

### Stati ordine

| Status | Significato | Cosa mostrare al cliente |
|--------|-------------|--------------------------|
| `pending` | Ordine creato, in attesa di pagamento | "Completa il pagamento" |
| `on-hold` | Cliente ha aperto la pagina di pagamento | "Pagamento in corso..." |
| `processing` | **Pagamento completato con successo** | "Pagamento confermato!" |
| `completed` | Ordine evaso | "Ordine completato" |
| `cancelled` | Ordine annullato | "Ordine annullato" |
| `failed` | Pagamento fallito | "Pagamento fallito, riprova" |

### Webhook

Il pagamento viene confermato tramite webhook Stripe → Artpay. Non è necessario implementare nulla lato frontend per questo. Quando Stripe conferma il pagamento, l'ordine passerà automaticamente a status `processing`.

### Tutti i clienti sono Guest

Tutti gli ordini CDS auction sono creati come **guest** (non registrati). Non c'è login/registrazione richiesta sulla pagina di pagamento.

---

## Troubleshooting

### Errore: "Vendor has not connected their Stripe account"

Il vendor deve prima collegare il proprio account Stripe Connect prima di poter ricevere pagamenti. Questo errore significa che il vendor non ha completato l'onboarding Stripe.

### Errore: "Order total must be at least 0.50 EUR"

L'importo minimo per un payment intent Stripe è €0.50. Verifica che il prezzo del lotto sia corretto.

### Payment Intent già esistente

Se chiami nuovamente `/cds-payment-intent` per lo stesso ordine, viene creato un **nuovo** payment intent. Il precedente viene abbandonato. Salva il `client_secret` e riutilizzalo se il cliente ricarica la pagina.

### Cliente abbandona il pagamento

I payment intent Stripe scadono dopo 24 ore se non confermati. L'ordine rimarrà in status `pending`. Il cliente può riaprire il link e ricreare un nuovo payment intent.

---

## Riepilogo endpoint

| Endpoint | Metodo | Auth | Scopo |
|----------|--------|------|-------|
| `/wc/v3/stripe/cds-order-details` | GET | ❌ No | Recupera dettagli ordine per display |
| `/wc/v3/stripe/cds-payment-intent` | POST | ❌ No | Crea Stripe Payment Intent |
| `/wc/v3/stripe/cds-payment-intent-fee` | POST | ❌ No | Aggiorna fee Klarna su Payment Intent |

**Non usare dal frontend:**
- `/api/v1/external-order/auction` - Creazione ordine (solo vendor con auth)
- `/api/v1/external-order/{order_key}` - Status ordine (solo vendor con auth)
- `/api/v1/cds/stripe-webhook` - Webhook Stripe (solo Stripe servers)