# AISigner 

AISigner, stajyer/öğrencilerin kısa bir anketle güçlü yönlerini ve seviyelerini belirleyip uygun mentörle eşleştiren; proje havuzundan uygun bir proje atandıktan sonra AI destekli bir öğrenme yol haritası (roadmap) oluşturan açık kaynak bir platformdur.

## Amaç (MVP)
- Öğrencinin kayıt + anket süreci
- AI ile temel profil çıkarımı (seviye / yatkın alanlar)
- Admin’in mentör ataması
- Mentörün proje havuzundan öğrenciye proje ataması
- AI destekli roadmap üretimi ve adımların onaylanması
- GitHub fork/PR akışına dayalı çalışma düzeni

## Database Kurulumu
 
 ### 1. Docker ile PostgreSQL'i Ayağa Kaldır
PostgreSQL veritabanını Docker üzerinden ayağa kaldırmak için:
```
docker compose up -d
```
Veri tabanı çalışıyor mu test etmek için:
```
 docker compose ps 
```

 Başarılı çıktı:
 ```
NAME          COMMAND                  SERVICE    STATUS      PORTS
aisigner_db   "docker-entrypoint.s…"   postgres   Up 5 seconds   0.0.0.0:5432->5432/tcp
```
### 2. Prisma Kurulumu
 Bağımlılıkları yükle
```
npm install prisma --save-dev

npm install @prisma/client
```

Prisma'yı başlat
```
npx prisma init
```

### .env dosyasını düzenle (DATABASE_URL'i ayarla)

``` 
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aisigner?schema=public" 

NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=change_me

```

 ### Schema dosyasını düzenle (models ekle)
 **Mevcut Modeller**

* **User Modeli**
```
 model User {

  id        Int      @id @default(autoincrement())  
  email     String   @unique                        
  name      String?                                 
  password  String  //hashed password
  phone     String?                                 
  role      Role     @default(STUDENT)                 
  createdAt DateTime @default(now())                
  updatedAt DateTime @updatedAt                     
}

enum Role {
  ADMIN
  MENTOR  
  STUDENT
}

```

### 3. Migration Çalıştır

İlk migration'ı oluştur ve uygula ve Prisma Client'i generate et 
```
npx prisma migrate dev --name init

npx prisma generate

```
### 4. Veritabanını Kontrol Et


* Tablolar oluştu mu?
```
docker exec -it aisigner_db psql -U postgres -d aisigner -c "\dt"
```
 * User tablosu yapısı doğru mu?
```
docker exec -it aisigner_db psql -U postgres -d aisigner -c "\d users"
```
 **Prisma Studio ile Görsel Test**

 * http://localhost:5555 adresinde web arayüzü açılacak, users tablosunu görebiliyor musun?
 ```
 npx prisma studio
 ```

**Prisma Client dosyalarının oluştuğunu kontrol et**
```
ls node_modules/.prisma/client/
```
**TypeScript tip dosyalarını kontrol et**
```
ls node_modules/@prisma/client/
``` 
### 5. Test Verisi Ekleme

**Prisma Studio ile görsel olarak**
```
npx prisma studio
```
* +Add record butonuna bas
* verileri gir
* save e bas

**Veya terminalden**
```
docker exec -it aisigner_db psql -U postgres -d aisigner -c "
INSERT INTO \"User\" (email, password, role) 
VALUES ('test@example.com', 'geçici_şifre', 'STUDENT') 
"
``` 
NOT: gerçek projede şifre hashlenmeli

### 6. Eğer Hata Alırsan

1) Docker container'ının çalıştığından emin ol: 
```
docker ps
```
2) .env dosyasındaki DATABASE_URL'i kontrol et

3) Önceki migration'ları resetle:
```
 npx prisma migrate reset
```

## Roller (özet)
- **Admin**: Kayıtlı kullanıcıları görür, mentör atar, proje şablonlarını yönetir.
- **Mentör**: Kendisine atanan öğrenciyi görür, proje atar, roadmap’i onaylar/düzenler.
- **Öğrenci**: Anketi doldurur, atanan projeyi ve görevlerini takip eder, fork/PR akışında çalışır.

## Yüksek Seviyeli Akış
1. Öğrenci kayıt olur ve anketi tamamlar.
2. AI, öğrencinin seviyesini ve yatkın alanlarını çıkarır (özet).
3. Admin, uygun mentörü atar.
4. Mentör, proje havuzundan uygun bir proje seçer.
5. AI, proje + öğrenci profiline göre bir roadmap üretir (mentör onaylar/düzenler).
6. Roadmap adımları GitHub issue/PR döngüsü ile yürütülür.

## Teknik (v0)
- **Uygulama**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Sunucu uçları**: Next.js Route Handlers (REST)
- **Kimlik doğrulama**: (MVP’de belirlenecek — örn. Lucia veya NextAuth)
- **Veritabanı**: PostgreSQL + Prisma
- **AI servisi**: OpenAI-uyumlu bir endpoint (server-side)
- **UI**: shadcn/ui tercih edilebilir

