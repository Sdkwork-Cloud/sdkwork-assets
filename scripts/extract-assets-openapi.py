import json
import copy
from pathlib import Path

src = Path(r"E:\sdkwork-space\sdkwork-drive\apis\app-api\drive\drive-app-api.openapi.json")
dst_dir = Path(r"E:\sdkwork-space\sdkwork-assets\apis\app-api\assets")
dst_dir.mkdir(parents=True, exist_ok=True)
dst = dst_dir / "assets-app-api.openapi.json"

doc = json.loads(src.read_text(encoding="utf-8"))
asset_paths = [p for p in doc["paths"] if p.startswith("/app/v3/api/assets")]

paths = {p: copy.deepcopy(doc["paths"][p]) for p in asset_paths}


def collect_refs(obj, refs):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key == "$ref" and isinstance(value, str) and value.startswith("#/components/schemas/"):
                refs.add(value.split("/")[-1])
            else:
                collect_refs(value, refs)
    elif isinstance(obj, list):
        for item in obj:
            collect_refs(item, refs)


needed = set()
collect_refs(paths, needed)
all_schemas = doc.get("components", {}).get("schemas", {})
resolved = set()
while True:
    added = False
    for name in list(needed):
        if name in resolved:
            continue
        resolved.add(name)
        schema = all_schemas.get(name)
        if schema is None:
            continue
        before = len(needed)
        collect_refs(schema, needed)
        if len(needed) > before:
            added = True
    if not added:
        break

schemas = {
    name: copy.deepcopy(all_schemas[name])
    for name in sorted(needed)
    if name in all_schemas
}


def patch_node(node):
    if isinstance(node, dict):
        if node.get("x-sdkwork-owner") == "sdkwork-drive":
            node["x-sdkwork-owner"] = "sdkwork-assets"
        if node.get("x-sdkwork-api-authority") == "sdkwork-drive-app-api":
            node["x-sdkwork-api-authority"] = "sdkwork-assets-app-api"
        if "tags" in node and isinstance(node["tags"], list):
            node["tags"] = ["assets" if tag == "drive" else tag for tag in node["tags"]]
        for value in node.values():
            patch_node(value)
    elif isinstance(node, list):
        for item in node:
            patch_node(item)


patch_node(paths)

out = {
    "openapi": doc.get("openapi", "3.1.2"),
    "info": {
        "title": "SDKWork Assets App API",
        "version": "1.0.0",
        "x-sdkwork-owner": "sdkwork-assets",
        "x-sdkwork-api-authority": "sdkwork-assets-app-api",
    },
    "servers": doc.get("servers", [{"url": "http://127.0.0.1:18080"}]),
    "tags": [
        {
            "name": "assets",
            "description": "Global assets API resources.",
            "x-sdk-nested-resource-surface": True,
        }
    ],
    "paths": paths,
    "components": {
        "schemas": schemas,
        "securitySchemes": copy.deepcopy(
            doc.get("components", {}).get("securitySchemes", {})
        ),
    },
}

dst.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"paths={len(paths)} schemas={len(schemas)} -> {dst}")
