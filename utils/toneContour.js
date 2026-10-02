// Derives a Yoruba word/phrase's tone contour directly from its diacritics -
// no separate tone data to author or keep in sync with the seed content.
// Yoruba tone marking: acute (á) = high, grave (à) = low, unmarked = mid.
// Underdot letters (ẹ ọ ṣ) are separate letters, not tone marks, and are
// correctly ignored here (see the NFD walkthrough below).
//
// This treats each vowel as one tone-bearing unit, since Yoruba syllables
// are almost entirely (C)V - a close-enough pedagogical simplification, not
// a full tonological analysis (it doesn't handle syllabic nasals, for
// instance). Good enough for a visual aid; not a linguistics tool.

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const COMBINING_ACUTE = '́'; // high tone
const COMBINING_GRAVE = '̀'; // low tone
const COMBINING_MARK = /[̀-ͯ]/; // any combining diacritic (tone marks + underdot)

/**
 * @param {string} text
 * @returns {('high' | 'mid' | 'low')[]} one tone per vowel, in reading order
 */
export function getToneContour(text) {
  // NFD first so precomposed accented letters (á) and already-decomposed
  // ones (a + combining acute) are handled the same way.
  const nfd = text.normalize('NFD');
  const contour = [];
  let i = 0;

  while (i < nfd.length) {
    const ch = nfd[i].toLowerCase();

    if (VOWELS.has(ch)) {
      let j = i + 1;
      let tone = 'mid';

      while (j < nfd.length && COMBINING_MARK.test(nfd[j])) {
        if (nfd[j] === COMBINING_ACUTE) tone = 'high';
        else if (nfd[j] === COMBINING_GRAVE) tone = 'low';
        j++;
      }

      contour.push(tone);
      i = j;
    } else {
      i++;
    }
  }

  return contour;
}
