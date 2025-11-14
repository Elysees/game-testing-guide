source "https://rubygems.org"

# Jekyll版本
gem "jekyll", "~> 4.3.0"

# GitHub Pages兼容
gem "github-pages", group: :jekyll_plugins

# Jekyll插件
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-github-metadata"
  gem "jekyll-optional-front-matter"
  gem "jekyll-readme-index"
  gem "jekyll-titles-from-headings"
  gem "jekyll-relative-links"
end

# Windows和JRuby不包含zoneinfo文件，需要tzinfo-data gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能提升的wdm gem（仅Windows）
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# JRuby的http_parser.rb gem
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# 开发依赖
group :development do
  gem "webrick", "~> 1.7"
end