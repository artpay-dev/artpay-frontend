import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { FiltersPanel } from "../index.ts";
import { useData, FAVOURITES_UPDATED_EVENT } from "../../../../hoc/DataProvider";
import { useFiltersStore } from "../../store/filters-store";
import { Artwork } from "../../../../types/artwork";
import { GroupedMessage } from "../../../../types/user";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import dayjs from "dayjs";

const FilterIcon = ({ color = "tertiary" }: { color: "primary" | "tertiary" }) => {
  const colorVariants = {
    primary: "fill-primary",
    tertiary: "fill-tertiary",
  };

  return (
    <svg
      width="19"
      height="17"
      viewBox="0 0 19 17"
      xmlns="http://www.w3.org/2000/svg"
      className={`${colorVariants[color]}`}>
      <path d="M9.5 12C9.77614 12 10 12.2239 10 12.5V14H18.5L18.6006 14.0098C18.8286 14.0563 19 14.2583 19 14.5C19 14.7417 18.8286 14.9437 18.6006 14.9902L18.5 15H10V16.5C10 16.7761 9.77614 17 9.5 17C9.22386 17 9 16.7761 9 16.5V12.5C9 12.2239 9.22386 12 9.5 12ZM6.5 14C6.77614 14 7 14.2239 7 14.5C7 14.7761 6.77614 15 6.5 15H0.5C0.223858 15 0 14.7761 0 14.5C0 14.2239 0.223858 14 0.5 14H6.5ZM5.5 6C5.77614 6 6 6.22386 6 6.5V10.5C6 10.7761 5.77614 11 5.5 11C5.22386 11 5 10.7761 5 10.5V9H0.5C0.223858 9 0 8.77614 0 8.5C0 8.22386 0.223858 8 0.5 8H5V6.5C5 6.22386 5.22386 6 5.5 6ZM18.5 8C18.7761 8 19 8.22386 19 8.5C19 8.77614 18.7761 9 18.5 9H8.5C8.22386 9 8 8.77614 8 8.5C8 8.22386 8.22386 8 8.5 8H18.5ZM12.5 0C12.7761 -4.62582e-05 13 0.223858 13 0.5V2H18.5C18.7761 2 19 2.22386 19 2.5C19 2.77614 18.7761 3 18.5 3H13.001V4.5C13.001 4.7761 12.7771 4.99988 12.501 5C12.2248 5.00005 12.001 4.77614 12.001 4.5L12 0.5C12 0.223935 12.2239 4.62564e-05 12.5 0ZM10.5 2C10.7761 2 11 2.22386 11 2.5C11 2.77614 10.7761 3 10.5 3H0.5C0.223858 3 0 2.77614 0 2.5C0 2.22386 0.223858 2 0.5 2H10.5Z" />
    </svg>
  );
};

const AiSparkleIcon = ({ color = "tertiary" }: { color: "primary" | "tertiary" }) => {
  const colorVariants = {
    primary: "fill-primary",
    tertiary: "fill-tertiary",
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`${colorVariants[color]}`}>
      <path d="M12 2L13.09 8.26L15 8L17.94 9.87L17.94 9.87C18.3 10.13 18.54 10.53 18.59 10.97L19.95 19.61C20.03 20.16 19.67 20.67 19.12 20.75C19.08 20.76 19.03 20.76 18.99 20.76H5.01C4.45 20.76 4 20.31 4 19.75C4 19.71 4 19.66 4.01 19.62L5.41 10.97C5.46 10.54 5.7 10.13 6.06 9.87L9 8L10.91 8.26L12 2M12 5.53L11.34 8.75L9 9.03L6.8 10.5L5.7 17.76H18.3L17.2 10.5L15 9.03L12.66 8.75L12 5.53M9 12C9 12.6 8.6 13 8 13S7 12.6 7 12 7.4 11 8 11 9 11.4 9 12M16 13C15.4 13 15 12.6 15 12S15.4 11 16 11 17 11.4 17 12 16.6 13 16 13Z" />
    </svg>
  );
};

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  const imageUrl = artwork.images?.[0]?.src || "../images/artists_example.png";
  const artistName = artwork.attributes?.find((attr) => attr.name === "Artista")?.options?.[0] || "Artista sconosciuto";
  const galleryName = artwork.store_name || "Galleria";

  console.log("artwork", artwork);

  return (
    <li className={"flex items-center gap-4 w-full cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"}>
      <div className={"rounded-2xl overflow-hidden h-30 w-30 aspect-square flex-shrink-0"}>
        <img src={imageUrl} className={"w-full h-full object-cover"} alt={artwork.name} />
      </div>
      <div className={"flex-1 min-w-0"}>
        <ul className={"flex flex-col"}>
          <li className={"text-secondary font-medium mb-1 text-sm truncate"}>{artistName}</li>
          <li className={"text-tertiary text-base font-medium mb-2 truncate"} title={artwork.name}>
            {artwork.name}
          </li>
          <li className={"text-secondary font-medium text-sm truncate"}>{galleryName}</li>
        </ul>
      </div>
    </li>
  );
};

