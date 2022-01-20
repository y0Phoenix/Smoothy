"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param  {string} videoName the string you wish to check
 * @returns {boolean} boolean value
 * @description uses RegExp to check the string for values inside of a valid url
 */
function validURL(videoName) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(videoName);
}
exports.default = validURL;
