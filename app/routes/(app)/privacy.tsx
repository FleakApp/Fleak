import type { MetaFunction } from "@remix-run/node";
import ReactMarkdown from "react-markdown";

import { siteConfig } from "@/config/site";

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.title} - Polityka Prywatności!` }];
};

export default function Index() {
  return (
    <section className="container flex h-full max-w-2xl flex-col justify-center space-y-6">
      <div className="mt-8 space-y-6">
        <h1 className="brand-text text-4xl">Polityka Prywatności</h1>

        <hr />

        <div className="pb-8">
          <ReactMarkdown className="prose dark:prose-invert">
            {`

Witamy na Fleak! Twoja prywatność jest dla nas niezwykle ważna. W niniejszej Polityce Prywatności znajdziesz informacje na temat tego, jakie dane zbieramy, jak je wykorzystujemy, oraz jakie masz prawa związane z przetwarzaniem Twoich danych osobowych. Korzystając z naszej strony, zgadzasz się na warunki opisane w tej Polityce Prywatności.
1. Jakie dane zbieramy?

Podczas korzystania z Fleak możemy zbierać różne rodzaje danych osobowych, w tym:

-   Dane rejestracyjne: takie jak imię, nazwisko, adres e-mail, nazwa użytkownika i hasło, które podajesz podczas tworzenia konta.
-   Dane dotyczące aktywności: informacje na temat tego, jak korzystasz z naszej platformy, w tym przeglądane strony, dodawane posty, polubienia, komentarze i inne interakcje.
-   Dane techniczne: informacje o urządzeniu, z którego korzystasz, adres IP, typ przeglądarki, system operacyjny oraz dane dotyczące połączenia internetowego.

2. Jak wykorzystujemy Twoje dane?

Zebrane dane wykorzystujemy do:

-   Utrzymania i ulepszania serwisu: Twoje dane pomagają nam dostosowywać treści i funkcje strony do Twoich preferencji oraz optymalizować działanie naszej platformy.
-   Personalizacji doświadczenia: na podstawie Twojej aktywności możemy proponować treści, które mogą Cię zainteresować, w tym memy, gify, filmy i inne posty.
-   Komunikacji: możemy wysyłać Ci powiadomienia o nowościach, zmianach na stronie oraz oferty marketingowe, o ile wyrazisz na to zgodę.
-   Bezpieczeństwa: Twoje dane są również wykorzystywane do monitorowania aktywności na stronie, zapobiegania oszustwom oraz ochrony przed nieautoryzowanym dostępem.

3. Udostępnianie danych

Twoje dane osobowe mogą być udostępniane stronom trzecim wyłącznie w następujących sytuacjach:

-  Zgoda użytkownika: Twoje dane mogą być udostępniane podmiotom trzecim, jeżeli wyrazisz na to zgodę.
-  Usługi zewnętrzne: Współpracujemy z dostawcami usług, którzy pomagają nam w utrzymaniu serwisu, np. hostingiem, analityką danych czy marketingiem. Ci dostawcy mogą mieć dostęp do Twoich danych, ale wyłącznie w zakresie niezbędnym do realizacji tych usług.
-  Zgodność z prawem: Możemy udostępnić Twoje dane, jeśli będzie to wymagane przez prawo lub w odpowiedzi na zgodne z prawem żądania organów ścigania.

4. Ochrona danych

Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić Twoje dane przed nieautoryzowanym dostępem, utratą, zmianą lub zniszczeniem. Twoje dane są przechowywane na zabezpieczonych serwerach i dostęp do nich mają tylko upoważnione osoby.

5. Pliki cookies

Fleak wykorzystuje pliki cookies do zbierania danych dotyczących Twojej aktywności na stronie, co pomaga nam ulepszać działanie serwisu i dostosowywać go do Twoich potrzeb. Możesz zarządzać ustawieniami cookies za pomocą ustawień swojej przeglądarki internetowej.

6. Zmiany w Polityce Prywatności

Fleak zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Wszelkie zmiany zostaną opublikowane na tej stronie, a dalsze korzystanie z serwisu po wprowadzeniu zmian oznacza akceptację zaktualizowanej Polityki Prywatności.

7. Kontakt

Jeśli masz jakiekolwiek pytania dotyczące naszej Polityki Prywatności lub chcesz skorzystać ze swoich praw związanych z danymi osobowymi, prosimy o kontakt za pośrednictwem formularza dostępnego na stronie Fleak.

Dziękujemy za zaufanie i cieszymy się, że jesteś częścią naszej społeczności!
`}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
