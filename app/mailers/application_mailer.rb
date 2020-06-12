# frozen_string_literal: true

# This class define the default options for send emails
class ApplicationMailer < ActionMailer::Base
  default from: 'from@example.com'
  layout 'mailer'
end
