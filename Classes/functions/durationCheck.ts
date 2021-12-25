/**
 * @param  {string} dur string duration of song
 * @returns {string} formatted duration
 * @deprecated
 */
export default function durationCheck(dur: string) {
    let totalseconds = parseInt(dur);
    let minutes = Math.floor(totalseconds / 60);
    let Seconds = Math.abs(minutes * 60 - totalseconds);
    let _seconds: string;
    let Minutes: string
    if (Seconds < 10) {
      _seconds = `0${Seconds}`;
    } else {
      _seconds = `${Seconds}`;
    }
    let hours = Math.floor(totalseconds / 3600);
    if (hours > 0) {
      for (let i = 0; minutes > 60; i++) {
        minutes = Math.floor(minutes - 60);
      }
      if (minutes < 10) {
        Minutes = `0${minutes}`;
      }
      if (minutes === 60) {
        return `${hours}:00:${_seconds}`;
      } else {
        return `${hours}:${minutes}:${_seconds}`;
      }
    } else {
      return `${minutes}:${_seconds}`;
    }
  }