/**
 * Refúgio Solar Editorial — experiência de descoberta local do SunHost Floripa.
 * Carrosséis calmos, paisagens da ilha e superfícies editoriais deixam a cidade conduzir a navegação.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  FileWarning,
  ImageOff,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Images,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Ticket,
  UsersRound,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

type Accommodation = {
  id: number;
  title: string;
  district: string;
  location: string;
  price: number;
  category: string;
  guests: number;
  beds: number;
  points: number;
  images: string[];
  description: string;
  tags: string[];
  amenities: string[];
  accent: string;
  localNote: string;
};

type CivicReward = {
  id: number;
  points: number;
  amount: number;
  title: string;
  detail: string;
};

type LocalUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
};

type SubmittedAccommodation = Accommodation & {
  ownerId: string;
  ownerName: string;
  status: "pending" | "approved" | "rejected";
  moderationNote?: string;
};

type Review = { id: number; userName: string; rating: number; body: string; createdAt: string };
type PanelName = "auth" | "account" | "publish" | "admin" | null;

const DEMO_ADMIN_EMAIL = "admin@sunhost.local";
const DEMO_ADMIN_PASSWORD = "Floripa@2026";

const heroSlides = [
  {
    image: "/assets/floripa-lagoa-amanhecer_e0cb2e0a.jpg",
    place: "Lagoa da Conceição",
    caption: "o amanhecer encontra a ilha",
  },
  {
    image: "/assets/floripa-ponte-hercilio-luz_d11d4d11.jpg",
    place: "Ponte Hercílio Luz",
    caption: "um símbolo que liga histórias",
  },
  {
    image: "/assets/floripa-praia-mole_9e90ce3d.jpg",
    place: "Praia Mole",
    caption: "mar aberto e Mata Atlântica",
  },
];

const accommodations: Accommodation[] = [
  {
    id: 1,
    title: "Apartamento aberto para a Lagoa",
    district: "Lagoa da Conceição",
    location: "Lagoa da Conceição, Florianópolis",
    price: 280,
    category: "Apartamento inteiro",
    guests: 3,
    beds: 2,
    points: 80,
    images: [
      "/assets/sunhost-lagoa-apartment_26ce4478.jpg",
      "/assets/sunhost-lagoa-bedroom_7c607e34.jpg",
      "/assets/sunhost-lagoa-veranda_a1bc7f2e.jpg",
    ],
    description:
      "Uma estadia iluminada, feita para dias sem pressa entre cafés na Lagoa, caminhadas e o encontro com o pôr do sol.",
    tags: ["Vista para água", "Trabalho remoto", "Lagoa"],
    amenities: [
      "Wi‑Fi rápido",
      "Varanda",
      "Cozinha equipada",
      "Espaço de trabalho",
    ],
    accent: "lagoa",
    localNote: "Roteiro da Lagoa",
  },
  {
    id: 2,
    title: "Casa de madeira entre morro e mar",
    district: "Praia Mole",
    location: "Praia Mole, Florianópolis",
    price: 320,
    category: "Casa inteira",
    guests: 5,
    beds: 3,
    points: 100,
    images: [
      "/assets/sunhost-praia-mole-home_87796aad.jpg",
      "/assets/sunhost-praia-mole-living_57e96078.jpg",
      "/assets/sunhost-praia-mole-deck_86704beb.jpg",
    ],
    description:
      "Para acordar perto da praia, abrir as portas para a brisa e fazer da natureza parte do roteiro da viagem.",
    tags: ["Vista para água", "Praia", "Grupo"],
    amenities: [
      "Área externa",
      "Chuveiro externo",
      "Cozinha equipada",
      "Estacionamento",
    ],
    accent: "mole",
    localNote: "Trilha e mar perto",
  },
  {
    id: 3,
    title: "Estúdio com ritmo de cidade",
    district: "Centro",
    location: "Centro, Florianópolis",
    price: 200,
    category: "Estúdio inteiro",
    guests: 2,
    beds: 1,
    points: 60,
    images: [
      "/assets/sunhost-centro-studio_3becdd2b.jpg",
      "/assets/sunhost-centro-kitchen_c9ad79a4.jpg",
    ],
    description:
      "Um ponto de partida leve e bem pensado para quem quer circular a pé por museus, mercados, cafés e história.",
    tags: ["Trabalho remoto", "Centro", "Casal"],
    amenities: ["Wi‑Fi rápido", "Ar-condicionado", "Cama queen", "Lavanderia"],
    accent: "centro",
    localNote: "Centro histórico a pé",
  },
  {
    id: 4, title: "Refúgio com varanda para o mar", district: "Barra da Lagoa", location: "Barra da Lagoa, Florianópolis", price: 260, category: "Casa inteira", guests: 4, beds: 2, points: 70,
    images: ["/assets/floripa-praia-mole_9e90ce3d.jpg", "/assets/sunhost-praia-mole-deck_86704beb.jpg", "/assets/sunhost-lagoa-veranda_a1bc7f2e.jpg"],
    description: "Um refúgio arejado para desacelerar perto do mar e dos caminhos da ilha.", tags: ["Vista para água", "Praia", "Família"], amenities: ["Varanda", "Wi‑Fi rápido", "Cozinha equipada"], accent: "mole", localNote: "Mar e trilhas por perto"
  },
  {
    id: 5, title: "Loft solar no Campeche", district: "Campeche", location: "Campeche, Florianópolis", price: 240, category: "Loft inteiro", guests: 2, beds: 1, points: 65,
    images: ["/assets/floripa-lagoa-amanhecer_e0cb2e0a.jpg", "/assets/sunhost-centro-studio_3becdd2b.jpg", "/assets/sunhost-centro-kitchen_c9ad79a4.jpg"],
    description: "Loft compacto com luz natural para quem quer trabalhar e explorar o sul da ilha.", tags: ["Trabalho remoto", "Praia", "Casal", "Wi‑Fi"], amenities: ["Wi‑Fi rápido", "Mesa de trabalho", "Ar-condicionado"], accent: "centro", localNote: "Café e praia a pé"
  },
  {
    id: 6, title: "Casa jardim na Lagoa", district: "Lagoa da Conceição", location: "Lagoa da Conceição, Florianópolis", price: 390, category: "Casa inteira", guests: 6, beds: 3, points: 120,
    images: ["/assets/sunhost-lagoa-veranda_a1bc7f2e.jpg", "/assets/sunhost-lagoa-apartment_26ce4478.jpg", "/assets/floripa-ponte-hercilio-luz_d11d4d11.jpg"],
    description: "Casa ampla para reunir a família, cozinhar sem pressa e viver a Lagoa.", tags: ["Lagoa", "Grupo", "Família", "Vista para água"], amenities: ["Jardim", "Cozinha completa", "Wi‑Fi rápido", "Estacionamento"], accent: "lagoa", localNote: "Dias longos na ilha"
  },
];

const civicRewards: CivicReward[] = [
  {
    id: 1,
    points: 200,
    amount: 20,
    title: "R$ 20 de desconto",
    detail: "na próxima estadia elegível",
  },
  {
    id: 2,
    points: 250,
    amount: 25,
    title: "R$ 25 de desconto",
    detail: "na próxima estadia elegível",
  },
  {
    id: 3,
    points: 400,
    amount: 45,
    title: "R$ 45 de desconto",
    detail: "para uma viagem de 2 noites ou mais",
  },
  {
    id: 4,
    points: 500,
    amount: 60,
    title: "R$ 60 de desconto",
    detail: "para guardar para a próxima escapada",
  },
];

const filters = ["Todos", "Vista para água", "Trabalho remoto", "Para grupos", "Praia", "Lagoa", "Centro", "Casal", "Família", "Wi‑Fi"] as const;

function scrollTo(sectionId: string) {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function readStoredNumberList(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) && value.every(item => typeof item === "number")
      ? value
      : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [guestCount, setGuestCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [civicBalance, setCivicBalance] = useState(250);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<Accommodation | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [cardSlideIndex, setCardSlideIndex] = useState<Record<number, number>>(
    {}
  );
  const [pausedCardId, setPausedCardId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<PanelName>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [localUsers, setLocalUsers] = useState<LocalUser[]>([]);
  const [submittedAccommodations, setSubmittedAccommodations] = useState<
    SubmittedAccommodation[]
  >([]);
  const [removedAccommodationIds, setRemovedAccommodationIds] = useState<
    number[]
  >([]);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [publishForm, setPublishForm] = useState({
    title: "",
    district: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [moderationTab, setModerationTab] = useState<
    "accommodations" | "comments" | "photos"
  >("accommodations");

  useEffect(() => {
    setFavorites(readStoredNumberList("sunhost-favoritos"));
    setClaimedRewards(readStoredNumberList("sunhost-recompensas"));
    const storedBalance = window.localStorage.getItem("sunhost-pontos");
    if (storedBalance !== null) {
      const savedBalance = Number(storedBalance);
      if (Number.isFinite(savedBalance) && savedBalance >= 0)
        setCivicBalance(savedBalance);
    }
    setRemovedAccommodationIds([]);
    const storedSession = window.sessionStorage.getItem("sunhost-sessao");
    if (storedSession) {
      try {
        setCurrentUser(JSON.parse(storedSession) as LocalUser);
      } catch {
        window.sessionStorage.removeItem("sunhost-sessao");
        window.sessionStorage.removeItem("sunhost-token");
      }
    }
    const token = window.sessionStorage.getItem("sunhost-token");
    if (token)
      fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } }).then(response => response.ok ? response.json() : []).then(setFavorites).catch(() => undefined);
    if (token)
      fetch("/api/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => (response.ok ? response.json() : []))
        .then(setSubmittedAccommodations)
        .catch(() => undefined);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem("sunhost-favoritos", JSON.stringify(favorites));
    window.localStorage.setItem("sunhost-pontos", String(civicBalance));
    window.localStorage.setItem(
      "sunhost-recompensas",
      JSON.stringify(claimedRewards)
    );
    window.localStorage.setItem(
      "sunhost-anuncios-removidos",
      JSON.stringify(removedAccommodationIds)
    );
  }, [
    civicBalance,
    claimedRewards,
    favorites,
    removedAccommodationIds,
    storageReady,
  ]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const timer = window.setInterval(
      () => setHeroIndex(current => (current + 1) % heroSlides.length),
      5000
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const timer = window.setInterval(() => {
      setCardSlideIndex(current =>
        [...accommodations, ...submittedAccommodations.filter(item => item.status === "approved")].reduce<Record<number, number>>((next, accommodation) => {
          next[accommodation.id] =
            accommodation.id === pausedCardId
              ? current[accommodation.id] || 0
              : ((current[accommodation.id] || 0) + 1) %
                accommodation.images.length;
          return next;
        }, {})
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [pausedCardId, submittedAccommodations]);

  const allAccommodations = useMemo(() => {
    const approvedSubmissions = submittedAccommodations.filter(
      item =>
        item.status === "approved" && !removedAccommodationIds.includes(item.id)
    );
    return [...accommodations, ...approvedSubmissions];
  }, [removedAccommodationIds, submittedAccommodations]);

  const visibleAccommodations = allAccommodations.filter(accommodation => {
    const matchesQuery =
      `${accommodation.title} ${accommodation.location} ${accommodation.district}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      activeFilter === "Todos" ||
      (activeFilter === "Para grupos" && accommodation.tags.includes("Grupo")) ||
      accommodation.tags.includes(activeFilter) ||
      (activeFilter === "Família" && accommodation.tags.includes("Família")) ||
      (activeFilter === "Wi‑Fi" && accommodation.amenities.some(item => item.toLowerCase().includes("wi")));
    return matchesQuery && matchesFilter;
  });

  const favoriteAccommodations = allAccommodations.filter(accommodation =>
    favorites.includes(accommodation.id)
  );
  const activeHeroSlide = heroSlides[heroIndex];

  function toggleFavorite(id: number) {
    const wasFavorited = favorites.includes(id);
    const nextFavorites = wasFavorited
      ? favorites.filter(favoriteId => favoriteId !== id)
      : [...favorites, id];
    setFavorites(nextFavorites);
    const token = window.sessionStorage.getItem("sunhost-token");
    if (token) fetch(`/api/favorites/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ saved: !wasFavorited }) }).catch(() => undefined);
    setNotice(
      wasFavorited
        ? "Removido dos seus favoritos."
        : "Salvo nos seus favoritos neste dispositivo."
    );
  }

  function openAccommodation(accommodation: Accommodation) {
    setSelectedAccommodation(accommodation);
    setGalleryIndex(0);
    setReviewBody("");
    setReviewRating(5);
    fetch(`/api/accommodations/${accommodation.id}/reviews`).then(r => r.ok ? r.json() : []).then(setReviews).catch(() => setReviews([]));
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    const token = window.sessionStorage.getItem("sunhost-token");
    if (!token) { setPanel("auth"); setNotice("Entre para avaliar esta hospedagem."); return; }
    if (!selectedAccommodation || reviewBody.trim().length < 3) return;
    const response = await fetch(`/api/accommodations/${selectedAccommodation.id}/reviews`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating: reviewRating, body: reviewBody.trim() }) });
    if (response.ok) { setReviewBody(""); setNotice("Avaliação enviada para moderação."); const next = await fetch(`/api/accommodations/${selectedAccommodation.id}/reviews`); setReviews(next.ok ? await next.json() : []); }
  }

  function applySearch() {
    setActiveFilter("Todos");
    scrollTo("acomodacoes");
    const formattedDate = selectedDate
      ? selectedDate.split("-").reverse().join("/")
      : "";
    setNotice(
      `Mostrando opções para ${guestCount} ${guestCount === 1 ? "hóspede" : "hóspedes"}${formattedDate ? ` a partir de ${formattedDate}` : ""}.`
    );
  }

  function redeemReward(reward: CivicReward) {
    if (claimedRewards.includes(reward.id)) {
      setNotice("Este benefício já está reservado neste dispositivo.");
      return;
    }
    if (civicBalance < reward.points) {
      setNotice(
        `Faltam ${reward.points - civicBalance} pontos para liberar este desconto.`
      );
      return;
    }
    setCivicBalance(current => current - reward.points);
    setClaimedRewards(current => [...current, reward.id]);
    setNotice(
      `${reward.title} reservado para sua próxima hospedagem elegível.`
    );
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = authForm.email.trim().toLowerCase();
    if (!email || !authForm.password) {
      setNotice("Preencha e-mail e senha para continuar.");
      return;
    }
    if (
      authMode === "signup" &&
      (!authForm.name.trim() || authForm.password.length < 6)
    ) {
      setNotice(
        "Informe seu nome e use uma senha com pelo menos 6 caracteres."
      );
      return;
    }
    try {
      const response = await fetch(
        `/api/auth/${authMode === "login" ? "login" : "signup"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            authMode === "login"
              ? { email, password: authForm.password }
              : {
                  name: authForm.name.trim(),
                  email,
                  password: authForm.password,
                }
          ),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || "Não foi possível continuar.");
        return;
      }
      setCurrentUser(data.user);
      window.sessionStorage.setItem(
        "sunhost-sessao",
        JSON.stringify(data.user)
      );
      window.sessionStorage.setItem("sunhost-token", data.token);
      const submissions = await fetch("/api/submissions", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (submissions.ok) setSubmittedAccommodations(await submissions.json());
      setAuthForm({ name: "", email: "", password: "" });
      setPanel(data.user.role === "admin" ? "admin" : "account");
      setNotice(
        data.user.role === "admin"
          ? "Painel administrativo aberto."
          : `Olá, ${data.user.name}. Sua conta está ativa.`
      );
    } catch {
      setNotice(
        "Servidor indisponível. Confira o PostgreSQL e tente novamente."
      );
    }
  }

  function logout() {
    setCurrentUser(null);
    window.sessionStorage.removeItem("sunhost-sessao");
    window.sessionStorage.removeItem("sunhost-token");
    setPanel(null);
    setNotice("Sessão encerrada neste navegador.");
  }

  async function submitAccommodation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser || currentUser.role !== "user") return;
    if (
      !publishForm.title.trim() ||
      !publishForm.district.trim() ||
      !publishForm.price ||
      !publishForm.description.trim()
    ) {
      setNotice(
        "Preencha título, bairro, preço e descrição para enviar o anúncio."
      );
      return;
    }
    try {
      const token = window.sessionStorage.getItem("sunhost-token") || "";
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...publishForm,
          price: Number(publishForm.price),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || "Não foi possível enviar.");
        return;
      }
      const list = await fetch("/api/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (list.ok) setSubmittedAccommodations(await list.json());
      setPublishForm({
        title: "",
        district: "",
        price: "",
        description: "",
        imageUrl: "",
      });
      setPanel("account");
      setNotice("Acomodação enviada para análise do administrador.");
    } catch {
      setNotice("Servidor indisponível. Tente novamente.");
    }
  }

  async function moderateAccommodation(
    id: number,
    status: "approved" | "rejected"
  ) {
    const token = window.sessionStorage.getItem("sunhost-token") || "";
    const response = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setSubmittedAccommodations(current =>
        current.map(item =>
          item.id === id
            ? {
                ...item,
                status,
                moderationNote:
                  status === "approved"
                    ? "Aprovado para exibição."
                    : "Rejeitado pela moderação.",
              }
            : item
        )
      );
      setNotice(
        status === "approved"
          ? "Acomodação aprovada e publicada."
          : "Acomodação rejeitada."
      );
    }
  }
  async function removeModeratedAccommodation(id: number) {
    const response = await fetch(`/api/submissions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${window.sessionStorage.getItem("sunhost-token") || ""}`,
      },
    });
    if (response.ok) {
      setSubmittedAccommodations(current =>
        current.filter(item => item.id !== id)
      );
      setRemovedAccommodationIds(current =>
        Array.from(new Set([...current, id]))
      );
      setNotice("Acomodação removida da vitrine.");
    }
  }
  function removeModeratedPhoto(accommodationId: number, imageIndex: number) {
    setSubmittedAccommodations(current =>
      current.map(item =>
        item.id === accommodationId
          ? {
              ...item,
              images: item.images.filter((_, index) => index !== imageIndex),
            }
          : item
      )
    );
    setNotice("Foto removida da visualização local.");
  }

  return (
    <div className="sunhost-app">
      <header className="topbar">
        <a
          className="brand"
          href="#inicio"
          aria-label="SunHost Floripa, ir para o início"
        >
          <span className="brand-mark">
            <img src="/assets/sunhost-symbol_64f5c7ec.png" alt="" />
          </span>
          <span className="brand-name">
            SunHost<span>Floripa</span>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          <button onClick={() => scrollTo("acomodacoes")}>Explorar</button>
          <button onClick={() => scrollTo("beneficios")}>
            Pontos & benefícios
          </button>
          <button onClick={() => setFavoritesOpen(true)}>
            Favoritos{" "}
            {favorites.length > 0 && (
              <span className="nav-count">{favorites.length}</span>
            )}
          </button>
        </nav>

        <div className="topbar-actions">
          <Button
            className="collection-button"
            onClick={() => setFavoritesOpen(true)}
          >
            Sua coleção <Heart size={15} />
          </Button>
          <button
            className="account-button"
            onClick={() =>
              setPanel(
                currentUser
                  ? currentUser.role === "admin"
                    ? "admin"
                    : "account"
                  : "auth"
              )
            }
            aria-label={
              currentUser
                ? `Abrir conta de ${currentUser.name}`
                : "Entrar ou criar conta"
            }
          >
            {currentUser?.role === "admin" ? (
              <ShieldCheck size={17} />
            ) : (
              <UserRound size={17} />
            )}
            <span>
              {currentUser ? currentUser.name.split(" ")[0] : "Entrar"}
            </span>
          </button>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(current => !current)}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button
              onClick={() => {
                scrollTo("acomodacoes");
                setMobileMenuOpen(false);
              }}
            >
              Explorar estadias
            </button>
            <button
              onClick={() => {
                scrollTo("beneficios");
                setMobileMenuOpen(false);
              }}
            >
              Pontos & benefícios
            </button>
            <button
              onClick={() => {
                setFavoritesOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              Meus favoritos
            </button>
            <button
              onClick={() => {
                setPanel(
                  currentUser
                    ? currentUser.role === "admin"
                      ? "admin"
                      : "account"
                    : "auth"
                );
                setMobileMenuOpen(false);
              }}
            >
              {currentUser ? "Minha conta" : "Entrar ou criar conta"}
            </button>
          </div>
        )}
      </header>

      {notice && (
        <div className="notice-region" role="status" aria-live="polite">
          <div className="notice">
            <Check size={17} aria-hidden="true" />
            <span>{notice}</span>
            <button
              className="notice-dismiss"
              onClick={() => setNotice("")}
              aria-label="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main>
        <section className="hero" id="inicio">
          {heroSlides.map((slide, index) => (
            <img
              className={`hero-image ${heroIndex === index ? "is-active" : ""}`}
              src={slide.image}
              alt=""
              aria-hidden="true"
              key={slide.image}
            />
          ))}
          <div className="hero-overlay" />
          <div className="hero-copy">
            <span className="eyebrow">
              <Sun size={15} /> hospedagens com propósito
            </span>
            <h1>
              Explore <em>Floripa</em> com a SunHost.
            </h1>
            <p>
              Espaços locais, bairros com personalidade e uma estadia que também
              devolve algo para a cidade.
            </p>
          </div>

          <div
            className="hero-photo-note"
            aria-label={`Foto atual: ${activeHeroSlide.place}, ${activeHeroSlide.caption}`}
          >
            <div>
              <MapPin size={14} />
              <strong>{activeHeroSlide.place}</strong>
              <span>{activeHeroSlide.caption}</span>
            </div>
            <div className="hero-progress" aria-hidden="true">
              {heroSlides.map((slide, index) => (
                <i
                  className={heroIndex === index ? "active" : ""}
                  key={slide.place}
                />
              ))}
            </div>
          </div>

          <div className="search-dock" aria-label="Buscar acomodações">
            <label className="search-field destination-field">
              <MapPin size={19} />
              <span>
                <small>Destino</small>
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Para onde em Floripa?"
                />
              </span>
            </label>
            <label className="search-field date-field">
              <CalendarDays size={19} />
              <span>
                <small>Datas</small>
                  <input
                    type="date"
                    value={selectedDate}
                    onClick={event => {
                      const picker = event.currentTarget as HTMLInputElement & {
                        showPicker?: () => void;
                      };
                      picker.showPicker?.();
                    }}
                    onChange={event => setSelectedDate(event.target.value)}
                    aria-label="Data de chegada"
                  />
              </span>
            </label>
            <div className="search-field guests-field">
              <UsersRound size={19} />
              <span>
                <small>Viajantes</small>
                <strong>
                  {guestCount} {guestCount === 1 ? "hóspede" : "hóspedes"}
                </strong>
              </span>
              <div
                className="guest-stepper"
                aria-label="Quantidade de hóspedes"
              >
                <button
                  onClick={() =>
                    setGuestCount(current => Math.max(1, current - 1))
                  }
                  aria-label="Diminuir hóspedes"
                >
                  −
                </button>
                <button
                  onClick={() =>
                    setGuestCount(current => Math.min(8, current + 1))
                  }
                  aria-label="Aumentar hóspedes"
                >
                  +
                </button>
              </div>
            </div>
            <button className="search-submit" onClick={applySearch}>
              <Search size={20} />
              <span>Buscar</span>
            </button>
          </div>
        </section>

        <section className="explore-section" id="acomodacoes">
          <div className="section-heading explore-heading">
            <div>
              <span className="eyebrow dark">
                <Compass size={15} /> descubra o seu ritmo
              </span>
              <h2>
                Seu ponto de partida, <em>com mais contexto.</em>
              </h2>
              <span className="section-motif" aria-hidden="true">
                <i />
                <Waves size={17} />
              </span>
            </div>
            <p>
              Cada anúncio muda de foto automaticamente a cada cinco segundos.
              Abra a estadia para explorar a galeria inteira.
            </p>
          </div>

          <div className="filter-row" aria-label="Filtros de acomodações">
            <div className="filter-scroll">
              {filters.map(filter => (
                <button
                  key={filter}
                  className={`filter-chip ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={activeFilter === filter}
                >
                  {filter === "Todos" && <SlidersHorizontal size={15} />}
                  {filter}
                </button>
              ))}
            </div>
            <button
              className="filter-more"
              onClick={() => {
                setQuery("");
                setActiveFilter("Todos");
                setNotice("Busca e filtros redefinidos.");
              }}
            >
              <SlidersHorizontal size={16} /> Limpar filtros
            </button>
          </div>

          <div
            className={`accommodation-grid accommodation-grid--${visibleAccommodations.length}`}
          >
            {visibleAccommodations.map((accommodation, index) => {
              const isFavorite = favorites.includes(accommodation.id);
              const activeImage = cardSlideIndex[accommodation.id] || 0;
              return (
                <article
                  className={`stay-card stay-card-${index + 1}`}
                  key={accommodation.id}
                  onMouseEnter={() => setPausedCardId(accommodation.id)}
                  onMouseLeave={() => setPausedCardId(null)}
                >
                  <button
                    className="stay-image"
                    onClick={() => openAccommodation(accommodation)}
                    aria-label={`Abrir fotos e detalhes de ${accommodation.title}`}
                  >
                    {accommodation.images.map((image, imageIndex) => (
                      <img
                        className={
                          activeImage === imageIndex ? "is-active" : ""
                        }
                        src={image}
                        alt=""
                        aria-hidden="true"
                        key={image}
                      />
                    ))}
                    <span className={`district-label ${accommodation.accent}`}>
                      {accommodation.district}
                    </span>
                    <span className="image-arrow">
                      <Images size={18} />
                    </span>
                    <span className="local-note">
                      <Waves size={12} /> {accommodation.localNote}
                    </span>
                    <span className="card-progress" aria-hidden="true">
                      {accommodation.images.map((image, imageIndex) => (
                        <i
                          className={activeImage === imageIndex ? "active" : ""}
                          key={image}
                        />
                      ))}
                    </span>
                  </button>
                  <button
                    className={`favorite-button ${isFavorite ? "saved" : ""}`}
                    onClick={() => toggleFavorite(accommodation.id)}
                    aria-label={
                      isFavorite
                        ? "Remover dos favoritos"
                        : "Salvar nos favoritos"
                    }
                    aria-pressed={isFavorite}
                  >
                    <Heart
                      size={18}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                  <div className="stay-content">
                    <div className="stay-meta">
                      <span>{accommodation.category}</span>
                      <span>·</span>
                      <span className="host-badge">Anfitrião</span>
                      <span>·</span>
                      <span>Até {accommodation.guests} pessoas</span>
                    </div>
                    <button
                      className="stay-title"
                      onClick={() => openAccommodation(accommodation)}
                    >
                      {accommodation.title}
                    </button>
                    <div className="stay-footer">
                      <p>
                        <strong>R$ {accommodation.price}</strong>{" "}
                        <span>/ noite</span>
                      </p>
                      <span className="civic-points">
                        <Sparkles size={14} /> {accommodation.points} pts
                      </span>
                    </div>
                    <button
                      className="review-state"
                      onClick={() => openAccommodation(accommodation)}
                    >
                      <Images size={15} /> Ver fotos e comentários{" "}
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleAccommodations.length === 0 && (
            <div className="empty-search">
              <Search size={23} />
              <div>
                <strong>Nenhuma estadia apareceu com essa busca.</strong>
                <p>
                  Experimente explorar todos os bairros ou limpar o destino.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveFilter("Todos");
                }}
              >
                Limpar busca
              </button>
            </div>
          )}
        </section>

        <section className="impact-section" id="impacto">
          <div className="impact-art">
            <img
              src="/assets/floripa-ponte-hercilio-luz_d11d4d11.jpg"
              alt="Ponte Hercílio Luz em Florianópolis"
            />
            <span className="island-seal">
              <i />
              <Waves size={16} /> Ilha em movimento
            </span>
          </div>
          <div className="impact-copy">
            <span className="eyebrow dark">
              <Waves size={15} /> propósito SunHost
            </span>
            <h2>
              Uma estadia pode deixar <em>boas marcas.</em>
            </h2>
            <p>
              A SunHost conecta viajantes, anfitriões e negócios locais em um ecossistema de turismo mais responsável. Cada hospedagem ajuda a movimentar a economia da ilha e transforma a viagem em boas marcas para Florianópolis.
            </p>
            <div className="impact-steps">
              <div>
                <span>01</span>
                <p>Escolha uma hospedagem com a cara da sua viagem.</p>
              </div>
              <div>
                <span>02</span>
                <p>Veja os pontos previstos antes de decidir.</p>
              </div>
              <div>
                <span>03</span>
                <p>Troque seu saldo por um desconto em outra estadia.</p>
              </div>
            </div>
            <button
              className="text-link"
              onClick={() => scrollTo("beneficios")}
            >
              Ver descontos disponíveis <ArrowUpRight size={17} />
            </button>
          </div>
        </section>

        <section className="rewards-section" id="beneficios">
          <div className="rewards-heading">
            <div>
              <span className="eyebrow dark">
                <Ticket size={15} /> pontos cívicos, benefícios diretos
              </span>
              <h2>
                Fique na ilha. <em>Volte com desconto.</em>
              </h2>
              <span className="section-motif" aria-hidden="true">
                <i />
                <Waves size={17} />
              </span>
            </div>
            <p>
              O saldo demonstra como anfitriões, viajantes e a comunidade podem participar de um ciclo local de benefícios.
            </p>
          </div>
          <div className="rewards-layout">
            <aside className="wallet-card" aria-label="Saldo de Pontos Cívicos">
              <span className="wallet-icon">
                <span className="wallet-motif" aria-hidden="true">
                  <i />
                  <Waves size={16} />
                </span>
              </span>
              <small>seu saldo local</small>
              <strong>
                {civicBalance}
                <em> pts</em>
              </strong>
              <p>
                Estadias elegíveis podem render de 50 a 100 pontos. O saldo é
                salvo apenas neste navegador.
              </p>
              <div className="wallet-actions">
                <button
                  onClick={() =>
                    setNotice(
                      "Em reservas reais, cada estadia elegível poderá creditar de 50 a 100 Pontos Cívicos."
                    )
                  }
                >
                  Como acumular <ArrowUpRight size={16} />
                </button>
                <button
                  className="reset-points"
                  onClick={() => {
                    setCivicBalance(250);
                    setClaimedRewards([]);
                    setNotice(
                      "Saldo demonstrativo restaurado para 250 pontos."
                    );
                  }}
                >
                  Restaurar demonstração
                </button>
              </div>
            </aside>
            <div className="reward-grid">
              {civicRewards.map(reward => {
                const claimed = claimedRewards.includes(reward.id);
                const available = civicBalance >= reward.points;
                return (
                  <button
                    className={`reward-card ${claimed ? "claimed" : ""}`}
                    onClick={() => redeemReward(reward)}
                    key={reward.id}
                    disabled={claimed}
                  >
                    <span className="reward-points">
                      <Sparkles size={13} /> {reward.points} pontos
                    </span>
                    <strong>R$ {reward.amount}</strong>
                    <p>
                      {reward.title}
                      <span>{reward.detail}</span>
                    </p>
                    <small>
                      {claimed
                        ? "Benefício reservado"
                        : available
                          ? "Resgatar desconto"
                          : `Faltam ${reward.points - civicBalance} pontos`}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="trip-strip">
          <div className="trip-icon">
            <Heart size={24} />
          </div>
          <div>
            <span className="eyebrow dark">sua viagem, no seu ritmo</span>
            <h2>
              As melhores escolhas ficam <em>por perto.</em>
            </h2>
          </div>
          <Button
            className="coral-button"
            onClick={() => setFavoritesOpen(true)}
          >
            Ver meus favoritos <ArrowUpRight size={17} />
          </Button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">
            <img src="/assets/sunhost-symbol_64f5c7ec.png" alt="" />
          </span>
          <span className="brand-name">
            SunHost<span>Floripa</span>
          </span>
        </a>
        <p>Uma maneira mais local de escolher onde ficar.</p>
        <div className="footer-tags">
          <span>Feito para Floripa</span>
          <span>Hospedagem com propósito</span>
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Navegação rápida">
        <button onClick={() => scrollTo("inicio")}>
          <Sun size={19} />
          <span>Início</span>
        </button>
        <button onClick={() => scrollTo("acomodacoes")}>
          <Compass size={19} />
          <span>Explorar</span>
        </button>
        <button
          onClick={() => setFavoritesOpen(true)}
          className={favorites.length > 0 ? "has-favorites" : ""}
        >
          <Heart
            size={19}
            fill={favorites.length > 0 ? "currentColor" : "none"}
          />
          <span>Salvos</span>
        </button>
        <button onClick={() => scrollTo("beneficios")}>
          <Sparkles size={19} />
          <span>Pontos</span>
        </button>
      </nav>

      <Dialog
        open={Boolean(selectedAccommodation)}
        onOpenChange={open => !open && setSelectedAccommodation(null)}
      >
        {selectedAccommodation && (
          <DialogContent className="stay-dialog" showCloseButton={false}>
            <DialogTitle className="sr-only">
              Detalhes de {selectedAccommodation.title}
            </DialogTitle>
            <button
              className="dialog-close"
              onClick={() => setSelectedAccommodation(null)}
              aria-label="Fechar detalhes"
            >
              <X size={20} />
            </button>
            <div className="dialog-gallery">
              <div className="dialog-image-stage">
                <img
                  src={selectedAccommodation.images[galleryIndex]}
                  alt={`${selectedAccommodation.title}, foto ${galleryIndex + 1}`}
                />
                <span>{selectedAccommodation.district}</span>
                <small>
                  <Images size={14} /> {galleryIndex + 1} de{" "}
                  {selectedAccommodation.images.length}
                </small>
              </div>
              <div className="gallery-controls" aria-label="Galeria de fotos">
                <button
                  className="gallery-arrow"
                  onClick={() =>
                    setGalleryIndex(
                      current =>
                        (current - 1 + selectedAccommodation.images.length) %
                        selectedAccommodation.images.length
                    )
                  }
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="gallery-thumbnails">
                  {selectedAccommodation.images.map((image, imageIndex) => (
                    <button
                      className={galleryIndex === imageIndex ? "active" : ""}
                      onClick={() => setGalleryIndex(imageIndex)}
                      aria-label={`Ver foto ${imageIndex + 1}`}
                      aria-pressed={galleryIndex === imageIndex}
                      key={image}
                    >
                      <img src={image} alt="" />
                    </button>
                  ))}
                </div>
                <button
                  className="gallery-arrow"
                  onClick={() =>
                    setGalleryIndex(
                      current =>
                        (current + 1) % selectedAccommodation.images.length
                    )
                  }
                  aria-label="Próxima foto"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="dialog-content">
              <div className="dialog-title-row">
                <div>
                  <p>
                    {selectedAccommodation.category} ·{" "}
                    {selectedAccommodation.location}
                  </p>
                  <h2>{selectedAccommodation.title}</h2>
                </div>
                <button
                  className={`favorite-button dialog-favorite ${favorites.includes(selectedAccommodation.id) ? "saved" : ""}`}
                  onClick={() => toggleFavorite(selectedAccommodation.id)}
                  aria-label="Alternar favorito"
                >
                  <Heart
                    size={19}
                    fill={
                      favorites.includes(selectedAccommodation.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              </div>
              <p className="dialog-description">
                {selectedAccommodation.description}
              </p>
              <div className="feature-grid">
                <span>
                  <UsersRound size={17} /> Até {selectedAccommodation.guests}{" "}
                  hóspedes
                </span>
                <span>
                  <BedDouble size={17} /> {selectedAccommodation.beds}{" "}
                  {selectedAccommodation.beds === 1 ? "cama" : "camas"}
                </span>
                <span>
                  <Wifi size={17} /> Wi‑Fi disponível
                </span>
                <span>
                  <Moon size={17} /> Check-in a combinar
                </span>
              </div>
              <div className="dialog-section">
                <div className="dialog-section-head">
                  <h3>O que este espaço oferece</h3>
                  <span className="civic-points">
                    <Sparkles size={14} /> {selectedAccommodation.points} pts
                    por estadia
                  </span>
                </div>
                <div className="amenity-list">
                  {selectedAccommodation.amenities.map(amenity => (
                    <span key={amenity}>
                      <Check size={14} /> {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="comments-section">
                <div className="reviews-heading"><span className="comment-icon"><MessageCircle size={18} /></span><div><h3>Avaliações</h3><p>{reviews.length ? `${reviews.length} avaliação(ões) publicada(s)` : "Ainda não há avaliações"}</p></div></div>
                <div className="reviews-list">{reviews.map(review => <article key={review.id}><div className="stars" aria-label={`${review.rating} de 5 estrelas`}>{[1,2,3,4,5].map(star => <span key={star} className={star <= review.rating ? "on" : ""}>★</span>)}</div><strong>{review.userName}</strong><p>{review.body}</p></article>)}</div>
                <form className="review-form" onSubmit={submitReview}><label>Classificação<div className="rating-picker">{[1,2,3,4,5].map(star => <button type="button" key={star} className={star <= reviewRating ? "on" : ""} onClick={() => setReviewRating(star)} aria-label={`${star} estrelas`}>★</button>)}</div></label><textarea value={reviewBody} onChange={event => setReviewBody(event.target.value)} placeholder="Conte como foi sua experiência..." rows={3} /><button className="text-link" type="submit">Publicar avaliação <ArrowUpRight size={16} /></button></form>
              </div>
              <div className="dialog-action">
                <div>
                  <strong>Salve para comparar</strong>
                  <p>Seus favoritos ficam armazenados neste dispositivo.</p>
                </div>
                <Button
                  className="coral-button"
                  onClick={() => toggleFavorite(selectedAccommodation.id)}
                >
                  {favorites.includes(selectedAccommodation.id)
                    ? "Remover dos favoritos"
                    : "Salvar nos favoritos"}{" "}
                  <Heart size={16} />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={favoritesOpen} onOpenChange={setFavoritesOpen}>
        <DialogContent className="favorites-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">Meus favoritos</DialogTitle>
          <button
            className="dialog-close"
            onClick={() => setFavoritesOpen(false)}
            aria-label="Fechar favoritos"
          >
            <X size={20} />
          </button>
          <span className="eyebrow dark">
            <Heart size={15} /> sua coleção
          </span>
          <h2>
            Estadias que você quer <em>guardar.</em>
          </h2>
          {favoriteAccommodations.length > 0 ? (
            <div className="saved-list">
              {favoriteAccommodations.map(accommodation => (
                <button
                  key={accommodation.id}
                  onClick={() => {
                    setFavoritesOpen(false);
                    openAccommodation(accommodation);
                  }}
                >
                  <img src={accommodation.images[0]} alt="" />
                  <span>
                    <strong>{accommodation.title}</strong>
                    <small>
                      {accommodation.district} · R$ {accommodation.price}/noite
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-favorites">
              <Heart size={26} />
              <strong>Sua coleção está vazia.</strong>
              <p>
                Toque no coração de uma acomodação para guardar ideias de viagem
                aqui.
              </p>
              <button
                onClick={() => {
                  setFavoritesOpen(false);
                  scrollTo("acomodacoes");
                }}
              >
                Explorar acomodações
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={panel !== null}
        onOpenChange={open => !open && setPanel(null)}
      >
        <DialogContent className="account-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">Painel SunHost</DialogTitle>
          <button
            className="dialog-close"
            onClick={() => setPanel(null)}
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>

          {panel === "auth" && (
            <div className="panel-body">
              <span className="eyebrow dark">
                <LogIn size={15} /> acesso sunhost
              </span>
              <h2>
                {authMode === "login" ? (
                  <>
                    Entre para cuidar da sua <em>viagem.</em>
                  </>
                ) : (
                  <>
                    Crie sua conta na <em>ilha.</em>
                  </>
                )}
              </h2>
              <p className="panel-lead">
                Salve estadias, acompanhe seus Pontos Cívicos e publique um
                espaço para análise.
              </p>
              <form className="panel-form" onSubmit={handleAuthSubmit}>
                {authMode === "signup" && (
                  <label>
                    Seu nome
                    <input
                      value={authForm.name}
                      onChange={event =>
                        setAuthForm({ ...authForm, name: event.target.value })
                      }
                      placeholder="Como podemos chamar você?"
                      autoComplete="name"
                    />
                  </label>
                )}
                <label>
                  E-mail
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={event =>
                      setAuthForm({ ...authForm, email: event.target.value })
                    }
                    placeholder="voce@email.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={event =>
                      setAuthForm({ ...authForm, password: event.target.value })
                    }
                    placeholder="Mínimo de 6 caracteres"
                    minLength={6}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                    required
                  />
                </label>
                <Button type="submit" className="coral-button panel-submit">
                  {authMode === "login" ? "Entrar" : "Criar conta"}{" "}
                  {authMode === "login" ? (
                    <LogIn size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                </Button>
              </form>
              <div className="demo-note">
                <ShieldCheck size={17} />
                <p>
                  <strong>Admin demonstrativo</strong>
                  <span>
                    {DEMO_ADMIN_EMAIL} · senha: {DEMO_ADMIN_PASSWORD}
                  </span>
                </p>
              </div>
              <button
                className="panel-switch"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "signup" : "login")
                }
              >
                {authMode === "login"
                  ? "Ainda não tenho conta"
                  : "Já tenho uma conta"}
              </button>
            </div>
          )}

          {panel === "account" && currentUser?.role === "user" && (
            <div className="panel-body">
              <span className="eyebrow dark">
                <UserRound size={15} /> minha conta
              </span>
              <h2>
                Olá, <em>{currentUser.name.split(" ")[0]}.</em>
              </h2>
              <p className="panel-lead">
                Sua sessão é local neste navegador. Aqui você acompanha os
                espaços que enviou para análise.
              </p>
              <div className="account-actions">
                <Button
                  className="coral-button"
                  onClick={() => setPanel("publish")}
                >
                  <Plus size={16} /> Publicar acomodação
                </Button>
                <button className="text-button" onClick={logout}>
                  <LogOut size={16} /> Sair
                </button>
              </div>
              <div className="submission-list">
                <h3>Meus envios</h3>
                {submittedAccommodations.filter(
                  item => item.ownerId === currentUser.id
                ).length === 0 ? (
                  <div className="panel-empty">
                    <FileWarning size={22} />
                    <p>Nenhuma acomodação enviada ainda.</p>
                  </div>
                ) : (
                  submittedAccommodations
                    .filter(item => item.ownerId === currentUser.id)
                    .map(item => (
                      <div className="submission-row" key={item.id}>
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {item.district} · R$ {item.price}/noite
                          </span>
                        </div>
                        <small className={`status-pill ${item.status}`}>
                          {item.status === "pending"
                            ? "Em análise"
                            : item.status === "approved"
                              ? "Aprovada"
                              : "Rejeitada"}
                        </small>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {panel === "publish" && currentUser?.role === "user" && (
            <div className="panel-body">
              <span className="eyebrow dark">
                <Plus size={15} /> publicar espaço
              </span>
              <h2>
                Conte a história do seu <em>canto.</em>
              </h2>
              <p className="panel-lead">
                O envio fica pendente até a revisão do administrador. Nesta
                demonstração, a foto pode ser uma URL pública.
              </p>
              <form className="panel-form" onSubmit={submitAccommodation}>
                <label>
                  Nome da acomodação
                  <input
                    value={publishForm.title}
                    onChange={event =>
                      setPublishForm({
                        ...publishForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="Ex.: Casa com vista para a Lagoa"
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    Bairro
                    <input
                      value={publishForm.district}
                      onChange={event =>
                        setPublishForm({
                          ...publishForm,
                          district: event.target.value,
                        })
                      }
                      placeholder="Ex.: Campeche"
                      required
                    />
                  </label>
                  <label>
                    Preço por noite
                    <input
                      type="number"
                      min="1"
                      value={publishForm.price}
                      onChange={event =>
                        setPublishForm({
                          ...publishForm,
                          price: event.target.value,
                        })
                      }
                      placeholder="280"
                      required
                    />
                  </label>
                </div>
                <label>
                  Descrição
                  <textarea
                    value={publishForm.description}
                    onChange={event =>
                      setPublishForm({
                        ...publishForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="O que torna este espaço especial?"
                    rows={4}
                    required
                  />
                </label>
                <label>
                  URL da foto principal{" "}
                  <span className="optional-label">opcional</span>
                  <input
                    type="url"
                    value={publishForm.imageUrl}
                    onChange={event =>
                      setPublishForm({
                        ...publishForm,
                        imageUrl: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </label>
                <div className="account-actions">
                  <Button type="submit" className="coral-button panel-submit">
                    Enviar para análise <ArrowUpRight size={16} />
                  </Button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setPanel("account")}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </div>
          )}

          {panel === "admin" && currentUser?.role === "admin" && (
            <div className="panel-body admin-panel">
              <span className="eyebrow dark">
                <ShieldCheck size={15} /> área protegida demonstrativa
              </span>
              <h2>
                Painel de <em>moderação.</em>
              </h2>
              <p className="panel-lead">
                Revise anúncios enviados, fotos e comentários antes que sejam
                tratados como conteúdo público.
              </p>
              <div className="moderation-stats">
                <span>
                  <strong>
                    {
                      submittedAccommodations.filter(
                        item => item.status === "pending"
                      ).length
                    }
                  </strong>{" "}
                  pendentes
                </span>
                <span>
                  <strong>
                    {
                      submittedAccommodations.filter(
                        item => item.status === "approved"
                      ).length
                    }
                  </strong>{" "}
                  aprovados
                </span>
                <span>
                  <strong>{removedAccommodationIds.length}</strong> removidos
                </span>
              </div>
              <div className="moderation-tabs">
                <button
                  className={moderationTab === "accommodations" ? "active" : ""}
                  onClick={() => setModerationTab("accommodations")}
                >
                  Acomodações
                </button>
                <button
                  className={moderationTab === "comments" ? "active" : ""}
                  onClick={() => setModerationTab("comments")}
                >
                  Comentários
                </button>
                <button
                  className={moderationTab === "photos" ? "active" : ""}
                  onClick={() => setModerationTab("photos")}
                >
                  Fotos
                </button>
              </div>
              {moderationTab === "accommodations" && (
                <div className="moderation-list">
                  {submittedAccommodations.length === 0 ? (
                    <div className="panel-empty">
                      <FileWarning size={22} />
                      <p>Nenhuma acomodação enviada para revisar.</p>
                    </div>
                  ) : (
                    submittedAccommodations.map(item => (
                      <div className="moderation-card" key={item.id}>
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {item.ownerName} · {item.district} · R$ {item.price}
                            /noite
                          </span>
                          <small>{item.description}</small>
                        </div>
                        <div className="moderation-actions">
                          <span className={`status-pill ${item.status}`}>
                            {item.status === "pending"
                              ? "Em análise"
                              : item.status === "approved"
                                ? "Aprovada"
                                : "Rejeitada"}
                          </span>
                          {item.status !== "approved" && (
                            <button
                              onClick={() =>
                                moderateAccommodation(item.id, "approved")
                              }
                              aria-label="Aprovar acomodação"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {item.status !== "rejected" && (
                            <button
                              onClick={() =>
                                moderateAccommodation(item.id, "rejected")
                              }
                              aria-label="Rejeitar acomodação"
                            >
                              <FileWarning size={16} />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              removeModeratedAccommodation(item.id)
                            }
                            aria-label="Remover acomodação"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {moderationTab === "comments" && (
                <div className="panel-empty moderation-empty">
                  <MessageCircle size={24} />
                  <strong>Nenhum comentário publicado.</strong>
                  <p>
                    Comentários só entram nesta fila depois de uma estadia
                    verificada. Assim, nenhum depoimento fictício é exibido.
                  </p>
                </div>
              )}
              {moderationTab === "photos" && (
                <div className="photo-moderation-grid">
                  {submittedAccommodations.flatMap(item =>
                    item.images.map((image, imageIndex) => ({
                      item,
                      image,
                      imageIndex,
                    }))
                  ).length === 0 ? (
                    <div className="panel-empty moderation-empty">
                      <ImageOff size={24} />
                      <strong>Nenhuma foto enviada.</strong>
                      <p>
                        As fotos dos próximos envios aparecerão aqui para
                        revisão.
                      </p>
                    </div>
                  ) : (
                    submittedAccommodations
                      .flatMap(item =>
                        item.images.map((image, imageIndex) => ({
                          item,
                          image,
                          imageIndex,
                        }))
                      )
                      .map(({ item, image, imageIndex }) => (
                        <div
                          className="moderation-photo"
                          key={`${item.id}-${imageIndex}`}
                        >
                          <img
                            src={image}
                            alt={`Foto enviada por ${item.ownerName}`}
                          />
                          <div>
                            <span>{item.title}</span>
                            <button
                              onClick={() =>
                                removeModeratedPhoto(item.id, imageIndex)
                              }
                            >
                              <Trash2 size={14} /> Remover foto
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
              <button className="text-button admin-logout" onClick={logout}>
                <LogOut size={16} /> Encerrar sessão admin
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
