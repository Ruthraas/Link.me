import type { ProfileData } from "@/core/profile";
import { getTheme } from "@/core/themes";

/**
 * Example pages for the landing showcase. Names and links are invented samples;
 * the round photos are public-domain artworks (credits in CREDITS below).
 */
type Sample = { profile: ProfileData; fact: string };

function sample(
  themeId: string,
  username: string,
  displayName: string,
  bio: string,
  avatar: string,
  links: [string, string][],
  mode: "light" | "dark" = "light",
): ProfileData {
  const theme = getTheme(themeId);
  return {
    username,
    displayName,
    bio,
    avatarUrl: `/samples/${avatar}.webp`,
    themeId,
    mode,
    wallpaperId: theme.wallpaper,
    wallpaperUrl: null,
    buttonStyle: theme.button,
    fontId: theme.font,
    links: links.map(([title, badge], i) => ({ id: `${username}-${i}`, title, href: "#", badge, sensitive: false })),
  };
}

export const SAMPLES: Sample[] = [
  {
    profile: sample("morango", "atelie.flor", "Ateliê Flor", "Buquês de papel feitos à mão em Curitiba. Encomendas abertas até sexta.", "flores", [
      ["Encomendar um buquê", "WA"], ["Vitrine no Instagram", "IG"], ["Como cuidar do seu buquê", ""],
    ]),
    fact: "Tema Morango, wallpaper Corações, fonte Redondinha",
  },
  {
    profile: sample("gatinha", "bia.estrela", "Bia Estrela", "Desenho, café e lives de pintura às quintas, 20h.", "ruysch", [
      ["Live de quinta", "TW"], ["Meus pincéis favoritos", ""], ["Vídeos curtos", "TT"],
    ]),
    fact: "Tema Gatinha, wallpaper Gatinhas, rosa e branco",
  },
  {
    profile: sample("gatinha-noturna", "luna.noite", "Luna", "Unhas, maquiagem e muito preto com rosa. Agenda aberta.", "flores", [
      ["Agendar horário", "WA"], ["Trabalhos recentes", "IG"], ["Tutoriais", "TT"],
    ], "dark"),
    fact: "Tema Gatinha noturna no escuro",
  },
  {
    profile: sample("oceano", "rafa.surf", "Rafa Surf", "Aulas de surf em Itacaré. Prancha inclusa, só traz protetor.", "onda", [
      ["Agendar aula", "WA"], ["Previsão das ondas", ""], ["Canal no YouTube", "YT"],
    ]),
    fact: "Tema Oceano, wallpaper Ondas, botão Arredondado",
  },
  {
    profile: sample("floresta", "trilha.norte", "Trilha Norte", "Guias de trilha na Serra da Mantiqueira. Saídas todo sábado.", "floresta", [
      ["Próximas saídas", ""], ["Grupo no WhatsApp", "WA"], ["Fotos das trilhas", "IG"],
    ], "dark"),
    fact: "Tema Floresta no escuro, wallpaper Camuflado",
  },
  {
    profile: sample("garagem", "oficina77", "Oficina 77", "Restauro de motos antigas. Orçamento pelo WhatsApp.", "moto", [
      ["Pedir orçamento", "WA"], ["Antes e depois", "IG"], ["Peças à venda", ""],
    ], "dark"),
    fact: "Tema Garagem, wallpaper Listras, botão Sombra dura",
  },
  {
    profile: sample("papel", "sebo.da.lu", "Sebo da Lu", "Livros usados com cheiro de livro. Entregamos em São Paulo.", "livros", [
      ["Catálogo do mês", ""], ["Clube do livro", "DC"], ["Fale com a Lu", "@"],
    ]),
    fact: "Tema Papel, sem wallpaper, fonte Elegante",
  },
];

export const CREDITS = [
  { title: "A Bouquet of Flowers", creator: "Clara Peeters", date: "1612", page: "https://commons.wikimedia.org/wiki/File:Clara_Peeters_-_A_Bouquet_of_Flowers_-_2020.22_-_Metropolitan_Museum_of_Art.jpg" },
  { title: "Flowers in a Glass Vase", creator: "Rachel Ruysch", date: "1698", page: "https://commons.wikimedia.org/wiki/File:Rachel_Ruysch_-_Flowers_in_a_Glass_Vase,_St%C3%A4del.jpg" },
  { title: "The Great Wave off Kanagawa", creator: "Katsushika Hokusai", date: "c. 1831", page: "https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg" },
  { title: "A Morning in a Pine Forest", creator: "Ivan Shishkin e Konstantin Savitsky", date: "1889", page: "https://commons.wikimedia.org/wiki/File:Shishkin,_Ivan_-_Morning_in_a_Pine_Forest.jpg" },
  { title: "Motorcycle rally, New Brighton beach, Christchurch", creator: "National Library NZ on The Commons", date: "c. 1920", page: "https://commons.wikimedia.org/wiki/File:Motorcycle_rally,_New_Brighton_beach,_Christchurch,_ca_1920_(3171739119).jpg" },
  { title: "Still-Life with Books", creator: "mestre holandês desconhecido", date: "c. 1628", page: "https://commons.wikimedia.org/wiki/File:17th-century_unknown_painters_-_Still-Life_with_Books_-_WGA23542.jpg" },
];
