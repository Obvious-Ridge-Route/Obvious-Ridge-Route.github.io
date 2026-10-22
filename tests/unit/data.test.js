import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config, exists, files, frontMatter, projectImages, projects, read, sizeOf, yaml } from '../helpers.js';

const REQUIRED = ['id', 'title', 'category', 'summary', 'intro', 'role', 'card', 'hero', 'overview', 'delivered'];
const MAX_IMAGE_BYTES = 500 * 1024;
const MAX_OG_BYTES = 300 * 1024;
const BRAND = ` | ${config().title}`;
const TODAY = new Date().toISOString().slice(0, 10);

const titleFits = (title) => `${title}${BRAND}`.length <= 70;
const descriptionFits = (text) => text.length >= 50 && text.length <= 160;

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
      const url = project.link ?? project.launch_url;
      assert.ok(url, `${project.id} needs a link, or a launch_url until the site launches`);
      assert.match(url, /^https:\/\//, `${project.id} link must be https`);
      assert.ok(!(project.link && project.launch_url), `${project.id}: remove launch_url once link is set`);
    }
  });

  it('features three or four projects, led by agentic AI work', () => {
    const featured = list.filter((project) => project.featured === true);
    assert.ok(featured.length === 3 || featured.length === 4, `featured: ${featured.map((project) => project.id)}`);
    assert.match(featured[0].category, /agentic ai/i, 'the first featured project should show agentic AI work');
  });

  it('keeps search titles and descriptions within what search results show', () => {
    for (const project of list) {
      const title = project.seo_title ?? project.title;
      assert.ok(titleFits(title), `${project.id}: "${title}${BRAND}" is over 70 characters; set a shorter seo_title`);
      const description = project.seo_description ?? project.summary;
      assert.ok(descriptionFits(description), `${project.id}: description is ${description.length} characters (50 to 160)`);
    }
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

  it('has a link preview image for every project', () => {
    for (const project of list) {
      const og = `assets/images/projects/${project.id}/og.jpg`;
      assert.ok(exists(og), `missing ${og}; run scripts/optimize_image.py card.webp og.jpg --og`);
      assert.ok(sizeOf(og) <= MAX_OG_BYTES, `${og} is over 300 KB`);
    }
  });

  it('has a page for every project, and a project for every page', () => {
    const ids = new Set(list.map((project) => project.id));
    for (const project of list) {
      const page = `${project.id}.html`;
      assert.ok(exists(page), `create ${page} for project "${project.id}"`);
      const meta = frontMatter(page);
      assert.equal(meta.layout, 'project', `${page} should use layout: project`);
      assert.equal(meta.project, project.id, `${page} should set project: ${project.id}`);
      assert.equal(meta.permalink, `/${project.id}`, `${page} should set permalink: /${project.id}`);
    }
    for (const page of files('.', (path) => !path.includes('/') && path.endsWith('.html'))) {
      const meta = frontMatter(page);
      if (meta?.layout === 'project') assert.ok(ids.has(meta.project), `${page} points at unknown project "${meta.project}"`);
    }
  });
});

describe('pages', () => {
  const pages = files('.', (path) => !path.includes('/') && path.endsWith('.html') && path !== '404.html');

  it('date every page for the sitemap', () => {
    for (const page of pages) {
      const value = frontMatter(page).last_modified_at;
      assert.ok(value, `${page} needs last_modified_at for the sitemap`);
      const date = (value instanceof Date ? value.toISOString() : String(value)).slice(0, 10);
      assert.ok(date <= TODAY, `${page} last_modified_at ${date} is in the future`);
    }
  });

  it('gives the homepage a search title and description that fit', () => {
    const meta = frontMatter('index.html');
    assert.ok(titleFits(meta.seo_title), 'homepage seo_title is too long');
    assert.ok(descriptionFits(meta.description), `homepage description is ${meta.description.length} characters`);
  });
});

describe('homepage data', () => {
  it('leads the capabilities with agentic AI development', () => {
    const capabilities = yaml('_data/capabilities.yml');
    assert.equal(capabilities[0].title, 'Agentic AI development');
    assert.equal(capabilities[0].featured, true);
    assert.equal(capabilities.filter((cap) => cap.featured).length, 1, 'only one capability is the lead');
    const ids = new Set(projects().map((project) => project.id));
    for (const cap of capabilities) {
      assert.ok(cap.title && cap.summary, 'capability needs a title and summary');
      if (cap.case_study) assert.ok(ids.has(cap.case_study), `${cap.title}: unknown case_study "${cap.case_study}"`);
      for (const point of cap.points ?? []) {
        assert.equal(typeof point, 'string', `${cap.title}: points must be plain text`);
        assert.ok(point.length <= 90, `${cap.title}: keep "${point}" short enough to scan`);
      }
    }
  });

  it('keeps the agentic AI band at four steps that link to a real case study', () => {
    const agentic = yaml('_data/agentic.yml');
    assert.equal(agentic.steps.length, 4);
    for (const step of agentic.steps) assert.ok(step.title && step.body);
    const id = agentic.proof_link.replace(/^\//, '');
    assert.ok(projects().some((project) => project.id === id), `proof_link ${agentic.proof_link} has no project`);
  });

  it('gives the Agentic AI page complete content and a search title that fits', () => {
    const agentic = yaml('_data/agentic.yml');
    assert.ok(titleFits(agentic.page.seo_title));
    assert.ok(descriptionFits(agentic.page.description), `description is ${agentic.page.description.length} characters`);
    assert.ok(agentic.use_cases.length >= 3);
    for (const item of agentic.use_cases) assert.ok(item.title && item.body);
    assert.ok(agentic.faq.length >= 5);
    for (const item of agentic.faq) {
      assert.match(item.question, /\?$/, `"${item.question}" should be a question`);
      assert.ok(item.answer.length >= 40, `answer to "${item.question}" is too short to quote`);
    }
    assert.equal(frontMatter('agentic-ai.html').permalink, agentic.page_link);
  });

  it('explains on the Agentic AI page how proprietary data is protected', () => {
    const agentic = yaml('_data/agentic.yml');
    assert.ok(agentic.security_title && agentic.security_intro, 'the security section needs a title and intro');
    assert.ok(agentic.security?.length >= 3, 'list at least three security points');
    for (const item of agentic.security) assert.ok(item.title && item.body);
  });

  it('links the navigation to pages and sections that exist', () => {
    const navigation = yaml('_data/navigation.yml');
    const homepage = read('index.html');
    const permalinks = files('.', (path) => !path.includes('/') && path.endsWith('.html')).map((page) => frontMatter(page)?.permalink);
    assert.ok(navigation.length >= 3);
    for (const item of navigation) {
      const section = item.href.match(/^\/#([a-z-]+)$/);
      if (section) {
        assert.ok(homepage.includes(`id="${section[1]}"`), `index.html has no section with id="${section[1]}"`);
      } else {
        assert.ok(permalinks.includes(item.href), `${item.label} links to ${item.href}, which no page publishes`);
      }
    }
  });
});
