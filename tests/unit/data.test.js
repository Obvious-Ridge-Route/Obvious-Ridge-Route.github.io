import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { exists, frontMatter, projectImages, projects, read, sizeOf, yaml } from '../helpers.js';

const REQUIRED = ['id', 'title', 'category', 'summary', 'intro', 'role', 'link', 'card', 'hero', 'overview', 'delivered'];
const MAX_IMAGE_BYTES = 500 * 1024;

describe('projects data', () => {
  const list = projects();

  it('has unique ids written as URL slugs', () => {
    const ids = list.map((project) => project.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate ids: ${ids}`);
    for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad id "${id}"`);
  });

  it('gives every project the fields the layouts read', () => {
    for (const project of list) {
      for (const field of REQUIRED) {
        assert.ok(project[field], `${project.id} is missing "${field}"`);
      }
      assert.ok(Array.isArray(project.delivered) && project.delivered.length > 0, `${project.id} needs a delivered list`);
      assert.match(project.link, /^https:\/\//, `${project.id} link must be https`);
    }
  });

  it('features exactly three projects, led by agentic AI work', () => {
    const featured = list.filter((project) => project.featured === true);
    assert.equal(featured.length, 3, `featured: ${featured.map((project) => project.id)}`);
    assert.match(featured[0].category, /agentic ai/i, 'the first featured project should show agentic AI work');
  });

  it('points every image at an existing, compressed file with real alt text', () => {
    for (const project of list) {
      for (const image of projectImages(project)) {
        assert.ok(image.src?.startsWith('/assets/images/'), `${project.id}: image src must start with /assets/images/ (${image.src})`);
        const path = image.src.slice(1);
        assert.ok(exists(path), `${project.id}: missing image ${path}`);
        assert.ok(sizeOf(path) <= MAX_IMAGE_BYTES, `${project.id}: ${path} is over 500 KB; run scripts/optimize_image.py`);
        assert.ok(image.alt && image.alt.trim().length >= 12, `${project.id}: ${path} needs descriptive alt text`);
        assert.doesNotMatch(image.alt, /^(image|screenshot|picture)\b/i, `${project.id}: alt text should describe the screen`);
      }
      for (const shot of project.gallery ?? []) {
        assert.ok(shot.caption, `${project.id}: gallery image ${shot.src} needs a caption`);
      }
    }
  });

  it('has a page for every project, and a project for every page', () => {
    for (const project of list) {
      const page = `${project.id}.html`;
      assert.ok(exists(page), `create ${page} for project "${project.id}"`);
      const meta = frontMatter(page);
      assert.equal(meta.layout, 'project', `${page} should use layout: project`);
      assert.equal(meta.project, project.id, `${page} should set project: ${project.id}`);
      assert.equal(meta.permalink, `/${project.id}`, `${page} should set permalink: /${project.id}`);
    }
  });
});

describe('homepage data', () => {
  it('leads the capabilities with agentic AI development', () => {
    const capabilities = yaml('_data/capabilities.yml');
    assert.equal(capabilities[0].title, 'Agentic AI development');
    assert.equal(capabilities[0].featured, true);
    assert.equal(capabilities.filter((cap) => cap.featured).length, 1, 'only one capability is the lead');
    for (const cap of capabilities) assert.ok(cap.title && cap.summary, `capability needs a title and summary`);
  });

  it('keeps the agentic AI band at four steps that link to a real case study', () => {
    const agentic = yaml('_data/agentic.yml');
    assert.equal(agentic.steps.length, 4);
    for (const step of agentic.steps) assert.ok(step.title && step.body);
    const id = agentic.proof_link.replace(/^\//, '');
    assert.ok(projects().some((project) => project.id === id), `proof_link ${agentic.proof_link} has no project`);
  });

  it('links the navigation to sections that exist on the homepage', () => {
    const navigation = yaml('_data/navigation.yml');
    const homepage = read('index.html');
    assert.ok(navigation.length >= 3);
    for (const item of navigation) {
      const match = item.href.match(/^\/#([a-z-]+)$/);
      assert.ok(match, `${item.label} should link to a homepage section like /#work`);
      assert.ok(homepage.includes(`id="${match[1]}"`), `index.html has no section with id="${match[1]}"`);
    }
  });
});
