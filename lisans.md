Şu an /panel erişimi LICENSE_KEY tanımlı olmadığı için kilitli. Ama
henüz gerçek bir müşteri değiliz, eşim pilot test yapacak — gerçek
license-api servisini şimdi kurmak istemiyorum.

Bunun yerine geçici bir "pilot test modu" ekle: bir environment
variable tanımla (örn. LICENSE_KEY=PILOT-TEST-BYPASS gibi özel bir
değer, ya da ayrı bir DISABLE_LICENSE_CHECK=true değişkeni — hangisi
daha temizse sen karar ver), bu değer set edildiğinde lisans kontrolü
atlanıp /panel'e erişim açılsın.

Bunu yaparken gerçek lisans doğrulama kodunu SİLME — sadece pilot test
için üzerine bir geçici anahtar ekle, ileride gerçek müşterilerde bu
bypass olmayacak, sadece bizim test ortamımızda kullanılacak.

Değişikliği yapınca hangi değeri Vercel'de hangi environment variable
adına gireceğimi söyle.