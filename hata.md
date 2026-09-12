Turso'nun Windows'ta CLI kurulumu WSL gerektiriyor, bu ekstra bir
karmaşıklık katıyor. Bunun yerine claude-code-talimati.md'de belirtilen
alternatif olan Supabase'e geçelim.

Supabase kullanacağız — bunun için:
1. supabase.com'da tarayıcıdan nasıl ücretsiz hesap açacağımı ve yeni
   bir proje oluşturacağımı adım adım söyle (CLI kurulumu gerektirmeyen
   web arayüzü üzerinden)
2. Proje kodundaki veritabanı bağlantı katmanını Turso/libSQL yerine
   Supabase (Postgres) kullanacak şekilde güncelle
3. Supabase'den alacağım bağlantı bilgilerini (connection string)
   nereye ekleyeceğimi söyle

Adım adım ilerleyelim, her adımda ne yapacağımı net söyle.