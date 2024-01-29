# frozen_string_literal: true

module Editor
  # This controller contain the methods shared for all editor controller
  class ApplicationController < ApplicationController
    before_action :authenticate_editor!

    private

    # deny access unless current_user is an editor
    def authenticate_editor!
      access_denied! unless user_signed_in? && (current_user.editor? || current_user.admin?)
    end
  end
end
