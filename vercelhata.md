Vercel deploy'u şu hatayla başarısız oldu:

"license-api/db/index.ts(5,30): error TS2307: Cannot find [module]"

license-api klasörü ayrı bir mini-servis olarak planlanmıştı (Bölüm 7),
ana Next.js uygulamasının build sürecine dahil olmamalı. Ana uygulamanın
TypeScript/Next.js build'i bu klasörü tamamen dışlayacak şekilde ayarla
(tsconfig.json'da exclude, ya da klasörü ana projeden çıkarıp ayrı bir
alt repo/klasör yapısına taşı — hangisi daha uygunsa sen karar ver).

Düzelttikten sonra yerelde "npm run build" komutunu çalıştırıp hatasız
tamamlandığını doğrula, sonra tekrar git push yapıp Vercel'de yeniden
deploy deneyelim.