source "https://rubygems.org"

# GitHub Pages builds this site with its own pinned Jekyll and plugin set.
# Using the same gem locally and in CI keeps all three builds identical.
gem "github-pages", group: :jekyll_plugins

# Ruby 3 no longer bundles webrick, which `jekyll serve` needs.
gem "webrick", "~> 1.8"

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1", platforms: [:mingw, :x64_mingw, :mswin]
