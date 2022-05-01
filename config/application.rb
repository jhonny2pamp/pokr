require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Poker
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    require Rails.root.join("lib/custom_public_exceptions")
    config.exceptions_app = CustomPublicExceptions.new(Rails.public_path)

    config.eager_load_paths += ["app/presenters", "app/repositories"]

    config.active_job.queue_adapter = :sidekiq

    # config.i18n.default_locale = 'pt-BR'

    config.time_zone = 'America/Sao_Paulo'
  end
end
