"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Award, Check, Download, Gift, Heart, LockKeyhole, Moon, RotateCcw, Sparkles, Star, Unlock } from "lucide-react";
import { BIRTHDAY_GIRL_NAME } from "@/data/birthdayGirl";
import { birthdayLetter } from "@/data/birthdayLetter";
import styles from "./FinaleExperience.module.css";

const discoveriesKey = "abhinaya-finale-treasures-v1";
const wishKey = "abhinaya-finale-wish-v1";
const wishes = [
  "May you always be happy.",
  "May your dreams become reality.",
  "May you always find reasons to smile.",
  "May you meet wonderful people.",
  "May you discover beautiful opportunities.",
  "May every challenge make you stronger.",
  "May your future be filled with endless magic.",
];
const treasures = [
  { title: "Heart of Happiness", icon: "heart" },
  { title: "Seven Golden Stars", icon: "stars" },
  { title: "Panda’s Secret Message", icon: "panda" },
  { title: "The Invisible Gift", icon: "gift" },
  { title: "The Final Golden Scroll", icon: "scroll" },
] as const;
const chapters = [
  { id: "constellation", label: "Your constellation", icon: Star },
  { id: "treasure", label: "Secret treasure", icon: Gift },
  { id: "wish", label: "One last wish", icon: Moon },
  { id: "award", label: "Your award", icon: Award },
  { id: "portal", label: "Final surprise", icon: Sparkles },
] as const;

type FinaleExperienceProps = {
  reducedMotion: boolean;
  onCelebrate: () => void;
  onReplay: () => void;
  onPandaReact: () => void;
};

function readDiscoveries(): number[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(discoveriesKey) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < treasures.length) : [];
  } catch { return []; }
}

function CertificateDownload() {
  const download = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1250;
    const context = canvas.getContext("2d");
    if (!context) return;
    const fill = context.createLinearGradient(0, 0, 1800, 1250);
    fill.addColorStop(0, "#fff5e8"); fill.addColorStop(0.48, "#ffe5f0"); fill.addColorStop(1, "#eee1ff");
    context.fillStyle = fill; context.fillRect(0, 0, 1800, 1250);
    context.strokeStyle = "#bd8c42"; context.lineWidth = 14; context.strokeRect(45, 45, 1710, 1160);
    context.strokeStyle = "#e7b969"; context.lineWidth = 4; context.strokeRect(68, 68, 1664, 1114);
    const center = (text: string, y: number, font: string, color: string) => { context.font = font; context.textAlign = "center"; context.fillStyle = color; context.fillText(text, 900, y, 1500); };
    context.fillStyle = "#bd8c42"; context.font = "72px Georgia"; context.textAlign = "center"; context.fillText("♛", 900, 190);
    center("THE OFFICIAL MAGICAL AWARD", 310, "bold 52px Georgia", "#7b3f78");
    center("This certificate is proudly presented to", 405, "italic 34px Georgia", "#684b68");
    center(BIRTHDAY_GIRL_NAME.toUpperCase(), 535, "bold 98px Georgia", "#bb4f8e");
    center("WORLD’S MOST MAGICAL BIRTHDAY STAR", 650, "bold 42px Georgia", "#7e529e");
    center("For spreading happiness, creating beautiful memories,", 775, "32px Georgia", "#60465e");
    center("and making the world a little brighter just by being in it.", 827, "32px Georgia", "#60465e");
    center("Awarded with unlimited love, happiness, and magical wishes!", 950, "italic 32px Georgia", "#88486f");
    context.fillStyle = "#ce6a9f"; context.font = "56px Georgia"; context.fillText("♥       ✦       ♥", 900, 1090);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `${BIRTHDAY_GIRL_NAME.toLowerCase()}-magical-birthday-award.png`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  };
  return <button className={styles.primaryButton} type="button" onClick={download}><Download size={18} /> Download My Award</button>;
}

