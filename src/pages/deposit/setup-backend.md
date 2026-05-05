# ArtPay Deposit Payment

Plugin WordPress per WooCommerce che gestisce pagamenti con deposito + saldo, compatibile con frontend headless (React) e MultivendorX.

## Requisiti

- WordPress 6.0+
- WooCommerce 7.0+
- WooCommerce Stripe Gateway (configurato e attivo)
- MultivendorX (Multivendor Marketplace)
- PHP 7.4+
- Stripe PHP SDK v10+ (installato via Composer)

## Installazione

1. **Clona o copia il plugin nella directory dei plugin WordPress:**
   ```bash
   cd wp-content/plugins/
   git clone [repository-url] artpay-deposit-payment
   cd artpay-deposit-payment
   ```

2. **Installa le dipendenze via Composer:**
   ```bash
   composer install
   ```

3. **Attiva il plugin da WordPress Admin:**
   - Vai su Plugin > Plugin Installati
   - Trova "ArtPay Deposit Payment"
   - Clicca "Attiva"

4. **Configura WooCommerce Stripe Gateway:**
   - WooCommerce > Impostazioni > Pagamenti > Stripe
   - Inserisci le tue API Keys (Test o Live)
   - Salva le modifiche

5. **Configura il Webhook Stripe:**
   - Vai su [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Crea un nuovo endpoint con URL: `https://tuosito.com/wp-json/adp/v1/webhooks/stripe`
   - Eventi da ascoltare:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copia il **Webhook Signing Secret**
   - Vai su WooCommerce > Deposit Payment
   - Incolla il Webhook Secret e salva

## Configurazione

### Impostazioni Plugin

Vai su **WooCommerce > Deposit Payment** per configurare:

- **Stripe Webhook Secret**: Secret per verificare i webhook Stripe
- **Percentuale Deposito Default**: Percentuale predefinita (1-100%)
- **Promemoria Pagamento Saldo**: Abilita/disabilita email di promemoria (funzionalità futura)

### Modalità Test vs Live

Il plugin utilizza automaticamente le credenziali Stripe (Test/Live) configurate in WooCommerce Stripe Gateway.

## Utilizzo API

### Autenticazione

Tutti gli endpoint (eccetto webhook) richiedono autenticazione WordPress. L'utente deve essere loggato e le richieste devono includere i cookie di sessione.

### Endpoint Disponibili

#### 1. Prepara Deposito

**POST** `/wp-json/adp/v1/deposit/prepare`

Crea un ordine WooCommerce e prepara il Payment Intent per il deposito.

**Request Body:**
```json
{
  "products": [
    {
      "product_id": 123,
      "quantity": 1,
      "variation_id": 0
    }
  ],
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "Via Roma 1",
    "city": "Milano",
    "postcode": "20100",
    "country": "IT",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "shipping_address": { ... },
  "deposit_type": "percentage",
  "deposit_value": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 12345,
    "order_key": "wc_order_xxx",
    "total": 100.00,
    "deposit_amount": 30.00,
    "balance_amount": 70.00,
    "currency": "EUR",
    "client_secret": "pi_xxx_secret_xxx",
    "stripe_publishable_key": "pk_test_xxx",
    "test_mode": true
  }
}
```

#### 2. Paga Saldo

**POST** `/wp-json/adp/v1/balance/pay`

Crea il Payment Intent per il pagamento del saldo.

**Request Body:**
```json
{
  "order_id": 12345
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 12345,
    "balance_amount": 70.00,
    "currency": "EUR",
    "client_secret": "pi_xxx_secret_xxx",
    "stripe_publishable_key": "pk_test_xxx",
    "test_mode": true
  }
}
```

#### 3. Stato Pagamento

**GET** `/wp-json/adp/v1/payment/status/{order_id}`

Recupera lo stato completo del pagamento.

**Response:**
```json
{
  "success": true,
  "data": {
    "order_id": 12345,
    "order_status": "on-hold",
    "order_total": 100.00,
    "currency": "EUR",
    "deposit": {
      "type": "percentage",
      "value": 30,
      "amount": 30.00,
      "status": "paid",
      "paid_at": "2025-01-22 10:30:00",
      "payment_intent_id": "pi_xxx",
      "transaction_id": "ch_xxx"
    },
    "balance": {
      "amount": 70.00,
      "status": "pending",
      "paid_at": null,
      "due_date": null,
      "payment_intent_id": null,
      "transaction_id": null
    },
    "created_at": "2025-01-22 10:00:00",
    "modified_at": "2025-01-22 10:30:00"
  }
}
```

### Esempio Frontend (React + Stripe Elements)

```javascript
// 1. Prepara deposito
const response = await fetch('/wp-json/adp/v1/deposit/prepare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Importante per cookies
  body: JSON.stringify(orderData)
});

const { data } = await response.json();

// 2. Conferma pagamento con Stripe
const stripe = await loadStripe(data.stripe_publishable_key);
const { error } = await stripe.confirmPayment({
  elements,
  clientSecret: data.client_secret,
  confirmParams: {
    return_url: 'https://yoursite.com/order-complete'
  }
});

// 3. Webhook Stripe aggiornerà automaticamente lo status dell'ordine
```

## Integrazione MultivendorX

Il plugin gestisce automaticamente le commissioni vendor:

- **Commissioni calcolate sul totale ordine** (non solo sul deposito)
- **Commissioni bloccate** fino al pagamento del saldo
- **Commissioni rilasciate automaticamente** quando il saldo è pagato
- **Visibilità commissioni** nascosta nella dashboard vendor fino al rilascio

### Hook Action Disponibili

```php
// Quando il deposito è pagato
add_action('adp_deposit_paid', function($order, $payment_intent) {
    // Il tuo codice qui
}, 10, 2);

// Quando il saldo è pagato
add_action('adp_balance_paid', function($order, $payment_intent) {
    // Il tuo codice qui
}, 10, 2);

// Quando l'ordine è completamente pagato
add_action('adp_order_fully_paid', function($order, $payment_intent) {
    // Il tuo codice qui
}, 10, 2);

// Quando un pagamento fallisce
add_action('adp_deposit_failed', function($order, $payment_intent) {
    // Il tuo codice qui
}, 10, 2);
```

## Struttura File

```
artpay-deposit-payment/
├── artpay-deposit-payment.php   # File principale
├── composer.json                 # Dipendenze PHP
├── includes/                     # Core classes
│   ├── class-adp-plugin.php
│   ├── class-adp-order-manager.php
│   ├── class-adp-payment-processor.php
│   ├── class-adp-stripe-handler.php
│   ├── class-adp-rest-api.php
│   ├── class-adp-mvx-integration.php
│   └── class-adp-webhook-handler.php
├── api/                          # REST endpoints
│   ├── class-adp-deposit-endpoint.php
│   ├── class-adp-balance-endpoint.php
│   └── class-adp-status-endpoint.php
├── admin/                        # Admin UI
│   ├── class-adp-settings.php
│   ├── class-adp-admin-ui.php
│   └── views/
│       └── order-payment-timeline.php
└── assets/                       # CSS/JS
    ├── css/
    │   └── admin-order-view.css
    └── js/
        └── admin-payment-status.js
```

## Troubleshooting

### Il webhook non funziona

1. Verifica che il Webhook Secret sia configurato correttamente
2. Controlla i log: `/wp-content/debug.log` (attiva `WP_DEBUG`)
3. Testa il webhook con Stripe CLI:
   ```bash
   stripe listen --forward-to https://tuosito.com/wp-json/adp/v1/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

### Le commissioni vendor non vengono rilasciate

1. Verifica che MultivendorX sia attivo
2. Controlla che il saldo sia effettivamente pagato
3. Guarda i log per eventuali errori MVX

### Test con Stripe Test Cards

- **Successo**: `4242 4242 4242 4242`
- **Fallimento**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

## Sicurezza

- Tutti gli input vengono sanitizzati
- I webhook Stripe sono verificati tramite signature
- Gli endpoint REST verificano ownership degli ordini
- Le API keys Stripe non vengono mai esposte al frontend

## Supporto

Per supporto tecnico o segnalazione bug, contattare il team ArtPay.

## License

Proprietario - Solo per uso interno ArtPay

## Changelog

### 1.0.0 - 2025-01-22
- Release iniziale
- Sistema deposito + saldo
- Integrazione Stripe Payment Intents
- Integrazione MultivendorX
- REST API headless
- Admin UI con timeline pagamenti