import test from "node:test";
import assert from "node:assert/strict";
import { companies, consultingSelection, focusAreas, processSteps, productExperience, serviceTracks, speakingPanels, stats, teachingMentoring, teachingRows, writingArticles } from "../src/content/siteContent.js";

const requiredExports = { companies, focusAreas, stats, processSteps, serviceTracks, consultingSelection, teachingMentoring, teachingRows, productExperience, speakingPanels, writingArticles };

function assertNoEmptyStrings(value, path = "content") {
  if (typeof value === "string") assert.notEqual(value.trim(), "", `${path} must not be empty`);
  if (Array.isArray(value)) value.forEach((item, index) => assertNoEmptyStrings(item, `${path}[${index}]`));
  if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => assertNoEmptyStrings(item, `${path}.${key}`));
}

test("content layer exposes every supported content collection", () => {
  Object.entries(requiredExports).forEach(([name, value]) => {
    assert.ok(Array.isArray(value), `${name} must be an array`);
    assert.ok(value.length > 0, `${name} must not be empty`);
  });
});

test("content entities follow the semantic shapes used by the UI", () => {
  processSteps.forEach(({ title, description }) => assert.ok(title && description));
  serviceTracks.forEach(({ number, title, tag, items }) => {
    assert.match(number, /^0[1-4]$/);
    assert.ok(title && tag && Array.isArray(items) && items.length > 0);
  });
  assert.deepEqual(serviceTracks.map(({ number }) => number), ["01", "02", "03", "04"]);
  consultingSelection.forEach(({ name, sector, detail }) => assert.ok(name && sector && detail));
  assert.deepEqual(consultingSelection.find(({ name }) => name === "Baroro"), {
    name: "Baroro",
    sector: "Beauty platform",
    detail: "Visual and usability audit of the website interface, exploratory user-research and testing plan, and engagement improvements.",
  });
  writingArticles.forEach(({ year, title, detail, href }) => {
    assert.ok(year && title && detail);
    assert.match(href, /^https:\/\//);
  });
});

test("content layer contains no blank editorial values", () => {
  assertNoEmptyStrings(requiredExports);
});
