# DOCUMENTAZIONE COMPLETA ARTMATCH

## PANORAMICA ARCHITETTURALE

ArtMatch è un sistema di matchmaking per opere d'arte che permette agli utenti di scoprire opere tramite uno swipe interattivo simile a Tinder. Il sistema comprende circa 2.078 linee di codice distribuito in componenti modulari.

## STRUTTURA DEL PROGETTO

```
src/features/artmatch/
├── app-artmatch/          # App principale
├── components/            # Componenti UI
│   ├── feed-card/        # Card promozionale per dashboard
│   ├── filters-panel/    # Pannello filtri avanzati
│   ├── main-app/         # Logica swipe principale
│   ├── side-panel/       # Pannello laterale (like/match)
│   └── swipe-card/       # Singola card swipe
├── layouts/              # Layout principale
│   └── main-layout/
├── services/             # Servizi API
│   └── artmatch-services.ts
├── store/                # State management
│   └── filters-store.ts
└── styles/               # Stili custom
    └── artmatch.css
```

---

## 1. COMPONENTI PRINCIPALI

### 1.1 Entry Point e Routing

**File:** `/src/pages/artmatch/ArtMatch.tsx`

```typescript
// Route definita in App.tsx alla linea 161:
<Route path="/artmatch" element={<ArtMatch />} />
```

Il componente è un semplice wrapper che renderizza `AppArtMatch`.

### 1.2 App Container

**File:** `/src/features/artmatch/app-artmatch/app-art-match.tsx`

Componente principale che:
- Gestisce lo stato dei risultati AI tramite `useState`
- Passa i risultati AI al componente MainApp
- Wrappa tutto nel MainLayout

**Responsabilità:**
- Coordinamento tra layout e app principale
- Bridge per passare risultati AI dalla ricerca AI al feed

### 1.3 Main Layout

**File:** `/src/features/artmatch/layouts/main-layout/main-layout.tsx`

**Caratteristiche:**
- Navbar con pulsante "Torna su" e logo ArtMatch
- Responsive: drawer mobile vs side panel fisso desktop
- Sfondo tertiary con branding ArtMatch

**Componenti:**
- `BackButton`: Navigazione indietro
- `ArtMatchLabel`: Badge con icona cuore
- `SidePanel`: Pannello filtri/like/match (responsive)

---

## 2. SWIPE CARD COMPONENT

**File:** `/src/features/artmatch/components/swipe-card/swipe-card.tsx`

### Struttura della Card

```typescript
interface SwipeCardProps {
  artwork: Artwork;
  onLike: (artwork: Artwork) => void;
  onDislike: (artwork: Artwork) => void;
  isTop?: boolean;
}
```

### Layout della Card

1. **Sezione Immagine (65% altezza)**
   - Immagine opera come background cover
   - Border radius 8px

2. **Sezione Info (35% restante)**
   - Nome opera
   - Nome artista (da `artwork.acf?.artist?.[0]?.post_title`)

3. **Bottoni Azione**
   - **Dislike**: IconButton rosso (80x80px) con CloseIcon
     - Colore: `#EC6F7B`
     - Background: `#ffebee`
   - **Like**: IconButton verde (80x80px) con FavoriteIcon
     - Colore: `#42B396`
     - Background: `#e8f5e9`

**Stile:**
- Border radius: 12px
- Box shadow: `0 10px 40px rgba(0,0,0,0.2)`
- Altezza: 100% del container
- User select: none (previene selezione testo)

---

## 3. MAIN APP - LOGICA SWIPE

**File:** `/src/features/artmatch/components/main-app/main-app.tsx`

### 3.1 Libreria Swiper

Utilizza **Swiper.js** con effetto cards:

```typescript
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
```

**Configurazione Swiper:**
- Effect: "cards"
- Grab cursor: true
- Cards effect:
  - perSlideOffset: 8px
  - perSlideRotate: 2 gradi
  - rotate: true
  - slideShadows: true

### 3.2 Stati Principali

```typescript
const [products, setProducts] = useState<Artwork[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [currentIndex, setCurrentIndex] = useState<number>(0);
const [showAiGrid, setShowAiGrid] = useState<boolean>(false);
const [aiGridResults, setAiGridResults] = useState<Artwork[]>([]);
const swiperRef = useRef<SwiperType | null>(null);
```

### 3.3 Caricamento Prodotti

**Funzione:** `loadProducts()`

