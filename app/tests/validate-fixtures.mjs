import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const schema = JSON.parse(await readFile(resolve(root, "shared/game-state.schema.json"), "utf8"));
const fixtures = [
  "public/demo-data/default-game-state.json",
  "skills/research-quest/references/fixture-research.json",
  "skills/research-quest/references/fixture-software.json",
  "skills/research-quest/references/fixture-learning.json",
];
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);

for (const fixture of fixtures) {
  const data = JSON.parse(await readFile(resolve(root, fixture), "utf8"));
  assert.equal(validate(data), true, `${fixture}: ${ajv.errorsText(validate.errors)}`);
  console.log(`FIXTURE_SCHEMA_OK ${fixture}`);
}
