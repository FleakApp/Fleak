import ReactMarkdown from "react-markdown";

export default function Index() {
  return (
    <div className="h-full flex-1 flex-col divide-y">
      <div className="relative flex items-center gap-x-3 p-6">
        <div>
          <h2 className="text-4xl font-extrabold">Deploy na vercel</h2>
          <p className="text-sm font-medium">Proces uruchomienia aplikacji </p>
        </div>
      </div>
      <div className="w-full p-6">
        <ReactMarkdown className="prose min-w-full dark:prose-invert">
          {`
### Etap 1

- Logujemy się na [github](https://github.com)
- Przechodzimy pod [github](https://github.com/codewebs-org/viral-app)
- Klikamy w przycisk **use this template** > **create a new repository**
  ![alt text](/image-1.png)
- Wypełniamy pole **Repository name**
- Zaznaczamy pole **Private**
  ![alt text](/image-2.png)
- Klikamy przycisk **Create repository**
  > Repozytorium na github będzie dostępne na życzenie na czas 1h później dostęp zostanie zablokowany.

### Etap 2

- Logujemy się na [neon](https://neon.tech)
- Klikamy przycisk **Create Project** i przechodzimy cały proces
  ![alt text](/image-3.png)
- Przechodzimy do utworzonego projektu i tworzymy bądź wybieramy istniejącą bazę danych

![alt text](/image-4.png)

- Zaznaczamy opcję **Pooled connection** i kopiujemy zawartość **Connection string**

### Etap 3

- Logujemy się na [vercel](https://vercel.com)
- Klikamy przycisk **Add new...** > **Project**
  ![alt text](/image-5.png)
- Wybieramy konto github na które wcześniej utworzyliśmy klon repozytorium, znajdujemy nasze repozytorium i klikamy **Import**
  ![alt text](/image-6.png)
- W Sekcji **Build and Output Settings** w Polu **Install Commant** wpisujemy treść **_pnpm install --no-frozen-lockfile_**

- W Sekcji **Environment Variables** tworzymy odpowiednio ważne klucze (**tylko wersja produkcyjna**)

1. JWT_SECRET 9b9c3e290668d57cdb3081ee10b8639ced1fc63af12afb1b0e09537a3afa689e
2. SESSION_SECRET 565da843e40a0f9de3b500b06891038cd333102ebc204240f8a23cf9276335a0
3. DATABASE_URL **adres bazy danych skopiowonat connection string z neon**

4. CLOUDINARY_CLOUD_NAME **CLOUDINARY CLOUD NAME**
5. CLOUDINARY_API_KEY **CLOUDINARY API KEY**
6. CLOUDINARY_API_SECRET **CLOUDINARY API SECRET**

  ![alt text](/image-7.png)
![alt text](/image-8.png)

- Klikamy deploy

### Etap 4

- Po zakończonej budowie aplikacji klikamy **Continue to Dashboard**
- Następnie **Settings** > **Domains** i wybieramy domenę którą chcemy dodać i klikamy **Add**


## Rejestracja domeny na vercel

### Etap 1

- Logujemy się na [github](https://github.com)
- Przechodzimy pod [vercel](https://vercel.com/account)
- Klikamy w przycisk **Domains**
  ![alt text](/image-9.png)
- Wypełniamy pole **Repository name**
- Klikamy **Add to project** jeśli mamy już domenę lub buy jeśli chcemy kupić na vercel

### Etap 2 (tylko w przypadku ***Add to project***)
- Wybieramy projekt i klikamy **Continue**
  ![alt text](/image-10.png)
- Wpisujemy adres domeny i klikamy **Add**
  ![alt text](/image-11.png)
  - Czekamy na veryfikację domeny
  ![alt text](/image-12.png)

> Proces weryfikacji domeny może potrwać do kilku dni.

> Ważne aby domena miała ustawione rekordy DNS na:
\`\`\`
  ns1.vercel-dns.com
  ns2.vercel-dns.com
\`\`\`
`}
        </ReactMarkdown>
      </div>
    </div>
  );
}
