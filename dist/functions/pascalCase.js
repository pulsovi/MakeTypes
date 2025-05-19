export function pascalCase(n) {
    return n.split("_").map((s) => (s[0] ? s[0].toUpperCase() : "") + s.slice(1)).join("");
}
