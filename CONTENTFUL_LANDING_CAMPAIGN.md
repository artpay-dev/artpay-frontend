# Contentful Landing Campaign - Guida alla Configurazione

## Content Model: `landingCampaign`

Devi creare un nuovo Content Type su Contentful chiamato **`landingCampaign`** con i seguenti campi:

### 1. Campi Base

| Field ID | Field Name | Type | Required | Description |
|----------|-----------|------|----------|-------------|
| `slug` | Slug | Short text | Yes | Identificatore univoco della campagna (es: "the-others-2025") |
| `campaignName` | Campaign Name | Short text | Yes | Nome della campagna |

### 2. Partner Information (Opzionale)

| Field ID | Field Name | Type | Required | Description |
|----------|-----------|------|----------|-------------|
| `partnerName` | Partner Name | Short text | No | Nome del partner (es: "The Others") |
| `partnerLogo` | Partner Logo | Media (Single asset) | No | Logo del partner |
| `partnerDescription` | Partner Description | Long text | No | Descrizione della partnership |

**Esempio partnerDescription:**
"The Others 2025 - XIV edizione sceglie artpay per promuovere l'utilizzo di soluzioni di pagamento digitali, flessibili e innovative al servizio di gallerie, artisti e collezionisti"

**Nota:** Se `partnerName` e `partnerLogo` sono presenti, verrà mostrata la sezione di collaborazione con i loghi ArtPay x Partner.

### 4. Hero Section

Crea un campo **JSON Object** chiamato `hero` con i seguenti sottocampi:

```json
{
  "tagline": "L'arte di vendere a rate",
  "taglineColor": "#6576EE",
  "subtitle": "Scopri come far crescere la tua galleria con artpay",
  "subtitleColor": "#808791",
  "heading": "Offri ai tuoi clienti l'arte che desiderano, in comode rate",
  "description": "Con artpay aumenti le vendite e fidelizzi i tuoi collezionisti..."
}
```

**Campi dell'hero:**
- `tagline` (Short text, required): Testo evidenziato in alto
- `taglineColor` (Short text, optional): Colore hex del tagline (default: #6576EE)
- `subtitle` (Short text, required): Sottotitolo
- `subtitleColor` (Short text, optional): Colore hex del subtitle (default: #808791)
- `heading` (Short text, required): Titolo principale
- `description` (Long text, required): Descrizione estesa

### 5. Features Section

| Field ID | Field Name | Type | Required |
|----------|-----------|------|----------|
| `featuresTitle` | Features Title | Short text | No |
| `featuresTitleColor` | Features Title Color | Short text | No |
| `features` | Features | JSON Object (List) | Yes |

**Struttura di ogni feature:**
```json
{
  "title": "Più vendite, meno barriere",
  "description": "Rendi le tue opere accessibili a un pubblico più ampio..."
}
```

### 6. Form Section (Opzionale)

| Field ID | Field Name | Type | Required | Description |
|----------|-----------|------|----------|-------------|
| `formHtml` | Form HTML | Long text | No | HTML completo del form (es: iframe Brevo) |

**Esempio formHtml:**
```html
<iframe width="100%" height="800" src="https://..." frameborder="0"></iframe>
```

**Nota:** Se `formHtml` è presente, verrà renderizzato questo HTML. Altrimenti, verrà usato il form Brevo di default.

## Esempio di Entry Completa

Ecco un esempio di entry completa per "The Others 2025":

```json
{
  "slug": "the-others-2025",
  "campaignName": "The Others 2025",
  "partnerName": "The Others",
  "partnerLogo": {
    "sys": {
      "type": "Link",
      "linkType": "Asset",
      "id": "7BrOFfUcVUyargzTLF7qil"
    }
  },
  "partnerDescription": "The Others 2025 - XIV edizione sceglie artpay per promuovere l'utilizzo di soluzioni di pagamento digitali, flessibili e innovative al servizio di gallerie, artisti e collezionisti",
  "hero": {
    "tagline": "L'arte di vendere a rate",
    "taglineColor": "#6576EE",
    "subtitle": "Scopri come far crescere la tua galleria con artpay",
    "subtitleColor": "#808791",
    "heading": "Offri ai tuoi clienti l'arte che desiderano, in comode rate",
    "description": "Con artpay aumenti le vendite e fidelizzi i tuoi collezionisti. Proponi pagamenti dilazionati semplici e garantiti, senza alcun rischio per la tua galleria."
  },
  "featuresTitle": "Perché scegliere artpay?",
  "featuresTitleColor": "#808791",
  "features": [
    {
      "title": "Più vendite, meno barriere",
      "description": "Rendi le tue opere accessibili a un pubblico più ampio con piani di pagamento personalizzati. Più collezionisti potranno acquistare, senza compromettere il valore dell'arte."
    },
    {
      "title": "Il prezzo non è più un ostacolo",
      "description": "Con artpay, acquistare diventa più semplice. I tuoi clienti possono pagare in più rate, in totale sicurezza e trasparenza."
    },
    {
      "title": "Pagamenti garantiti, zero rischi",
      "description": "Dimentica insolvenze e ritardi: con artpay incassi l'intero importo in poche settimane, sempre in sicurezza."
    },
    {
      "title": "Una soluzione pensata per l'arte",
      "description": "artpay nasce per gallerie e professionisti del settore. Una piattaforma digitale su misura, sviluppata insieme a partner finanziari selezionati."
    }
  ],
  "formHtml": "<iframe width=\"100%\" height=\"800\" src=\"https://brevo-form-url\" frameborder=\"0\"></iframe>"
}
```

## Note Importanti

1. **Slug**: Viene usato per recuperare la campagna specifica. Modificalo in `src/features/landingforcampaign/index.tsx` (riga 18) se necessario
2. **Logo del partner**: Deve essere caricato come Asset su Contentful
3. **Colori**: Possono essere lasciati vuoti, verranno usati i colori di default (#6576EE per il tagline, #808791 per subtitle e features title)
4. **Features**: Puoi aggiungere quante features vuoi, verranno renderizzate automaticamente

## Environment Variables Necessarie

Assicurati di avere queste variabili d'ambiente configurate:

```env
VITE_CONTENTFUL_STAGING_SPACE_ID=your_space_id
VITE_CONTENTFUL_STAGING_ACCESS_TOKEN=your_access_token
```

## Testing

1. Crea il Content Model su Contentful
2. Crea una entry con slug "the-others-2025"
3. Pubblica l'entry
4. La landing page dovrebbe caricare automaticamente i contenuti da Contentful

Se hai bisogno di usare uno slug diverso o renderlo dinamico basato sull'URL, possiamo modificare il componente per leggere il parametro dall'URL.