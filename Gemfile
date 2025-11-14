source "https://rubygems.org"

# GitHub Pages gem包含了Jekyll和所有兼容的插件
gem "github-pages", group: :jekyll_plugins

# 注意：不要单独指定jekyll版本，github-pages会自动包含兼容版本
# 注意：不要单独添加插件，github-pages已包含所有支持的插件

# Windows和JRuby不包含zoneinfo文件，需要tzinfo-data gem
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# 性能提升的wdm gem（仅Windows）
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# JRuby的http_parser.rb gem
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# 开发和测试依赖
group :development, :test do
  gem "webrick", "~> 1.7"
  gem "html-proofer", "~> 3.19"
end