1. Carica 50 prodotti dal backend tramite `artmatchService.getProducts(50, 0, filters)`
2. Se utente autenticato:
   - Recupera opere già viste (liked + disliked)
   - Filtra prodotti per escludere quelli già visti
3. Aggiorna lo stato products

**Trigger reload:**
- Al mount del componente
- Quando cambiano i filtri (`useEffect` su `filters`)

### 3.4 Gestione Like

**Funzione:** `handleLike(artwork: Artwork)`

**Flusso completo:**

1. **UI Update Immediato**
   - Se swiper: `moveToNext()` per card successiva
   - Se griglia AI: rimuove artwork dalla lista

2. **Verifica Autenticazione**
   - Se non autenticato: mostra login

3. **Salvataggio Like** (background)
   - Chiama `dataProvider.addFavouriteArtwork(artwork.id.toString())`
   - Endpoint: `/wp-json/wp/v2/addUserFavoriteArtwork/{id}`
   - Aggiorna cache locale dei preferiti
   - Dispone evento `FAVOURITES_UPDATED_EVENT`

4. **Invio Messaggio Automatico alla Galleria** (background)
   ```typescript
   const message = `ArtMatch - Sono interessato a ${artworkName} di ${artistName}. Vorrei avere maggiori informazioni.`;

   dataProvider.sendQuestionToVendor({
     product_id: artwork.id,
     question: message,
   });
   ```
   - Endpoint: `/wp-json/wc/v3/customer-question`
   - Crea automaticamente una conversazione con la galleria
   - Messaggio prefissato con "ArtMatch" per identificazione

### 3.5 Gestione Dislike

**Funzione:** `handleDislike(artwork: Artwork)`

**Flusso:**

1. **UI Update Immediato**
   - Se swiper: `moveToNext()`
   - Se griglia AI: rimuove artwork dalla lista

2. **Salvataggio Dislike** (background)
   - Chiama `artmatchService.dislikeProduct(artwork.id, authToken)`
   - Endpoint: `/wp-json/artpay/v1/addUserDislikedArtwork/{id}`
   - Salva l'ID nell'array di opere non gradite

**Nota:** I dislike NON inviano messaggi alla galleria.

### 3.6 Modalità Visualizzazione

**Due modalità:**

1. **Swiper Mode** (default)
   - Stack di carte con effetto swipe
   - Dimensioni: 400px max width, 720px altezza
   - Navigazione sequenziale

2. **AI Grid Mode** (quando `showAiGrid = true`)
   - Griglia responsive (Grid Material-UI)
   - Breakpoints: xs=12, sm=6, md=4, lg=3
   - Cards con immagine clickable per navigare a dettaglio opera
   - Pulsanti like/dislike inline su ogni card
   - Header con contatore risultati e pulsante chiudi
   - Gradiente viola/blu per branding AI

---

## 4. SIDE PANEL - GESTIONE LIKE E MATCH

**File:** `/src/features/artmatch/components/side-panel/side-panel.tsx`

### 4.1 Struttura Pannello

**Tabs:**
1. **Like**: Lista opere messe nei preferiti
2. **Match**: Conversazioni con gallerie che hanno risposto

**Pulsanti superiori:**
1. **Filtri**: Apre FiltersPanel
2. **AI**: Apre ricerca AI con gradiente viola

### 4.2 Tab "Like"

**Stati:**
```typescript
const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
```

**Caricamento:**
- Chiama `dataProvider.getFavouriteArtworks()` per IDs
- Endpoint: `/wp-json/wp/v2/getUserFavoriteArtworks`
- Recupera dettagli opere con `dataProvider.getArtworks(favouriteIds)`

**Listener eventi:**
```typescript
document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdate);
```
Ricarica automaticamente quando cambiano i preferiti.

**Componente ArtworkCard:**
- Immagine 30x30 (120px)
- Nome artista
- Titolo opera
- Nome galleria
- Click: naviga a `/opere/{slug}`

### 4.3 Tab "Match"

**Stati:**
```typescript
const [conversations, setConversations] = useState<GroupedMessage[]>([]);
```

**Caricamento:**
- Chiama `dataProvider.getChatHistory()`
- Endpoint: `/wp-json/wc/v3/customer-question`
- **Filtra** solo conversazioni con risposta galleria:
  ```typescript
  const hasGalleryResponse = conversation.messages.some(
    (msg) => !msg.userMessage
  );
  ```

