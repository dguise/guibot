export function word(word: String) {
    return new RegExp('(^|\\s)' + word + '($|\\s)', "i");
}