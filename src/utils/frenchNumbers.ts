/**
 * Convertit un montant numérique en Francs CFA en toutes lettres (Français)
 * Conforme aux standards comptables camerounais pour les quittances et reçus de scolarité.
 */
export function numberToFrenchWords(n: number): string {
  if (isNaN(n) || n === 0) return "Zéro Franc CFA";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];

  function convertGroup(val: number): string {
    let res = "";
    const hundreds = Math.floor(val / 100);
    const rem = val % 100;

    if (hundreds > 0) {
      if (hundreds === 1) {
        res += "cent";
      } else {
        res += units[hundreds] + " cent";
        if (rem === 0) res += "s";
      }
      if (rem > 0) res += " ";
    }

    if (rem > 0) {
      if (rem < 10) {
        res += units[rem];
      } else if (rem < 20) {
        res += teens[rem - 10];
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        if (t === 7) {
          res += "soixante-" + teens[u];
        } else if (t === 9) {
          res += "quatre-vingt-" + teens[u];
        } else {
          res += tens[t];
          if (u === 1 && t < 8) {
            res += " et un";
          } else if (u > 0) {
            res += "-" + units[u];
          }
        }
      }
    }

    return res.trim();
  }

  let amount = Math.floor(Math.abs(n));
  if (amount === 0) return "Zéro Franc CFA";

  const billions = Math.floor(amount / 1000000000);
  amount %= 1000000000;
  const millions = Math.floor(amount / 1000000);
  amount %= 1000000;
  const thousands = Math.floor(amount / 1000);
  const remainder = amount % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? "un milliard" : convertGroup(billions) + " milliards");
  }
  if (millions > 0) {
    parts.push(millions === 1 ? "un million" : convertGroup(millions) + " millions");
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : convertGroup(thousands) + " mille");
  }
  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  const result = parts.join(" ").trim();
  const capitalized = result.charAt(0).toUpperCase() + result.slice(1);
  return `${capitalized} Francs CFA`;
}
