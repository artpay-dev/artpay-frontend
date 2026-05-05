# Artpay SSO

Plugin WordPress per un sistema SSO leggero basato su token monouso a breve scadenza. Permette a più applicazioni frontend sullo stesso dominio di autenticare gli utenti WordPress senza condividere sessioni o cookie.

---

## Flusso di funzionamento

```
Frontend App A                  WordPress (artpay-sso)            Frontend App B
     |                                   |                               |
     |-- POST /generate-token ---------->|                               |
     |   { username, password }          |                               |
     |                                   |-- wp_authenticate()           |
     |                                   |-- set_transient(token, uid)   |
     |<-- { token, expires_in: 60 } -----|                               |
     |                                   |                               |
     |-- reindirizza App B con ?token=.. -------------------------------->|
     |                                   |                               |
     |                                   |<-- POST /exchange-token ------|
     |                                   |    { token }                  |
     |                                   |-- get_transient(token)        |
     |                                   |-- delete_transient(token)     |
     |                                   |-- { id, email, roles } ------>|
```

1. **App A** autentica l'utente con username e password e ottiene un token temporaneo.
2. **App A** passa il token ad **App B** (es. tramite query string o postMessage).
3. **App B** chiama `exchange-token` prima che scadano i 60 secondi.
4. Il token viene cancellato immediatamente: non può essere riusato.

---

## Endpoint

### `POST /wp-json/artpay-sso/v1/generate-token`

Autentica un utente e genera un token monouso.

**Body**
```json
{
  "username": "mario.rossi",
  "password": "password123"
}
```

**Risposta 200**
```json
{
  "token": "aB3xK9...64caratteri...zQ7m",
  "expires_in": 60
}
```

**Risposta 401** — credenziali non valide
```json
{
  "code": "invalid_credentials",
  "message": "Invalid username or password."
}
```

---

### `POST /wp-json/artpay-sso/v1/exchange-token`

Scambia un token con i dati dell'utente. Il token viene eliminato al primo utilizzo.

**Body**
```json
{
  "token": "aB3xK9...64caratteri...zQ7m"
}
```

**Risposta 200**
```json
{
  "id": 42,
  "email": "mario.rossi@example.com",
  "display_name": "Mario Rossi",
  "roles": ["subscriber"],
  "wc_api_user_keys": {
    "consumer_key": "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "consumer_secret": "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

`wc_api_user_keys` contiene le credenziali WooCommerce REST API dell'utente, usabili direttamente per chiamate autenticate a `/wc/v3/*`. Se l'utente non ha ancora chiavi generate (caso anomalo), entrambi i valori saranno `null`.

**Risposta 401** — token non trovato o scaduto
```json
{
  "code": "invalid_token",
  "message": "Token not found or expired."
}
```

---

## CORS

Entrambi gli endpoint accettano richieste cross-origin da qualsiasi sottodominio del dominio root del sito WordPress. Il dominio root viene ricavato automaticamente da `get_site_url()`.

| Sito WordPress   | Origin ammessi                              |
|------------------|---------------------------------------------|
| `artpay.art`     | `artpay.art`, `app.artpay.art`, `admin.artpay.art`, ... |

Origini esterne al dominio root vengono rifiutate dal browser (nessun header `Allow-Origin` restituito).

---

## Proprietà del token

| Proprietà     | Valore                                      |
|---------------|---------------------------------------------|
| Lunghezza     | 64 caratteri alfanumerici                   |
| Generazione   | `wp_generate_password(64, false)` — CSPRNG  |
| Storage       | WordPress transient (`sso_token_{token}`)   |
| Scadenza      | 60 secondi                                  |
| Monouso       | Eliminato al primo `exchange-token` valido  |

---

## Installazione

1. Copiare la cartella `artpay-sso` in `wp-content/plugins/`.
2. Attivare il plugin da **WP Admin → Plugin → Artpay SSO**.
3. Nessuna configurazione aggiuntiva richiesta.

---

## Sicurezza

- Le credenziali vengono verificate tramite `wp_authenticate`, che rispetta blocchi account, rate limiting di terze parti e hook WordPress standard.
- Il token è generato con un CSPRNG (Cryptographically Secure Pseudo-Random Number Generator).
- La finestra di validità di 60 secondi limita l'esposizione in caso di intercettazione.
- Il token viene eliminato immediatamente al primo utilizzo, impedendo replay attack.
- L'input `username` è sanitizzato con `sanitize_user`, il `token` con `sanitize_text_field`.
- Le password non vengono mai registrate, loggate o restituite in risposta.