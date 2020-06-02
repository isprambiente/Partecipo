# frozen_string_literal: true

class Admin::ApplicationController < ApplicationController
  before_action :authenticate_admin!

  # Set nav for editor's section
  def nav
    'nav_admin'
  end

  private

  # deny access unless current_user is an editor
  def authenticate_admin!
    access_denied! unless current_user.admin?
  end
end
