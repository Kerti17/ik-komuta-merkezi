Önce dosya karmaşasını temizleyelim: talimatii.md, talimati4.md ve
komut1.md dosyalarını sil veya yok say. Bundan sonra SADECE
claude-code-talimati.md dosyasını referans al, tek doğru kaynak bu.

Şimdi tasarımı kontrol edelim — kod seviyesinde token'lar doğru
olabilir ama tarayıcıda görünen sonuç hâlâ sade duruyor. Şu somut
kontrol listesini birebir uygula, her maddeyi tek tek doğrula:

1. Sayfa arka planı beyaz değil, #F8F5EC (kumaş beji) olmalı
2. Her kart: beyaz zemin + 1px #DED6C2 kenarlık + border-radius 8px
   + box-shadow: 0 12px 28px -18px rgba(27,35,51,0.25) — şu an
   kartlarda gölge yok, düz duruyor
3. Başlıklar Archivo fontuyla, kalın (font-weight 700-800), KPI
   rakamları en az 28px büyüklüğünde
4. Küçük etiketler ("AKTİF ÇALIŞAN" gibi) Space Mono fontuyla,
   UPPERCASE, letter-spacing: 0.05em, gri renk (#6b7280)
5. Renkli rozetler (Bugün/Yarın gibi) DOLU arka plan renkli olmalı
   (örn. background: #F3D6CE, color: #A8402E) — şu an sadece metin
   rengi değişmiş gibi görünüyor, arka plan boş
6. Sol menüde aktif öğe koyu lacivert (#1B2333) zeminde beyaz yazı,
   kategori varsa mono/uppercase
7. Sayfa başlıklarının altına 4px yükseklikte, 5 renkli segmentten
   oluşan bir "iplik" ayraç çizgisi ekle (thread-rule)
8. Butonlar: birincil buton dolu altın renk (#D4A017) + gölge,
   ikincil buton kenarlıklı/şeffaf

Uyguladıktan sonra ekran görüntüsü göster, birlikte kontrol edelim.