**Componente MessagesCard:**
- Immagine opera (64x64)
- Nome galleria
- Nome opera
- Ultimo messaggio (troncato a 50 caratteri)
- Data relativa (Oggi, Ieri, giorno settimana, data)
- Click: apre modal conversazione

**Modal Conversazione:**
- Header: nome galleria + nome opera
- Messaggi a bolle (stile chat)
  - Utente: verde (#42B396), allineato destra
  - Galleria: grigio (#f5f5f5), allineato sinistra
- Input nuovo messaggio con tasto Enter
- Pulsante invio con spinner durante invio
- Linkify per URLs automatici

### 4.4 Ricerca AI

**UI:**
- Box gradiente viola/blu
- Textarea multiline (4 righe)
- Placeholder suggerisce formato ricerca
- Pulsante con gradiente e spinner

**Funzione:** `handleAiSearch()`

**Flusso:**

1. **Validazione**
   - Verifica prompt non vuoto
   - Previene invii multipli

2. **Invio Richiesta**
   - Endpoint: `/wp-json/artpay/v1/ai-search`
   - Method: POST
   - Body:
     ```json
     {
       "prompt": "string",
       "filters": ArtmatchFilters
     }
     ```

3. **Gestione Risposta**
   - Se successo: apre modal con contatore risultati
   - Se nessun risultato: alert utente
   - Errore: alert generico

4. **Modal Risultati AI**
   - Mostra numero opere trovate
   - Box gradiente con titolo/descrizione
   - Pulsante "Mostra risultati": passa risultati a MainApp
   - Pulsante "Annulla": chiude modal

5. **Rendering Risultati**
   - Quando conferma: `onAiResults(aiResults)`
   - MainApp passa a modalità griglia
   - Chiude pannello AI search

---

## 5. FILTERS PANEL

**File:** `/src/features/artmatch/components/filters-panel/filters-panel.tsx`

### 5.1 Filtri Disponibili

**1. Costo**
- Input min/max personalizzati (type="number")
- Range predefiniti (checkbox):
  - 0-200€
  - 200-500€
  - 500-1000€
  - 1000-5000€
  - 5000+€

**2. Periodo Storico**
- Antico (prima del 1800)
- Moderno (1800-1945)
- Contemporaneo (1945-oggi)

**3. Tipo (Categorie)**
- Caricate dinamicamente da WooCommerce
- Endpoint: `/wp-json/wc/v3/products/categories`
- Mostra solo categorie con count > 0
- Lista scrollabile (max-height: 240px)
- Mostra contatore opere per categoria

### 5.2 Stati Locali

```typescript
const [minPrice, setMinPrice] = useState<string>("");
const [maxPrice, setMaxPrice] = useState<string>("");
const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
```

### 5.3 Accordion Element

Componente riusabile per sezioni espandibili:
- Pulsante con freccia rotante
- Animazione altezza con overflow hidden
- Border bottom per separazione

### 5.4 Gestione Filtri

**Funzione:** `handleSubmit()`
- Aggiorna store Zustand con tutti i filtri
- Triggera reload in MainApp (via useEffect)
- Opzionale callback `onApplyFilters`

**Funzione:** `handleReset()`
- Resetta tutti gli stati locali
- Chiama `filtersStore.resetFilters()`
- Ricarica prodotti non filtrati

---

## 6. STORE ZUSTAND - FILTERS

**File:** `/src/features/artmatch/store/filters-store.ts`

### 6.1 Struttura Dati

```typescript
export interface PriceFilter {
  min?: number;
  max?: number;
  selectedRanges?: string[];
}

export interface ArtmatchFilters {
  price: PriceFilter;
  historicalPeriods?: string[];
  artTypes?: number[]; // IDs categorie WooCommerce
}
```

### 6.2 Store Actions

```typescript
interface FiltersStore {
  filters: ArtmatchFilters;
  setMinPrice: (min: number | undefined) => void;
  setMaxPrice: (max: number | undefined) => void;
  setSelectedPriceRanges: (ranges: string[]) => void;
  setHistoricalPeriods: (periods: string[]) => void;
  setArtTypes: (types: number[]) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}
```

### 6.3 Metodo Utilità

**`hasActiveFilters()`**: Verifica se ci sono filtri attivi
- Controlla tutti i campi dei filtri
- Restituisce `true` se almeno un filtro è impostato
- Usato per UI condizionale (badge, reset button, etc.)

---

## 7. SERVIZI API

**File:** `/src/features/artmatch/services/artmatch-services.ts`

### 7.1 Configurazione Base

```typescript
const baseUrl = import.meta.env.VITE_SERVER_URL || "";

// Guest credentials per accesso pubblico
const GUEST_CONSUMER_KEY = "ck_349ace6a3d417517d0140e415779ed924c65f5e1";
const GUEST_CONSUMER_SECRET = "cs_b74f44b74eadd4718728c26a698fd73f9c5c9328";
```

### 7.2 Funzione buildQueryParams

Converte filtri Zustand in parametri query per API:

**Logica prezzo:**
1. Applica min/max personalizzati se presenti
2. Elabora selectedRanges:
   - Calcola min/max complessivi da range multipli
   - Range "5000+" non imposta max
   - Combina con min/max personalizzati

**Filtri categorie:**
```typescript
params.categories = JSON.stringify(filters.artTypes);
```

**Filtri periodi:**
```typescript
params.historical_periods = JSON.stringify(filters.historicalPeriods);
```

### 7.3 API Methods

**1. getProducts**
```typescript
async getProducts(
  limit: number = 100,
  offset: number = 0,
  filters?: ArtmatchFilters
): Promise<Artwork[]>
```
- Endpoint: `/wp-json/artpay/v1/artmatch/products`
- Method: GET
- Parametri: per_page, offset, filtri vari
- Response: `{ success: boolean, products: Artwork[], total: number }`

**2. likeProduct**
```typescript
async likeProduct(
  productId: number,
  authToken: string
): Promise<number[]>
```
- Endpoint: `/wp-json/wp/v2/addUserFavoriteArtwork/{productId}`
- Method: POST
- Headers: Authorization
- Response: Array di IDs opere preferite aggiornato

**3. dislikeProduct**
```typescript
async dislikeProduct(
  productId: number,
  authToken: string
): Promise<number[]>
```
- Endpoint: `/wp-json/artpay/v1/addUserDislikedArtwork/{productId}`
- Method: POST
- Headers: Authorization
- Response: Array di IDs opere non gradite aggiornato

**4. getCategories**
```typescript
async getCategories(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  count: number;
}>>
```
- Endpoint: `/wp-json/wc/v3/products/categories`
- Method: GET
- Auth: Basic (guest credentials)
- Parametri: per_page=100
- Filtra categorie con count > 0

---

## 8. DATA PROVIDER INTEGRATION

**File:** `/src/hoc/DataProvider.tsx`

### 8.1 Metodi Favoriti

**getFavouriteArtworks()**
- Cache in `favouritesMap.artworks`
- Endpoint: `/wp-json/wp/v2/getUserFavoriteArtworks`
- Restituisce array di IDs

**addFavouriteArtwork(id: string)**
- Endpoint: `/wp-json/wp/v2/addUserFavoriteArtwork/{id}`
- Aggiorna cache locale
- Dispatch evento `FAVOURITES_UPDATED_EVENT`

**getDislikedArtworks()**
- Endpoint: `/wp-json/artpay/v1/getUserDislikedArtworks`
- Nessuna cache (sempre fresh)

### 8.2 Sistema Messaggistica

**sendQuestionToVendor(data: CustomerQuestion)**
```typescript
interface CustomerQuestion {
  product_id: number;
  question: string;
}
```
- Endpoint: `/wp-json/wc/v3/customer-question`
- Method: POST
- Headers: Authorization
- Response: `{ message: string }`

**getChatHistory()**

**Flusso elaborazione:**
1. Recupera tutte le questions dell'utente
2. Raggruppa per product_ID
3. Per ogni messaggio:
   - Aggiunge domanda utente
   - Aggiunge risposta galleria se presente
4. Ordina messaggi per data (crescente)
5. Recupera dettagli opere
6. Crea `GroupedMessage[]` con:
   - `product`: Artwork completo
   - `lastMessageDate`: Dayjs
   - `lastMessageText`: string
   - `messages`: Message[]
7. Ordina conversazioni per data (decrescente)

**getProductChatHistory(productId: number)**
- Simile a getChatHistory ma per singola opera
- Parametro query: `product_id`

### 8.3 Eventi Custom

**FAVOURITES_UPDATED_EVENT**
```typescript
export const FAVOURITES_UPDATED_EVENT = "favourites:updated";

const dispatchFavouritesUpdated = (favouritesMap: FavouritesMap) =>
  document.dispatchEvent(
    new CustomEvent<FavouritesMap>(FAVOURITES_UPDATED_EVENT, {
      detail: favouritesMap,
    })
  );
```

Ascoltato da:
- SidePanel per aggiornare lista like
- Altri componenti che mostrano stato preferiti

---

## 9. TIPI TYPESCRIPT

### 9.1 Artwork Type

**File:** `/src/types/artwork.ts`

**Campi rilevanti per ArtMatch:**
```typescript
export type Artwork = {
  id: number;
  name: string;
  slug: string;
  price: string;
  images: {
    src: string;
    woocommerce_thumbnail: string; // 300x300
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  attributes: any[];
  store_name: string;
  acf: {
    artist: ArtworkArtist[];
    anno_di_produzione: string;
    // ...
  };
  // ...
}
```

### 9.2 User/Message Types

**File:** `/src/types/user.ts`

```typescript
export type Message = {
  userMessage: boolean;
  text: string;
  date: Dayjs;
}

export interface GroupedMessage {
  product: Artwork;
  lastMessageDate: Dayjs;
  lastMessageText: string;
  messages: Message[];
}

export type CustomerQuestion = {
  product_id: number;
  question: string;
}

export type QuestionWithAnswer = {
  ques_ID: string;
  product_ID: string;
  ques_details: string;
  ques_by: string;
  ques_created: string;
  answer?: VendorAnswer;
}
```

---

## 10. FLUSSO COMPLETO UTENTE

### 10.1 Discovery Flow

```
1. Utente naviga a /artmatch
   └─> ArtMatch page component
       └─> AppArtMatch
           └─> MainLayout + MainApp

2. MainApp carica prodotti
   ├─> artmatchService.getProducts(50, 0, filters)
   ├─> Se autenticato: filtra opere già viste
   └─> Renderizza Swiper con SwipeCards

3. Utente vede stack di carte
   └─> Card top mostra: immagine, nome, artista
       └─> Bottoni: Like (verde) | Dislike (rosso)
```

### 10.2 Like Flow (Match completo)

```
1. Utente clicca Like su un'opera
   └─> handleLike(artwork)

2. UI update immediato
   ├─> moveToNext() → carta successiva
   └─> Feedback visivo istantaneo

3. Backend operations (parallele, non bloccanti)
   ├─> addFavouriteArtwork(id)
   │   ├─> POST /wp-json/wp/v2/addUserFavoriteArtwork/{id}
   │   ├─> Aggiorna cache preferiti
   │   └─> Dispatch FAVOURITES_UPDATED_EVENT
   │
   └─> sendQuestionToVendor()
       ├─> POST /wp-json/wc/v3/customer-question
       ├─> Messaggio: "ArtMatch - Sono interessato a {opera} di {artista}..."
       └─> Crea conversazione con galleria

4. Side effects
   ├─> SidePanel ascolta FAVOURITES_UPDATED_EVENT
   │   └─> Ricarica tab "Like"
   │
   └─> Tab "Match" si popola quando galleria risponde
       └─> getChatHistory() filtra conversazioni con risposta
```

### 10.3 Dislike Flow

```
1. Utente clicca Dislike
   └─> handleDislike(artwork)

2. UI update immediato
   └─> moveToNext() → carta successiva

3. Backend operation
   └─> artmatchService.dislikeProduct(id, token)
       └─> POST /wp-json/artpay/v1/addUserDislikedArtwork/{id}
       └─> Salva in array disliked (filtrato nei prossimi load)

4. NOTA: NO messaggio alla galleria
```

### 10.4 Filter Flow

```
1. Utente clicca "Filtri" nel SidePanel
   └─> Apre FiltersPanel

2. Utente seleziona filtri
   ├─> Prezzo (min/max o range)
   ├─> Periodo storico
   └─> Tipologia (categorie)

3. Utente clicca "Applica Filtri"
   └─> handleSubmit()
       ├─> Aggiorna useFiltersStore
       └─> Chiude FiltersPanel

4. MainApp reagisce al cambio filtri
   └─> useEffect([filters])
       └─> loadProducts()
           ├─> artmatchService.getProducts(50, 0, NEW_FILTERS)
           └─> Renderizza nuovo stack carte filtrato
```

### 10.5 AI Search Flow

```
1. Utente clicka "AI" nel SidePanel
   └─> Apre AI search box con gradiente viola

2. Utente scrive descrizione
   └─> Es: "Cerco dipinto astratto blu e verde, contemporaneo"

3. Utente clicca "Cerca un'opera con l'AI"
   └─> handleAiSearch()
       ├─> Mostra spinner
       └─> POST /wp-json/artpay/v1/ai-search
           ├─> Body: { prompt, filters }
           └─> Response: { success, results[], total }

4. Se risultati trovati
   └─> Apre modal con contatore
       ├─> "{N} opere trovate!"
       └─> Pulsanti: "Mostra risultati" | "Annulla"

5. Utente conferma
   └─> handleAiResultsConfirm()
       ├─> onAiResults(aiResults)
       │   └─> Passa risultati a MainApp
       │
       └─> MainApp passa a modalità griglia
           ├─> showAiGrid = true
           └─> Renderizza Grid con Cards
               ├─> Immagine clickable
               └─> Bottoni Like/Dislike inline
```

### 10.6 Match/Chat Flow

```
1. Galleria risponde alla question automatica
   └─> Backend salva answer in database

2. Utente apre tab "Match" nel SidePanel
   └─> loadConversations()
       └─> getChatHistory()
           ├─> Recupera questions con answers
           ├─> FILTRA solo con risposta galleria
           └─> Raggruppa per opera

3. UI mostra lista conversazioni
   ├─> Card per ogni opera
   │   ├─> Immagine
   │   ├─> Nome galleria
   │   ├─> Ultimo messaggio
   │   └─> Data relativa
   │
   └─> Ordinate per data (più recenti prime)

4. Utente clicca conversazione
   └─> handleConversationClick()
       └─> Apre modal chat
           ├─> Header: galleria + opera
           ├─> Messaggi a bolle
           │   ├─> Verde (utente) a destra
           │   └─> Grigio (galleria) a sinistra
           │
           └─> Input nuovo messaggio
               └─> handleSendMessage()
                   ├─> sendQuestionToVendor()
                   ├─> Aggiorna UI locale
                   └─> Mostra spinner durante invio
```

---

## 11. BACKEND API ENDPOINTS

### Endpoint ArtMatch Specifici

```
GET  /wp-json/artpay/v1/artmatch/products
     - Query params: per_page, offset, min_price, max_price,
                     categories, historical_periods
     - Response: { success, products[], total }

POST /wp-json/artpay/v1/ai-search
     - Body: { prompt: string, filters: ArtmatchFilters }
     - Response: { success, results[], total }

POST /wp-json/artpay/v1/addUserDislikedArtwork/{id}
     - Auth: Bearer token
     - Response: number[] (updated disliked IDs)

GET  /wp-json/artpay/v1/getUserDislikedArtworks
     - Auth: Bearer token
     - Response: number[]
```

### Endpoint Favoriti (WP Core)

```
GET  /wp-json/wp/v2/getUserFavoriteArtworks
     - Auth: Bearer token
     - Response: number[]

POST /wp-json/wp/v2/addUserFavoriteArtwork/{id}
     - Auth: Bearer token
     - Response: number[] (updated)

POST /wp-json/wp/v2/removeUserFavoriteArtwork/{id}
     - Auth: Bearer token
     - Response: number[] (updated)
```

### Endpoint Messaggistica (WooCommerce)

```
POST /wp-json/wc/v3/customer-question
     - Auth: Bearer token
     - Body: { product_id: number, question: string }
     - Response: { message: string }

GET  /wp-json/wc/v3/customer-question
     - Auth: Bearer token
     - Query params: product_id (optional)
     - Response: QuestionWithAnswer[]
```

### Endpoint Categorie (WooCommerce)

```
GET  /wp-json/wc/v3/products/categories
     - Auth: Basic (guest credentials)
     - Query params: per_page
     - Response: Category[]
```

---

## 12. OTTIMIZZAZIONI E BEST PRACTICES

### 12.1 Performance

1. **Caricamento Lazy**
   - Carica 50 opere alla volta
   - Filtra opere già viste lato client

2. **Cache Locale**
   - `favouritesMap` per preferiti
   - Evita chiamate ripetute durante sessione

3. **UI Non Bloccante**
   - Like/Dislike: UI update immediato
   - Operazioni backend in background
   - Catch errori senza bloccare UX

4. **Eventi Custom**
   - `FAVOURITES_UPDATED_EVENT` per sync tra componenti
   - Evita prop drilling profondo

### 12.2 UX Patterns

1. **Feedback Immediato**
   - Card scompare subito al like/dislike
   - Spinner solo per operazioni lunghe (AI search)

2. **Error Handling Graceful**
   - Console.error per debug
   - Alert solo per errori critici (AI search)
   - Fallback: mostra prodotti anche se filtro preferiti fallisce

3. **Responsive Design**
   - Drawer mobile vs sidebar desktop
   - Grid responsive per risultati AI
   - Swiper touch-friendly

4. **Loading States**
   - CircularProgress durante caricamenti
   - Disable buttons durante invio
   - Skeleton/placeholder per immagini

### 12.3 Sicurezza

1. **Autenticazione**
   - Verifica `auth.isAuthenticated` prima operazioni
   - Redirect a login se necessario
   - Token in headers per tutte le API protette

2. **Guest Access**
   - Credenziali guest solo per categorie pubbliche
   - No accesso a preferiti/messaggi senza auth

3. **Validazione Input**
   - Check prompt AI non vuoto
   - Previene invii multipli con flag `sending`

---

## 13. STRUTTURA DATI COMPLETA

### Filters Store State

```typescript
{
  filters: {
    price: {
      min?: number,
      max?: number,
      selectedRanges?: string[] // ["0-200", "500-1000"]
    },
    historicalPeriods?: string[], // ["ancient", "modern"]
    artTypes?: number[] // [12, 45, 67] (category IDs)
  }
}
```

### Favourites Map (Cache)

```typescript
{
  artworks: number[] | null,
  artists: number[] | null,
  galleries: number[] | null
}
```

### AI Search Request

```typescript
{
  prompt: string,
  filters: {
    price: { min?, max?, selectedRanges? },
    historicalPeriods?: string[],
    artTypes?: number[]
  }
}
```

### AI Search Response

```typescript
{
  success: boolean,
  results: Artwork[],
  total: number
}
```

---

## 14. FILE CHIAVE E LINEE DI CODICE

```
TOTALE: ~2.078 righe

File principali:
- side-panel.tsx: ~838 righe (39%)
- main-app.tsx: ~471 righe (23%)
- filters-panel.tsx: ~260 righe (12%)
- artmatch-services.ts: ~176 righe (8%)
- main-layout.tsx: ~75 righe (4%)
- swipe-card.tsx: ~117 righe (6%)
- filters-store.ts: ~81 righe (4%)
- app-art-match.tsx: ~21 righe (1%)
- Altri: ~39 righe (2%)
```

---

## 15. DIPENDENZE ESTERNE

**NPM Packages:**
- `swiper`: Libreria swipe cards
- `@mui/material`: UI components
- `zustand`: State management
- `axios`: HTTP client
- `react-router-dom`: Routing
- `dayjs`: Date manipulation
- `linkify-react`: Auto-link URLs in messaggi

**Swiper CSS:**
```typescript
import "swiper/css";
import "swiper/css/effect-cards";
```

---

## 16. INTEGRATION POINTS

### Con AuthProvider
```typescript
const auth = useAuth();
- auth.isAuthenticated
- auth.getAuthToken()
- auth.login()
```

### Con DataProvider
```typescript
const dataProvider = useData();
- getFavouriteArtworks()
- addFavouriteArtwork(id)
- getDislikedArtworks()
- sendQuestionToVendor({ product_id, question })
- getChatHistory()
- getArtworks(ids)
```

### Con Routing
```typescript
const navigate = useNavigate();
- navigate('/artmatch')
- navigate('/opere/:slug')
- navigate(-1) // back
```

---

## CONCLUSIONE

Il sistema ArtMatch è una feature complessa e ben strutturata che combina:

1. **Discovery**: Swipe interattivo con Swiper.js
2. **Filtering**: Sistema filtri avanzato con Zustand
3. **AI**: Ricerca semantica con backend AI
4. **Matching**: Sistema automatico di introduzione utente-galleria
5. **Chat**: Messaggistica integrata per follow-up

### Punti di forza:
- Architettura modulare e scalabile
- UX fluida con feedback immediato
- Integrazione seamless con WooCommerce
- Sistema di cache e eventi per performance
- Responsive e mobile-friendly

### Possibili Miglioramenti:
- Pagination/infinite scroll invece di caricare 50 opere
- Animazioni swipe manuali (drag gesture)
- Notifiche push per risposte gallerie
- Analytics tracking per swipe patterns
- A/B testing messaggi automatici