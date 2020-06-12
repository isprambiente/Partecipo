# frozen_string_literal: true

# This controller contain the methods shared for all editor controller
class Editor::ApplicationController < ApplicationController
  before_action :authenticate_editor!

  # Set nav for editor's section
  def nav
    'nav_editor'
  end

  private

  # deny access unless current_user is an editor
  def authenticate_editor!
    access_denied! unless current_user.editor? || current_user.admin?
  end
end
