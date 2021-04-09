# frozen_string_literal: true

# This controller contain the methods shared for all admin controller
class Admin::ApplicationController < ApplicationController
  before_action :authenticate_admin!

  private

  # deny access unless current_user is an editor
  def authenticate_admin!
    access_denied! unless current_user.admin?
  end
end