interface MessagesCardProps {
  conversation: GroupedMessage;
  onClick: () => void;
}

const MessagesCard = ({ conversation, onClick }: MessagesCardProps) => {
  const imageUrl = conversation.product.images?.[0]?.src || "../images/gallery-logo-example.png";
  const galleryName = conversation.product.store_name || "Galleria";
  const artworkName = conversation.product.name;

  // Tronca il messaggio se troppo lungo
  const truncatedMessage = conversation.lastMessageText.length > 50
    ? conversation.lastMessageText.substring(0, 50) + "..."
    : conversation.lastMessageText;

  // Formatta la data in modo relativo (Oggi, Ieri, giorno della settimana, data)
  const formatDate = (date: any) => {
    const now = new Date();
    const messageDate = date.toDate();
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Oggi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return date.format("dddd");
    return date.format("DD/MM/YYYY");
  };

  return (
    <li onClick={onClick} className={"p-4 flex items-center w-full gap-2 cursor-pointer hover:bg-gray-100 transition-colors"}>
      <div className={"overflow-hidden rounded-2xl h-16 min-w-16 aspect-square"}>
        <img src={imageUrl} alt={artworkName} className="h-full w-full object-cover" />
      </div>
      <div className={"flex flex-col space-y-1 flex-1 min-w-0"}>
        <span className="font-medium truncate">{galleryName}</span>
        <p className="text-secondary text-xs font-medium truncate">{artworkName}</p>
        <p className="text-secondary text-xs truncate">{truncatedMessage}</p>
      </div>
      <div className="flex flex-col text-xs text-secondary">
        <span>{formatDate(conversation.lastMessageDate)}</span>
      </div>
    </li>
  );
};

interface SidePanelProps {
  open?: boolean;
  onClose?: () => void;
}