> Not: Bu repo başlangıçta **yalın Next.js iskeleti** içerir. Veritabanı, Prisma, auth, AI ve GitHub entegrasyonları ilk görev(ler) kapsamında eklenecektir.

## Katkı
- Fork → branch → PR akışı ile katkı verin.
- Küçük ve odaklı PR’lar tercih edilir.

## Lisans
MIT

---

## Geliştirme Kuralları ve Mimari İlkeler

**Yaklaşım:** Feature‑based.

```
src/
  app/                         # Next App Router (route segmentleri)
    (public)/                  # kayıt/anket, landing vb.
    (student)/                 # öğrenci alanı
    (mentor)/                  # mentor alanı
    (admin)/                   # admin alanı
    api/                       # (gerekirse) route handlers
  features/
    auth/
      ui/                      # sayfa ve bileşenler (UI-only)
      server/                  # server actions, service, repo katmanı
      models/                  # Zod şemaları, tipler, domain modelleri
      lib/                     # yardımcı fonksiyonlar (yalnızca feature içi)
      hooks/                   # client hooks
      components/              # feature-özel küçük bileşenler
    student/...
    mentor/...
    admin/...
  lib/                         # app-geneli yardımcılar (fetcher, auth guard)
  styles/                      # global css/tailwind
  prisma/
    schema.prisma              # yalnızca veritabanı şeması (Prisma)
```

- **Şemalar (schemas):**
  - **Veritabanı şeması** yalnızca `prisma/schema.prisma` içinde tutulur.
  - **Uygulama/doğrulama şemaları** (Zod) ilgili feature altında `models/` içinde tanımlanır.
- **Dışa Açık API:** Route Handlers → `features/<feature>/server` fonksiyonlarını çağırır. UI bu katmana doğrudan erişmez.
- **İsimlendirme:** Dosya/klsr: kebab-case, React bileşenleri: PascalCase, tip/şema: `PascalCase`, env anahtarları: `SCREAMING_SNAKE_CASE`.
- **İçe Aktarım:** `@/*` alias (mutlak import); feature dışından içeri bağımlılık minimum.
- **Stil/UI:** Tailwind + shadcn/ui. Bileşenler erişilebilirlik (a11y) kurallarına uyar.
- **Durum Yönetimi:** Öncelik server actions; gerekli yerde minimal client state. (İleride React Query opsiyonel.)
- **Güvenlik:** Server-only işlemler Route Handler/Server Action’da kalır; gizli anahtarlar client’a sızmaz. HttpOnly cookie, SameSite=Lax.
- **Kod Kalitesi:** TypeScript strict, ESLint + Prettier zorunlu; küçük ve odaklı PR.
- **Commit/Branch:** Conventional Commits (`feat:`, `fix:`, `chore:`…), branch: `feat/<scope>-kısa-açıklama`.
- **PR Kuralları:** “Ne değişti?” + “Nasıl test edilir?” zorunlu; ekran görüntüsü/gif teşvik edilir.

---

## Genel Roadmap

**M0 – Bootstrap (tamamlandı)**
- Next.js 15 + TS + Tailwind iskeleti, README ve lisans.

**M1 – Altyapı**
- Postgres (Docker Compose), Prisma kurulumu; `User` + `Role` modeli; seed ile 1 admin/1 mentor/1 öğrenci.
- Auth çözümü seçimi (Lucia öneri) + temel giriş/kayıt; RBAC korumalı layoutlar.

**M2 – Öğrenci Onboarding & Profil Özeti**
- Çok adımlı anket formu (`features/student/ui`), Zod şemaları `models/` altında.
- Anket verisinin saklanması ve **mock AI** ile özet (level/tracks/skills/summary).

**M3 – Admin & Mentor Temelleri**
- Admin: kullanıcı listesi, rol/mentör atama ekranı.
- Proje Havuzu (Admin): şablon CRUD, markdown editörü, zorluk/track alanları.

**M4 – Proje Atama & Roadmap Üretimi**
- Mentor: öğrenci detayında öneri sıralaması ile proje seçimi.
- AI ile roadmap taslağı üret; mentor düzenleyip yayınlar (yalnızca taslak aşaması, görevleştirmeyi sonraya bırakabiliriz).

**M5 – GitHub Akışı Rehberi**
- Dokümantasyon: fork → branch → PR akışı, `gh` CLI yönergeleri.
- (Opsiyon) PR/Issue read‑only durumlarını uygulamada göstermek için webhook/cron okuma taslağı.

**M6 – Geri Bildirim ve Görünürlük**
- Öğrenci/Mentor yorum alanları (uygulama içi), ilerleme yüzdesi, bildirim taslağı.

**M7 – Stabilizasyon**
- CI (lint/typecheck/test/build), e2e test iskeleti, güvenlik/gizlilik gözden geçirme.

> Not: Bu roadmap **yön göstericidir**. Her milestone küçük PR’lara bölünmelidir; detaylı “tasklandırma” issue’larda yapılacaktır.
