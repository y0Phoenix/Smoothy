/**
 * @param  {} name search query/string you are finding the distance to
 * @param  {} possibleVid the string you want to see the distance between
 * @returns number which is the distance betweent the two strings
 */
export const distance = (name = '', possibleVid = '') => {
    const track = Array(possibleVid.length + 1)
      .fill(null)
      .map(() => Array(name.length + 1).fill(null));
    for (let i = 0; i <= name.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= possibleVid.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= possibleVid.length; j += 1) {
      for (let i = 1; i <= name.length; i += 1) {
        const indicator = name[i - 1] === possibleVid[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return track[possibleVid.length][name.length];
}