"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spell = require("simple-spellchecker");
const dictionary = spell.getDictionarySync('en-US');
dictionary.addRegex(/i/);
const playdl = require("play-dl");
const modules_1 = require("../modules/modules");
/**
 * @param  {string} q the video you wish to search
 * @returns {playdl.YouTubeVideo} the closest match to the search query
 * @description searches youtube for videos matching the search query and
 * checks the distance between both strings and returns the closest match
 */
async function videoFinder(query) {
    try {
        let name = query.toLowerCase();
        const videoResult = await playdl.search(name);
        const regex = /;|,|\.|>|<|'|"|:|}|{|\]|\[|=|-|_|\(|\)|&|^|%|$|#|@|!|~|`|\s/ig;
        if (videoResult[0]) {
            let _possibleVids = [];
            let vid = videoResult[0].title.toLowerCase();
            vid = vid.replace(regex, '');
            name = name.replace(regex, '');
            const Name = name.split(' ');
            let proceed = false;
            for (let i = 0; i < Name.length; i++) {
                const re = new RegExp(Name[i], 'g');
                const includes = re.test(vid);
                if (!includes) {
                    proceed = true;
                    break;
                }
            }
            if (proceed) {
                const _name = name.split(' ');
                for (let i = 0; i < _name.length; i++) {
                    const check = dictionary.spellCheck(_name[i]);
                    if (!check) {
                        let suggs = dictionary.getSuggestions(_name[i]);
                        _name[i] = suggs[0];
                    }
                    if (check[0]) {
                    }
                }
                name = _name.join(' ');
                const videoResult = await playdl.search(name);
                if (videoResult[0]) {
                    let _possibleVids = [];
                    let vid = videoResult[0].title.toLowerCase();
                    vid = vid.replace(regex, '');
                    const Name = name.split(' ');
                    let proceed = false;
                    for (let i = 0; i < Name.length; i++) {
                        const re = new RegExp(Name[i], 'g');
                        const includes = re.test(vid);
                        if (!includes) {
                            proceed = true;
                            break;
                        }
                    }
                    if (!proceed) {
                        return videoResult[0];
                    }
                    else {
                        for (let i = 0; i < 10; i++) {
                            let vid = videoResult[i].title.toLowerCase();
                            let includes = vid.includes(name);
                            if (includes === true) {
                                return videoResult[i];
                            }
                        }
                        for (let i = 0; i < 6; i++) {
                            let possibleVid = videoResult[i].title.toLowerCase();
                            let dif = (0, modules_1.distance)(name, possibleVid);
                            _possibleVids.push({ dif: dif, video: videoResult[i] });
                        }
                        const returnObj = await (0, modules_1.topResult)(_possibleVids);
                        return returnObj.video;
                    }
                }
            }
            else {
                return videoResult[0];
            }
            return undefined;
        }
        return undefined;
    }
    catch (error) {
        console.log(`Videosearch error on ${query}`);
        let name = query.toLowerCase();
        const videoResult = await playdl.search(name);
        if (videoResult[0]) {
            return videoResult[0];
        }
    }
}
exports.default = videoFinder;
;
