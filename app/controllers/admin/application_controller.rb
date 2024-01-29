# frozen_string_literal: true

module Admin
  # This controller contain the methods shared for all admin controller
  class ApplicationController < ApplicationController
    before_action :authenticate_user!

    private

    # deny access unless current_user is an editor
    def authenticate_admin!
      access_denied! unless current_user.admin?
    end
  end
end
