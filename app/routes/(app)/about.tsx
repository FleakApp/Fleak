import type { MetaFunction } from "@remix-run/node";
import ReactMarkdown from "react-markdown";

import { siteConfig } from "@/config/site";

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.title} - O nas!` }];
};

export default function Index() {
  return (
    <section className="container flex h-full max-w-2xl flex-col justify-center space-y-6">
      <div className="mt-8 space-y-6">
        <h1 className="brand-text text-4xl">O nas</h1>

        <hr />

        <div className="pb-8">
          <ReactMarkdown className="prose dark:prose-invert">
            {`
Witaj na Fleak – Twoim nowym ulubionym miejscu w sieci, gdzie króluje humor, kreatywność, fakty i nieograniczona wolność wypowiedzi! Jesteśmy platformą stworzoną z myślą o wszystkich, którzy kochają dzielić się memami, gifami, filmami i ciekawymi postami, a także komentować i oceniać treści z pełną swobodą.

Na Fleak znajdziesz to, czego potrzebujesz, aby oderwać się od codziennych zmartwień i zanurzyć w świecie internetowego humoru. Nasza społeczność to ludzie którzy wspólnie tworzą i dzielą się najlepszymi treściami, gwarantując dawkę śmiechu a także wiedzy na każdy dzień.

Czym się wyróżniamy? Wolność słowa to nasza główna zasada! Na Fleak możesz wyrażać swoje opinie bez obaw o cenzurę. Cenimy różnorodność myśli i zachęcamy do twórczej ekspresji. Każdy post, mem czy komentarz to miejsce, gdzie możesz być sobą i dzielić się swoją wizją świata w sposób, który najlepiej do Ciebie pasuje.

Twórz, dziel się i oceniaj! U nas masz pełną kontrolę nad tym, co widzisz i czym się dzielisz. Nasza aplikacja umożliwia łatwe dodawanie treści, ocenianie innych postów oraz interakcję z członkami naszej społeczności. Dzięki temu Fleak jest miejscem, które stale się rozwija i dostosowuje do potrzeb swoich użytkowników.

Dołącz do Fleak i stań się częścią społeczności, która nie zna granic, jeśli chodzi o humor i kreatywność. Czekamy na Ciebie!

Fleak – humor, który nie bierze jeńców!
`}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
