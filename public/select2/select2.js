/*
Copyright 2012 Igor Vaynberg

Version: 3.5.0 Timestamp: Mon Jun 16 19:29:44 EDT 2014

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.

You may obtain a copy of the Apache License and the GPL License at:

    http://www.apache.org/licenses/LICENSE-2.0
    http://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the
Apache License or the GPL License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
the specific language governing permissions and limitations under the Apache License and the GPL License.
*/
(function ($) {
  if (typeof $.fn.each2 === 'undefined') {
    $.extend($.fn, {
      /*
            * 4-10 times faster .each replacement
            * use it carefully, as it overrides jQuery context of element on each iteration
            */
      each2(c) {
        let j = $([0]),
          i = -1,
          l = this.length;
        while (
          ++i < l
                    && (j.context = j[0] = this[i])
                    && c.call(j[0], i, j) !== false // "this"=DOM, i=index, j=jQuery object
        );
        return this;
      },
    });
  }
}(jQuery));

(function ($, undefined) {
  /* global document, window, jQuery, console */

  if (window.Select2 !== undefined) {
    return;
  }

  var KEY,
    AbstractSelect2,
    SingleSelect2,
    MultiSelect2,
    nextUid,
    sizer,
    lastMousePosition = { x: 0, y: 0 },
    $document,
    scrollBarDimensions,

    KEY = {
      TAB: 9,
      ENTER: 13,
      ESC: 27,
      SPACE: 32,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SHIFT: 16,
      CTRL: 17,
      ALT: 18,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      HOME: 36,
      END: 35,
      BACKSPACE: 8,
      DELETE: 46,
      isArrow(k) {
        k = k.which ? k.which : k;
        switch (k) {
          case KEY.LEFT:
          case KEY.RIGHT:
          case KEY.UP:
          case KEY.DOWN:
            return true;
        }
        return false;
      },
      isControl(e) {
        const k = e.which;
        switch (k) {
          case KEY.SHIFT:
          case KEY.CTRL:
          case KEY.ALT:
            return true;
        }

        if (e.metaKey) return true;

        return false;
      },
      isFunctionKey(k) {
        k = k.which ? k.which : k;
        return k >= 112 && k <= 123;
      },
    },
    MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",

    DIACRITICS = {
      '\u24B6': 'A', Ａ: 'A', À: 'A', Á: 'A', Â: 'A', Ầ: 'A', Ấ: 'A', Ẫ: 'A', Ẩ: 'A', Ã: 'A', Ā: 'A', Ă: 'A', Ằ: 'A', Ắ: 'A', Ẵ: 'A', Ẳ: 'A', Ȧ: 'A', Ǡ: 'A', Ä: 'A', Ǟ: 'A', Ả: 'A', Å: 'A', Ǻ: 'A', Ǎ: 'A', Ȁ: 'A', Ȃ: 'A', Ạ: 'A', Ậ: 'A', Ặ: 'A', Ḁ: 'A', Ą: 'A', Ⱥ: 'A', Ɐ: 'A', Ꜳ: 'AA', Æ: 'AE', Ǽ: 'AE', Ǣ: 'AE', Ꜵ: 'AO', Ꜷ: 'AU', Ꜹ: 'AV', Ꜻ: 'AV', Ꜽ: 'AY', '\u24B7': 'B', Ｂ: 'B', Ḃ: 'B', Ḅ: 'B', Ḇ: 'B', Ƀ: 'B', Ƃ: 'B', Ɓ: 'B', '\u24B8': 'C', Ｃ: 'C', Ć: 'C', Ĉ: 'C', Ċ: 'C', Č: 'C', Ç: 'C', Ḉ: 'C', Ƈ: 'C', Ȼ: 'C', Ꜿ: 'C', '\u24B9': 'D', Ｄ: 'D', Ḋ: 'D', Ď: 'D', Ḍ: 'D', Ḑ: 'D', Ḓ: 'D', Ḏ: 'D', Đ: 'D', Ƌ: 'D', Ɗ: 'D', Ɖ: 'D', Ꝺ: 'D', Ǳ: 'DZ', Ǆ: 'DZ', ǲ: 'Dz', ǅ: 'Dz', '\u24BA': 'E', Ｅ: 'E', È: 'E', É: 'E', Ê: 'E', Ề: 'E', Ế: 'E', Ễ: 'E', Ể: 'E', Ẽ: 'E', Ē: 'E', Ḕ: 'E', Ḗ: 'E', Ĕ: 'E', Ė: 'E', Ë: 'E', Ẻ: 'E', Ě: 'E', Ȅ: 'E', Ȇ: 'E', Ẹ: 'E', Ệ: 'E', Ȩ: 'E', Ḝ: 'E', Ę: 'E', Ḙ: 'E', Ḛ: 'E', Ɛ: 'E', Ǝ: 'E', '\u24BB': 'F', Ｆ: 'F', Ḟ: 'F', Ƒ: 'F', Ꝼ: 'F', '\u24BC': 'G', Ｇ: 'G', Ǵ: 'G', Ĝ: 'G', Ḡ: 'G', Ğ: 'G', Ġ: 'G', Ǧ: 'G', Ģ: 'G', Ǥ: 'G', Ɠ: 'G', Ꞡ: 'G', Ᵹ: 'G', Ꝿ: 'G', '\u24BD': 'H', Ｈ: 'H', Ĥ: 'H', Ḣ: 'H', Ḧ: 'H', Ȟ: 'H', Ḥ: 'H', Ḩ: 'H', Ḫ: 'H', Ħ: 'H', Ⱨ: 'H', Ⱶ: 'H', Ɥ: 'H', '\u24BE': 'I', Ｉ: 'I', Ì: 'I', Í: 'I', Î: 'I', Ĩ: 'I', Ī: 'I', Ĭ: 'I', İ: 'I', Ï: 'I', Ḯ: 'I', Ỉ: 'I', Ǐ: 'I', Ȉ: 'I', Ȋ: 'I', Ị: 'I', Į: 'I', Ḭ: 'I', Ɨ: 'I', '\u24BF': 'J', Ｊ: 'J', Ĵ: 'J', Ɉ: 'J', '\u24C0': 'K', Ｋ: 'K', Ḱ: 'K', Ǩ: 'K', Ḳ: 'K', Ķ: 'K', Ḵ: 'K', Ƙ: 'K', Ⱪ: 'K', Ꝁ: 'K', Ꝃ: 'K', Ꝅ: 'K', Ꞣ: 'K', '\u24C1': 'L', Ｌ: 'L', Ŀ: 'L', Ĺ: 'L', Ľ: 'L', Ḷ: 'L', Ḹ: 'L', Ļ: 'L', Ḽ: 'L', Ḻ: 'L', Ł: 'L', Ƚ: 'L', Ɫ: 'L', Ⱡ: 'L', Ꝉ: 'L', Ꝇ: 'L', Ꞁ: 'L', Ǉ: 'LJ', ǈ: 'Lj', '\u24C2': 'M', Ｍ: 'M', Ḿ: 'M', Ṁ: 'M', Ṃ: 'M', Ɱ: 'M', Ɯ: 'M', '\u24C3': 'N', Ｎ: 'N', Ǹ: 'N', Ń: 'N', Ñ: 'N', Ṅ: 'N', Ň: 'N', Ṇ: 'N', Ņ: 'N', Ṋ: 'N', Ṉ: 'N', Ƞ: 'N', Ɲ: 'N', Ꞑ: 'N', Ꞥ: 'N', Ǌ: 'NJ', ǋ: 'Nj', '\u24C4': 'O', Ｏ: 'O', Ò: 'O', Ó: 'O', Ô: 'O', Ồ: 'O', Ố: 'O', Ỗ: 'O', Ổ: 'O', Õ: 'O', Ṍ: 'O', Ȭ: 'O', Ṏ: 'O', Ō: 'O', Ṑ: 'O', Ṓ: 'O', Ŏ: 'O', Ȯ: 'O', Ȱ: 'O', Ö: 'O', Ȫ: 'O', Ỏ: 'O', Ő: 'O', Ǒ: 'O', Ȍ: 'O', Ȏ: 'O', Ơ: 'O', Ờ: 'O', Ớ: 'O', Ỡ: 'O', Ở: 'O', Ợ: 'O', Ọ: 'O', Ộ: 'O', Ǫ: 'O', Ǭ: 'O', Ø: 'O', Ǿ: 'O', Ɔ: 'O', Ɵ: 'O', Ꝋ: 'O', Ꝍ: 'O', Ƣ: 'OI', Ꝏ: 'OO', Ȣ: 'OU', '\u24C5': 'P', Ｐ: 'P', Ṕ: 'P', Ṗ: 'P', Ƥ: 'P', Ᵽ: 'P', Ꝑ: 'P', Ꝓ: 'P', Ꝕ: 'P', '\u24C6': 'Q', Ｑ: 'Q', Ꝗ: 'Q', Ꝙ: 'Q', Ɋ: 'Q', '\u24C7': 'R', Ｒ: 'R', Ŕ: 'R', Ṙ: 'R', Ř: 'R', Ȑ: 'R', Ȓ: 'R', Ṛ: 'R', Ṝ: 'R', Ŗ: 'R', Ṟ: 'R', Ɍ: 'R', Ɽ: 'R', Ꝛ: 'R', Ꞧ: 'R', Ꞃ: 'R', '\u24C8': 'S', Ｓ: 'S', ẞ: 'S', Ś: 'S', Ṥ: 'S', Ŝ: 'S', Ṡ: 'S', Š: 'S', Ṧ: 'S', Ṣ: 'S', Ṩ: 'S', Ș: 'S', Ş: 'S', Ȿ: 'S', Ꞩ: 'S', Ꞅ: 'S', '\u24C9': 'T', Ｔ: 'T', Ṫ: 'T', Ť: 'T', Ṭ: 'T', Ț: 'T', Ţ: 'T', Ṱ: 'T', Ṯ: 'T', Ŧ: 'T', Ƭ: 'T', Ʈ: 'T', Ⱦ: 'T', Ꞇ: 'T', Ꜩ: 'TZ', '\u24CA': 'U', Ｕ: 'U', Ù: 'U', Ú: 'U', Û: 'U', Ũ: 'U', Ṹ: 'U', Ū: 'U', Ṻ: 'U', Ŭ: 'U', Ü: 'U', Ǜ: 'U', Ǘ: 'U', Ǖ: 'U', Ǚ: 'U', Ủ: 'U', Ů: 'U', Ű: 'U', Ǔ: 'U', Ȕ: 'U', Ȗ: 'U', Ư: 'U', Ừ: 'U', Ứ: 'U', Ữ: 'U', Ử: 'U', Ự: 'U', Ụ: 'U', Ṳ: 'U', Ų: 'U', Ṷ: 'U', Ṵ: 'U', Ʉ: 'U', '\u24CB': 'V', Ｖ: 'V', Ṽ: 'V', Ṿ: 'V', Ʋ: 'V', Ꝟ: 'V', Ʌ: 'V', Ꝡ: 'VY', '\u24CC': 'W', Ｗ: 'W', Ẁ: 'W', Ẃ: 'W', Ŵ: 'W', Ẇ: 'W', Ẅ: 'W', Ẉ: 'W', Ⱳ: 'W', '\u24CD': 'X', Ｘ: 'X', Ẋ: 'X', Ẍ: 'X', '\u24CE': 'Y', Ｙ: 'Y', Ỳ: 'Y', Ý: 'Y', Ŷ: 'Y', Ỹ: 'Y', Ȳ: 'Y', Ẏ: 'Y', Ÿ: 'Y', Ỷ: 'Y', Ỵ: 'Y', Ƴ: 'Y', Ɏ: 'Y', Ỿ: 'Y', '\u24CF': 'Z', Ｚ: 'Z', Ź: 'Z', Ẑ: 'Z', Ż: 'Z', Ž: 'Z', Ẓ: 'Z', Ẕ: 'Z', Ƶ: 'Z', Ȥ: 'Z', Ɀ: 'Z', Ⱬ: 'Z', Ꝣ: 'Z', '\u24D0': 'a', ａ: 'a', ẚ: 'a', à: 'a', á: 'a', â: 'a', ầ: 'a', ấ: 'a', ẫ: 'a', ẩ: 'a', ã: 'a', ā: 'a', ă: 'a', ằ: 'a', ắ: 'a', ẵ: 'a', ẳ: 'a', ȧ: 'a', ǡ: 'a', ä: 'a', ǟ: 'a', ả: 'a', å: 'a', ǻ: 'a', ǎ: 'a', ȁ: 'a', ȃ: 'a', ạ: 'a', ậ: 'a', ặ: 'a', ḁ: 'a', ą: 'a', ⱥ: 'a', ɐ: 'a', ꜳ: 'aa', æ: 'ae', ǽ: 'ae', ǣ: 'ae', ꜵ: 'ao', ꜷ: 'au', ꜹ: 'av', ꜻ: 'av', ꜽ: 'ay', '\u24D1': 'b', ｂ: 'b', ḃ: 'b', ḅ: 'b', ḇ: 'b', ƀ: 'b', ƃ: 'b', ɓ: 'b', '\u24D2': 'c', ｃ: 'c', ć: 'c', ĉ: 'c', ċ: 'c', č: 'c', ç: 'c', ḉ: 'c', ƈ: 'c', ȼ: 'c', ꜿ: 'c', ↄ: 'c', '\u24D3': 'd', ｄ: 'd', ḋ: 'd', ď: 'd', ḍ: 'd', ḑ: 'd', ḓ: 'd', ḏ: 'd', đ: 'd', ƌ: 'd', ɖ: 'd', ɗ: 'd', ꝺ: 'd', ǳ: 'dz', ǆ: 'dz', '\u24D4': 'e', ｅ: 'e', è: 'e', é: 'e', ê: 'e', ề: 'e', ế: 'e', ễ: 'e', ể: 'e', ẽ: 'e', ē: 'e', ḕ: 'e', ḗ: 'e', ĕ: 'e', ė: 'e', ë: 'e', ẻ: 'e', ě: 'e', ȅ: 'e', ȇ: 'e', ẹ: 'e', ệ: 'e', ȩ: 'e', ḝ: 'e', ę: 'e', ḙ: 'e', ḛ: 'e', ɇ: 'e', ɛ: 'e', ǝ: 'e', '\u24D5': 'f', ｆ: 'f', ḟ: 'f', ƒ: 'f', ꝼ: 'f', '\u24D6': 'g', ｇ: 'g', ǵ: 'g', ĝ: 'g', ḡ: 'g', ğ: 'g', ġ: 'g', ǧ: 'g', ģ: 'g', ǥ: 'g', ɠ: 'g', ꞡ: 'g', ᵹ: 'g', ꝿ: 'g', '\u24D7': 'h', ｈ: 'h', ĥ: 'h', ḣ: 'h', ḧ: 'h', ȟ: 'h', ḥ: 'h', ḩ: 'h', ḫ: 'h', ẖ: 'h', ħ: 'h', ⱨ: 'h', ⱶ: 'h', ɥ: 'h', ƕ: 'hv', '\u24D8': 'i', ｉ: 'i', ì: 'i', í: 'i', î: 'i', ĩ: 'i', ī: 'i', ĭ: 'i', ï: 'i', ḯ: 'i', ỉ: 'i', ǐ: 'i', ȉ: 'i', ȋ: 'i', ị: 'i', į: 'i', ḭ: 'i', ɨ: 'i', ı: 'i', '\u24D9': 'j', ｊ: 'j', ĵ: 'j', ǰ: 'j', ɉ: 'j', '\u24DA': 'k', ｋ: 'k', ḱ: 'k', ǩ: 'k', ḳ: 'k', ķ: 'k', ḵ: 'k', ƙ: 'k', ⱪ: 'k', ꝁ: 'k', ꝃ: 'k', ꝅ: 'k', ꞣ: 'k', '\u24DB': 'l', ｌ: 'l', ŀ: 'l', ĺ: 'l', ľ: 'l', ḷ: 'l', ḹ: 'l', ļ: 'l', ḽ: 'l', ḻ: 'l', ſ: 'l', ł: 'l', ƚ: 'l', ɫ: 'l', ⱡ: 'l', ꝉ: 'l', ꞁ: 'l', ꝇ: 'l', ǉ: 'lj', '\u24DC': 'm', ｍ: 'm', ḿ: 'm', ṁ: 'm', ṃ: 'm', ɱ: 'm', ɯ: 'm', '\u24DD': 'n', ｎ: 'n', ǹ: 'n', ń: 'n', ñ: 'n', ṅ: 'n', ň: 'n', ṇ: 'n', ņ: 'n', ṋ: 'n', ṉ: 'n', ƞ: 'n', ɲ: 'n', ŉ: 'n', ꞑ: 'n', ꞥ: 'n', ǌ: 'nj', '\u24DE': 'o', ｏ: 'o', ò: 'o', ó: 'o', ô: 'o', ồ: 'o', ố: 'o', ỗ: 'o', ổ: 'o', õ: 'o', ṍ: 'o', ȭ: 'o', ṏ: 'o', ō: 'o', ṑ: 'o', ṓ: 'o', ŏ: 'o', ȯ: 'o', ȱ: 'o', ö: 'o', ȫ: 'o', ỏ: 'o', ő: 'o', ǒ: 'o', ȍ: 'o', ȏ: 'o', ơ: 'o', ờ: 'o', ớ: 'o', ỡ: 'o', ở: 'o', ợ: 'o', ọ: 'o', ộ: 'o', ǫ: 'o', ǭ: 'o', ø: 'o', ǿ: 'o', ɔ: 'o', ꝋ: 'o', ꝍ: 'o', ɵ: 'o', ƣ: 'oi', ȣ: 'ou', ꝏ: 'oo', '\u24DF': 'p', ｐ: 'p', ṕ: 'p', ṗ: 'p', ƥ: 'p', ᵽ: 'p', ꝑ: 'p', ꝓ: 'p', ꝕ: 'p', '\u24E0': 'q', ｑ: 'q', ɋ: 'q', ꝗ: 'q', ꝙ: 'q', '\u24E1': 'r', ｒ: 'r', ŕ: 'r', ṙ: 'r', ř: 'r', ȑ: 'r', ȓ: 'r', ṛ: 'r', ṝ: 'r', ŗ: 'r', ṟ: 'r', ɍ: 'r', ɽ: 'r', ꝛ: 'r', ꞧ: 'r', ꞃ: 'r', '\u24E2': 's', ｓ: 's', ß: 's', ś: 's', ṥ: 's', ŝ: 's', ṡ: 's', š: 's', ṧ: 's', ṣ: 's', ṩ: 's', ș: 's', ş: 's', ȿ: 's', ꞩ: 's', ꞅ: 's', ẛ: 's', '\u24E3': 't', ｔ: 't', ṫ: 't', ẗ: 't', ť: 't', ṭ: 't', ț: 't', ţ: 't', ṱ: 't', ṯ: 't', ŧ: 't', ƭ: 't', ʈ: 't', ⱦ: 't', ꞇ: 't', ꜩ: 'tz', '\u24E4': 'u', ｕ: 'u', ù: 'u', ú: 'u', û: 'u', ũ: 'u', ṹ: 'u', ū: 'u', ṻ: 'u', ŭ: 'u', ü: 'u', ǜ: 'u', ǘ: 'u', ǖ: 'u', ǚ: 'u', ủ: 'u', ů: 'u', ű: 'u', ǔ: 'u', ȕ: 'u', ȗ: 'u', ư: 'u', ừ: 'u', ứ: 'u', ữ: 'u', ử: 'u', ự: 'u', ụ: 'u', ṳ: 'u', ų: 'u', ṷ: 'u', ṵ: 'u', ʉ: 'u', '\u24E5': 'v', ｖ: 'v', ṽ: 'v', ṿ: 'v', ʋ: 'v', ꝟ: 'v', ʌ: 'v', ꝡ: 'vy', '\u24E6': 'w', ｗ: 'w', ẁ: 'w', ẃ: 'w', ŵ: 'w', ẇ: 'w', ẅ: 'w', ẘ: 'w', ẉ: 'w', ⱳ: 'w', '\u24E7': 'x', ｘ: 'x', ẋ: 'x', ẍ: 'x', '\u24E8': 'y', ｙ: 'y', ỳ: 'y', ý: 'y', ŷ: 'y', ỹ: 'y', ȳ: 'y', ẏ: 'y', ÿ: 'y', ỷ: 'y', ẙ: 'y', ỵ: 'y', ƴ: 'y', ɏ: 'y', ỿ: 'y', '\u24E9': 'z', ｚ: 'z', ź: 'z', ẑ: 'z', ż: 'z', ž: 'z', ẓ: 'z', ẕ: 'z', ƶ: 'z', ȥ: 'z', ɀ: 'z', ⱬ: 'z', ꝣ: 'z', Ά: '\u0391', Έ: '\u0395', Ή: '\u0397', Ί: '\u0399', Ϊ: '\u0399', Ό: '\u039F', Ύ: '\u03A5', Ϋ: '\u03A5', Ώ: '\u03A9', ά: '\u03B1', έ: '\u03B5', ή: '\u03B7', ί: '\u03B9', ϊ: '\u03B9', ΐ: '\u03B9', ό: '\u03BF', ύ: '\u03C5', ϋ: '\u03C5', ΰ: '\u03C5', ω: '\u03C9', ς: '\u03C3',
    };

  $document = $(document);

  nextUid = (function () { let counter = 1; return function () { return counter++; }; }());


  function reinsertElement(element) {
    const placeholder = $(document.createTextNode(''));

    element.before(placeholder);
    placeholder.before(element);
    placeholder.remove();
  }

  function stripDiacritics(str) {
    // Used 'uni range + named function' from http://jsperf.com/diacritics/18
    function match(a) {
      return DIACRITICS[a] || a;
    }

    return str.replace(/[^\u0000-\u007E]/g, match);
  }

  function indexOf(value, array) {
    let i = 0,
      l = array.length;
    for (; i < l; i += 1) {
      if (equal(value, array[i])) return i;
    }
    return -1;
  }

  function measureScrollbar() {
    const $template = $(MEASURE_SCROLLBAR_TEMPLATE);
    $template.appendTo('body');

    const dim = {
      width: $template.width() - $template[0].clientWidth,
      height: $template.height() - $template[0].clientHeight,
    };
    $template.remove();

    return dim;
  }

  /**
     * Compares equality of a and b
     * @param a
     * @param b
     */
  function equal(a, b) {
    if (a === b) return true;
    if (a === undefined || b === undefined) return false;
    if (a === null || b === null) return false;
    // Check whether 'a' or 'b' is a string (primitive or object).
    // The concatenation of an empty string (+'') converts its argument to a string's primitive.
    if (a.constructor === String) return `${a}` === `${b}`; // a+'' - in case 'a' is a String object
    if (b.constructor === String) return `${b}` === `${a}`; // b+'' - in case 'b' is a String object
    return false;
  }

  /**
     * Splits the string into an array of values, trimming each value. An empty array is returned for nulls or empty
     * strings
     * @param string
     * @param separator
     */
  function splitVal(string, separator) {
    let val,
      i,
      l;
    if (string === null || string.length < 1) return [];
    val = string.split(separator);
    for (i = 0, l = val.length; i < l; i += 1) val[i] = $.trim(val[i]);
    return val;
  }

  function getSideBorderPadding(element) {
    return element.outerWidth(false) - element.width();
  }

  function installKeyUpChangeEvent(element) {
    const key = 'keyup-change-value';
    element.on('keydown', () => {
      if ($.data(element, key) === undefined) {
        $.data(element, key, element.val());
      }
    });
    element.on('keyup', () => {
      const val = $.data(element, key);
      if (val !== undefined && element.val() !== val) {
        $.removeData(element, key);
        element.trigger('keyup-change');
      }
    });
  }


  /**
     * filters mouse events so an event is fired only if the mouse moved.
     *
     * filters out mouse events that occur when mouse is stationary but
     * the elements under the pointer are scrolled.
     */
  function installFilteredMouseMove(element) {
    element.on('mousemove', (e) => {
      const lastpos = lastMousePosition;
      if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
        $(e.target).trigger('mousemove-filtered', e);
      }
    });
  }

  /**
     * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
     * within the last quietMillis milliseconds.
     *
     * @param quietMillis number of milliseconds to wait before invoking fn
     * @param fn function to be debounced
     * @param ctx object to be used as this reference within fn
     * @return debounced version of fn
     */
  function debounce(quietMillis, fn, ctx) {
    ctx = ctx || undefined;
    let timeout;
    return function () {
      const args = arguments;
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        fn.apply(ctx, args);
      }, quietMillis);
    };
  }

  function installDebouncedScroll(threshold, element) {
    const notify = debounce(threshold, (e) => { element.trigger('scroll-debounced', e); });
    element.on('scroll', (e) => {
      if (indexOf(e.target, element.get()) >= 0) notify(e);
    });
  }

  function focus($el) {
    if ($el[0] === document.activeElement) return;

    /* set the focus in a 0 timeout - that way the focus is set after the processing
            of the current event has finished - which seems like the only reliable way
            to set focus */
    window.setTimeout(() => {
      let el = $el[0],
        pos = $el.val().length,
        range;

      $el.focus();

      /* make sure el received focus so we do not error out when trying to manipulate the caret.
                sometimes modals or others listeners may steal it after its set */
      const isVisible = (el.offsetWidth > 0 || el.offsetHeight > 0);
      if (isVisible && el === document.activeElement) {
        /* after the focus is set move the caret to the end, necessary when we val()
                    just before setting focus */
        if (el.setSelectionRange) {
          el.setSelectionRange(pos, pos);
        } else if (el.createTextRange) {
          range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
      }
    }, 0);
  }

  function getCursorInfo(el) {
    el = $(el)[0];
    let offset = 0;
    let length = 0;
    if ('selectionStart' in el) {
      offset = el.selectionStart;
      length = el.selectionEnd - offset;
    } else if ('selection' in document) {
      el.focus();
      const sel = document.selection.createRange();
      length = document.selection.createRange().text.length;
      sel.moveStart('character', -el.value.length);
      offset = sel.text.length - length;
    }
    return { offset, length };
  }

  function killEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  function killEventImmediately(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function measureTextWidth(e) {
    if (!sizer) {
      const style = e[0].currentStyle || window.getComputedStyle(e[0], null);
      sizer = $(document.createElement('div')).css({
        position: 'absolute',
        left: '-10000px',
        top: '-10000px',
        display: 'none',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        textTransform: style.textTransform,
        whiteSpace: 'nowrap',
      });
      sizer.attr('class', 'select2-sizer');
      $('body').append(sizer);
    }
    sizer.text(e.val());
    return sizer.width();
  }

  function syncCssClasses(dest, src, adapter) {
    let classes,
      replacements = [],
      adapted;

    classes = $.trim(dest.attr('class'));

    if (classes) {
      classes = `${classes}`; // for IE which returns object

      $(classes.split(/\s+/)).each2(function () {
        if (this.indexOf('select2-') === 0) {
          replacements.push(this);
        }
      });
    }

    classes = $.trim(src.attr('class'));

    if (classes) {
      classes = `${classes}`; // for IE which returns object

      $(classes.split(/\s+/)).each2(function () {
        if (this.indexOf('select2-') !== 0) {
          adapted = adapter(this);

          if (adapted) {
            replacements.push(adapted);
          }
        }
      });
    }

    dest.attr('class', replacements.join(' '));
  }


  function markMatch(text, term, markup, escapeMarkup) {
    let match = stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
      tl = term.length;

    if (match < 0) {
      markup.push(escapeMarkup(text));
      return;
    }

    markup.push(escapeMarkup(text.substring(0, match)));
    markup.push("<span class='select2-match'>");
    markup.push(escapeMarkup(text.substring(match, match + tl)));
    markup.push('</span>');
    markup.push(escapeMarkup(text.substring(match + tl, text.length)));
  }

  function defaultEscapeMarkup(markup) {
    const replace_map = {
      '\\': '&#92;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#47;',
    };

    return String(markup).replace(/[&<>"'\/\\]/g, match => replace_map[match]);
  }

  /**
     * Produces an ajax-based query function
     *
     * @param options object containing configuration parameters
     * @param options.params parameter map for the transport ajax call, can contain such options as cache, jsonpCallback, etc. see $.ajax
     * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
     * @param options.url url for the data
     * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
     * @param options.dataType request data type: ajax, jsonp, other datatypes supported by jQuery's $.ajax function or the transport function if specified
     * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
     * @param options.results a function(remoteData, pageNumber, query) that converts data returned form the remote request to the format expected by Select2.
     *      The expected format is an object containing the following keys:
     *      results array of objects that will be used as choices
     *      more (optional) boolean indicating whether there are more results available
     *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
     */
  function ajax(options) {
    let timeout, // current scheduled but not yet executed request
      handler = null,
      quietMillis = options.quietMillis || 100,
      ajaxUrl = options.url,
      self = this;

    return function (query) {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        let data = options.data, // ajax data function
          url = ajaxUrl, // ajax url string or function
          transport = options.transport || $.fn.select2.ajaxDefaults.transport,
          // deprecated - to be removed in 4.0  - use params instead
          deprecated = {
            type: options.type || 'GET', // set type of request (GET or POST)
            cache: options.cache || false,
            jsonpCallback: options.jsonpCallback || undefined,
            dataType: options.dataType || 'json',
          },
          params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);

        data = data ? data.call(self, query.term, query.page, query.context) : null;
        url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;

        if (handler && typeof handler.abort === 'function') { handler.abort(); }

        if (options.params) {
          if ($.isFunction(options.params)) {
            $.extend(params, options.params.call(self));
          } else {
            $.extend(params, options.params);
          }
        }

        $.extend(params, {
          url,
          dataType: options.dataType,
          data,
          success(data) {
            // TODO - replace query.page with query so users have access to term, page, etc.
            // added query as third paramter to keep backwards compatibility
            const results = options.results(data, query.page, query);
            query.callback(results);
          },
        });
        handler = transport.call(self, params);
      }, quietMillis);
    };
  }

  /**
     * Produces a query function that works with a local array
     *
     * @param options object containing configuration parameters. The options parameter can either be an array or an
     * object.
     *
     * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
     *
     * If the object form is used it is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
     * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
     * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
     * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
     * the text.
     */
  function local(options) {
    let data = options, // data elements
      dataText,
      tmp,
      text = function (item) { return `${item.text}`; }; // function used to retrieve the text portion of a data item that is matched against the search

    if ($.isArray(data)) {
      tmp = data;
      data = { results: tmp };
    }

    if ($.isFunction(data) === false) {
      tmp = data;
      data = function () { return tmp; };
    }

    const dataItem = data();
    if (dataItem.text) {
      text = dataItem.text;
      // if text is not a function we assume it to be a key name
      if (!$.isFunction(text)) {
        dataText = dataItem.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
        text = function (item) { return item[dataText]; };
      }
    }

    return function (query) {
      let t = query.term,
        filtered = { results: [] },
        process;
      if (t === '') {
        query.callback(data());
        return;
      }

      process = function (datum, collection) {
        let group,
          attr;
        datum = datum[0];
        if (datum.children) {
          group = {};
          for (attr in datum) {
            if (datum.hasOwnProperty(attr)) group[attr] = datum[attr];
          }
          group.children = [];
          $(datum.children).each2((i, childDatum) => { process(childDatum, group.children); });
          if (group.children.length || query.matcher(t, text(group), datum)) {
            collection.push(group);
          }
        } else if (query.matcher(t, text(datum), datum)) {
          collection.push(datum);
        }
      };

      $(data().results).each2((i, datum) => { process(datum, filtered.results); });
      query.callback(filtered);
    };
  }

  // TODO javadoc
  function tags(data) {
    const isFunc = $.isFunction(data);
    return function (query) {
      let t = query.term,
        filtered = { results: [] };
      const result = isFunc ? data(query) : data;
      if ($.isArray(result)) {
        $(result).each(function () {
          let isObject = this.text !== undefined,
            text = isObject ? this.text : this;
          if (t === '' || query.matcher(t, text)) {
            filtered.results.push(isObject ? this : { id: this, text: this });
          }
        });
        query.callback(filtered);
      }
    };
  }

  /**
     * Checks if the formatter function should be used.
     *
     * Throws an error if it is not a function. Returns true if it should be used,
     * false if no formatting should be performed.
     *
     * @param formatter
     */
  function checkFormatter(formatter, formatterName) {
    if ($.isFunction(formatter)) return true;
    if (!formatter) return false;
    if (typeof (formatter) === 'string') return true;
    throw new Error(`${formatterName} must be a string, function, or falsy value`);
  }

  /**
   * Returns a given value
   * If given a function, returns its output
   *
   * @param val string|function
   * @param context value of "this" to be passed to function
   * @returns {*}
   */
  function evaluate(val, context) {
    if ($.isFunction(val)) {
      const args = Array.prototype.slice.call(arguments, 2);
      return val.apply(context, args);
    }
    return val;
  }

  function countResults(results) {
    let count = 0;
    $.each(results, (i, item) => {
      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    });
    return count;
  }

  /**
     * Default tokenizer. This function uses breaks the input on substring match of any string from the
     * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
     * two options have to be defined in order for the tokenizer to work.
     *
     * @param input text user has typed so far or pasted into the search field
     * @param selection currently selected choices
     * @param selectCallback function(choice) callback tho add the choice to selection
     * @param opts select2's opts
     * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
     */
  function defaultTokenizer(input, selection, selectCallback, opts) {
    let original = input, // store the original so we can compare and know if we need to tell the search to update its text
      dupe = false, // check for whether a token we extracted represents a duplicate selected choice
      token, // token
      index, // position at which the separator was found
      i,
      l, // looping variables
      separator; // the matched separator

    if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

    while (true) {
      index = -1;

      for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
        separator = opts.tokenSeparators[i];
        index = input.indexOf(separator);
        if (index >= 0) break;
      }

      if (index < 0) break; // did not find any token separator in the input string, bail

      token = input.substring(0, index);
      input = input.substring(index + separator.length);

      if (token.length > 0) {
        token = opts.createSearchChoice.call(this, token, selection);
        if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
          dupe = false;
          for (i = 0, l = selection.length; i < l; i++) {
            if (equal(opts.id(token), opts.id(selection[i]))) {
              dupe = true; break;
            }
          }

          if (!dupe) selectCallback(token);
        }
      }
    }

    if (original !== input) return input;
  }

  function cleanupJQueryElements() {
    const self = this;

    $.each(arguments, (i, element) => {
      self[element].remove();
      self[element] = null;
    });
  }

  /**
     * Creates a new class
     *
     * @param superClass
     * @param methods
     */
  function clazz(SuperClass, methods) {
    const constructor = function () {};
    constructor.prototype = new SuperClass();
    constructor.prototype.constructor = constructor;
    constructor.prototype.parent = SuperClass.prototype;
    constructor.prototype = $.extend(constructor.prototype, methods);
    return constructor;
  }

  AbstractSelect2 = clazz(Object, {

    // abstract
    bind(func) {
      const self = this;
      return function () {
        func.apply(self, arguments);
      };
    },

    // abstract
    init(opts) {
      let results,
        search,
        resultsSelector = '.select2-results';

      // prepare options
      this.opts = opts = this.prepareOpts(opts);

      this.id = opts.id;

      // destroy if called on an existing component
      if (opts.element.data('select2') !== undefined &&
                opts.element.data('select2') !== null) {
        opts.element.data('select2').destroy();
      }

      this.container = this.createContainer();

      this.liveRegion = $('<span>', {
        role: 'status',
        'aria-live': 'polite',
      })
        .addClass('select2-hidden-accessible')
        .appendTo(document.body);

      this.containerId = `s2id_${opts.element.attr('id') || `autogen${nextUid()}`}`;
      this.containerEventName = this.containerId
        .replace(/([.])/g, '_')
        .replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
      this.container.attr('id', this.containerId);

      this.container.attr('title', opts.element.attr('title'));

      this.body = $('body');

      syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);

      this.container.attr('style', opts.element.attr('style'));
      this.container.css(evaluate(opts.containerCss, this.opts.element));
      this.container.addClass(evaluate(opts.containerCssClass, this.opts.element));

      this.elementTabIndex = this.opts.element.attr('tabindex');

      // swap container for the element
      this.opts.element
        .data('select2', this)
        .attr('tabindex', '-1')
        .before(this.container)
        .on('click.select2', killEvent); // do not leak click events

      this.container.data('select2', this);

      this.dropdown = this.container.find('.select2-drop');

      syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);

      this.dropdown.addClass(evaluate(opts.dropdownCssClass, this.opts.element));
      this.dropdown.data('select2', this);
      this.dropdown.on('click', killEvent);

      this.results = results = this.container.find(resultsSelector);
      this.search = search = this.container.find('input.select2-input');

      this.queryCount = 0;
      this.resultsPage = 0;
      this.context = null;

      // initialize the container
      this.initContainer();

      this.container.on('click', killEvent);

      installFilteredMouseMove(this.results);

      this.dropdown.on('mousemove-filtered', resultsSelector, this.bind(this.highlightUnderEvent));
      this.dropdown.on('touchstart touchmove touchend', resultsSelector, this.bind(function (event) {
        this._touchEvent = true;
        this.highlightUnderEvent(event);
      }));
      this.dropdown.on('touchmove', resultsSelector, this.bind(this.touchMoved));
      this.dropdown.on('touchstart touchend', resultsSelector, this.bind(this.clearTouchMoved));

      // Waiting for a click event on touch devices to select option and hide dropdown
      // otherwise click will be triggered on an underlying element
      this.dropdown.on('click', this.bind(function (event) {
        if (this._touchEvent) {
          this._touchEvent = false;
          this.selectHighlighted();
        }
      }));

      installDebouncedScroll(80, this.results);
      this.dropdown.on('scroll-debounced', resultsSelector, this.bind(this.loadMoreIfNeeded));

      // do not propagate change event from the search field out of the component
      $(this.container).on('change', '.select2-input', (e) => { e.stopPropagation(); });
      $(this.dropdown).on('change', '.select2-input', (e) => { e.stopPropagation(); });

      // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
      if ($.fn.mousewheel) {
        results.mousewheel((e, delta, deltaX, deltaY) => {
          const top = results.scrollTop();
          if (deltaY > 0 && top - deltaY <= 0) {
            results.scrollTop(0);
            killEvent(e);
          } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
            results.scrollTop(results.get(0).scrollHeight - results.height());
            killEvent(e);
          }
        });
      }

      installKeyUpChangeEvent(search);
      search.on('keyup-change input paste', this.bind(this.updateResults));
      search.on('focus', () => { search.addClass('select2-focused'); });
      search.on('blur', () => { search.removeClass('select2-focused'); });

      this.dropdown.on('mouseup', resultsSelector, this.bind(function (e) {
        if ($(e.target).closest('.select2-result-selectable').length > 0) {
          this.highlightUnderEvent(e);
          this.selectHighlighted(e);
        }
      }));

      // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
      // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
      // dom it will trigger the popup close, which is not what we want
      // focusin can cause focus wars between modals and select2 since the dropdown is outside the modal.
      this.dropdown.on('click mouseup mousedown touchstart touchend focusin', (e) => { e.stopPropagation(); });

      this.nextSearchTerm = undefined;

      if ($.isFunction(this.opts.initSelection)) {
        // initialize selection based on the current value of the source element
        this.initSelection();

        // if the user has provided a function that can set selection based on the value of the source element
        // we monitor the change event on the element and trigger it, allowing for two way synchronization
        this.monitorSource();
      }

      if (opts.maximumInputLength !== null) {
        this.search.attr('maxlength', opts.maximumInputLength);
      }

      let disabled = opts.element.prop('disabled');
      if (disabled === undefined) disabled = false;
      this.enable(!disabled);

      let readonly = opts.element.prop('readonly');
      if (readonly === undefined) readonly = false;
      this.readonly(readonly);

      // Calculate size of scrollbar
      scrollBarDimensions = scrollBarDimensions || measureScrollbar();

      this.autofocus = opts.element.prop('autofocus');
      opts.element.prop('autofocus', false);
      if (this.autofocus) this.focus();

      this.search.attr('placeholder', opts.searchInputPlaceholder);
    },

    // abstract
    destroy() {
      let element = this.opts.element,
        select2 = element.data('select2');

      this.close();

      if (element.length && element[0].detachEvent) {
        element.each(function () {
          this.detachEvent('onpropertychange', this._sync);
        });
      }
      if (this.propertyObserver) {
        this.propertyObserver.disconnect();
        this.propertyObserver = null;
      }
      this._sync = null;

      if (select2 !== undefined) {
        select2.container.remove();
        select2.liveRegion.remove();
        select2.dropdown.remove();
        element
          .removeClass('select2-offscreen')
          .removeData('select2')
          .off('.select2')
          .prop('autofocus', this.autofocus || false);
        if (this.elementTabIndex) {
          element.attr({ tabindex: this.elementTabIndex });
        } else {
          element.removeAttr('tabindex');
        }
        element.show();
      }

      cleanupJQueryElements.call(
        this,
        'container',
        'liveRegion',
        'dropdown',
        'results',
        'search',
      );
    },

    // abstract
    optionToData(element) {
      if (element.is('option')) {
        return {
          id: element.prop('value'),
          text: element.text(),
          element: element.get(),
          css: element.attr('class'),
          disabled: element.prop('disabled'),
          locked: equal(element.attr('locked'), 'locked') || equal(element.data('locked'), true),
        };
      } else if (element.is('optgroup')) {
        return {
          text: element.attr('label'),
          children: [],
          element: element.get(),
          css: element.attr('class'),
        };
      }
    },

    // abstract
    prepareOpts(opts) {
      let element,
        select,
        idKey,
        ajaxUrl,
        self = this;

      element = opts.element;

      if (element.get(0).tagName.toLowerCase() === 'select') {
        this.select = select = opts.element;
      }

      if (select) {
        // these options are not allowed when attached to a select because they are picked up off the element itself
        $.each(['id', 'multiple', 'ajax', 'query', 'createSearchChoice', 'initSelection', 'data', 'tags'], function () {
          if (this in opts) {
            throw new Error(`Option '${this}' is not allowed for Select2 when attached to a <select> element.`);
          }
        });
      }

      opts = $.extend({}, {
        populateResults(container, results, query) {
          let populate,
            id = this.opts.id,
            liveRegion = this.liveRegion;

          populate = function (results, container, depth) {
            let i,
              l,
              result,
              selectable,
              disabled,
              compound,
              node,
              label,
              innerContainer,
              formatted;

            results = opts.sortResults(results, container, query);

            // collect the created nodes for bulk append
            const nodes = [];
            for (i = 0, l = results.length; i < l; i += 1) {
              result = results[i];

              disabled = (result.disabled === true);
              selectable = (!disabled) && (id(result) !== undefined);

              compound = result.children && result.children.length > 0;

              node = $('<li></li>');
              node.addClass(`select2-results-dept-${depth}`);
              node.addClass('select2-result');
              node.addClass(selectable ? 'select2-result-selectable' : 'select2-result-unselectable');
              if (disabled) { node.addClass('select2-disabled'); }
              if (compound) { node.addClass('select2-result-with-children'); }
              node.addClass(self.opts.formatResultCssClass(result));
              node.attr('role', 'presentation');

              label = $(document.createElement('div'));
              label.addClass('select2-result-label');
              label.attr('id', `select2-result-label-${nextUid()}`);
              label.attr('role', 'option');

              formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
              if (formatted !== undefined) {
                label.html(formatted);
                node.append(label);
              }


              if (compound) {
                innerContainer = $('<ul></ul>');
                innerContainer.addClass('select2-result-sub');
                populate(result.children, innerContainer, depth + 1);
                node.append(innerContainer);
              }

              node.data('select2-data', result);
              nodes.push(node[0]);
            }

            // bulk append the created nodes
            container.append(nodes);
            liveRegion.text(opts.formatMatches(results.length));
          };

          populate(results, container, 0);
        },
      }, $.fn.select2.defaults, opts);

      if (typeof (opts.id) !== 'function') {
        idKey = opts.id;
        opts.id = function (e) { return e[idKey]; };
      }

      if ($.isArray(opts.element.data('select2Tags'))) {
        if ('tags' in opts) {
          throw `tags specified as both an attribute 'data-select2-tags' and in options of Select2 ${opts.element.attr('id')}`;
        }
        opts.tags = opts.element.data('select2Tags');
      }

      if (select) {
        opts.query = this.bind(function (query) {
          let data = { results: [], more: false },
            term = query.term,
            children,
            placeholderOption,
            process;

          process = function (element, collection) {
            let group;
            if (element.is('option')) {
              if (query.matcher(term, element.text(), element)) {
                collection.push(self.optionToData(element));
              }
            } else if (element.is('optgroup')) {
              group = self.optionToData(element);
              element.children().each2((i, elm) => { process(elm, group.children); });
              if (group.children.length > 0) {
                collection.push(group);
              }
            }
          };

          children = element.children();

          // ignore the placeholder option if there is one
          if (this.getPlaceholder() !== undefined && children.length > 0) {
            placeholderOption = this.getPlaceholderOption();
            if (placeholderOption) {
              children = children.not(placeholderOption);
            }
          }

          children.each2((i, elm) => { process(elm, data.results); });

          query.callback(data);
        });
        // this is needed because inside val() we construct choices from options and there id is hardcoded
        opts.id = function (e) { return e.id; };
      } else if (!('query' in opts)) {
        if ('ajax' in opts) {
          ajaxUrl = opts.element.data('ajax-url');
          if (ajaxUrl && ajaxUrl.length > 0) {
            opts.ajax.url = ajaxUrl;
          }
          opts.query = ajax.call(opts.element, opts.ajax);
        } else if ('data' in opts) {
          opts.query = local(opts.data);
        } else if ('tags' in opts) {
          opts.query = tags(opts.tags);
          if (opts.createSearchChoice === undefined) {
            opts.createSearchChoice = function (term) { return { id: $.trim(term), text: $.trim(term) }; };
          }
          if (opts.initSelection === undefined) {
            opts.initSelection = function (element, callback) {
              const data = [];
              $(splitVal(element.val(), opts.separator)).each(function () {
                let obj = { id: this, text: this },
                  tags = opts.tags;
                if ($.isFunction(tags)) tags = tags();
                $(tags).each(function () { if (equal(this.id, obj.id)) { obj = this; return false; } });
                data.push(obj);
              });

              callback(data);
            };
          }
        }
      }
      if (typeof (opts.query) !== 'function') {
        throw `query function not defined for Select2 ${opts.element.attr('id')}`;
      }

      if (opts.createSearchChoicePosition === 'top') {
        opts.createSearchChoicePosition = function (list, item) { list.unshift(item); };
      } else if (opts.createSearchChoicePosition === 'bottom') {
        opts.createSearchChoicePosition = function (list, item) { list.push(item); };
      } else if (typeof (opts.createSearchChoicePosition) !== 'function') {
        throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
      }

      return opts;
    },

    /**
         * Monitor the original element for changes and update select2 accordingly
         */
    // abstract
    monitorSource() {
      let el = this.opts.element,
        observer,
        self = this;

      el.on('change.select2', this.bind(function (e) {
        if (this.opts.element.data('select2-change-triggered') !== true) {
          this.initSelection();
        }
      }));

      this._sync = this.bind(function () {
        // sync enabled state
        let disabled = el.prop('disabled');
        if (disabled === undefined) disabled = false;
        this.enable(!disabled);

        let readonly = el.prop('readonly');
        if (readonly === undefined) readonly = false;
        this.readonly(readonly);

        syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
        this.container.addClass(evaluate(this.opts.containerCssClass, this.opts.element));

        syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
        this.dropdown.addClass(evaluate(this.opts.dropdownCssClass, this.opts.element));
      });

      // IE8-10 (IE9/10 won't fire propertyChange via attachEventListener)
      if (el.length && el[0].attachEvent) {
        el.each(function () {
          this.attachEvent('onpropertychange', self._sync);
        });
      }

      // safari, chrome, firefox, IE11
      observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
      if (observer !== undefined) {
        if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }
        this.propertyObserver = new observer(((mutations) => {
          $.each(mutations, self._sync);
        }));
        this.propertyObserver.observe(el.get(0), { attributes: true, subtree: false });
      }
    },

    // abstract
    triggerSelect(data) {
      const evt = $.Event('select2-selecting', { val: this.id(data), object: data, choice: data });
      this.opts.element.trigger(evt);
      return !evt.isDefaultPrevented();
    },

    /**
         * Triggers the change event on the source element
         */
    // abstract
    triggerChange(details) {
      details = details || {};
      details = $.extend({}, details, { type: 'change', val: this.val() });
      // prevents recursive triggering
      this.opts.element.data('select2-change-triggered', true);
      this.opts.element.trigger(details);
      this.opts.element.data('select2-change-triggered', false);

      // some validation frameworks ignore the change event and listen instead to keyup, click for selects
      // so here we trigger the click event manually
      this.opts.element.click();

      // ValidationEngine ignores the change event and listens instead to blur
      // so here we trigger the blur event manually if so desired
      if (this.opts.blurOnChange) { this.opts.element.blur(); }
    },

    // abstract
    isInterfaceEnabled() {
      return this.enabledInterface === true;
    },

    // abstract
    enableInterface() {
      let enabled = this._enabled && !this._readonly,
        disabled = !enabled;

      if (enabled === this.enabledInterface) return false;

      this.container.toggleClass('select2-container-disabled', disabled);
      this.close();
      this.enabledInterface = enabled;

      return true;
    },

    // abstract
    enable(enabled) {
      if (enabled === undefined) enabled = true;
      if (this._enabled === enabled) return;
      this._enabled = enabled;

      this.opts.element.prop('disabled', !enabled);
      this.enableInterface();
    },

    // abstract
    disable() {
      this.enable(false);
    },

    // abstract
    readonly(enabled) {
      if (enabled === undefined) enabled = false;
      if (this._readonly === enabled) return;
      this._readonly = enabled;

      this.opts.element.prop('readonly', enabled);
      this.enableInterface();
    },

    // abstract
    opened() {
      return (this.container) ? this.container.hasClass('select2-dropdown-open') : false;
    },

    // abstract
    positionDropdown() {
      let $dropdown = this.dropdown,
        offset = this.container.offset(),
        height = this.container.outerHeight(false),
        width = this.container.outerWidth(false),
        dropHeight = $dropdown.outerHeight(false),
        $window = $(window),
        windowWidth = $window.width(),
        windowHeight = $window.height(),
        viewPortRight = $window.scrollLeft() + windowWidth,
        viewportBottom = $window.scrollTop() + windowHeight,
        dropTop = offset.top + height,
        dropLeft = offset.left,
        enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
        enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),
        dropWidth = $dropdown.outerWidth(false),
        enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,
        aboveNow = $dropdown.hasClass('select2-drop-above'),
        bodyOffset,
        above,
        changeDirection,
        css,
        resultsListNode;

      // always prefer the current above/below alignment, unless there is not enough room
      if (aboveNow) {
        above = true;
        if (!enoughRoomAbove && enoughRoomBelow) {
          changeDirection = true;
          above = false;
        }
      } else {
        above = false;
        if (!enoughRoomBelow && enoughRoomAbove) {
          changeDirection = true;
          above = true;
        }
      }

      // if we are changing direction we need to get positions when dropdown is hidden;
      if (changeDirection) {
        $dropdown.hide();
        offset = this.container.offset();
        height = this.container.outerHeight(false);
        width = this.container.outerWidth(false);
        dropHeight = $dropdown.outerHeight(false);
        viewPortRight = $window.scrollLeft() + windowWidth;
        viewportBottom = $window.scrollTop() + windowHeight;
        dropTop = offset.top + height;
        dropLeft = offset.left;
        dropWidth = $dropdown.outerWidth(false);
        enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
        $dropdown.show();

        // fix so the cursor does not move to the left within the search-textbox in IE
        this.focusSearch();
      }

      if (this.opts.dropdownAutoWidth) {
        resultsListNode = $('.select2-results', $dropdown)[0];
        $dropdown.addClass('select2-drop-auto-width');
        $dropdown.css('width', '');
        // Add scrollbar width to dropdown if vertical scrollbar is present
        dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
        dropWidth > width ? width = dropWidth : dropWidth = width;
        dropHeight = $dropdown.outerHeight(false);
        enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
      } else {
        this.container.removeClass('select2-drop-auto-width');
      }

      // console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
      // console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body.scrollTop(), "enough?", enoughRoomAbove);

      // fix positioning when body has an offset and is not position: static
      if (this.body.css('position') !== 'static') {
        bodyOffset = this.body.offset();
        dropTop -= bodyOffset.top;
        dropLeft -= bodyOffset.left;
      }

      if (!enoughRoomOnRight) {
        dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;
      }

      css = {
        left: dropLeft,
        width,
      };

      if (above) {
        css.top = offset.top - dropHeight;
        css.bottom = 'auto';
        this.container.addClass('select2-drop-above');
        $dropdown.addClass('select2-drop-above');
      } else {
        css.top = dropTop;
        css.bottom = 'auto';
        this.container.removeClass('select2-drop-above');
        $dropdown.removeClass('select2-drop-above');
      }
      css = $.extend(css, evaluate(this.opts.dropdownCss, this.opts.element));

      $dropdown.css(css);
    },

    // abstract
    shouldOpen() {
      let event;

      if (this.opened()) return false;

      if (this._enabled === false || this._readonly === true) return false;

      event = $.Event('select2-opening');
      this.opts.element.trigger(event);
      return !event.isDefaultPrevented();
    },

    // abstract
    clearDropdownAlignmentPreference() {
      // clear the classes used to figure out the preference of where the dropdown should be opened
      this.container.removeClass('select2-drop-above');
      this.dropdown.removeClass('select2-drop-above');
    },

    /**
         * Opens the dropdown
         *
         * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
         * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
         */
    // abstract
    open() {
      if (!this.shouldOpen()) return false;

      this.opening();

      // Only bind the document mousemove when the dropdown is visible
      $document.on('mousemove.select2Event', (e) => {
        lastMousePosition.x = e.pageX;
        lastMousePosition.y = e.pageY;
      });

      return true;
    },

    /**
         * Performs the opening of the dropdown
         */
    // abstract
    opening() {
      let cid = this.containerEventName,
        scroll = `scroll.${cid}`,
        resize = `resize.${cid}`,
        orient = `orientationchange.${cid}`,
        mask;

      this.container.addClass('select2-dropdown-open').addClass('select2-container-active');

      this.clearDropdownAlignmentPreference();

      if (this.dropdown[0] !== this.body.children().last()[0]) {
        this.dropdown.detach().appendTo(this.body);
      }

      // create the dropdown mask if doesn't already exist
      mask = $('#select2-drop-mask');
      if (mask.length == 0) {
        mask = $(document.createElement('div'));
        mask.attr('id', 'select2-drop-mask').attr('class', 'select2-drop-mask');
        mask.hide();
        mask.appendTo(this.body);
        mask.on('mousedown touchstart click', (e) => {
          // Prevent IE from generating a click event on the body
          reinsertElement(mask);

          let dropdown = $('#select2-drop'),
            self;
          if (dropdown.length > 0) {
            self = dropdown.data('select2');
            if (self.opts.selectOnBlur) {
              self.selectHighlighted({ noFocus: true });
            }
            self.close();
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }

      // ensure the mask is always right before the dropdown
      if (this.dropdown.prev()[0] !== mask[0]) {
        this.dropdown.before(mask);
      }

      // move the global id to the correct dropdown
      $('#select2-drop').removeAttr('id');
      this.dropdown.attr('id', 'select2-drop');

      // show the elements
      mask.show();

      this.positionDropdown();
      this.dropdown.show();
      this.positionDropdown();

      this.dropdown.addClass('select2-drop-active');

      // attach listeners to events that can change the position of the container and thus require
      // the position of the dropdown to be updated as well so it does not come unglued from the container
      const that = this;
      this.container.parents().add(window).each(function () {
        $(this).on(`${resize} ${scroll} ${orient}`, (e) => {
          if (that.opened()) that.positionDropdown();
        });
      });
    },

    // abstract
    close() {
      if (!this.opened()) return;

      let cid = this.containerEventName,
        scroll = `scroll.${cid}`,
        resize = `resize.${cid}`,
        orient = `orientationchange.${cid}`;

      // unbind event listeners
      this.container.parents().add(window).each(function () { $(this).off(scroll).off(resize).off(orient); });

      this.clearDropdownAlignmentPreference();

      $('#select2-drop-mask').hide();
      this.dropdown.removeAttr('id'); // only the active dropdown has the select2-drop id
      this.dropdown.hide();
      this.container.removeClass('select2-dropdown-open').removeClass('select2-container-active');
      this.results.empty();

      // Now that the dropdown is closed, unbind the global document mousemove event
      $document.off('mousemove.select2Event');

      this.clearSearch();
      this.search.removeClass('select2-active');
      this.opts.element.trigger($.Event('select2-close'));
    },

    /**
         * Opens control, sets input value, and updates results.
         */
    // abstract
    externalSearch(term) {
      this.open();
      this.search.val(term);
      this.updateResults(false);
    },

    // abstract
    clearSearch() {

    },

    // abstract
    getMaximumSelectionSize() {
      return evaluate(this.opts.maximumSelectionSize, this.opts.element);
    },

    // abstract
    ensureHighlightVisible() {
      let results = this.results,
        children,
        index,
        child,
        hb,
        rb,
        y,
        more,
        topOffset;

      index = this.highlight();

      if (index < 0) return;

      if (index == 0) {
        // if the first element is highlighted scroll all the way to the top,
        // that way any unselectable headers above it will also be scrolled
        // into view

        results.scrollTop(0);
        return;
      }

      children = this.findHighlightableChoices().find('.select2-result-label');

      child = $(children[index]);

      topOffset = (child.offset() || {}).top || 0;

      hb = topOffset + child.outerHeight(true);

      // if this is the last child lets also make sure select2-more-results is visible
      if (index === children.length - 1) {
        more = results.find('li.select2-more-results');
        if (more.length > 0) {
          hb = more.offset().top + more.outerHeight(true);
        }
      }

      rb = results.offset().top + results.outerHeight(true);
      if (hb > rb) {
        results.scrollTop(results.scrollTop() + (hb - rb));
      }
      y = topOffset - results.offset().top;

      // make sure the top of the element is visible
      if (y < 0 && child.css('display') != 'none') {
        results.scrollTop(results.scrollTop() + y); // y is negative
      }
    },

    // abstract
    findHighlightableChoices() {
      return this.results.find('.select2-result-selectable:not(.select2-disabled):not(.select2-selected)');
    },

    // abstract
    moveHighlight(delta) {
      let choices = this.findHighlightableChoices(),
        index = this.highlight();

      while (index > -1 && index < choices.length) {
        index += delta;
        const choice = $(choices[index]);
        if (choice.hasClass('select2-result-selectable') && !choice.hasClass('select2-disabled') && !choice.hasClass('select2-selected')) {
          this.highlight(index);
          break;
        }
      }
    },

    // abstract
    highlight(index) {
      let choices = this.findHighlightableChoices(),
        choice,
        data;

      if (arguments.length === 0) {
        return indexOf(choices.filter('.select2-highlighted')[0], choices.get());
      }

      if (index >= choices.length) index = choices.length - 1;
      if (index < 0) index = 0;

      this.removeHighlight();

      choice = $(choices[index]);
      choice.addClass('select2-highlighted');

      // ensure assistive technology can determine the active choice
      this.search.attr('aria-activedescendant', choice.find('.select2-result-label').attr('id'));

      this.ensureHighlightVisible();

      this.liveRegion.text(choice.text());

      data = choice.data('select2-data');
      if (data) {
        this.opts.element.trigger({ type: 'select2-highlight', val: this.id(data), choice: data });
      }
    },

    removeHighlight() {
      this.results.find('.select2-highlighted').removeClass('select2-highlighted');
    },

    touchMoved() {
      this._touchMoved = true;
    },

    clearTouchMoved() {
      this._touchMoved = false;
    },

    // abstract
    countSelectableResults() {
      return this.findHighlightableChoices().length;
    },

    // abstract
    highlightUnderEvent(event) {
      const el = $(event.target).closest('.select2-result-selectable');
      if (el.length > 0 && !el.is('.select2-highlighted')) {
        const choices = this.findHighlightableChoices();
        this.highlight(choices.index(el));
      } else if (el.length == 0) {
        // if we are over an unselectable item remove all highlights
        this.removeHighlight();
      }
    },

    // abstract
    loadMoreIfNeeded() {
      let results = this.results,
        more = results.find('li.select2-more-results'),
        below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
        page = this.resultsPage + 1,
        self = this,
        term = this.search.val(),
        context = this.context;

      if (more.length === 0) return;
      below = more.offset().top - results.offset().top - results.height();

      if (below <= this.opts.loadMorePadding) {
        more.addClass('select2-active');
        this.opts.query({
          element: this.opts.element,
          term,
          page,
          context,
          matcher: this.opts.matcher,
          callback: this.bind(function (data) {
            // ignore a response if the select2 has been closed before it was received
            if (!self.opened()) return;


            self.opts.populateResults.call(this, results, data.results, { term, page, context });
            self.postprocessResults(data, false, false);

            if (data.more === true) {
              more.detach().appendTo(results).text(evaluate(self.opts.formatLoadMore, self.opts.element, page + 1));
              window.setTimeout(() => { self.loadMoreIfNeeded(); }, 10);
            } else {
              more.remove();
            }
            self.positionDropdown();
            self.resultsPage = page;
            self.context = data.context;
            this.opts.element.trigger({ type: 'select2-loaded', items: data });
          }),
        });
      }
    },

    /**
         * Default tokenizer function which does nothing
         */
    tokenize() {

    },

    /**
         * @param initial whether or not this is the call to this method right after the dropdown has been opened
         */
    // abstract
    updateResults(initial) {
      let search = this.search,
        results = this.results,
        opts = this.opts,
        data,
        self = this,
        input,
        term = search.val(),
        lastTerm = $.data(this.container, 'select2-last-term'),
        // sequence number used to drop out-of-order responses
        queryNumber;

      // prevent duplicate queries against the same term
      if (initial !== true && lastTerm && equal(term, lastTerm)) return;

      $.data(this.container, 'select2-last-term', term);

      // if the search is currently hidden we do not alter the results
      if (initial !== true && (this.showSearchInput === false || !this.opened())) {
        return;
      }

      function postRender() {
        search.removeClass('select2-active');
        self.positionDropdown();
        if (results.find('.select2-no-results,.select2-selection-limit,.select2-searching').length) {
          self.liveRegion.text(results.text());
        } else {
          self.liveRegion.text(self.opts.formatMatches(results.find('.select2-result-selectable').length));
        }
      }

      function render(html) {
        results.html(html);
        postRender();
      }

      queryNumber = ++this.queryCount;

      const maxSelSize = this.getMaximumSelectionSize();
      if (maxSelSize >= 1) {
        data = this.data();
        if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, 'formatSelectionTooBig')) {
          render(`<li class='select2-selection-limit'>${evaluate(opts.formatSelectionTooBig, opts.element, maxSelSize)}</li>`);
          return;
        }
      }

      if (search.val().length < opts.minimumInputLength) {
        if (checkFormatter(opts.formatInputTooShort, 'formatInputTooShort')) {
          render(`<li class='select2-no-results'>${evaluate(opts.formatInputTooShort, opts.element, search.val(), opts.minimumInputLength)}</li>`);
        } else {
          render('');
        }
        if (initial && this.showSearch) this.showSearch(true);
        return;
      }

      if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
        if (checkFormatter(opts.formatInputTooLong, 'formatInputTooLong')) {
          render(`<li class='select2-no-results'>${evaluate(opts.formatInputTooLong, opts.element, search.val(), opts.maximumInputLength)}</li>`);
        } else {
          render('');
        }
        return;
      }

      if (opts.formatSearching && this.findHighlightableChoices().length === 0) {
        render(`<li class='select2-searching'>${evaluate(opts.formatSearching, opts.element)}</li>`);
      }

      search.addClass('select2-active');

      this.removeHighlight();

      // give the tokenizer a chance to pre-process the input
      input = this.tokenize();
      if (input != undefined && input != null) {
        search.val(input);
      }

      this.resultsPage = 1;

      opts.query({
        element: opts.element,
        term: search.val(),
        page: this.resultsPage,
        context: null,
        matcher: opts.matcher,
        callback: this.bind(function (data) {
          let def; // default choice

          // ignore old responses
          if (queryNumber != this.queryCount) {
            return;
          }

          // ignore a response if the select2 has been closed before it was received
          if (!this.opened()) {
            this.search.removeClass('select2-active');
            return;
          }

          // save context, if any
          this.context = (data.context === undefined) ? null : data.context;
          // create a default choice and prepend it to the list
          if (this.opts.createSearchChoice && search.val() !== '') {
            def = this.opts.createSearchChoice.call(self, search.val(), data.results);
            if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
              if ($(data.results).filter(function () {
                return equal(self.id(this), self.id(def));
              }).length === 0) {
                this.opts.createSearchChoicePosition(data.results, def);
              }
            }
          }

          if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, 'formatNoMatches')) {
            render(`<li class='select2-no-results'>${evaluate(opts.formatNoMatches, opts.element, search.val())}</li>`);
            return;
          }

          results.empty();
          self.opts.populateResults.call(this, results, data.results, { term: search.val(), page: this.resultsPage, context: null });

          if (data.more === true && checkFormatter(opts.formatLoadMore, 'formatLoadMore')) {
            results.append(`<li class='select2-more-results'>${opts.escapeMarkup(evaluate(opts.formatLoadMore, opts.element, this.resultsPage))}</li>`);
            window.setTimeout(() => { self.loadMoreIfNeeded(); }, 10);
          }

          this.postprocessResults(data, initial);

          postRender();

          this.opts.element.trigger({ type: 'select2-loaded', items: data });
        }),
      });
    },

    // abstract
    cancel() {
      this.close();
    },

    // abstract
    blur() {
      // if selectOnBlur == true, select the currently highlighted option
      if (this.opts.selectOnBlur) { this.selectHighlighted({ noFocus: true }); }

      this.close();
      this.container.removeClass('select2-container-active');
      // synonymous to .is(':focus'), which is available in jquery >= 1.6
      if (this.search[0] === document.activeElement) { this.search.blur(); }
      this.clearSearch();
      this.selection.find('.select2-search-choice-focus').removeClass('select2-search-choice-focus');
    },

    // abstract
    focusSearch() {
      focus(this.search);
    },

    // abstract
    selectHighlighted(options) {
      if (this._touchMoved) {
        this.clearTouchMoved();
        return;
      }
      let index = this.highlight(),
        highlighted = this.results.find('.select2-highlighted'),
        data = highlighted.closest('.select2-result').data('select2-data');

      if (data) {
        this.highlight(index);
        this.onSelect(data, options);
      } else if (options && options.noFocus) {
        this.close();
      }
    },

    // abstract
    getPlaceholder() {
      let placeholderOption;
      return this.opts.element.attr('placeholder') ||
                this.opts.element.attr('data-placeholder') || // jquery 1.4 compat
                this.opts.element.data('placeholder') ||
                this.opts.placeholder ||
                ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined);
    },

    // abstract
    getPlaceholderOption() {
      if (this.select) {
        const firstOption = this.select.children('option').first();
        if (this.opts.placeholderOption !== undefined) {
          // Determine the placeholder option based on the specified placeholderOption setting
          return (this.opts.placeholderOption === 'first' && firstOption) ||
                           (typeof this.opts.placeholderOption === 'function' && this.opts.placeholderOption(this.select));
        } else if ($.trim(firstOption.text()) === '' && firstOption.val() === '') {
          // No explicit placeholder option specified, use the first if it's blank
          return firstOption;
        }
      }
    },

    /**
         * Get the desired width for the container element.  This is
         * derived first from option `width` passed to select2, then
         * the inline 'style' on the original element, and finally
         * falls back to the jQuery calculated element width.
         */
    // abstract
    initContainerWidth() {
      function resolveContainerWidth() {
        let style,
          attrs,
          matches,
          i,
          l,
          attr;

        if (this.opts.width === 'off') {
          return null;
        } else if (this.opts.width === 'element') {
          return this.opts.element.outerWidth(false) === 0 ? 'auto' : `${this.opts.element.outerWidth(false)}px`;
        } else if (this.opts.width === 'copy' || this.opts.width === 'resolve') {
          // check if there is inline style on the element that contains width
          style = this.opts.element.attr('style');
          if (style !== undefined) {
            attrs = style.split(';');
            for (i = 0, l = attrs.length; i < l; i += 1) {
              attr = attrs[i].replace(/\s/g, '');
              matches = attr.match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
              if (matches !== null && matches.length >= 1) { return matches[1]; }
            }
          }

          if (this.opts.width === 'resolve') {
            // next check if css('width') can resolve a width that is percent based, this is sometimes possible
            // when attached to input type=hidden or elements hidden via css
            style = this.opts.element.css('width');
            if (style.indexOf('%') > 0) return style;

            // finally, fallback on the calculated width of the element
            return (this.opts.element.outerWidth(false) === 0 ? 'auto' : `${this.opts.element.outerWidth(false)}px`);
          }

          return null;
        } else if ($.isFunction(this.opts.width)) {
          return this.opts.width();
        }
        return this.opts.width;
      }

      const width = resolveContainerWidth.call(this);
      if (width !== null) {
        this.container.css('width', width);
      }
    },
  });

  SingleSelect2 = clazz(AbstractSelect2, {

    // single

    createContainer() {
      const container = $(document.createElement('div')).attr({
        class: 'select2-container',
      }).html([
        "<a href='javascript:void(0)' class='select2-choice' tabindex='-1'>",
        "   <span class='select2-chosen'>&#160;</span><abbr class='select2-search-choice-close'></abbr>",
        "   <span class='select2-arrow' role='presentation'><b role='presentation'></b></span>",
        '</a>',
        "<label for='' class='select2-offscreen'></label>",
        "<input class='select2-focusser select2-offscreen' type='text' aria-haspopup='true' role='button' />",
        "<div class='select2-drop select2-display-none'>",
        "   <div class='select2-search'>",
        "       <label for='' class='select2-offscreen'></label>",
        "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'",
        "       aria-autocomplete='list' />",
        '   </div>',
        "   <ul class='select2-results' role='listbox'>",
        '   </ul>',
        '</div>'].join(''));
      return container;
    },

    // single
    enableInterface() {
      if (this.parent.enableInterface.apply(this, arguments)) {
        this.focusser.prop('disabled', !this.isInterfaceEnabled());
      }
    },

    // single
    opening() {
      let el,
        range,
        len;

      if (this.opts.minimumResultsForSearch >= 0) {
        this.showSearch(true);
      }

      this.parent.opening.apply(this, arguments);

      if (this.showSearchInput !== false) {
        // IE appends focusser.val() at the end of field :/ so we manually insert it at the beginning using a range
        // all other browsers handle this just fine

        this.search.val(this.focusser.val());
      }
      if (this.opts.shouldFocusInput(this)) {
        this.search.focus();
        // move the cursor to the end after focussing, otherwise it will be at the beginning and
        // new text will appear *before* focusser.val()
        el = this.search.get(0);
        if (el.createTextRange) {
          range = el.createTextRange();
          range.collapse(false);
          range.select();
        } else if (el.setSelectionRange) {
          len = this.search.val().length;
          el.setSelectionRange(len, len);
        }
      }

      // initializes search's value with nextSearchTerm (if defined by user)
      // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
      if (this.search.val() === '') {
        if (this.nextSearchTerm != undefined) {
          this.search.val(this.nextSearchTerm);
          this.search.select();
        }
      }

      this.focusser.prop('disabled', true).val('');
      this.updateResults(true);
      this.opts.element.trigger($.Event('select2-open'));
    },

    // single
    close() {
      if (!this.opened()) return;
      this.parent.close.apply(this, arguments);

      this.focusser.prop('disabled', false);

      if (this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }
    },

    // single
    focus() {
      if (this.opened()) {
        this.close();
      } else {
        this.focusser.prop('disabled', false);
        if (this.opts.shouldFocusInput(this)) {
          this.focusser.focus();
        }
      }
    },

    // single
    isFocused() {
      return this.container.hasClass('select2-container-active');
    },

    // single
    cancel() {
      this.parent.cancel.apply(this, arguments);
      this.focusser.prop('disabled', false);

      if (this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }
    },

    // single
    destroy() {
      $(`label[for='${this.focusser.attr('id')}']`)
        .attr('for', this.opts.element.attr('id'));
      this.parent.destroy.apply(this, arguments);

      cleanupJQueryElements.call(
        this,
        'selection',
        'focusser',
      );
    },

    // single
    initContainer() {
      let selection,
        container = this.container,
        dropdown = this.dropdown,
        idSuffix = nextUid(),
        elementLabel;

      if (this.opts.minimumResultsForSearch < 0) {
        this.showSearch(false);
      } else {
        this.showSearch(true);
      }

      this.selection = selection = container.find('.select2-choice');

      this.focusser = container.find('.select2-focusser');

      // add aria associations
      selection.find('.select2-chosen').attr('id', `select2-chosen-${idSuffix}`);
      this.focusser.attr('aria-labelledby', `select2-chosen-${idSuffix}`);
      this.results.attr('id', `select2-results-${idSuffix}`);
      this.search.attr('aria-owns', `select2-results-${idSuffix}`);

      // rewrite labels from original element to focusser
      this.focusser.attr('id', `s2id_autogen${idSuffix}`);

      elementLabel = $(`label[for='${this.opts.element.attr('id')}']`);

      this.focusser.prev()
        .text(elementLabel.text())
        .attr('for', this.focusser.attr('id'));

      // Ensure the original element retains an accessible name
      const originalTitle = this.opts.element.attr('title');
      this.opts.element.attr('title', (originalTitle || elementLabel.text()));

      this.focusser.attr('tabindex', this.elementTabIndex);

      // write label for search field using the label from the focusser element
      this.search.attr('id', `${this.focusser.attr('id')}_search`);

      this.search.prev()
        .text($(`label[for='${this.focusser.attr('id')}']`).text())
        .attr('for', this.search.attr('id'));

      this.search.on('keydown', this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          // prevent the page from scrolling
          killEvent(e);
          return;
        }

        switch (e.which) {
          case KEY.UP:
          case KEY.DOWN:
            this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
            killEvent(e);
            return;
          case KEY.ENTER:
            this.selectHighlighted();
            killEvent(e);
            return;
          case KEY.TAB:
            this.selectHighlighted({ noFocus: true });
            return;
          case KEY.ESC:
            this.cancel(e);
            killEvent(e);
        }
      }));

      this.search.on('blur', this.bind(function (e) {
        // a workaround for chrome to keep the search field focussed when the scroll bar is used to scroll the dropdown.
        // without this the search field loses focus which is annoying
        if (document.activeElement === this.body.get(0)) {
          window.setTimeout(this.bind(function () {
            if (this.opened()) {
              this.search.focus();
            }
          }), 0);
        }
      }));

      this.focusser.on('keydown', this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
          return;
        }

        if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
          killEvent(e);
          return;
        }

        if (e.which == KEY.DOWN || e.which == KEY.UP
                    || (e.which == KEY.ENTER && this.opts.openOnEnter)) {
          if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

          this.open();
          killEvent(e);
          return;
        }

        if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
          if (this.opts.allowClear) {
            this.clear();
          }
          killEvent(e);
        }
      }));


      installKeyUpChangeEvent(this.focusser);
      this.focusser.on('keyup-change input', this.bind(function (e) {
        if (this.opts.minimumResultsForSearch >= 0) {
          e.stopPropagation();
          if (this.opened()) return;
          this.open();
        }
      }));

      selection.on('mousedown touchstart', 'abbr', this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;
        this.clear();
        killEventImmediately(e);
        this.close();
        this.selection.focus();
      }));

      selection.on('mousedown touchstart', this.bind(function (e) {
        // Prevent IE from generating a click event on the body
        reinsertElement(selection);

        if (!this.container.hasClass('select2-container-active')) {
          this.opts.element.trigger($.Event('select2-focus'));
        }

        if (this.opened()) {
          this.close();
        } else if (this.isInterfaceEnabled()) {
          this.open();
        }

        killEvent(e);
      }));

      dropdown.on('mousedown touchstart', this.bind(function () {
        if (this.opts.shouldFocusInput(this)) {
          this.search.focus();
        }
      }));

      selection.on('focus', this.bind((e) => {
        killEvent(e);
      }));

      this.focusser.on('focus', this.bind(function () {
        if (!this.container.hasClass('select2-container-active')) {
          this.opts.element.trigger($.Event('select2-focus'));
        }
        this.container.addClass('select2-container-active');
      })).on('blur', this.bind(function () {
        if (!this.opened()) {
          this.container.removeClass('select2-container-active');
          this.opts.element.trigger($.Event('select2-blur'));
        }
      }));
      this.search.on('focus', this.bind(function () {
        if (!this.container.hasClass('select2-container-active')) {
          this.opts.element.trigger($.Event('select2-focus'));
        }
        this.container.addClass('select2-container-active');
      }));

      this.initContainerWidth();
      this.opts.element.addClass('select2-offscreen');
      this.setPlaceholder();
    },

    // single
    clear(triggerChange) {
      const data = this.selection.data('select2-data');
      if (data) { // guard against queued quick consecutive clicks
        const evt = $.Event('select2-clearing');
        this.opts.element.trigger(evt);
        if (evt.isDefaultPrevented()) {
          return;
        }
        const placeholderOption = this.getPlaceholderOption();
        this.opts.element.val(placeholderOption ? placeholderOption.val() : '');
        this.selection.find('.select2-chosen').empty();
        this.selection.removeData('select2-data');
        this.setPlaceholder();

        if (triggerChange !== false) {
          this.opts.element.trigger({ type: 'select2-removed', val: this.id(data), choice: data });
          this.triggerChange({ removed: data });
        }
      }
    },

    /**
         * Sets selection based on source element's value
         */
    // single
    initSelection() {
      let selected;
      if (this.isPlaceholderOptionSelected()) {
        this.updateSelection(null);
        this.close();
        this.setPlaceholder();
      } else {
        const self = this;
        this.opts.initSelection.call(null, this.opts.element, (selected) => {
          if (selected !== undefined && selected !== null) {
            self.updateSelection(selected);
            self.close();
            self.setPlaceholder();
            self.nextSearchTerm = self.opts.nextSearchTerm(selected, self.search.val());
          }
        });
      }
    },

    isPlaceholderOptionSelected() {
      let placeholderOption;
      if (this.getPlaceholder() === undefined) return false; // no placeholder specified so no option should be considered
      return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.prop('selected'))
                || (this.opts.element.val() === '')
                || (this.opts.element.val() === undefined)
                || (this.opts.element.val() === null);
    },

    // single
    prepareOpts() {
      let opts = this.parent.prepareOpts.apply(this, arguments),
        self = this;

      if (opts.element.get(0).tagName.toLowerCase() === 'select') {
        // install the selection initializer
        opts.initSelection = function (element, callback) {
          const selected = element.find('option').filter(function () { return this.selected && !this.disabled; });
          // a single select box always has a value, no need to null check 'selected'
          callback(self.optionToData(selected));
        };
      } else if ('data' in opts) {
        // install default initSelection when applied to hidden input and data is local
        opts.initSelection = opts.initSelection || function (element, callback) {
          const id = element.val();
          // search in data by id, storing the actual matching item
          let match = null;
          opts.query({
            matcher(term, text, el) {
              const is_match = equal(id, opts.id(el));
              if (is_match) {
                match = el;
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              callback(match);
            },
          });
        };
      }

      return opts;
    },

    // single
    getPlaceholder() {
      // if a placeholder is specified on a single select without a valid placeholder option ignore it
      if (this.select) {
        if (this.getPlaceholderOption() === undefined) {
          return undefined;
        }
      }

      return this.parent.getPlaceholder.apply(this, arguments);
    },

    // single
    setPlaceholder() {
      const placeholder = this.getPlaceholder();

      if (this.isPlaceholderOptionSelected() && placeholder !== undefined) {
        // check for a placeholder option if attached to a select
        if (this.select && this.getPlaceholderOption() === undefined) return;

        this.selection.find('.select2-chosen').html(this.opts.escapeMarkup(placeholder));

        this.selection.addClass('select2-default');

        this.container.removeClass('select2-allowclear');
      }
    },

    // single
    postprocessResults(data, initial, noHighlightUpdate) {
      let selected = 0,
        self = this,
        showSearchInput = true;

      // find the selected element in the result list

      this.findHighlightableChoices().each2((i, elm) => {
        if (equal(self.id(elm.data('select2-data')), self.opts.element.val())) {
          selected = i;
          return false;
        }
      });

      // and highlight it
      if (noHighlightUpdate !== false) {
        if (initial === true && selected >= 0) {
          this.highlight(selected);
        } else {
          this.highlight(0);
        }
      }

      // hide the search box if this is the first we got the results and there are enough of them for search

      if (initial === true) {
        const min = this.opts.minimumResultsForSearch;
        if (min >= 0) {
          this.showSearch(countResults(data.results) >= min);
        }
      }
    },

    // single
    showSearch(showSearchInput) {
      if (this.showSearchInput === showSearchInput) return;

      this.showSearchInput = showSearchInput;

      this.dropdown.find('.select2-search').toggleClass('select2-search-hidden', !showSearchInput);
      this.dropdown.find('.select2-search').toggleClass('select2-offscreen', !showSearchInput);
      // add "select2-with-searchbox" to the container if search box is shown
      $(this.dropdown, this.container).toggleClass('select2-with-searchbox', showSearchInput);
    },

    // single
    onSelect(data, options) {
      if (!this.triggerSelect(data)) { return; }

      let old = this.opts.element.val(),
        oldData = this.data();

      this.opts.element.val(this.id(data));
      this.updateSelection(data);

      this.opts.element.trigger({ type: 'select2-selected', val: this.id(data), choice: data });

      this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());
      this.close();

      if ((!options || !options.noFocus) && this.opts.shouldFocusInput(this)) {
        this.focusser.focus();
      }

      if (!equal(old, this.id(data))) {
        this.triggerChange({ added: data, removed: oldData });
      }
    },

    // single
    updateSelection(data) {
      let container = this.selection.find('.select2-chosen'),
        formatted,
        cssClass;

      this.selection.data('select2-data', data);

      container.empty();
      if (data !== null) {
        formatted = this.opts.formatSelection(data, container, this.opts.escapeMarkup);
      }
      if (formatted !== undefined) {
        container.append(formatted);
      }
      cssClass = this.opts.formatSelectionCssClass(data, container);
      if (cssClass !== undefined) {
        container.addClass(cssClass);
      }

      this.selection.removeClass('select2-default');

      if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
        this.container.addClass('select2-allowclear');
      }
    },

    // single
    val() {
      let val,
        triggerChange = false,
        data = null,
        self = this,
        oldData = this.data();

      if (arguments.length === 0) {
        return this.opts.element.val();
      }

      val = arguments[0];

      if (arguments.length > 1) {
        triggerChange = arguments[1];
      }

      if (this.select) {
        this.select
          .val(val)
          .find('option').filter(function () { return this.selected; }).each2((i, elm) => {
            data = self.optionToData(elm);
            return false;
          });
        this.updateSelection(data);
        this.setPlaceholder();
        if (triggerChange) {
          this.triggerChange({ added: data, removed: oldData });
        }
      } else {
        // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
        if (!val && val !== 0) {
          this.clear(triggerChange);
          return;
        }
        if (this.opts.initSelection === undefined) {
          throw new Error('cannot call val() if initSelection() is not defined');
        }
        this.opts.element.val(val);
        this.opts.initSelection(this.opts.element, (data) => {
          self.opts.element.val(!data ? '' : self.id(data));
          self.updateSelection(data);
          self.setPlaceholder();
          if (triggerChange) {
            self.triggerChange({ added: data, removed: oldData });
          }
        });
      }
    },

    // single
    clearSearch() {
      this.search.val('');
      this.focusser.val('');
    },

    // single
    data(value) {
      let data,
        triggerChange = false;

      if (arguments.length === 0) {
        data = this.selection.data('select2-data');
        if (data == undefined) data = null;
        return data;
      }
      if (arguments.length > 1) {
        triggerChange = arguments[1];
      }
      if (!value) {
        this.clear(triggerChange);
      } else {
        data = this.data();
        this.opts.element.val(!value ? '' : this.id(value));
        this.updateSelection(value);
        if (triggerChange) {
          this.triggerChange({ added: value, removed: data });
        }
      }
    },
  });

  MultiSelect2 = clazz(AbstractSelect2, {

    // multi
    createContainer() {
      const container = $(document.createElement('div')).attr({
        class: 'select2-container select2-container-multi',
      }).html([
        "<ul class='select2-choices'>",
        "  <li class='select2-search-field'>",
        "    <label for='' class='select2-offscreen'></label>",
        "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>",
        '  </li>',
        '</ul>',
        "<div class='select2-drop select2-drop-multi select2-display-none'>",
        "   <ul class='select2-results'>",
        '   </ul>',
        '</div>'].join(''));
      return container;
    },

    // multi
    prepareOpts() {
      let opts = this.parent.prepareOpts.apply(this, arguments),
        self = this;

      // TODO validate placeholder is a string if specified

      if (opts.element.get(0).tagName.toLowerCase() === 'select') {
        // install the selection initializer
        opts.initSelection = function (element, callback) {
          const data = [];

          element.find('option').filter(function () { return this.selected && !this.disabled; }).each2((i, elm) => {
            data.push(self.optionToData(elm));
          });
          callback(data);
        };
      } else if ('data' in opts) {
        // install default initSelection when applied to hidden input and data is local
        opts.initSelection = opts.initSelection || function (element, callback) {
          const ids = splitVal(element.val(), opts.separator);
          // search in data by array of ids, storing matching items in a list
          const matches = [];
          opts.query({
            matcher(term, text, el) {
              const is_match = $.grep(ids, id => equal(id, opts.id(el))).length;
              if (is_match) {
                matches.push(el);
              }
              return is_match;
            },
            callback: !$.isFunction(callback) ? $.noop : function () {
              // reorder matches based on the order they appear in the ids array because right now
              // they are in the order in which they appear in data array
              const ordered = [];
              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                for (let j = 0; j < matches.length; j++) {
                  const match = matches[j];
                  if (equal(id, opts.id(match))) {
                    ordered.push(match);
                    matches.splice(j, 1);
                    break;
                  }
                }
              }
              callback(ordered);
            },
          });
        };
      }

      return opts;
    },

    // multi
    selectChoice(choice) {
      const selected = this.container.find('.select2-search-choice-focus');
      if (selected.length && choice && choice[0] == selected[0]) {

      } else {
        if (selected.length) {
          this.opts.element.trigger('choice-deselected', selected);
        }
        selected.removeClass('select2-search-choice-focus');
        if (choice && choice.length) {
          this.close();
          choice.addClass('select2-search-choice-focus');
          this.opts.element.trigger('choice-selected', choice);
        }
      }
    },

    // multi
    destroy() {
      $(`label[for='${this.search.attr('id')}']`)
        .attr('for', this.opts.element.attr('id'));
      this.parent.destroy.apply(this, arguments);

      cleanupJQueryElements.call(
        this,
        'searchContainer',
        'selection',
      );
    },

    // multi
    initContainer() {
      let selector = '.select2-choices',
        selection;

      this.searchContainer = this.container.find('.select2-search-field');
      this.selection = selection = this.container.find(selector);

      const _this = this;
      this.selection.on('click', '.select2-search-choice:not(.select2-locked)', function (e) {
        // killEvent(e);
        _this.search[0].focus();
        _this.selectChoice($(this));
      });

      // rewrite labels from original element to focusser
      this.search.attr('id', `s2id_autogen${nextUid()}`);

      this.search.prev()
        .text($(`label[for='${this.opts.element.attr('id')}']`).text())
        .attr('for', this.search.attr('id'));

      this.search.on('input paste', this.bind(function () {
        if (this.search.attr('placeholder') && this.search.val().length == 0) return;
        if (!this.isInterfaceEnabled()) return;
        if (!this.opened()) {
          this.open();
        }
      }));

      this.search.attr('tabindex', this.elementTabIndex);

      this.keydowns = 0;
      this.search.on('keydown', this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;

        ++this.keydowns;
        const selected = selection.find('.select2-search-choice-focus');
        const prev = selected.prev('.select2-search-choice:not(.select2-locked)');
        const next = selected.next('.select2-search-choice:not(.select2-locked)');
        const pos = getCursorInfo(this.search);

        if (selected.length &&
                    (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER)) {
          let selectedChoice = selected;
          if (e.which == KEY.LEFT && prev.length) {
            selectedChoice = prev;
          } else if (e.which == KEY.RIGHT) {
            selectedChoice = next.length ? next : null;
          } else if (e.which === KEY.BACKSPACE) {
            if (this.unselect(selected.first())) {
              this.search.width(10);
              selectedChoice = prev.length ? prev : next;
            }
          } else if (e.which == KEY.DELETE) {
            if (this.unselect(selected.first())) {
              this.search.width(10);
              selectedChoice = next.length ? next : null;
            }
          } else if (e.which == KEY.ENTER) {
            selectedChoice = null;
          }

          this.selectChoice(selectedChoice);
          killEvent(e);
          if (!selectedChoice || !selectedChoice.length) {
            this.open();
          }
          return;
        } else if (((e.which === KEY.BACKSPACE && this.keydowns == 1)
                    || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length)) {
          this.selectChoice(selection.find('.select2-search-choice:not(.select2-locked)').last());
          killEvent(e);
          return;
        }
        this.selectChoice(null);


        if (this.opened()) {
          switch (e.which) {
            case KEY.UP:
            case KEY.DOWN:
              this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
              killEvent(e);
              return;
            case KEY.ENTER:
              this.selectHighlighted();
              killEvent(e);
              return;
            case KEY.TAB:
              this.selectHighlighted({ noFocus: true });
              this.close();
              return;
            case KEY.ESC:
              this.cancel(e);
              killEvent(e);
              return;
          }
        }

        if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
                 || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
          return;
        }

        if (e.which === KEY.ENTER) {
          if (this.opts.openOnEnter === false) {
            return;
          } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
            return;
          }
        }

        this.open();

        if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
          // prevent the page from scrolling
          killEvent(e);
        }

        if (e.which === KEY.ENTER) {
          // prevent form from being submitted
          killEvent(e);
        }
      }));

      this.search.on('keyup', this.bind(function (e) {
        this.keydowns = 0;
        this.resizeSearch();
      }));

      this.search.on('blur', this.bind(function (e) {
        this.container.removeClass('select2-container-active');
        this.search.removeClass('select2-focused');
        this.selectChoice(null);
        if (!this.opened()) this.clearSearch();
        e.stopImmediatePropagation();
        this.opts.element.trigger($.Event('select2-blur'));
      }));

      this.container.on('click', selector, this.bind(function (e) {
        if (!this.isInterfaceEnabled()) return;
        if ($(e.target).closest('.select2-search-choice').length > 0) {
          // clicked inside a select2 search choice, do not open
          return;
        }
        this.selectChoice(null);
        this.clearPlaceholder();
        if (!this.container.hasClass('select2-container-active')) {
          this.opts.element.trigger($.Event('select2-focus'));
        }
        this.open();
        this.focusSearch();
        e.preventDefault();
      }));

      this.container.on('focus', selector, this.bind(function () {
        if (!this.isInterfaceEnabled()) return;
        if (!this.container.hasClass('select2-container-active')) {
          this.opts.element.trigger($.Event('select2-focus'));
        }
        this.container.addClass('select2-container-active');
        this.dropdown.addClass('select2-drop-active');
        this.clearPlaceholder();
      }));

      this.initContainerWidth();
      this.opts.element.addClass('select2-offscreen');

      // set the placeholder if necessary
      this.clearSearch();
    },

    // multi
    enableInterface() {
      if (this.parent.enableInterface.apply(this, arguments)) {
        this.search.prop('disabled', !this.isInterfaceEnabled());
      }
    },

    // multi
    initSelection() {
      let data;
      if (this.opts.element.val() === '' && this.opts.element.text() === '') {
        this.updateSelection([]);
        this.close();
        // set the placeholder if necessary
        this.clearSearch();
      }
      if (this.select || this.opts.element.val() !== '') {
        const self = this;
        this.opts.initSelection.call(null, this.opts.element, (data) => {
          if (data !== undefined && data !== null) {
            self.updateSelection(data);
            self.close();
            // set the placeholder if necessary
            self.clearSearch();
          }
        });
      }
    },

    // multi
    clearSearch() {
      let placeholder = this.getPlaceholder(),
        maxWidth = this.getMaxSearchWidth();

      if (placeholder !== undefined && this.getVal().length === 0 && this.search.hasClass('select2-focused') === false) {
        this.search.val(placeholder).addClass('select2-default');
        // stretch the search box to full width of the container so as much of the placeholder is visible as possible
        // we could call this.resizeSearch(), but we do not because that requires a sizer and we do not want to create one so early because of a firefox bug, see #944
        this.search.width(maxWidth > 0 ? maxWidth : this.container.css('width'));
      } else {
        this.search.val('').width(10);
      }
    },

    // multi
    clearPlaceholder() {
      if (this.search.hasClass('select2-default')) {
        this.search.val('').removeClass('select2-default');
      }
    },

    // multi
    opening() {
      this.clearPlaceholder(); // should be done before super so placeholder is not used to search
      this.resizeSearch();

      this.parent.opening.apply(this, arguments);

      this.focusSearch();

      // initializes search's value with nextSearchTerm (if defined by user)
      // ignore nextSearchTerm if the dropdown is opened by the user pressing a letter
      if (this.search.val() === '') {
        if (this.nextSearchTerm != undefined) {
          this.search.val(this.nextSearchTerm);
          this.search.select();
        }
      }

      this.updateResults(true);
      if (this.opts.shouldFocusInput(this)) {
        this.search.focus();
      }
      this.opts.element.trigger($.Event('select2-open'));
    },

    // multi
    close() {
      if (!this.opened()) return;
      this.parent.close.apply(this, arguments);
    },

    // multi
    focus() {
      this.close();
      this.search.focus();
    },

    // multi
    isFocused() {
      return this.search.hasClass('select2-focused');
    },

    // multi
    updateSelection(data) {
      let ids = [],
        filtered = [],
        self = this;

      // filter out duplicates
      $(data).each(function () {
        if (indexOf(self.id(this), ids) < 0) {
          ids.push(self.id(this));
          filtered.push(this);
        }
      });
      data = filtered;

      this.selection.find('.select2-search-choice').remove();
      $(data).each(function () {
        self.addSelectedChoice(this);
      });
      self.postprocessResults();
    },

    // multi
    tokenize() {
      let input = this.search.val();
      input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
      if (input != null && input != undefined) {
        this.search.val(input);
        if (input.length > 0) {
          this.open();
        }
      }
    },

    // multi
    onSelect(data, options) {
      if (!this.triggerSelect(data)) { return; }

      this.addSelectedChoice(data);

      this.opts.element.trigger({ type: 'selected', val: this.id(data), choice: data });

      // keep track of the search's value before it gets cleared
      this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());

      this.clearSearch();
      this.updateResults();

      if (this.select || !this.opts.closeOnSelect) this.postprocessResults(data, false, this.opts.closeOnSelect === true);

      if (this.opts.closeOnSelect) {
        this.close();
        this.search.width(10);
      } else if (this.countSelectableResults() > 0) {
        this.search.width(10);
        this.resizeSearch();
        if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize()) {
          // if we reached max selection size repaint the results so choices
          // are replaced with the max selection reached message
          this.updateResults(true);
        } else {
          // initializes search's value with nextSearchTerm and update search result
          if (this.nextSearchTerm != undefined) {
            this.search.val(this.nextSearchTerm);
            this.updateResults();
            this.search.select();
          }
        }
        this.positionDropdown();
      } else {
        // if nothing left to select close
        this.close();
        this.search.width(10);
      }

      // since its not possible to select an element that has already been
      // added we do not need to check if this is a new element before firing change
      this.triggerChange({ added: data });

      if (!options || !options.noFocus) { this.focusSearch(); }
    },

    // multi
    cancel() {
      this.close();
      this.focusSearch();
    },

    addSelectedChoice(data) {
      let enableChoice = !data.locked,
        enabledItem = $("<li class='select2-search-choice'>" +
                    '    <div></div>' +
                    "    <a href='#' class='select2-search-choice-close' tabindex='-1'></a>" +
                    '</li>'),
        disabledItem = $("<li class='select2-search-choice select2-locked'>" +
                    '<div></div>' +
                    '</li>');
      let choice = enableChoice ? enabledItem : disabledItem,
        id = this.id(data),
        val = this.getVal(),
        formatted,
        cssClass;

      formatted = this.opts.formatSelection(data, choice.find('div'), this.opts.escapeMarkup);
      if (formatted != undefined) {
        choice.find('div').replaceWith(`<div>${formatted}</div>`);
      }
      cssClass = this.opts.formatSelectionCssClass(data, choice.find('div'));
      if (cssClass != undefined) {
        choice.addClass(cssClass);
      }

      if (enableChoice) {
        choice.find('.select2-search-choice-close')
          .on('mousedown', killEvent)
          .on('click dblclick', this.bind(function (e) {
            if (!this.isInterfaceEnabled()) return;

            this.unselect($(e.target));
            this.selection.find('.select2-search-choice-focus').removeClass('select2-search-choice-focus');
            killEvent(e);
            this.close();
            this.focusSearch();
          })).on('focus', this.bind(function () {
            if (!this.isInterfaceEnabled()) return;
            this.container.addClass('select2-container-active');
            this.dropdown.addClass('select2-drop-active');
          }));
      }

      choice.data('select2-data', data);
      choice.insertBefore(this.searchContainer);

      val.push(id);
      this.setVal(val);
    },

    // multi
    unselect(selected) {
      let val = this.getVal(),
        data,
        index;
      selected = selected.closest('.select2-search-choice');

      if (selected.length === 0) {
        throw `Invalid argument: ${selected}. Must be .select2-search-choice`;
      }

      data = selected.data('select2-data');

      if (!data) {
        // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
        // and invoked on an element already removed
        return;
      }

      const evt = $.Event('select2-removing');
      evt.val = this.id(data);
      evt.choice = data;
      this.opts.element.trigger(evt);

      if (evt.isDefaultPrevented()) {
        return false;
      }

      while ((index = indexOf(this.id(data), val)) >= 0) {
        val.splice(index, 1);
        this.setVal(val);
        if (this.select) this.postprocessResults();
      }

      selected.remove();

      this.opts.element.trigger({ type: 'select2-removed', val: this.id(data), choice: data });
      this.triggerChange({ removed: data });

      return true;
    },

    // multi
    postprocessResults(data, initial, noHighlightUpdate) {
      let val = this.getVal(),
        choices = this.results.find('.select2-result'),
        compound = this.results.find('.select2-result-with-children'),
        self = this;

      choices.each2((i, choice) => {
        const id = self.id(choice.data('select2-data'));
        if (indexOf(id, val) >= 0) {
          choice.addClass('select2-selected');
          // mark all children of the selected parent as selected
          choice.find('.select2-result-selectable').addClass('select2-selected');
        }
      });

      compound.each2((i, choice) => {
        // hide an optgroup if it doesn't have any selectable children
        if (!choice.is('.select2-result-selectable')
                    && choice.find('.select2-result-selectable:not(.select2-selected)').length === 0) {
          choice.addClass('select2-selected');
        }
      });

      if (this.highlight() == -1 && noHighlightUpdate !== false) {
        self.highlight(0);
      }

      // If all results are chosen render formatNoMatches
      if (!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0) {
        if (!data || data && !data.more && this.results.find('.select2-no-results').length === 0) {
          if (checkFormatter(self.opts.formatNoMatches, 'formatNoMatches')) {
            this.results.append(`<li class='select2-no-results'>${evaluate(self.opts.formatNoMatches, self.opts.element, self.search.val())}</li>`);
          }
        }
      }
    },

    // multi
    getMaxSearchWidth() {
      return this.selection.width() - getSideBorderPadding(this.search);
    },

    // multi
    resizeSearch() {
      let minimumWidth,
        left,
        maxWidth,
        containerLeft,
        searchWidth,
        sideBorderPadding = getSideBorderPadding(this.search);

      minimumWidth = measureTextWidth(this.search) + 10;

      left = this.search.offset().left;

      maxWidth = this.selection.width();
      containerLeft = this.selection.offset().left;

      searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

      if (searchWidth < minimumWidth) {
        searchWidth = maxWidth - sideBorderPadding;
      }

      if (searchWidth < 40) {
        searchWidth = maxWidth - sideBorderPadding;
      }

      if (searchWidth <= 0) {
        searchWidth = minimumWidth;
      }

      this.search.width(Math.floor(searchWidth));
    },

    // multi
    getVal() {
      let val;
      if (this.select) {
        val = this.select.val();
        return val === null ? [] : val;
      }
      val = this.opts.element.val();
      return splitVal(val, this.opts.separator);
    },

    // multi
    setVal(val) {
      let unique;
      if (this.select) {
        this.select.val(val);
      } else {
        unique = [];
        // filter out duplicates
        $(val).each(function () {
          if (indexOf(this, unique) < 0) unique.push(this);
        });
        this.opts.element.val(unique.length === 0 ? '' : unique.join(this.opts.separator));
      }
    },

    // multi
    buildChangeDetails(old, current) {
      var current = current.slice(0),
        old = old.slice(0);

      // remove intersection from each array
      for (let i = 0; i < current.length; i++) {
        for (let j = 0; j < old.length; j++) {
          if (equal(this.opts.id(current[i]), this.opts.id(old[j]))) {
            current.splice(i, 1);
            if (i > 0) {
                        	i--;
            }
            old.splice(j, 1);
            j--;
          }
        }
      }

      return { added: current, removed: old };
    },


    // multi
    val(val, triggerChange) {
      let oldData,
        self = this;

      if (arguments.length === 0) {
        return this.getVal();
      }

      oldData = this.data();
      if (!oldData.length) oldData = [];

      // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
      if (!val && val !== 0) {
        this.opts.element.val('');
        this.updateSelection([]);
        this.clearSearch();
        if (triggerChange) {
          this.triggerChange({ added: this.data(), removed: oldData });
        }
        return;
      }

      // val is a list of ids
      this.setVal(val);

      if (this.select) {
        this.opts.initSelection(this.select, this.bind(this.updateSelection));
        if (triggerChange) {
          this.triggerChange(this.buildChangeDetails(oldData, this.data()));
        }
      } else {
        if (this.opts.initSelection === undefined) {
          throw new Error('val() cannot be called if initSelection() is not defined');
        }

        this.opts.initSelection(this.opts.element, (data) => {
          const ids = $.map(data, self.id);
          self.setVal(ids);
          self.updateSelection(data);
          self.clearSearch();
          if (triggerChange) {
            self.triggerChange(self.buildChangeDetails(oldData, self.data()));
          }
        });
      }
      this.clearSearch();
    },

    // multi
    onSortStart() {
      if (this.select) {
        throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
      }

      // collapse search field into 0 width so its container can be collapsed as well
      this.search.width(0);
      // hide the container
      this.searchContainer.hide();
    },

    // multi
    onSortEnd() {
      let val = [],
        self = this;

      // show search and move it to the end of the list
      this.searchContainer.show();
      // make sure the search container is the last item in the list
      this.searchContainer.appendTo(this.searchContainer.parent());
      // since we collapsed the width in dragStarted, we resize it here
      this.resizeSearch();

      // update selection
      this.selection.find('.select2-search-choice').each(function () {
        val.push(self.opts.id($(this).data('select2-data')));
      });
      this.setVal(val);
      this.triggerChange();
    },

    // multi
    data(values, triggerChange) {
      let self = this,
        ids,
        old;
      if (arguments.length === 0) {
        return this.selection
          .children('.select2-search-choice')
          .map(function () { return $(this).data('select2-data'); })
          .get();
      }
      old = this.data();
      if (!values) { values = []; }
      ids = $.map(values, e => self.opts.id(e));
      this.setVal(ids);
      this.updateSelection(values);
      this.clearSearch();
      if (triggerChange) {
        this.triggerChange(this.buildChangeDetails(old, this.data()));
      }
    },
  });

  $.fn.select2 = function () {
    let args = Array.prototype.slice.call(arguments, 0),
      opts,
      select2,
      method,
      value,
      multiple,
      allowedMethods = ['val', 'destroy', 'opened', 'open', 'close', 'focus', 'isFocused', 'container', 'dropdown', 'onSortStart', 'onSortEnd', 'enable', 'disable', 'readonly', 'positionDropdown', 'data', 'search'],
      valueMethods = ['opened', 'isFocused', 'container', 'dropdown'],
      propertyMethods = ['val', 'data'],
      methodsMap = { search: 'externalSearch' };

    this.each(function () {
      if (args.length === 0 || typeof (args[0]) === 'object') {
        opts = args.length === 0 ? {} : $.extend({}, args[0]);
        opts.element = $(this);

        if (opts.element.get(0).tagName.toLowerCase() === 'select') {
          multiple = opts.element.prop('multiple');
        } else {
          multiple = opts.multiple || false;
          if ('tags' in opts) { opts.multiple = multiple = true; }
        }

        select2 = multiple ? new window.Select2.class.multi() : new window.Select2.class.single();
        select2.init(opts);
      } else if (typeof (args[0]) === 'string') {
        if (indexOf(args[0], allowedMethods) < 0) {
          throw `Unknown method: ${args[0]}`;
        }

        value = undefined;
        select2 = $(this).data('select2');
        if (select2 === undefined) return;

        method = args[0];

        if (method === 'container') {
          value = select2.container;
        } else if (method === 'dropdown') {
          value = select2.dropdown;
        } else {
          if (methodsMap[method]) method = methodsMap[method];

          value = select2[method](...args.slice(1));
        }
        if (indexOf(args[0], valueMethods) >= 0
                    || (indexOf(args[0], propertyMethods) >= 0 && args.length == 1)) {
          return false; // abort the iteration, ready to return first matched value
        }
      } else {
        throw `Invalid arguments to select2 plugin: ${args}`;
      }
    });
    return (value === undefined) ? this : value;
  };

  // plugin defaults, accessible to users
  $.fn.select2.defaults = {
    width: 'copy',
    loadMorePadding: 0,
    closeOnSelect: true,
    openOnEnter: true,
    containerCss: {},
    dropdownCss: {},
    containerCssClass: '',
    dropdownCssClass: '',
    formatResult(result, container, query, escapeMarkup) {
      const markup = [];
      markMatch(result.text, query.term, markup, escapeMarkup);
      return markup.join('');
    },
    formatSelection(data, container, escapeMarkup) {
      return data ? escapeMarkup(data.text) : undefined;
    },
    sortResults(results, container, query) {
      return results;
    },
    formatResultCssClass(data) { return data.css; },
    formatSelectionCssClass(data, container) { return undefined; },
    formatMatches(matches) { if (matches === 1) { return 'One result is available, press enter to select it.'; } return `${matches} results are available, use up and down arrow keys to navigate.`; },
    formatNoMatches() { return 'No matches found'; },
    formatInputTooShort(input, min) { const n = min - input.length; return `Please enter ${n} or more character${n == 1 ? '' : 's'}`; },
    formatInputTooLong(input, max) { const n = input.length - max; return `Please delete ${n} character${n == 1 ? '' : 's'}`; },
    formatSelectionTooBig(limit) { return `You can only select ${limit} item${limit == 1 ? '' : 's'}`; },
    formatLoadMore(pageNumber) { return 'Loading more results…'; },
    formatSearching() { return 'Searching…'; },
    minimumResultsForSearch: 0,
    minimumInputLength: 0,
    maximumInputLength: null,
    maximumSelectionSize: 0,
    id(e) { return e == undefined ? null : e.id; },
    matcher(term, text) {
      return stripDiacritics(`${text}`).toUpperCase().indexOf(stripDiacritics(`${term}`).toUpperCase()) >= 0;
    },
    separator: ',',
    tokenSeparators: [],
    tokenizer: defaultTokenizer,
    escapeMarkup: defaultEscapeMarkup,
    blurOnChange: false,
    selectOnBlur: false,
    adaptContainerCssClass(c) { return c; },
    adaptDropdownCssClass(c) { return null; },
    nextSearchTerm(selectedObject, currentSearchTerm) { return undefined; },
    searchInputPlaceholder: '',
    createSearchChoicePosition: 'top',
    shouldFocusInput(instance) {
      // Attempt to detect touch devices
      const supportsTouchEvents = (('ontouchstart' in window) ||
                                       (navigator.msMaxTouchPoints > 0));

      // Only devices which support touch events should be special cased
      if (!supportsTouchEvents) {
        return true;
      }

      // Never focus the input if search is disabled
      if (instance.opts.minimumResultsForSearch < 0) {
        return false;
      }

      return true;
    },
  };

  $.fn.select2.ajaxDefaults = {
    transport: $.ajax,
    params: {
      type: 'GET',
      cache: false,
      dataType: 'json',
    },
  };

  // exports
  window.Select2 = {
    query: {
      ajax,
      local,
      tags,
    },
    util: {
      debounce,
      markMatch,
      escapeMarkup: defaultEscapeMarkup,
      stripDiacritics,
    },
    class: {
      abstract: AbstractSelect2,
      single: SingleSelect2,
      multi: MultiSelect2,
    },
  };
}(jQuery));