export default function FinaleExperience({ reducedMotion, onCelebrate, onReplay, onPandaReact }: FinaleExperienceProps) {
  const [constellationRevealed, setConstellationRevealed] = useState(false);
  const [treasuresFound, setTreasuresFound] = useState<number[]>([]);
  const [chestPhase, setChestPhase] = useState<"closed" | "unlocking" | "open">("closed");
  const [selectedTreasure, setSelectedTreasure] = useState<number | null>(null);
  const [selectedWish, setSelectedWish] = useState<number | null>(null);
  const [chestGiftOpen, setChestGiftOpen] = useState(false);
  const [wish, setWish] = useState("");
  const [savedWish, setSavedWish] = useState("");
  const [wishReleased, setWishReleased] = useState(false);
  const [wishError, setWishError] = useState("");
  const [editingWish, setEditingWish] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const chestTimer = useRef<number | null>(null);
  const portalTimer = useRef<number | null>(null);
  const discoveredAll = treasuresFound.length === treasures.length;

  // Restore browser-only saved state after hydration to keep server and initial client markup identical.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTreasuresFound(readDiscoveries());
    try {
      const storedWish = window.localStorage.getItem(wishKey) ?? "";
      setSavedWish(storedWish);
      setWish(storedWish);
    } catch { /* The wish still works in memory if storage is unavailable. */ }
    return () => {
      if (chestTimer.current !== null) window.clearTimeout(chestTimer.current);
      if (portalTimer.current !== null) window.clearTimeout(portalTimer.current);
    };
  }, []);

  const openChest = () => {
    if (chestPhase !== "closed") return;
    setChestPhase("unlocking");
    chestTimer.current = window.setTimeout(() => setChestPhase("open"), reducedMotion ? 0 : 900);
  };

  const discoverTreasure = (index: number) => {
    setSelectedTreasure(index);
    setSelectedWish(null);
    setTreasuresFound((current) => {
      const updated = current.includes(index) ? current : [...current, index].sort((a, b) => a - b);
      try { window.localStorage.setItem(discoveriesKey, JSON.stringify(updated)); } catch { /* Keep current-session progress. */ }
      return updated;
    });
    if (index === 2) onPandaReact();
    if (index === 3) setChestGiftOpen(false);
  };

  const releaseWish = () => {
    const cleanWish = wish.trim();
    if (!cleanWish) { setWishError("Write a little wish before sending it to the stars."); return; }
    setWishError(""); setSavedWish(cleanWish); setWish(cleanWish); setWishReleased(true); setEditingWish(false);
    try { window.localStorage.setItem(wishKey, cleanWish); } catch { /* Keep the wish for this visit if storage is unavailable. */ }
  };

  const revealPortal = () => {
    if (portalOpen) { onCelebrate(); return; }
    setPortalOpen(true);
    onPandaReact();
    portalTimer.current = window.setTimeout(onCelebrate, reducedMotion ? 0 : 1200);
  };

  const awardName = BIRTHDAY_GIRL_NAME.toUpperCase();

  return <div className={styles.experience} data-reduced-motion={reducedMotion}>
    <header className={styles.hero}>
      <span className={styles.heroCrown}>♛</span>
      <p className={styles.eyebrow}>A FINAL GIFT FROM THE MAGICAL KINGDOM</p>
      <h1>HAPPY BIRTHDAY,<br /><span>{BIRTHDAY_GIRL_NAME}!</span> <Heart className={styles.titleHeart} fill="currentColor" /></h1>
      <p className={styles.heroPromise}>Your magical adventure may be ending, but your beautiful memories are just beginning!</p>
      <p className={styles.heroMessage}>{birthdayLetter.finale.message}</p>
      <a className={styles.beginLink} href="#constellation">Explore your final surprises <ArrowDown size={17} /></a>
    </header>

    <nav className={styles.chapterNav} aria-label="Final birthday surprises">
      {chapters.map(({ id, label, icon: Icon }, index) => <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={16} />{label}</a>)}
    </nav>

    <div className={styles.chapters}>
      <section id="constellation" className={`${styles.chapter} ${styles.constellationChapter}`}>
        <div className={styles.chapterHeading}><span>01 · WRITTEN IN THE STARS</span><h2>Abhinaya’s Magical Constellation</h2><p>Every kind heart leaves a little light in the sky.</p></div>
        <div className={`${styles.skyMap} ${constellationRevealed ? styles.skyRevealed : ""}`}>
          <div className={styles.nebula} />
          <svg viewBox="0 0 900 330" role="img" aria-label={constellationRevealed ? `A constellation spelling ${awardName}` : "A starry sky waiting for your constellation"}>
            <defs><linearGradient id="nameStarGradient" x1="0" x2="1"><stop stopColor="#fff1b8" /><stop offset=".48" stopColor="#ff9dcc" /><stop offset="1" stopColor="#d5b1ff" /></linearGradient></defs>
            {Array.from({ length: 110 }, (_, index) => { const x = (index * 173 + 37) % 890 + 5; const y = (index * 97 + 23) % 310 + 10; return <circle key={index} cx={x} cy={y} r={index % 13 === 0 ? 2 : 1.15} className={styles.skyDot} style={{ animationDelay: `${(index % 19) * -0.17}s` }} />; })}
            <path className={styles.constellationLine} d="M160 164 240 121 325 173 410 115 495 167 580 115 665 163 742 124" />
            {[160, 240, 325, 410, 495, 580, 665, 742].map((x, index) => <g key={x} className={styles.nameStar} style={{ transitionDelay: `${index * 180}ms` }}><circle cx={x} cy={[164, 121, 173, 115, 167, 115, 163, 124][index]} r={index % 2 ? 4 : 5} /><path d={`M${x} ${[164, 121, 173, 115, 167, 115, 163, 124][index] - 11}v22m-11-11h22`} /></g>)}
            <text className={styles.constellationName} x="450" y="270" textAnchor="middle">{awardName}</text>
            <path className={styles.skyHeart} d="M450 54c-19-27-55 0 0 40 55-40 19-67 0-40Z" />
          </svg>
        </div>
        <div className={styles.constellationResult} aria-live="polite">
          {constellationRevealed ? <><strong>A Star Was Born to Shine — {awardName} 💗</strong><p>Some stars shine in the sky. Some shine in the lives of everyone around them. You’re one of those special stars, {BIRTHDAY_GIRL_NAME}!</p></> : <button className={styles.primaryButton} type="button" onClick={() => setConstellationRevealed(true)}><Sparkles size={18} /> Reveal My Constellation ✨</button>}
        </div>
      </section>

      <section id="treasure" className={`${styles.chapter} ${styles.treasureChapter}`}>
        <div className={styles.chapterHeading}><span>02 · A SECRET JUST FOR YOU</span><h2>The Birthday Treasure Chest</h2><p>There are five little treasures waiting inside.</p></div>
        <div className={`${styles.treasureLayout} ${chestPhase === "open" ? styles.treasureUnsealed : ""}`}>
          <div className={`${styles.chestScene} ${styles[`chest${chestPhase[0].toUpperCase()}${chestPhase.slice(1)}`]}`}>
            <div className={styles.chestAura} />
            <div className={styles.chestLid}><i /><i /><i /></div>
            <div className={styles.chestBody}><span className={styles.chestBand} /><span className={styles.chestLock}><Heart className={styles.lockHeart} fill="currentColor" /><span>{chestPhase === "closed" ? <LockKeyhole size={19} /> : <Unlock size={19} />}</span></span><span className={styles.gem}>✦</span><span className={`${styles.treasureGlow} ${chestPhase === "open" ? styles.glowOn : ""}`} /></div>
            <p>{chestPhase === "open" ? "Your treasures are shining!" : chestPhase === "unlocking" ? "The heart lock is opening…" : "A secret treasure is waiting for you…"}</p>
            {chestPhase === "closed" && <button className={styles.primaryButton} type="button" onClick={openChest}><LockKeyhole size={17} /> Unlock My Treasure 🎁</button>}
          </div>
          {chestPhase === "open" && <div className={styles.treasureShelf} aria-label="Choose a treasure">
            {treasures.map((treasure, index) => <button key={treasure.title} className={`${styles.treasureButton} ${selectedTreasure === index ? styles.treasureSelected : ""} ${treasuresFound.includes(index) ? styles.treasureFound : ""}`} style={{ animationDelay: reducedMotion ? "0s" : `${index * 120}ms` }} type="button" onClick={() => discoverTreasure(index)} aria-pressed={selectedTreasure === index}>
              <span className={styles.treasureIcon}>{index === 0 ? <Heart fill="currentColor" /> : index === 1 ? <Star fill="currentColor" /> : index === 2 ? <Heart /> : index === 3 ? <Gift /> : <span className={styles.scrollMark}>✦</span>}</span><b>{treasure.title}</b><small>{treasuresFound.includes(index) ? "Discovered" : "Tap to discover"}</small>{treasuresFound.includes(index) && <Check className={styles.foundCheck} size={16} />}
            </button>)}
          </div>}
        </div>

        {selectedTreasure !== null && chestPhase === "open" && <div className={styles.treasureReveal} aria-live="polite">
          <span className={styles.revealKicker}>TREASURE {selectedTreasure + 1} · {treasures[selectedTreasure].title.toUpperCase()}</span>
          {selectedTreasure === 0 && <><Heart className={styles.revealHeart} fill="currentColor" /><p>If happiness had a face, it would look a little like yours, {BIRTHDAY_GIRL_NAME}! 💗</p></>}
          {selectedTreasure === 1 && <><p>Seven golden stars, each carrying a wish just for you:</p><div className={styles.wishStars}>{wishes.map((message, index) => <button key={message} type="button" onClick={() => setSelectedWish(index)} aria-label={`Wish ${index + 1}`} aria-pressed={selectedWish === index}><Star fill="currentColor" /><span>{index + 1}</span></button>)}</div>{selectedWish !== null && <p className={styles.starWish} role="status">{wishes[selectedWish]}</p>}</>}
          {selectedTreasure === 2 && <p className={styles.pandaMessage}>“Psst… {BIRTHDAY_GIRL_NAME}, you’re officially my favourite human in this magical kingdom!” 🐼💗</p>}
          {selectedTreasure === 3 && <><button className={`${styles.invisibleGift} ${chestGiftOpen ? styles.invisibleGiftOpen : ""}`} type="button" onClick={() => setChestGiftOpen((open) => !open)} aria-expanded={chestGiftOpen}><Gift size={35} /><span>{chestGiftOpen ? "A gift full of magic!" : "Tap to unwrap"}</span></button>{chestGiftOpen && <p>A lifetime supply of smiles, unlimited happiness, unexpected adventures, and beautiful memories!</p>}</>}
          {selectedTreasure === 4 && <div className={`${styles.scrollReveal} ${styles.scrollUnrolled}`}><div className={styles.scrollSeal}>♥</div><strong>A Special Note Just for You, {BIRTHDAY_GIRL_NAME} 💗</strong><p>{birthdayLetter.paragraphs.join(" ")}</p><em>{birthdayLetter.signoff}</em></div>}
        </div>}
        {discoveredAll && <div className={styles.treasureComplete} role="status"><Sparkles size={18} /><strong>A Treasure Just for You 💗</strong><p>{BIRTHDAY_GIRL_NAME}, the greatest treasure isn’t hidden inside this chest. It’s the happiness, kindness, laughter, and magic that you bring into the world.</p><b>Never stop shining! ✨</b></div>}
      </section>

      <section id="wish" className={`${styles.chapter} ${styles.wishChapter}`}>
        <div className={styles.chapterHeading}><span>03 · A WISH FOR YOUR FUTURE</span><h2>One Last Wish, {BIRTHDAY_GIRL_NAME}…</h2><p>If you could make one wish for your future, what would it be?</p></div>
        <div className={`${styles.lanternScene} ${wishReleased ? styles.lanternReleased : ""}`}>
          <div className={styles.moonGlow}><Moon size={38} fill="currentColor" /></div><div className={styles.fireflies} aria-hidden="true">✦　·　✧　·　✦　·　✧</div>
          <div className={styles.lantern}><i /><span>✧</span><div className={styles.lanternWish}>{wishReleased ? savedWish : "Your wish will glow here"}</div><b /></div>
          {savedWish && !editingWish ? <div className={styles.savedWish}><p>{wishReleased ? "May your wish find its way to the stars! 💗" : "Your wish is saved on this device."}</p><blockquote>{savedWish}</blockquote><button className={styles.textButton} type="button" onClick={() => { setEditingWish(true); setWishReleased(false); }}>View or edit your saved wish</button></div> : <div className={styles.wishForm}><label htmlFor="final-wish">Write your magical wish here… 💗</label><textarea id="final-wish" value={wish} maxLength={260} onChange={(event) => { setWish(event.target.value); setWishError(""); }} placeholder="Write your magical wish here… 💗" rows={3} /><div className={styles.wishFormBottom}><small>{wish.length}/260</small><button className={styles.primaryButton} type="button" onClick={releaseWish}><Sparkles size={17} /> {savedWish ? "Save and Release My Wish" : "Release My Wish ✨"}</button></div>{wishError && <p className={styles.formError} role="alert">{wishError}</p>}</div>}
        </div>
      </section>

      <section id="award" className={`${styles.chapter} ${styles.awardChapter}`}>
        <div className={styles.chapterHeading}><span>04 · YOUR ROYAL RECOGNITION</span><h2>An Official Magical Birthday Award</h2><p>For making the world brighter just by being you.</p></div>
        <div className={styles.certificate}>
          <span className={styles.certificateCrown}>♛</span><div className={styles.certificateFlourish}>✦　❧　✦</div><small>THE OFFICIAL MAGICAL AWARD</small><p>This certificate is proudly presented to</p><h3>{awardName}</h3><strong>WORLD’S MOST MAGICAL BIRTHDAY STAR</strong><p>For spreading happiness, creating beautiful memories, and making the world a little brighter just by being in it.</p><em>Awarded with unlimited love, happiness, and magical wishes! 💗</em><div className={styles.certificateFlourish}>♥　✧　♥</div>
        </div>
        <CertificateDownload />
      </section>

      <section id="portal" className={`${styles.chapter} ${styles.portalChapter}`}>
        <div className={styles.chapterHeading}><span>05 · THE LAST SURPRISE</span><h2>One Last Surprise Is Waiting for You…</h2><p>A little more birthday magic, just beyond the stars.</p></div>
        <div className={`${styles.portal} ${portalOpen ? styles.portalOpened : ""}`}>
          <div className={styles.portalRing}><div className={styles.portalWorld}><span>✦</span><Heart fill="currentColor" /><b>✧</b></div></div>
          {!portalOpen ? <button className={styles.primaryButton} type="button" onClick={revealPortal}><Sparkles size={18} /> Reveal My Final Surprise 💗</button> : <div className={styles.portalMessage} aria-live="polite"><strong>{BIRTHDAY_GIRL_NAME} 💗</strong><p>You deserve all the happiness, magic, and beautiful moments this world has to offer.</p><p>Never stop shining, never stop dreaming, and never stop being the wonderful person you are!</p><b>HAPPY BIRTHDAY ONCE AGAIN! 🎂✨</b></div>}
        </div>
      </section>

      <section className={styles.finalCelebration} aria-label="Birthday celebration finale">
        <span className={styles.finalRibbon}>YOUR FAIRYTALE ENDING</span><h2>Keep smiling, keep shining!</h2><p>{birthdayLetter.finale.closing}</p>
        <div className={styles.finalActions}><button className={styles.primaryButton} type="button" onClick={onCelebrate}><RotateCcw size={17} /> Celebrate Again! 🎉</button><button className={styles.secondaryButton} type="button" onClick={onReplay}><ArrowRight size={17} /> Relive the Magic ↻</button></div>
        <small>Your constellation, treasures, and wish are saved on this device.</small>
      </section>
    </div>
    <footer className={styles.footer}>Made with love for {BIRTHDAY_GIRL_NAME} <Heart size={14} fill="currentColor" /></footer>
  </div>;
}
