import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  approvePublicationCandidate,
  candidateConflicts,
  expectedEvidenceLibraryId,
  publicationPaperIdConflicts,
  publishedPaperFromPublication,
  validatePublicationCandidate,
  validateZoteroPublication,
} from "../library/publication-candidate.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const papersPath = path.join(repoRoot, "papers.json");
const taxonomyPath = path.join(repoRoot, "paper-taxonomy.json");
const publicationDir = path.join(repoRoot, "docs", "zotero-synthesis");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(target) {
  return JSON.parse(fs.readFileSync(path.resolve(target), "utf8"));
}

function atomicWrite(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporary, target);
}

function loadPublications() {
  if (!fs.existsSync(publicationDir)) return [];
  return fs
    .readdirSync(publicationDir)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort()
    .map((name) => readJson(path.join(publicationDir, name)));
}

function flag(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function validateCandidateAndConflicts(candidate, publications = loadPublications()) {
  const validation = validatePublicationCandidate(candidate);
  const papers = readJson(papersPath);
  const conflicts = validation.valid
    ? candidateConflicts(candidate, papers, publications)
    : [];
  return {
    valid: validation.valid && conflicts.length === 0,
    errors: [...validation.errors, ...conflicts],
  };
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(
      [result.stdout, result.stderr].filter(Boolean).join("\n").trim(),
    );
  }
  return result.stdout.trim();
}

const [command, target] = process.argv.slice(2);
if (!["check", "stage", "apply"].includes(command) || !target) {
  fail(
    "Usage: node scripts/zotero-publication-candidate.mjs "
    + "<check|stage|apply> <json> [options]",
  );
}

if (command === "check") {
  const candidate = readJson(target);
  const result = validateCandidateAndConflicts(candidate);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exit(1);
}

if (command === "stage") {
  const candidate = readJson(target);
  const existingPublications = loadPublications();
  const result = validateCandidateAndConflicts(candidate, existingPublications);
  if (!result.valid) {
    fail(`Candidate cannot be staged:\n- ${result.errors.join("\n- ")}`);
  }
  const papers = readJson(papersPath);
  const requestedPaperId = flag("--paper-id");
  const expectedPaperId = expectedEvidenceLibraryId(
    candidate,
    papers,
    existingPublications,
  );
  if (requestedPaperId !== expectedPaperId) {
    fail(
      `--paper-id must use the next reserved Evidence Library ID `
      + `${expectedPaperId}.`,
    );
  }
  const publication = approvePublicationCandidate(candidate, {
    paperId: requestedPaperId,
    reviewedBy: flag("--reviewed-by"),
    reviewedOn: flag("--reviewed-on"),
  });
  if (papers.some((paper) => String(paper.id) === publication.libraryReview.paperId)) {
    fail(`Evidence Library ID ${publication.libraryReview.paperId} is already assigned.`);
  }
  const destination = path.join(
    publicationDir,
    `${publication.publicationId}.json`,
  );
  if (fs.existsSync(destination)) {
    const existing = readJson(destination);
    if (JSON.stringify(existing) !== JSON.stringify(publication)) {
      fail(`Staged publication already exists with different content: ${destination}`);
    }
  } else {
    atomicWrite(destination, publication);
  }
  console.log(
    JSON.stringify(
      {
        staged: true,
        path: path.relative(repoRoot, destination),
        publicationId: publication.publicationId,
        paperId: publication.libraryReview.paperId,
      },
      null,
      2,
    ),
  );
}

if (command === "apply") {
  const publicationPath = path.resolve(target);
  if (
    !publicationPath.startsWith(`${path.resolve(publicationDir)}${path.sep}`)
  ) {
    fail("Only a tracked publication under docs/zotero-synthesis can be applied.");
  }
  const staged = readJson(publicationPath);
  const validation = validateZoteroPublication(staged);
  if (!validation.valid) {
    fail(`Publication cannot be applied:\n- ${validation.errors.join("\n- ")}`);
  }
  if (staged.status !== "STAGED") {
    fail("Only a STAGED publication can be applied.");
  }
  const publishedOn = flag("--published-on");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) {
    fail("--published-on must use YYYY-MM-DD.");
  }
  const otherPublications = loadPublications().filter(
    (entry) => entry.publicationId !== staged.publicationId,
  );
  const papers = readJson(papersPath);
  const conflicts = candidateConflicts(
    staged.candidate,
    papers,
    otherPublications,
  );
  conflicts.push(
    ...publicationPaperIdConflicts([staged, ...otherPublications]),
  );
  if (conflicts.length) {
    fail(`Publication conflicts with existing evidence:\n- ${conflicts.join("\n- ")}`);
  }
  if (papers.some((paper) => String(paper.id) === staged.libraryReview.paperId)) {
    fail(`Evidence Library ID ${staged.libraryReview.paperId} is already assigned.`);
  }

  const published = {
    ...staged,
    status: "PUBLISHED",
    publication: {
      status: "PUBLISHED",
      publishedOn,
    },
  };
  const nextPapers = [...papers, publishedPaperFromPublication(published)]
    .sort((left, right) => Number(left.id) - Number(right.id));
  const previousPapers = fs.readFileSync(papersPath, "utf8");
  const previousTaxonomy = fs.readFileSync(taxonomyPath, "utf8");
  const previousPublication = fs.readFileSync(publicationPath, "utf8");

  try {
    atomicWrite(publicationPath, published);
    atomicWrite(papersPath, nextPapers);
    const outputs = [
      run(process.execPath, ["scripts/build-paper-taxonomy.mjs"]),
      run(process.execPath, ["scripts/audit-zotero-publications.mjs"]),
      run(process.execPath, ["scripts/audit-taxonomy.mjs"]),
      run(process.execPath, ["scripts/audit-library.mjs", "--check"]),
    ];
    console.log(
      JSON.stringify(
        {
          applied: true,
          paperId: published.libraryReview.paperId,
          publicationId: published.publicationId,
          checks: outputs,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    fs.writeFileSync(papersPath, previousPapers);
    fs.writeFileSync(taxonomyPath, previousTaxonomy);
    fs.writeFileSync(publicationPath, previousPublication);
    fail(`Publication rolled back because verification failed:\n${error.message}`);
  }
}
