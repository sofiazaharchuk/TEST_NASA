import json, sys
sys.path.insert(0, "tools")
from loc_a import L as A
from loc_b import L as B
en = json.load(open("src/i18n/en.json", encoding="utf-8"))
def fill(node, it, path=()):
    out = {}
    for k, v in node.items():
        if isinstance(v, dict): out[k] = fill(v, it, path + (k,))
        elif path == ("app",) and k == "name" or k == "factSource": out[k] = v
        else: out[k] = next(it)
    return out
def keys(d, p=""):
    r = set()
    for k, v in d.items(): r |= keys(v, p + k + ".") if isinstance(v, dict) else {p + k}
    return r
for code, strings in {**A, **B}.items():
    it = iter(strings); res = fill(en, it)
    assert next(it, None) is None, code + ": too many strings"
    assert keys(res) == keys(en), code + ": key mismatch"
    json.dump(res, open(f"src/i18n/{code}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(code, "ok", res["levels"]["first_day"]["name"], "|", res["levels"]["thirsty_base"]["name"], "|", res["chain"]["storm_ok"]["title"])
