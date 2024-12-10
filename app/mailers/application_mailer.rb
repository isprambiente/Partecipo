# frozen_string_literal: true

# This class define the default options for send emails
class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("RAILS_EMAIL_FROM", "partecipo@partecipo.it")
  layout "mailer"
end
