/* Downloads the Noto Emoji (Apache-2.0) pictures used for the letter words into public/img/letters. */
const fs = require("fs");
const codes = process.argv.slice(2);
(async () => {
  let bad = [];
  for (const c of codes) {
    const out = `public/img/letters/${c}.svg`;
    if (fs.existsSync(out)) continue;
    const r = await fetch(`https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.047/svg/emoji_u${c}.svg`);
    if (!r.ok) { bad.push(c); continue; }
    fs.writeFileSync(out, (await r.text()).replace(/<\?xml[^>]*>\s*/,"").replace(/<!--[\s\S]*?-->\s*/g,""));
  }
  console.log("missing:", bad.join(" ") || "none");
})();