const SidePanel = ({ open = true, onClose }: SidePanelProps) => {
  const [tab, setTab] = useState<"like" | "match">("like");
  const [filtersPanelOpen, setFiltersPanelOpen] = useState<boolean>(false);
  const [aiSearchOpen, setAiSearchOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
  const [conversations, setConversations] = useState<GroupedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConversation, setSelectedConversation] = useState<GroupedMessage | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dataProvider = useData();

  // Carica i dati quando cambia il tab
  useEffect(() => {
    if (tab === "like") {
      loadFavouriteArtworks();
    } else if (tab === "match") {
      loadConversations();
    }
  }, [tab]);

  // Listener per aggiornamenti ai preferiti
  useEffect(() => {
    const handleFavouritesUpdate = () => {
      if (tab === "like") {
        loadFavouriteArtworks();
      }
    };

    document.addEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdate);
    return () => {
      document.removeEventListener(FAVOURITES_UPDATED_EVENT, handleFavouritesUpdate);
    };
  }, [tab]);

  const loadFavouriteArtworks = async () => {
    try {
      setLoading(true);
      const favouriteIds = await dataProvider.getFavouriteArtworks();
      if (favouriteIds.length > 0) {
        const artworks = await dataProvider.getArtworks(favouriteIds);
        setLikedArtworks(artworks);
      } else {
        setLikedArtworks([]);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle opere preferite:", error);
      setLikedArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const chatHistory = await dataProvider.getChatHistory();

      // Filtra solo le conversazioni ArtMatch con risposta dalla galleria
      const artMatchConversations = chatHistory.filter((conversation) => {
        // Verifica se almeno un messaggio utente inizia con "ArtMatch"
        const hasArtMatchMessage = conversation.messages.some(
          (msg) => msg.userMessage && msg.text.startsWith("ArtMatch")
        );

        // Verifica se c'è almeno una risposta dalla galleria
        const hasGalleryResponse = conversation.messages.some(
          (msg) => !msg.userMessage
        );

        return hasArtMatchMessage && hasGalleryResponse;
      });

      setConversations(artMatchConversations);
    } catch (error) {
      console.error("Errore nel caricamento delle conversazioni:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersPanelOpen = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
    setAiSearchOpen(false);
  };

  const handleAiSearchOpen = () => {
    setAiSearchOpen(!aiSearchOpen);
    setFiltersPanelOpen(false);
  };

  const handleAiSearch = async () => {
    if (!aiPrompt.trim() || sending) return;

    try {
      setSending(true);

      // Ottieni i filtri attuali dal store
      const currentFilters = useFiltersStore.getState().filters;

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/wp-json/artpay/v1/ai-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          filters: currentFilters
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nella ricerca AI');
      }

      if (data.success && data.results.length > 0) {
        // TODO: Mostrare i risultati all'utente
        console.log('AI Search Results:', data.results);
        console.log('AI Reasoning:', data.results[0]?.ai_reasoning);

        // Opzione 1: Mostrare in un modale
        // setAiResults(data.results);
        // setAiResultsModalOpen(true);

        // Opzione 2: Navigare a una pagina di risultati
        // navigate('/artmatch/results', { state: { results: data.results } });

        // Per ora mostriamo un alert
        alert(`Trovate ${data.total} opere che corrispondono alla tua ricerca!`);
        setAiSearchOpen(false);
      } else {
        alert('Nessuna opera trovata. Prova a modificare la tua richiesta.');
      }

    } catch (error) {
      console.error('AI Search Error:', error);
      alert('Errore durante la ricerca AI. Riprova più tardi.');
    } finally {
      setSending(false);
    }
  };

  const handleConversationClick = (conversation: GroupedMessage) => {
    setSelectedConversation(conversation);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedConversation(null);
    setNewMessage("");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await dataProvider.sendQuestionToVendor({
        product_id: selectedConversation.product.id,
        question: newMessage,
      });

      // Aggiungi il messaggio all'interfaccia
      const newMsg = {
        text: newMessage,
        userMessage: true,
        date: dayjs(),
      };

      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMsg],
        lastMessageText: newMessage,
        lastMessageDate: dayjs(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error);
    } finally {
      setSending(false);
    }
  };

  const panelContent = (
    <aside className={"h-screen rounded-r-2xl w-full max-w-xs lg:max-w-sm bg-white pt-16 lg:pt-30 px-6 pb-12 overflow-y-hidden"}>
      <div className="flex gap-2">
        <Button className={"custom-navbar flex items-center gap-2.5 py-6! flex-1"} onClick={handleFiltersPanelOpen}>
          <FilterIcon color={filtersPanelOpen ? "primary" : "tertiary"} />
          <span className={`${filtersPanelOpen ? "text-primary" : "text-tertiary"}`}>Filtri</span>
        </Button>
        <Button
          className={"custom-navbar flex items-center gap-2.5 py-6! flex-1"}
          onClick={handleAiSearchOpen}
          sx={{
            background: aiSearchOpen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            '&:hover': {
              background: aiSearchOpen ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)',
            }
          }}>
          <AiSparkleIcon color={aiSearchOpen ? "primary" : "tertiary"} />
          <span className={`${aiSearchOpen ? "text-white" : "text-tertiary"}`}>AI</span>
        </Button>
      </div>
      {filtersPanelOpen ? (
        <FiltersPanel />
      ) : aiSearchOpen ? (
        <div className="mt-8 flex flex-col gap-4">
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <div className="absolute top-2 right-2">
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <AiSparkleIcon color="primary" />
              Ricerca AI
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              Descrivi l'opera che stai cercando e l'AI ti aiuterà a trovarla
            </p>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Es: Cerco un dipinto astratto con tonalità blu e verdi, stile contemporaneo, di medie dimensioni..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleAiSearch}
              disabled={!aiPrompt.trim() || sending}
              sx={{
                mt: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6440 8c 100%)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                },
              }}>
              {sending ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Ricerca in corso...
                </>
              ) : (
                "Cerca un'opera con l'AI"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <nav className={"flex items-center mt-12 "}>
            <ul className={"flex items-center justify-center w-full "}>
              <li
                className={`flex items-center justify-center w-full ${
                  tab == "like" ? "border-primary border-b-2" : "text-tertiary border-b"
                }`}>
                <button
                  className={`py-2.5 cursor-pointer ${tab == "like" ? "text-primary" : "text-tertiary"}`}
                  onClick={() => setTab("like")}>
                  Like
                </button>
              </li>
              <li
                className={`flex items-center justify-center w-full ${
                  tab == "match" ? "border-primary border-b-2" : "text-tertiary border-b"
                }`}>
                <button
                  className={`py-2.5 cursor-pointer ${tab == "match" ? "text-primary" : "text-tertiary"}`}
                  onClick={() => setTab("match")}>
                  Match
                </button>
              </li>
            </ul>
          </nav>
          <div className={"overflow-y-auto flex-1"}>
            {tab === "like" && (
              <>
                {loading ? (
                  <div className={"flex justify-center items-center mt-12"}>
                    <CircularProgress size={40} />
                  </div>
                ) : likedArtworks.length === 0 ? (
                  <div className={"flex flex-col items-center justify-center mt-12 px-4"}>
                    <p className={"text-secondary text-center"}>Nessuna opera nei preferiti</p>
                    <p className={"text-secondary text-sm text-center mt-2"}>
                      Inizia a mettere like alle opere che ti piacciono!
                    </p>
                  </div>
                ) : (
                  <ul className={"flex flex-col mt-8 space-y-6"}>
                    {likedArtworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </ul>
                )}
              </>
            )}
            {tab === "match" && (
              <>
                {loading ? (
                  <div className={"flex justify-center items-center mt-12"}>
                    <CircularProgress size={40} />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={"flex flex-col items-center justify-center mt-12 px-4"}>
                    <p className={"text-secondary text-center"}>Nessuna conversazione</p>
                    <p className={"text-secondary text-sm text-center mt-2"}>
                      Le tue conversazioni con le gallerie appariranno qui
                    </p>
                  </div>
                ) : (
                  <ul className={"flex flex-col mt-8 space-y-2"}>
                    {conversations.map((conversation) => (
                      <MessagesCard
                        key={conversation.product.id}
                        conversation={conversation}
                        onClick={() => handleConversationClick(conversation)}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );

  // Su mobile: mostra come Drawer
  if (isMobile) {
    return (
      <>
        <Drawer anchor="left" open={open} onClose={onClose}>
          {panelContent}
        </Drawer>
        {/* Modale conversazione */}
        {selectedConversation && (
          <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{selectedConversation.product.store_name || "Galleria"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedConversation.product.name}
                  </Typography>
                </Box>
                <IconButton onClick={handleModalClose} edge="end">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
                {selectedConversation.messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: message.userMessage ? "flex-end" : "flex-start",
                      width: "100%",
                    }}>
                    <Box
                      sx={{
                        maxWidth: "70%",
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: message.userMessage ? "#42B396" : "#f5f5f5",
                        color: message.userMessage ? "white" : "text.primary",
                      }}>
                      <Typography variant="body2">{message.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: "0.7rem",
                        }}>
                        {message.date.format("DD/MM/YYYY HH:mm")}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Input per rispondere */}
              <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 2, pb: 3, borderTop: "1px solid #e0e0e0" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Scrivi un messaggio..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                  multiline
                  maxRows={2}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    minHeight: 40,
                    backgroundColor: "#42B396",
                    color: "white",
                    "&:hover": { backgroundColor: "#358f7a" },
                    "&:disabled": { backgroundColor: "#e0e0e0" },
                  }}>
                  {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                </IconButton>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Su desktop: mostra sempre fisso
  return (
    <>
      {panelContent}
      {/* Modale conversazione */}
      {selectedConversation && (
        <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">{selectedConversation.product.store_name || "Galleria"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedConversation.product.name}
                </Typography>
              </Box>
              <IconButton onClick={handleModalClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
              {selectedConversation.messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: message.userMessage ? "flex-end" : "flex-start",
                    width: "100%",
                  }}>
                  <Box
                    sx={{
                      maxWidth: "70%",
                      padding: 2,
                      borderRadius: 2,
                      backgroundColor: message.userMessage ? "#42B396" : "#f5f5f5",
                      color: message.userMessage ? "white" : "text.primary",
                    }}>
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: "0.7rem",
                      }}>
                      {message.date.format("DD/MM/YYYY HH:mm")}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Input per rispondere */}
            <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 2, pb: 3, borderTop: "1px solid #e0e0e0" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Scrivi un messaggio..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                multiline
                maxRows={2}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                sx={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  minHeight: 40,
                  backgroundColor: "#42B396",
                  color: "white",
                  "&:hover": { backgroundColor: "#358f7a" },
                  "&:disabled": { backgroundColor: "#e0e0e0" },
                }}>
                {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SidePanel;
