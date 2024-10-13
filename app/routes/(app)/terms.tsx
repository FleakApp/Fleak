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
        <h1 className="brand-text text-4xl">Warunki Usługi</h1>

        <hr />

        <div className="pb-8">
          <ReactMarkdown className="prose dark:prose-invert">
            {`
Warunki Usługi

Witamy na Fleak! Cieszymy się, że chcesz stać się częścią naszej dynamicznej społeczności, która żyje humorem bez granic. Przed rozpoczęciem korzystania z naszej platformy, prosimy o zapoznanie się z poniższymi Warunkami Usługi, które regulują korzystanie z Fleak. Korzystanie z naszej strony oznacza, że akceptujesz te warunki w całości.

1. Akceptacja Warunków

Korzystając z Fleak, akceptujesz te Warunki Usługi oraz naszą Politykę Prywatności. Jeżeli nie zgadzasz się z którymkolwiek z tych warunków, prosimy o niekorzystanie z naszej strony.

2. Rejestracja i Konto Użytkownika

Aby w pełni korzystać z funkcji Fleak, możesz być zobowiązany do założenia konta użytkownika. Użytkownik odpowiada za zachowanie poufności swoich danych logowania oraz za wszystkie działania podejmowane na swoim koncie. Zabrania się używania konta innej osoby bez jej wyraźnej zgody.

3. Zamieszczanie Treści

Fleak to platforma, na której możesz dzielić się memami, gifami, filmami i postami. Użytkownicy są w pełni odpowiedzialni za treści, które publikują. Publikując treści na Fleak, zgadzasz się, że nie będą one naruszały praw autorskich, znaków towarowych ani innych praw własności intelektualnej osób trzecich.

4. Odpowiedzialność za Treści

Treści zamieszczane przez użytkowników mogą zawierać materiały o kontrowersyjnym charakterze, w tym czarny humor. Fleak nie ponosi odpowiedzialności za jakiekolwiek treści publikowane przez użytkowników. Zastrzegamy sobie prawo do usuwania treści, które naruszają nasze zasady, w tym treści obraźliwych, nielegalnych lub w inny sposób nieodpowiednich.

5. Prawa Własności Intelektualnej

Wszystkie materiały dostępne na Fleak, w tym logo, grafiki, oprogramowanie i inne elementy chronione prawem, są własnością Fleak lub licencjodawców. Zabrania się kopiowania, dystrybucji, modyfikowania lub jakiegokolwiek innego wykorzystywania tych materiałów bez naszej wyraźnej zgody.

6. Prywatność

Twoja prywatność jest dla nas ważna. Wszystkie dane osobowe zbierane przez Fleak są przetwarzane zgodnie z naszą Polityką Prywatności, która jest dostępna na naszej stronie.

7. Ograniczenie Odpowiedzialności

Fleak nie ponosi odpowiedzialności za jakiekolwiek straty lub szkody wynikające z korzystania z naszej platformy, w tym za utratę danych, przerwy w działaniu serwisu czy inne szkody związane z korzystaniem z Fleak. Użytkownicy korzystają z serwisu na własne ryzyko.

8. Modyfikacje Warunków

Fleak zastrzega sobie prawo do modyfikacji niniejszych Warunków Usługi w dowolnym czasie. Wszelkie zmiany zostaną opublikowane na naszej stronie, a dalsze korzystanie z serwisu będzie oznaczać akceptację zmienionych warunków.

9. Zakończenie Usługi

Fleak może, według własnego uznania, zawiesić lub zakończyć dostęp do serwisu dla dowolnego użytkownika w przypadku naruszenia tych Warunków Usługi lub z innych powodów.

10. Kontakt

Jeśli masz jakiekolwiek pytania dotyczące niniejszych Warunków Usługi, prosimy o kontakt z nami za pomocą formularza kontaktowego dostępnego na stronie Fleak.

Dziękujemy za bycie częścią społeczności Fleak! Baw się dobrze i pamiętaj o odpowiedzialnym korzystaniu z naszej platformy!

`}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
