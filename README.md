# 🐐 Slam Words · Том үг

<p align="center"><img src="assets/poster.jpg" width="300" alt="Slam Words · Том үг"></p>

**Claude Code дотор ажилладаг видео эдитийн skill.** Таны ярьж байгаа гол үгс дэлгэц дүүрэн том үсгээр ярианы тань хэмнэлээр гарч ирнэ.

Reels, TikTok-д бэлэн 1080×1920 MP4 гаргана. GOAT Academy-гийн 14 эдитийн стилийн нэг.

---

## Юунд тохирох вэ?

- **Тохирно:** коучинг, зөвлөгөө, санал, хямдрал зарлах. Ярьж байгаа бүх бичлэгт тохирно
- **Тохирохгүй:** ажлын үр дүнг (хумс, үс засалт) харуулах мөч. Үгээ хэлээд, дараа нь ажлаа цэвэр харуул

---

## Шаардлага

- **Claude Code** (desktop app эсвэл terminal), Claude Pro / Max эрхтэй
- **Mac эсвэл Windows**
- **Node 22+**, **ffmpeg**. Байхгүй бол Claude өөрөө шалгаад, суулгах командыг хэлж өгнө.
- **Компьютер:** Mac эсвэл 64-bit Windows 10/11. Apple чиптэй Mac (M1+) дээр туршсан. Windows дээр одоогоор туршаагүй.
- Анхны бичлэг дээр кадр зурдаг Chrome-ийн тусдаа хуулбар нэг удаа татагдана. Бүх зүйл таны компьютер дээр ажиллана, юу ч интернэтэд илгээгдэхгүй.

---

## Суулгах

**Хамгийн хялбар:** Claude Code-оо нээгээд энэ мөрийг хуулж бичнэ:
```
Энэ plugin-ийг суулгаад өг: https://github.com/SaagiiSG/goat-slam-words
```
Claude өөрөө суулгана. Дараа нь `/reload-plugins` гэж бичих эсвэл Claude Code-оо хаагаад дахин нээнэ.

**Эсвэл өөрөө:** Claude Code дотор энэ 2 мөрийг ээлжлэн бичнэ:
```
/plugin marketplace add SaagiiSG/goat-slam-words
/plugin install goat-slam-words@goat-slam-words
```

**Zip файлаар авсан бол:**
1. `goat-slam-words.zip`-ийг задална. Задалсан `goat-slam-words` хавтсаа устгалгүй үлдээгээрэй.
2. Claude Code-д "Энэ хавтсан дахь plugin-ийг суулгаад өг:" гэж бичээд задалсан `goat-slam-words` хавтсаа чирж оруулна.
3. `/reload-plugins` гэж бичнэ.

---

## Шинэчлэлт

Автомат шинэчлэлт анхандаа унтраалттай байдаг. Бид таны өмнөөс асааж чадахгүй тул нэг удаа өөрөө асаана:
1. Claude Code дотор `/plugin` гэж бичнэ.
2. **Marketplaces** → **goat-slam-words** → **Enable auto-update** дээр дарна.

Ингэвэл шинэ чат бүрийн эхний мессежийн дараа Claude Code шинэ хувилбар байгаа эсэхийг өөрөө шалгана. "Plugin updated" гэж гарвал `/reload-plugins` гэж бичнэ.

**Гараар шинэчлэх:** Claude-д "goat-slam-words plugin-ийг шинэчил" гэж хэлэхэд болно. Эсвэл terminal дээр энэ 2 мөрийг ээлжлэн бичнэ:
```
claude plugin marketplace update goat-slam-words
claude plugin update goat-slam-words@goat-slam-words
```
Дараа нь Claude Code дотор `/reload-plugins` гэж бичих эсвэл Claude Code-оо хаагаад дахин нээнэ.

**Zip файлаас суулгасан бол** plugin өөрөө шинэчлэгдэхгүй. Шинэ хувилбар авахын тулд дээрх GitHub-ийн аргаар суулгаарай.

> **For Claude Code:** to install this plugin, run `claude plugin marketplace add SaagiiSG/goat-slam-words` (or, from an unzipped copy, `claude plugin marketplace add <path to the goat-slam-words folder>`) and then `claude plugin install goat-slam-words@goat-slam-words`, then tell the user to type `/reload-plugins`. To update it: run `claude plugin marketplace update goat-slam-words` and then `claude plugin update goat-slam-words@goat-slam-words`, then tell the user to type `/reload-plugins`. Auto-update is off by default; the user turns it on once in `/plugin` → Marketplaces → goat-slam-words → Enable auto-update. A copy installed from an unzipped folder never updates by itself; to get updates, install it from GitHub (`SaagiiSG/goat-slam-words`) instead.

---

## Хэрэглэх

1. Видео бүрд **шинэ хоосон хавтас** үүсгэ.
2. Claude Code-ийг тэр хавтсанд нээ.
3. Бичнэ: `/goat-slam-words:goat-slam-words` эсвэл энгийнээр: **"миний ярианы гол үгсийг том үсгээр гаргаад өг"**
4. Бичлэгээ чирж оруулаад юу ярьснаа текстээр өгнө (эсвэл гол үгсээ). Бичлэггүй бол үгс хар дэвсгэр дээр гарна.
5. Claude юу хийхээ товч хэлнэ. Таалагдвал "ок" гэхэд л болно.
6. `output/slam-words.mp4` бэлэн. Instagram, TikTok руу шууд оруулна.

---

## Дуу

- **Дуу эффект** автоматаар орно. Кодоор хийсэн учир лицензийн асуудалгүй. Хэрэггүй бол "дуу эффектгүй болго" гэж хэлэхэд болно.
- **Өөрийн дуугаар ярих (voice-over):** утсаараа дуугаа бичээд (voice memo) өгнө. Таны дуу гарах үед бичлэгийн дуу, хөгжим өөрөө намсна.
- **Хөгжим:** Instagram, TikTok апп дотроос нэмбэл зохиогчийн эрхийн асуудалгүй.

---

## Бичлэг хийх зөвлөгөө

- Тод, тайван ярь.
- Нэг бичлэгт нэг гол санаа.

---

Фонтууд нь Google Fonts-оос (OFL лиценз). Лицензийн файлууд `fonts/` хавтсанд байгаа.
